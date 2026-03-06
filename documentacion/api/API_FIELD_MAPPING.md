# 🗺️ **MAPEO DE CAMPOS - FRONTEND A BACKEND**

## 📋 **DESCRIPCIÓN**

Este archivo contiene el mapeo entre los valores que se muestran en el frontend y los valores exactos que debe enviar la API al backend.

---

## 🔄 **MAPEO DE CAMPOS**

### **1. `request_type` (Tipo de Servicio)**

| **Frontend (Display)** | **Backend (API)** | **Descripción** |
|------------------------|-------------------|-----------------|
| 🛫 **Vuelo** | `"tiquete_aereo"` | Tiquete aéreo |
| 🏨 **Hotel** | `"hotel"` | Hotel/alojamiento |
| 🎒 **Paquete** | `"paquete_completo"` | Paquete turístico completo |
| 🚐 **Transfer** | `"traslado"` | Servicio de traslado |
| 🩺 **Asistencia médica** | `"seguro_viaje"` | Seguro de viaje |
| 📋 **Otro** | `"plan_turistico"` | Plan turístico personalizado |

### **2. `destination_type` (Tipo de Destino)**

| **Frontend (Display)** | **Backend (API)** | **Descripción** |
|------------------------|-------------------|-----------------|
| 🇨🇴 **Nacional** | `"nacional"` | Destino dentro de Colombia |
| 🌍 **Internacional** | `"internacional"` | Destino fuera de Colombia |

---

## 💻 **IMPLEMENTACIÓN EN FRONTEND**

### **JavaScript - Mapeo de Valores:**

```javascript
// Mapeo de tipos de servicio
const requestTypeMapping = {
    'Vuelo': 'tiquete_aereo',
    'Hotel': 'hotel',
    'Paquete': 'paquete_completo',
    'Transfer': 'traslado',
    'Asistencia médica': 'seguro_viaje',
    'Otro': 'plan_turistico'
};

// Mapeo de tipos de destino
const destinationTypeMapping = {
    'Nacional': 'nacional',
    'Internacional': 'internacional'
};

// Función para convertir valores del frontend al backend
function mapFrontendToBackend(frontendData) {
    return {
        ...frontendData,
        request_type: requestTypeMapping[frontendData.request_type],
        destination_type: destinationTypeMapping[frontendData.destination_type]
    };
}

// Ejemplo de uso
const frontendData = {
    request_type: 'Vuelo',        // Lo que ve el usuario
    destination_type: 'Nacional'   // Lo que ve el usuario
};

const apiData = mapFrontendToBackend(frontendData);
// Resultado: { request_type: 'tiquete_aereo', destination_type: 'nacional' }
```

### **HTML - Opciones del Select:**

```html
<!-- Tipo de Servicio -->
<select id="request_type" name="request_type" class="form-select" required>
    <option value="">Selecciona un servicio</option>
    <option value="Vuelo">🛫 Vuelo</option>
    <option value="Hotel">🏨 Hotel</option>
    <option value="Paquete">🎒 Paquete</option>
    <option value="Transfer">🚐 Transfer</option>
    <option value="Asistencia médica">🩺 Asistencia médica</option>
    <option value="Otro">📋 Otro</option>
</select>

<!-- Tipo de Destino -->
<select id="destination_type" name="destination_type" class="form-select" required>
    <option value="">Selecciona el tipo</option>
    <option value="Nacional">🇨🇴 Nacional</option>
    <option value="Internacional">🌍 Internacional</option>
</select>
```

---

## 📤 **EJEMPLO COMPLETO DE PETICIÓN API**

### **Datos del Frontend (formulario):**
```json
{
    "agency_slug": "agencia-principal",
    "client_name": "Juan Pérez",
    "client_email": "juan@email.com",
    "client_phone": "3001234567",
    "request_type": "Vuelo",           // ← Usuario selecciona "Vuelo"
    "destination_type": "Nacional",     // ← Usuario selecciona "Nacional"
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

### **Datos Enviados a la API (después del mapeo):**
```json
{
    "agency_slug": "agencia-principal",
    "client_name": "Juan Pérez",
    "client_email": "juan@email.com",
    "client_phone": "3001234567",
    "request_type": "tiquete_aereo",    // ← Convertido a valor de BD
    "destination_type": "nacional",      // ← Convertido a valor de BD
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

---

## ⚠️ **IMPORTANTE**

1. **NUNCA envíes los valores del frontend directamente** a la API
2. **SIEMPRE usa la función de mapeo** antes de enviar los datos
3. **Los valores de la base de datos son en minúsculas** y con guiones bajos
4. **Los valores del frontend pueden ser en español** y más amigables para el usuario

---

## 🔧 **VALIDACIÓN EN EL BACKEND**

### **Reglas de Validación Actualizadas:**
```php
'request_type' => 'required|string|in:plan_turistico,tiquete_aereo,hotel,paquete_completo,traslado,seguro_viaje',
'destination_type' => 'required|string|in:nacional,internacional',
```

### **Valores Aceptados por la Base de Datos:**
- **request_type:** `plan_turistico`, `tiquete_aereo`, `hotel`, `paquete_completo`, `traslado`, `seguro_viaje`
- **destination_type:** `nacional`, `internacional`

---

**¿Te queda claro el mapeo? ¿Necesitas ayuda para implementar la función de conversión en tu frontend?**
