# 📚 **DOCUMENTACIÓN COMPLETA DE LA API - CRM AGENCIA DE VIAJES**

## 🎯 **DESCRIPCIÓN GENERAL**

Esta API permite la integración entre el sitio web público de la agencia de viajes y el sistema CRM interno. Proporciona endpoints para crear cotizaciones, tareas, gestionar clientes y autenticación.

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

#### **2. Crear Cotización**
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
    "special_requirements": "Habitación con vista al mar",
    "task_personnel_id": 1
}
```

**Campos requeridos:**
- `agency_slug`: Slug de la agencia
- `client_name`: Nombre completo del cliente
- `client_email`: Email del cliente
- `client_phone`: Teléfono del cliente
- `slug`: **NUEVO** - Slug único del cliente (ej: "juan-perez-meytsq98")
- `request_type`: Tipo de servicio
- `destination_type`: Tipo de destino
- `origin`: Ciudad de origen
- `destination`: Ciudad de destino
- `departure_date`: Fecha de salida
- `adult`: Número de adultos
- `children`: Número de niños
- `infant`: Número de infantes

**Valores válidos para `request_type`:**
- `"plan_turistico"` - Plan turístico completo
- `"tiquete_aereo"` - Tiquete aéreo
- `"hotel"` - Hotel/alojamiento
- `"paquete_completo"` - Paquete completo
- `"traslado"` - Servicio de traslado
- `"seguro_viaje"` - Seguro de viaje

**Valores válidos para `destination_type`:**
- `"nacional"` - Destino nacional
- `"internacional"` - Destino internacional

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Cotización creada exitosamente",
    "data": {
        "quotation_id": 123,
        "task_id": 456,
        "reference_number": "COT-2024-001",
        "estimated_response_time": "24-48 horas",
        "next_steps": "Un asesor se pondrá en contacto contigo pronto"
    }
}
```

#### **3. Crear Tarea**
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

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Tarea creada exitosamente",
    "data": {
        "task_id": 789,
        "reference_number": "TAR-2024-001",
        "estimated_response_time": "24-48 horas",
        "next_steps": "Un asesor se pondrá en contacto contigo pronto"
    }
}
```

#### **4. Crear Cliente**
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

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Client created successfully",
    "data": {
        "client": {
            "id": 10,
            "name": "Ana López",
            "email": "ana@email.com",
            "phone": "3005551234"
        },
        "user": {
            "id": 15,
            "name": "Ana López",
            "email": "ana@email.com"
        }
    }
}
```

#### **5. Buscar Clientes**
```
GET /v1/client/search?query={search_term}
```
**Descripción:** Busca clientes por nombre o email (mínimo 2 caracteres).

**Parámetros:**
- `query` (query): Término de búsqueda (mínimo 2 caracteres)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Maicol Londoño",
            "email": "maicoll4966@gmail.com",
            "phone": "3506852261"
        }
    ],
    "count": 1
}
```

#### **6. Tipos de Servicios**
```
GET /v1/services/types
```
**Descripción:** Obtiene la lista de tipos de servicios disponibles.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        "vuelos",
        "hoteles",
        "tours",
        "traslados",
        "paquetes",
        "asistencia médica",
        "otros servicios"
    ]
}
```

#### **7. Destinos Populares**
```
GET /v1/destinations/popular
```
**Descripción:** Obtiene la lista de destinos más populares.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        "Cartagena",
        "San Andrés",
        "Santa Marta",
        "Tayrona",
        "Capurganá",
        "Providencia"
    ]
}
```

#### **8. Login de Cliente**
```
POST /v1/client/login
```
**Descripción:** Autentica a un cliente y genera un token de acceso.

**Body:**
```json
{
    "email": "vanessaparedes186@gmail.com",
    "password": "12345678"
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "data": {
        "client": {
            "id": 1,
            "name": "Lady Vanessa Paredes Salas",
            "email": "vanessaparedes186@gmail.com"
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

#### **9. Listar Paquetes Públicos (Secciones por destino)**
```
GET /v1/packages
```
**Descripción:** Devuelve todos los paquetes publicados en el CRM listos para mostrarse en la web pública, con opción de filtrar por destino, agencia o palabra clave.

**Parámetros de consulta:**
- `destination` (opcional): Nombre exacto del destino que selecciona el cliente.
- `agency` (opcional): Slug de la agencia para limitar los resultados.
- `status` (opcional): Estado del paquete (`active` por defecto).
- `per_page` (opcional): Límite por página (1-50, default 12).
- `search` (opcional): Texto libre en título / origen / destino.
- `only_active_schedules` (opcional): `true` por defecto. Si es `false`, devuelve todas las salidas.

**Respuesta exitosa (200):**
```json
{
    "data": [
        {
            "id": 87,
            "title": "Caribe Premium",
            "origin": "Medellín",
            "destination": "Cartagena",
            "status": "active",
            "valid_from": "2026-04-01",
            "valid_until": "2026-12-15",
            "include": "<p>Vuelo + Hotel + Traslados</p>",
            "main_image": "https://mvpsolutions365.com/storage/packages/caribe-premium.jpg",
            "gallery_images": [
                "https://mvpsolutions365.com/storage/packages/gallery/caribe-1.jpg"
            ],
            "document_file": "https://mvpsolutions365.com/storage/packages/docs/caribe.pdf",
            "min_price": 1850000,
            "max_price": 2450000,
            "agency": {
                "id": 3,
                "name": "MVP Travel",
                "slug": "mvp-travel"
            },
            "schedules": [
                {
                    "id": 145,
                    "start_date": "2026-05-10",
                    "end_date": "2026-05-15",
                    "status": "active",
                    "status_label": "Activa",
                    "available_units": 12,
                    "min_fare": 1850000,
                    "max_fare": 2100000,
                    "fares": [
                        {
                            "id": 411,
                            "passenger_type": "adult",
                            "accommodation_type": "double",
                            "fare": 1850000,
                            "currency": "COP"
                        }
                    ]
                }
            ],
            "created_at": "2026-03-15T13:45:21Z",
            "updated_at": "2026-03-18T09:11:02Z"
        }
    ],
    "links": {
        "first": "https://mvpsolutions365.com/api/v1/packages?page=1",
        "last": "https://mvpsolutions365.com/api/v1/packages?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "https://mvpsolutions365.com/api/v1/packages",
        "per_page": 12,
        "to": 1,
        "total": 1
    },
    "success": true,
    "filters": {
        "destination": "Cartagena",
        "agency": "mvp-travel",
        "status": "active",
        "only_active_schedules": true
    }
}
```

#### **10. Mostrar Paquete Público**
```
GET /v1/packages/{id}
```
**Descripción:** Devuelve el detalle completo de un paquete (para modal, landing o SEO). Se pueden ocultar las salidas inactivas con `only_active_schedules=true`.

**Respuesta exitosa (200):**
```json
{
    "data": {
        "id": 87,
        "title": "Caribe Premium",
        "origin": "Medellín",
        "destination": "Cartagena",
        "status": "active",
        "valid_from": "2026-04-01",
        "valid_until": "2026-12-15",
        "include": "<p>Vuelo + Hotel + Traslados</p>",
        "no_include": "<p>Gastos personales</p>",
        "itinerary": "<p>Día 1 llegada...</p>",
        "details": "<p>Plan completo</p>",
        "main_image": "https://mvpsolutions365.com/storage/packages/caribe-premium.jpg",
        "gallery_images": [
            "https://mvpsolutions365.com/storage/packages/gallery/caribe-1.jpg",
            "https://mvpsolutions365.com/storage/packages/gallery/caribe-2.jpg"
        ],
        "document_file": "https://mvpsolutions365.com/storage/packages/docs/caribe.pdf",
        "min_price": 1850000,
        "max_price": 2450000,
        "agency": {
            "id": 3,
            "name": "MVP Travel",
            "slug": "mvp-travel"
        },
        "schedules": [
            {
                "id": 145,
                "start_date": "2026-05-10",
                "end_date": "2026-05-15",
                "status": "active",
                "available_units": 12,
                "notes": "Promo Semana Madre",
                "min_fare": 1850000,
                "max_fare": 2100000,
                "fares": [
                    {
                        "id": 411,
                        "passenger_type": "adult",
                        "accommodation_type": "double",
                        "fare": 1850000,
                        "currency": "COP",
                        "meal_plan": "AI"
                    }
                ]
            }
        ],
        "created_at": "2026-03-15T13:45:21Z",
        "updated_at": "2026-03-18T09:11:02Z"
    },
    "success": true
}
```

#### **11. Destinos Públicos Disponibles**
```
GET /v1/packages/destinations
```
**Descripción:** Lista los destinos únicos con paquetes publicados. Útil para construir menús, pestañas o carruseles por destino.

**Parámetros de consulta (opcionales):**
- `agency`: Slug de la agencia si deseas limitar la respuesta.
- `status`: Estado del paquete (default `active`).
- `only_active_schedules`: true por defecto.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        "Cartagena",
        "La Guajira",
        "San Andres"
    ],
    "filters": {
        "agency": null,
        "status": "active",
        "only_active_schedules": true
    }
}
```

#### **12. Listar Paquetes de una Agencia**
```
GET /v1/agency/{slug}/packages
```
**Descripción:** Obtiene la lista de paquetes turísticos de una agencia específica.

**Parámetros de consulta:**
- `search` (opcional): Búsqueda por título, origen o destino
- `destination` (opcional): Filtrar por destino específico
- `status` (opcional): Filtrar por estado (active, inactive)
- `limit` (opcional): Número de resultados por página (default: 20)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "title": "Paquete Caribe Completo",
                "origin": "Medellín",
                "destination": "Cartagena",
                "include": "Hotel, vuelo, traslados, desayuno",
                "no_include": "Almuerzos, cenas, bebidas",
                "itinerary": "Día 1: Llegada y check-in...",
                "details": "Paquete turístico completo...",
                "main_image": "https://mvpsolutions365.com/storage/packages/main-1.jpg",
                "gallery_images": ["https://mvpsolutions365.com/storage/packages/gallery-1.jpg"],
                "document_file": "https://mvpsolutions365.com/storage/packages/doc-1.pdf",
                "min_price": 1500000,
                "max_price": 2500000,
                "schedules_count": 3,
                "active_schedules_count": 2,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-16T14:20:00Z"
            }
        ],
        "total": 1,
        "per_page": 20
    },
    "agency": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal"
    }
}
```

#### **13. Mostrar Paquete Específico**
```
GET /v1/agency/{slug}/packages/{id}
```
**Descripción:** Obtiene los detalles completos de un paquete específico.

**Parámetros:**
- `slug` (path): Slug de la agencia
- `id` (path): ID del paquete

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Paquete Caribe Completo",
        "origin": "Medellín",
        "destination": "Cartagena",
        "include": "Hotel, vuelo, traslados, desayuno",
        "no_include": "Almuerzos, cenas, bebidas",
        "itinerary": "Día 1: Llegada y check-in...",
        "details": "Paquete turístico completo...",
        "main_image": "https://mvpsolutions365.com/storage/packages/main-1.jpg",
        "gallery_images": ["https://mvpsolutions365.com/storage/packages/gallery-1.jpg"],
        "document_file": "https://mvpsolutions365.com/storage/packages/doc-1.pdf",
        "min_price": 1500000,
        "max_price": 2500000,
        "schedules": [
            {
                "id": 1,
                "start_date": "2024-06-15",
                "end_date": "2024-06-20",
                "status": "active",
                "status_label": "Activa",
                "notes": "Salida confirmada",
                "fares": [
                    {
                        "id": 1,
                        "passenger_type": "Adulto",
                        "accommodation_type": "Doble",
                        "fare": 1500000,
                        "description": "Precio por persona"
                    }
                ],
                "min_fare": 1500000,
                "max_fare": 1500000
            }
        ],
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-16T14:20:00Z"
    },
    "agency": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal"
    }
}
```

#### **14. Obtener Destinos de Paquetes**
```
GET /v1/agency/{slug}/packages/destinations
```
**Descripción:** Obtiene la lista de destinos únicos disponibles en los paquetes de una agencia.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        "Cartagena",
        "San Andrés",
        "Santa Marta",
        "Medellín",
        "Bogotá"
    ],
    "agency": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal"
    }
}
```

#### **15. Obtener Paquetes Destacados**
```
GET /v1/agency/{slug}/packages/featured
```
**Descripción:** Obtiene los paquetes destacados (con salidas activas) de una agencia.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Paquete Caribe Completo",
            "origin": "Medellín",
            "destination": "Cartagena",
            "main_image": "https://mvpsolutions365.com/storage/packages/main-1.jpg",
            "min_price": 1500000,
            "max_price": 2500000,
            "active_schedules_count": 2
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

### **🔒 RUTAS PROTEGIDAS (Requieren autenticación)**

#### **1. Perfil del Cliente**
```
GET /v1/client/profile
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Lady Vanessa Paredes Salas",
        "email": "vanessaparedes186@gmail.com",
        "phone": "3001234567",
        "address": "Medellín, Colombia"
    }
}
```

#### **2. Logout del Cliente**
```
POST /v1/client/logout
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Logout exitoso"
}
```

---

## 👤 API PORTAL DEL CLIENTE

Estos endpoints permiten al cliente autenticado visualizar sus cotizaciones, servicios y estado de viaje desde el portal del viajero.

Todas las rutas requieren autenticación mediante Sanctum.

**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

---

### 🔐 Flujo de Autenticación Cliente

1. **Login del cliente**
   `POST /v1/client/login`
2. **Obtener cotizaciones del cliente**
   `GET /v1/client/quotations`
3. **Obtener detalle de cotización**
   `GET /v1/client/quotations/{id}`
4. **Obtener servicios de la cotización**
   `GET /v1/client/quotations/{id}/services`
5. **Obtener detalle completo del viaje**
   `GET /v1/client/trip/{slug}`

---

### 🗺 CLIENT PORTAL FLOW

```text
Login
  ↓
GET /client/quotations
  ↓
GET /client/trip/{slug}
  ↓
Mostrar dashboard del viaje
```

---

### ⚙️ Ejemplo configuración Postman

**Base URL:**
`http://localhost/api/v1`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

---

### 🗂 ENDPOINTS DEL PORTAL

#### **1. Listar cotizaciones**
```
GET /v1/client/quotations
```

#### **2. Cotización específica**
```
GET /v1/client/quotations/{id}
```

#### **3. Servicios de la cotización**
```
GET /v1/client/quotations/{id}/services
```

#### **4. Servicios específicos**
```
GET /v1/client/quotations/{id}/services/tickets
GET /v1/client/quotations/{id}/services/hotels
GET /v1/client/quotations/{id}/services/transfers
GET /v1/client/quotations/{id}/services/medical-assists
```

#### **5. Detalle del Viaje**
```
GET /v1/client/trip/{slug}
```

#### **6. Detalle de Reserva de Hotel**
```
GET /v1/client/hotels/{id}
```
**Descripción:**
Obtiene la información completa de una reserva de hotel específica, incluyendo imágenes y detalles de las habitaciones.

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Ejemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hotel Cartagena Plaza",
    "arrival_date": "2024-06-15",
    "departure_date": "2024-06-20",
    "room_type": "Suite",
    "type_food": "Todo incluido",
    "total_rooms": 2,
    "adult": 4,
    "children": 1,
    "infant": 0,
    "fare": 1500000,
    "total_fare": 1800000,
    "status": "aprobado",
    "status_label": "Aprobado",
    "provider": {
      "id": 5,
      "name": "Hotelbeds"
    },
    "images": [
      {
        "id": 10,
        "url": "https://mvpsolutions365.com/storage/hotels/room1.jpg",
        "thumbnail": "https://mvpsolutions365.com/storage/hotels/thumbnails/room1_thumb.jpg",
        "is_main": true
      }
    ],
    "details": [
      {
        "id": 20,
        "room_type": "Suite Ejecutiva",
        "number_of_rooms": 1,
        "view_type": "vista al mar",
        "meal_plan": "todo incluido",
        "nights": 5,
        "price": 300000,
        "total_price": 1500000
      }
    ]
  }
}
```

---
**Descripción:**
Obtiene toda la información del viaje del cliente, incluyendo:
- datos del viaje
- asesor asignado
- servicios cotizados
- tareas asociadas
- pagos
- totales

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Ejemplo Request:**
```
GET /v1/client/trip/plan-turistico-madrid-es-PNj633aO
```

**Ejemplo Response:**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": 243,
      "slug": "plan-turistico-madrid-es-PNj633aO",
      "destination": "Madrid (ES)",
      "departure_date": "2026-03-31",
      "return_date": "2026-04-11",
      "status": "En proceso"
    },
    "advisor": null,
    "services": {
      "tickets": [],
      "hotels": [],
      "transfers": [],
      "medical_assists": []
    },
    "tasks": [],
    "payments": {
      "client_payments": [],
      "total_paid": 0
    },
    "totals": {
      "quoted": 0,
      "sold": 0,
      "discarded": 0
    }
  }
}
```

---

### **👨‍💼 RUTAS DE ADMINISTRADOR (Requieren autenticación)**

#### **1. Listar Cotizaciones (Admin)**
```
GET /v1/admin/quotations
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "reference_number": "COT-2024-001",
                "client_name": "Lady Vanessa Paredes Salas",
                "service_type": "vuelos",
                "destination": "Cartagena",
                "status": "En proceso",
                "created_at": "2024-01-15T10:30:00Z"
            }
        ],
        "total": 1,
        "per_page": 20
    }
}
```

#### **2. Listar Tareas (Admin)**
```
GET /v1/admin/tasks
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "title": "Consulta sobre paquetes al Caribe",
                "client_name": "María García",
                "type_task": "consulta",
                "state": "Asignado",
                "priority": "normal",
                "created_at": "2024-01-15T10:30:00Z"
            }
        ],
        "total": 1,
        "per_page": 20
    }
}
```

---

## 📝 **CÓDIGOS DE ERROR COMUNES**

### **400 - Bad Request**
```json
{
    "success": false,
    "message": "Datos de validación incorrectos",
    "errors": {
        "email": ["El campo email es obligatorio"],
        "password": ["La contraseña debe tener al menos 8 caracteres"]
    }
}
```

### **401 - Unauthorized**
```json
{
    "success": false,
    "message": "Token de autenticación inválido o expirado"
}
```

### **404 - Not Found**
```json
{
    "success": false,
    "message": "Recurso no encontrado"
}
```

### **422 - Validation Error**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["El email ya está registrado"]
    }
}
```

### **500 - Internal Server Error**
```json
{
    "success": false,
    "message": "Error interno del servidor",
    "error": "Detalles del error (solo en desarrollo)"
}
```

---

## 🧪 **CREDENCIALES DE PRUEBA**

### **Cliente de Prueba:**
- **Email:** vanessaparedes186@gmail.com
- **Contraseña:** 12345678

### **Agencia de Prueba:**
- **Slug:** agencia-principal

---

## 🔧 **CONFIGURACIÓN DE POSTMAN**

### **1. Crear Environment "Local Development":**
- `base_url`: `https://mvpsolutions365.com`
- `auth_token`: (se llena automáticamente después del login)

### **2. Headers Globales:**
- `Accept`: `application/json`
- `Content-Type`: `application/json`

### **3. Headers de Autenticación:**
- `Authorization`: `Bearer {{auth_token}}`

---

## 📱 **EJEMPLOS DE USO**

### **Flujo Completo de Cotización:**
1. **Crear Cliente** → `POST /v1/client`
2. **Crear Cotización** → `POST /v1/quotation`
3. **Login del Cliente** → `POST /v1/client/login`
4. **Ver Cotizaciones** → `GET /v1/client/quotations`
5. **Ver Detalle** → `GET /v1/client/quotations/{id}`

### **Flujo de Tarea:**
1. **Crear Tarea** → `POST /v1/task`
2. **Login del Cliente** → `POST /v1/client/login`
3. **Ver Perfil** → `GET /v1/client/profile`

---

## 🚀 **PRÓXIMOS PASOS**

1. ✅ **API completa implementada**
2. ✅ **Endpoints de cliente funcionando**
3. ✅ **Autenticación con Sanctum**
4. 🔄 **Desarrollo del frontend**
5. 🔄 **Integración completa**
6. 🔄 **Testing y optimización**

---

**¿Necesitas ayuda con algún endpoint específico o quieres que te ayude con la implementación del frontend?**
