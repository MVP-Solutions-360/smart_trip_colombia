# Documentación del Servicio de Traslados

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [Componentes Livewire](#componentes-livewire)
5. [Base de Datos](#base-de-datos)
6. [API y Rutas](#api-y-rutas)
7. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
8. [Guías de Uso](#guías-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

El servicio de Traslados es un módulo integral del CRM que permite a las agencias de viajes gestionar servicios de transporte para sus clientes. El sistema está construido con Laravel y Livewire, proporcionando una experiencia de usuario moderna y reactiva para la gestión completa de traslados.

### Características Principales
- ✅ **Gestión completa de traslados** con información detallada
- ✅ **Múltiples tipos de servicio** (aeroportuario, hotelero, personalizado)
- ✅ **Tipos de viaje** (ida, ida y vuelta, múltiple)
- ✅ **Estados de traslado** (cotizado, vendido, descartado)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Observaciones automáticas** para clientes
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

---

## Arquitectura del Sistema

### Estructura de Directorios
```
app/
├── Livewire/Services/Transfer/
│   ├── CreateTransferReserve.php
│   ├── EditTransferReserve.php
│   ├── ShowTransferReserve.php
│   └── IndexTransferReserve.php
├── Models/
│   ├── TransferReserve.php
│   ├── Client.php
│   ├── Request.php
│   └── ...
└── ...

resources/views/livewire/services/transfer/
├── create-transfer-reserve.blade.php
├── edit-transfer-reserve.blade.php
├── show-transfer-reserve.blade.php
└── index-transfer-reserve.blade.php

database/migrations/
└── 2025_07_16_194423_create_transfer_reserves_table.php

routes/modules/services/
└── transfers.php
```

---

## Modelo de Datos

### Modelo TransferReserve

#### Estructura de la Tabla `transfer_reserves`
```sql
CREATE TABLE transfer_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    agency_id BIGINT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    service_type VARCHAR(255) NOT NULL,
    travel_type VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    departure_date DATE NULL,
    departure_time TIME NULL,
    adult TINYINT UNSIGNED NOT NULL,
    children TINYINT UNSIGNED DEFAULT 0,
    infant TINYINT UNSIGNED DEFAULT 0,
    fare DECIMAL(15,2) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    total_fare DECIMAL(15,2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    client_id BIGINT NOT NULL,
    request_id BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

#### Campos Principales
- **`service_type`**: Tipo de servicio (aeroportuario, hotelero, personalizado)
- **`travel_type`**: Tipo de viaje (ida, ida y vuelta, múltiple)
- **`origin`**: Origen del traslado
- **`destination`**: Destino del traslado
- **`arrival_date/arrival_time`**: Fecha y hora de llegada
- **`departure_date/departure_time`**: Fecha y hora de salida
- **`adult/children/infant`**: Cantidad de pasajeros por tipo
- **`fare`**: Tarifa base del traslado
- **`profit_percentage`**: Porcentaje de utilidad
- **`total_fare`**: Tarifa total calculada
- **`status`**: Estado del traslado

### Tipos de Servicio
- **`aeroportuario`**: Traslados desde/hacia aeropuertos
- **`hotelero`**: Traslados entre hoteles
- **`personalizado`**: Traslados con origen y destino específicos

### Tipos de Viaje
- **`ida`**: Solo ida
- **`ida y vuelta`**: Ida y regreso
- **`múltiple`**: Múltiples destinos

### Estados de Traslado
- **`cotizado`**: Traslado en proceso de cotización
- **`vendido`**: Traslado confirmado y vendido
- **`descartado`**: Traslado descartado por el cliente

---

## Componentes Livewire

### 1. CreateTransferReserve
**Ubicación**: `app/Livewire/Services/Transfer/CreateTransferReserve.php`

**Funcionalidades**:
- Creación de nuevos traslados
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos
- Observaciones automáticas
- Logs detallados para debugging

### 2. EditTransferReserve
**Ubicación**: `app/Livewire/Services/Transfer/EditTransferReserve.php`

**Funcionalidades**:
- Edición de traslados existentes
- Carga de datos actuales
- Actualización de información
- Preservación de contexto

### 3. ShowTransferReserve
**Ubicación**: `app/Livewire/Services/Transfer/ShowTransferReserve.php`

**Funcionalidades**:
- Visualización detallada del traslado
- Información completa del servicio
- Estado del traslado

### 4. IndexTransferReserve
**Ubicación**: `app/Livewire/Services/Transfer/IndexTransferReserve.php`

**Funcionalidades**:
- Listado de traslados
- Filtros y búsqueda
- Acciones masivas
- Navegación entre traslados

---

## Base de Datos

### Relaciones Principales

#### TransferReserve
```php
// Traslado pertenece a un proveedor
public function provider()
{
    return $this->belongsTo(Provider::class);
}

// Traslado pertenece a una agencia
public function agency()
{
    return $this->belongsTo(Agency::class);
}

// Traslado pertenece a un cliente
public function client()
{
    return $this->belongsTo(Client::class);
}

// Traslado pertenece a un request
public function request()
{
    return $this->belongsTo(Request::class);
}
```

### Traits Utilizados

#### HasObservations
```php
use App\Traits\HasObservations;

class TransferReserve extends Model
{
    use HasObservations;
    
    // Permite gestión de observaciones
    // - Observaciones automáticas
    // - Historial de cambios
    // - Seguimiento de estado
}
```

---

## API y Rutas

### Rutas de Traslados
```php
Route::prefix('agency/{agency:slug}/clients/{client:slug}/request/{request:slug}')
    ->middleware(['auth', 'verified'])
    ->name('requests.')
    ->group(function () {
        Route::get('/transfers', IndexTransferReserve::class)->name('transfers.index');
        Route::get('/transfers/create', CreateTransferReserve::class)->name('transfers.create');
        Route::get('/transfers/{transfer}/edit', EditTransferReserve::class)->name('transfers.edit');
        Route::get('/transfers/{transfer}', ShowTransferReserve::class)->name('transfers.show');
    });
```

---

## Funcionalidades Avanzadas

### Sistema de Observaciones Automáticas

#### Creación Automática
```php
private function createAutomaticObservation($transfer)
{
    $user = auth()->user();
    
    $observationText = "Se ha creado un traslado: {$this->service_type}. ";
    $observationText .= "Origen: {$this->origin}. ";
    $observationText .= "Destino: {$this->destination}. ";
    $observationText .= "Fecha: {$this->arrival_date}. ";
    $observationText .= "Estado: {$this->status}. ";
    
    if ($this->fare > 0) {
        $observationText .= "Tarifa: $" . number_format($this->fare, 2) . ". ";
        $observationText .= "Total: $" . number_format($this->total_fare, 2) . ". ";
    }
    
    $this->client->observations()->create([
        'title' => 'Nuevo traslado creado',
        'body' => $observationText,
        'user_id' => $user->id,
        'type' => 'operational',
        'priority' => 'medium',
        'is_private' => false,
        'agency_id' => $this->agency->id,
    ]);
}
```

### Cálculo Automático de Tarifas

#### JavaScript para Cálculo en Tiempo Real
```javascript
function transferPricing() {
    return {
        fare: 0,
        profit: 0,
        totalFare: 0,
        
        init() {
            this.calculateTotal();
        },
        
        calculateTotal() {
            const fare = parseFloat(this.fare) || 0;
            const profit = parseFloat(this.profit) || 0;
            
            if (fare > 0 && profit >= 0) {
                this.totalFare = (fare + (fare * profit / 100)).toFixed(2);
            } else {
                this.totalFare = fare.toFixed(2);
            }
        }
    }
}
```

---

## Guías de Uso

### Crear un Traslado

#### 1. Acceso al Formulario
```
URL: /agency/{agency}/clients/{client}/request/{request}/transfers/create
```

#### 2. Llenar Información Básica
- **Proveedor**: Seleccionar de la lista de proveedores
- **Tipo de Servicio**: Aeroportuario, hotelero, personalizado
- **Tipo de Viaje**: Ida, ida y vuelta, múltiple
- **Origen**: Punto de partida
- **Destino**: Punto de llegada

#### 3. Configurar Fechas y Horarios
- **Fecha de Llegada**: Fecha de llegada al destino
- **Hora de Llegada**: Hora de llegada
- **Fecha de Salida**: Fecha de salida (si aplica)
- **Hora de Salida**: Hora de salida (si aplica)

#### 4. Configurar Pasajeros
- **Adultos**: Cantidad de adultos (mínimo 1)
- **Niños**: Cantidad de niños (opcional)
- **Infantes**: Cantidad de infantes (opcional)

#### 5. Establecer Tarifas
- **Tarifa Neta**: Costo base del traslado
- **% de Utilidad**: Porcentaje de ganancia
- **Total**: Se calcula automáticamente

#### 6. Configurar Estado
- **Estado**: Cotizado, vendido, descartado

#### 7. Guardar
- Hacer clic en "Crear Traslado"
- El sistema generará un slug único
- Se creará una observación automática
- Redirección al detalle del traslado

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Validación de Fechas
**Síntoma**: `The departure date must be a date after or equal to arrival date`

**Solución**: Verificar que la fecha de salida sea posterior o igual a la fecha de llegada.

#### 2. Error de Slug Duplicado
**Síntoma**: `SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry`

**Solución**: El sistema genera automáticamente slugs únicos con código aleatorio.

#### 3. Error de Cálculo de Tarifas
**Síntoma**: El total no se calcula automáticamente

**Solución**: Verificar JavaScript y validaciones en el componente.

#### 4. Error de Validación de Pasajeros
**Síntoma**: `The adult field is required`

**Solución**: Asegurar que al menos un adulto esté especificado.

---

## Conclusión

El servicio de Traslados proporciona una solución completa para la gestión de servicios de transporte. Con características avanzadas como múltiples tipos de servicio, cálculo automático de tarifas, observaciones automáticas y una interfaz moderna, el sistema está diseñado para mejorar la eficiencia y la experiencia del usuario en las agencias de viajes.

### Características Destacadas
- ✅ **Interfaz moderna** con Livewire
- ✅ **Validación robusta** en tiempo real
- ✅ **Cálculo automático** de tarifas
- ✅ **Observaciones automáticas** para clientes
- ✅ **Múltiples tipos** de servicio y viaje
- ✅ **Estados de seguimiento** completos
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con el sistema CRM

---

*Documentación actualizada: Septiembre 2025*
*Versión del sistema: 1.0.0*