# 🎒 **EJEMPLOS DE USO - API DE PAQUETES**

## 🎯 **DESCRIPCIÓN**

Este archivo contiene ejemplos prácticos para probar la API de paquetes desde tu sitio web. La API te permitirá mostrar todos los paquetes turísticos que crees en el CRM.

---

## ✨ **NUEVOS CAMPOS DISPONIBLES**

### **Campos agregados recientemente:**

- **`status`**: Estado del paquete (`active` = Activo, `inactive` = Inactivo)
- **`valid_from`**: Fecha de inicio de validez del paquete (formato: YYYY-MM-DD)
- **`valid_until`**: Fecha de fin de validez del paquete (formato: YYYY-MM-DD)
- **`available_units`**: Cantidad de unidades disponibles para reserva

### **Filtros adicionales:**

- **`package_status`**: Filtrar paquetes por su estado (active/inactive)
- **`status`**: Filtrar por estado de las salidas del paquete

---

## 🌐 **ENDPOINTS DISPONIBLES**

### **1. Listar Paquetes de una Agencia**
```
GET /api/v1/agency/{slug}/packages
```

### **2. Mostrar Paquete Específico**
```
GET /api/v1/agency/{slug}/packages/{id}
```

### **3. Obtener Destinos de Paquetes**
```
GET /api/v1/agency/{slug}/packages/destinations
```

### **4. Obtener Paquetes Destacados**
```
GET /api/v1/agency/{slug}/packages/featured
```

---

## 🧪 **EJEMPLOS DE TESTING**

### **Base URL para desarrollo:**
```
https://mvpsolutions365.com/api/v1
```

### **Base URL para producción:**
```
https://mvpsolutions365.com/api/v1
```

### **Agencia de prueba:**
```
agencia-principal
```

---

## 📋 **EJEMPLO 1: Listar Todos los Paquetes**

### **URL:**
```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages
```

### **Respuesta esperada:**
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
                "status": "active",
                "valid_from": "2024-01-01",
                "valid_until": "2024-12-31",
                "available_units": 50,
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

---

## 🔍 **EJEMPLO 2: Filtrar Paquetes por Destino**

### **URL:**
```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages?destination=Cartagena
```

### **Parámetros de filtrado disponibles:**
- `search`: Búsqueda por título, origen o destino
- `destination`: Filtrar por destino específico
- `status`: Filtrar por estado de las salidas (active, inactive)
- `package_status`: Filtrar por estado del paquete (active, inactive)
- `limit`: Número de resultados por página

### **Ejemplos de filtros:**
```
?search=caribe
?destination=Cartagena
?status=active
?package_status=active
?limit=10
```

---

## 📖 **EJEMPLO 3: Mostrar Paquete Específico**

### **URL:**
```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages/1
```

### **Respuesta esperada:**
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
                "status": "active",
                "valid_from": "2024-01-01",
                "valid_until": "2024-12-31",
                "available_units": 50,
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

---

## 🗺️ **EJEMPLO 4: Obtener Destinos Disponibles**

### **URL:**
```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages/destinations
```

### **Respuesta esperada:**
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

---

## ⭐ **EJEMPLO 5: Obtener Paquetes Destacados**

### **URL:**
```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages/featured
```

### **Respuesta esperada:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Paquete Caribe Completo",
            "origin": "Medellín",
            "destination": "Cartagena",
            "status": "active",
            "valid_from": "2024-01-01",
            "valid_until": "2024-12-31",
            "available_units": 50,
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

## 💻 **IMPLEMENTACIÓN EN FRONTEND**

### **JavaScript - Función para obtener paquetes:**

```javascript
class PackageAPI {
    constructor(baseUrl = 'https://mvpsolutions365.com/api/v1') {
        this.baseUrl = baseUrl;
    }

    // Obtener todos los paquetes de una agencia
    async getPackages(agencySlug, filters = {}) {
        const params = new URLSearchParams(filters);
        const url = `${this.baseUrl}/agency/${agencySlug}/packages?${params}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Error al obtener paquetes');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Obtener un paquete específico
    async getPackage(agencySlug, packageId) {
        const url = `${this.baseUrl}/agency/${agencySlug}/packages/${packageId}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Error al obtener paquete');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Obtener destinos disponibles
    async getDestinations(agencySlug) {
        const url = `${this.baseUrl}/agency/${agencySlug}/packages/destinations`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Error al obtener destinos');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Obtener paquetes destacados
    async getFeaturedPackages(agencySlug) {
        const url = `${this.baseUrl}/agency/${agencySlug}/packages/featured`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Error al obtener paquetes destacados');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

// Ejemplo de uso
const packageAPI = new PackageAPI();

// Obtener todos los paquetes
packageAPI.getPackages('agencia-principal')
    .then(data => {
        console.log('Paquetes:', data.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Obtener paquetes con filtros
packageAPI.getPackages('agencia-principal', {
    destination: 'Cartagena',
    status: 'active',
    limit: 10
})
    .then(data => {
        console.log('Paquetes filtrados:', data.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

---

## 🎨 **EJEMPLO DE INTERFAZ HTML**

### **Lista de paquetes:**

```html
<div class="packages-grid">
    <div class="package-card" v-for="package in packages" :key="package.id">
        <img :src="package.main_image" :alt="package.title" class="package-image">
        <div class="package-content">
            <h3 class="package-title">{{ package.title }}</h3>
            <p class="package-route">{{ package.origin }} → {{ package.destination }}</p>
            <div class="package-price">
                <span class="price-label">Desde:</span>
                <span class="price-value">${{ formatPrice(package.min_price) }}</span>
            </div>
            <div class="package-features">
                <span class="feature">{{ package.active_schedules_count }} salidas activas</span>
            </div>
            <button @click="viewPackage(package.id)" class="btn-view">
                Ver detalles
            </button>
        </div>
    </div>
</div>
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **✅ API de paquetes implementada** - 4 endpoints funcionando
2. **🔄 Crear paquetes en el CRM** - Usar el formulario que ya tienes
3. **🔄 Probar endpoints** - Verificar que devuelvan datos correctamente
4. **🔄 Integrar en tu sitio web** - Mostrar paquetes en el frontend
5. **🔄 Crear páginas de paquetes** - Lista, detalle, filtros

---

**¿Quieres que te ayude a probar algún endpoint específico o necesitas ayuda con la implementación en el frontend?** 🚀


