# Documentación del Servicio de Hoteles

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
10. [Ejemplos de Código](#ejemplos-de-código)

---

## Introducción

El servicio de Hoteles es un módulo integral del CRM que permite a las agencias de viajes gestionar reservas de alojamiento para sus clientes. El sistema está construido con Laravel y Livewire, proporcionando una experiencia de usuario moderna y reactiva para la gestión completa de reservas hoteleras.

### Características Principales
- ✅ **Gestión completa de reservas** con información detallada de hoteles
- ✅ **Múltiples tipos de habitación** (sencilla, doble, triple, cuádruple, múltiple)
- ✅ **Tipos de alimentación** (desayuno, media pensión, pensión completa, todo incluido)
- ✅ **Gestión de huéspedes** (adultos, niños, infantes)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Estados de reserva** (cotizado, vendido, descartado)
- ✅ **Observaciones automáticas** para clientes
- ✅ **Gestión de archivos multimedia** con HasMediaFiles
- ✅ **Integración con traslados** relacionados
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

---

## Arquitectura del Sistema

### Estructura de Directorios
```
app/
├── Livewire/Services/Hotels/
│   ├── CreateHotelReserves.php
│   ├── EditHotelReserves.php
│   ├── ShowHotelReserves.php
│   ├── IndexHotelReserves.php
│   └── Component/
│       ├── EditHotelReserves.php
│       └── IndexHotelReserves.php
├── Models/
│   ├── HotelReserve.php
│   ├── Provider.php
│   ├── Client.php
│   ├── Request.php
│   └── TransferReserve.php
└── ...

resources/views/livewire/services/hotels/
├── create-hotel-reserves.blade.php
├── edit-hotel-reserves.blade.php
├── show-hotel-reserves.blade.php
├── index-hotel-reserves.blade.php
└── component/
    ├── edit-hotel-reserves.blade.php
    └── index-hotel-reserves.blade.php

database/migrations/
└── 2025_07_16_194423_create_hotel_reserves_table.php

routes/modules/services/
└── hotels.php
```

---

## Modelo de Datos

### Modelo HotelReserve

#### Estructura de la Tabla `hotel_reserves`
```sql
CREATE TABLE hotel_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    agency_id BIGINT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    arrival_date DATETIME NOT NULL,
    departure_date DATETIME NOT NULL,
    name VARCHAR(255) NOT NULL,
    reservation_code VARCHAR(255) NULL,
    room_type VARCHAR(255) NOT NULL,
    type_food VARCHAR(255) NOT NULL,
    total_rooms TINYINT UNSIGNED NOT NULL,
    adult TINYINT UNSIGNED NOT NULL,
    children TINYINT UNSIGNED DEFAULT 0,
    infant TINYINT UNSIGNED DEFAULT 0,
    fare DECIMAL(15,2) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    total_fare DECIMAL(15,2) NOT NULL,
    description LONGTEXT NULL,
    observations LONGTEXT NULL,
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
- **`provider_id`**: ID del proveedor de hoteles
- **`arrival_date/departure_date`**: Fechas de llegada y salida
- **`name`**: Nombre del hotel
- **`reservation_code`**: Código de reserva del hotel
- **`room_type`**: Tipo de habitación
- **`type_food`**: Tipo de alimentación
- **`total_rooms`**: Número total de habitaciones
- **`adult/children/infant`**: Cantidad de huéspedes por tipo
- **`fare`**: Tarifa base de la reserva
- **`profit_percentage`**: Porcentaje de utilidad
- **`total_fare`**: Tarifa total calculada
- **`description`**: Descripción del hotel
- **`observations`**: Observaciones adicionales
- **`status`**: Estado de la reserva

### Tipos de Habitación
- **`Sencilla`**: Habitación para una persona
- **`Doble`**: Habitación para dos personas
- **`Triple`**: Habitación para tres personas
- **`Cuádruple`**: Habitación para cuatro personas
- **`Múltiple`**: Habitación para más de cuatro personas

### Tipos de Alimentación
- **`No incluye`**: Sin alimentación incluida
- **`Solo desayuno`**: Solo desayuno incluido
- **`Desayuno y cena`**: Media pensión
- **`Desayuno, almuerzo, cena`**: Pensión completa
- **`Todo incluido`**: Todo incluido (AI)

### Estados de Reserva
- **`cotizado`**: Reserva en proceso de cotización
- **`vendido`**: Reserva confirmada y vendida
- **`descartado`**: Reserva descartada por el cliente

---

## Componentes Livewire

### 1. CreateHotelReserves
**Ubicación**: `app/Livewire/Services/Hotels/CreateHotelReserves.php`

**Funcionalidades**:
- Creación de nuevas reservas de hotel
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos
- Observaciones automáticas
- Logs detallados para debugging

**Propiedades Principales**:
```php
public $provider_id;
public $arrival_date;
public $departure_date;
public $name;
public $room_type;
public $type_food;
public $total_rooms;
public $adult;
public $children = 0;
public $infant = 0;
public $fare = 0;
public $total_fare = 0;
public $profit_percentage = 0;
public $reservation_code = '';
public $status;
public $description;
public $observations;
```

**Métodos Clave**:
- `mount()`: Inicialización del componente
- `save()`: Guardado de la reserva
- `updated()`: Cálculo automático de tarifas
- `createAutomaticObservation()`: Creación de observación automática

### 2. EditHotelReserves
**Ubicación**: `app/Livewire/Services/Hotels/EditHotelReserves.php`

**Funcionalidades**:
- Edición de reservas existentes
- Carga de datos actuales
- Actualización de información
- Preservación de contexto

### 3. ShowHotelReserves
**Ubicación**: `app/Livewire/Services/Hotels/ShowHotelReserves.php`

**Funcionalidades**:
- Visualización detallada de la reserva
- Modal de edición
- Información completa del hotel
- Estado de la reserva

### 4. IndexHotelReserves
**Ubicación**: `app/Livewire/Services/Hotels/IndexHotelReserves.php`

**Funcionalidades**:
- Listado de reservas de hotel
- Filtros y búsqueda
- Acciones masivas
- Navegación entre reservas

### 5. Component/IndexHotelReserves
**Ubicación**: `app/Livewire/Services/Hotels/Component/IndexHotelReserves.php`

**Funcionalidades**:
- Componente especializado para listado
- Eliminación de reservas
- Confirmación de eliminación
- Logs detallados

---

## Base de Datos

### Relaciones Principales

#### HotelReserve
```php
// Reserva pertenece a un proveedor
public function provider()
{
    return $this->belongsTo(Provider::class);
}

// Reserva pertenece a una agencia
public function agency()
{
    return $this->belongsTo(Agency::class);
}

// Reserva pertenece a un cliente
public function client()
{
    return $this->belongsTo(Client::class);
}

// Reserva pertenece a un request
public function request()
{
    return $this->belongsTo(Request::class);
}

// Reserva tiene traslados relacionados
public function transfers()
{
    return $this->hasMany(TransferReserve::class);
}

// Reserva tiene pagos de proveedor
public function providerPayments()
{
    return $this->morphMany(ProviderPayment::class, 'payable');
}
```

### Traits Utilizados

#### HasMediaFiles
```php
use App\Traits\HasMediaFiles;

class HotelReserve extends Model
{
    use HasMediaFiles;
    
    // Permite gestión de archivos multimedia
    // - Subida de imágenes
    // - Gestión de documentos
    // - Almacenamiento organizado
}
```

#### HasObservations
```php
use App\Traits\HasObservations;

class HotelReserve extends Model
{
    use HasObservations;
    
    // Permite gestión de observaciones
    // - Observaciones automáticas
    // - Historial de cambios
    // - Seguimiento de estado
}
```

### Índices y Optimizaciones
- **Índice único** en slug para evitar duplicados
- **Foreign keys** con cascada para integridad referencial
- **Casts** para campos decimales y fechas
- **Validaciones** en nivel de base de datos

---

## API y Rutas

### Rutas de Hoteles
```php
Route::prefix('agency/{agency:slug}/clients/{client:slug}/request/{request:slug}')
    ->middleware(['auth', 'verified'])
    ->name('requests.')
    ->group(function () {
        Route::get('/hotels', IndexHotelReserves::class)->name('hotels.index');
        Route::get('/hotels/create', CreateHotelReserves::class)->name('hotels.create');
        Route::get('/hotels/{hotel}/edit', EditHotelReserves::class)->name('hotels.edit');
        Route::get('/hotels/{hotel}', ShowHotelReserves::class)->name('hotels.show');
    });
```

### Parámetros de Ruta
- **`agency`**: Slug de la agencia
- **`client`**: Slug del cliente
- **`request`**: Slug del request
- **`hotel`**: Slug de la reserva de hotel

---

## Funcionalidades Avanzadas

### Sistema de Observaciones Automáticas

#### Creación Automática
```php
private function createAutomaticObservation($hotel)
{
    $user = auth()->user();
    
    $observationText = "Se ha creado una reserva de hotel: {$this->name}. ";
    $observationText .= "Fecha de llegada: {$this->arrival_date}. ";
    $observationText .= "Fecha de salida: {$this->departure_date}. ";
    $observationText .= "Tipo de habitación: {$this->room_type}. ";
    $observationText .= "Tipo de alimentación: {$this->type_food}. ";
    $observationText .= "Habitaciones: {$this->total_rooms}. ";
    $observationText .= "Estado: {$this->status}. ";
    
    if ($this->fare > 0) {
        $observationText .= "Tarifa: $" . number_format($this->fare, 2) . ". ";
        $observationText .= "Total: $" . number_format($this->total_fare, 2) . ". ";
    }
    
    $this->client->observations()->create([
        'title' => 'Nueva reserva de hotel creada',
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
function hotelPricing() {
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

### Gestión de Archivos Multimedia

#### HasMediaFiles Trait
```php
// En el modelo HotelReserve
use App\Traits\HasMediaFiles;

// Métodos disponibles:
// - uploadFile($file, $type, $description)
// - getFiles($type)
// - deleteFile($fileId)
// - getFileUrl($file)
```

#### Uso en Componentes
```php
// Subir archivo
$hotel->uploadFile($file, 'image', 'Imagen del hotel');

// Obtener archivos
$images = $hotel->getFiles('image');

// Eliminar archivo
$hotel->deleteFile($fileId);
```

### Integración con Traslados

#### Relación con TransferReserve
```php
// Una reserva de hotel puede tener múltiples traslados
public function transfers()
{
    return $this->hasMany(TransferReserve::class);
}

// Crear traslado relacionado
$transfer = $hotel->transfers()->create([
    'service_type' => 'hotelero',
    'origin' => 'Aeropuerto',
    'destination' => $hotel->name,
    'arrival_date' => $hotel->arrival_date,
    // ... otros campos
]);
```

---

## Guías de Uso

### Crear una Reserva de Hotel

#### 1. Acceso al Formulario
```
URL: /agency/{agency}/clients/{client}/request/{request}/hotels/create
```

#### 2. Llenar Información Básica
- **Proveedor**: Seleccionar de la lista de proveedores
- **Fechas**: Fecha de llegada y salida
- **Nombre del Hotel**: Nombre del establecimiento
- **Código de Reserva**: Código de reserva del hotel

#### 3. Configurar Alojamiento
- **Tipo de Habitación**: Sencilla, doble, triple, etc.
- **Tipo de Alimentación**: Desayuno, media pensión, etc.
- **Número de Habitaciones**: Cantidad de habitaciones

#### 4. Configurar Huéspedes
- **Adultos**: Cantidad de adultos (mínimo 1)
- **Niños**: Cantidad de niños (opcional)
- **Infantes**: Cantidad de infantes (opcional)

#### 5. Establecer Tarifas
- **Tarifa Neta**: Costo base de la reserva
- **% de Utilidad**: Porcentaje de ganancia
- **Total**: Se calcula automáticamente

#### 6. Configurar Estado y Descripción
- **Estado**: Cotizado, vendido, descartado
- **Descripción**: Detalles del hotel
- **Observaciones**: Notas adicionales

#### 7. Guardar
- Hacer clic en "Crear Reserva"
- El sistema generará un slug único
- Se creará una observación automática
- Redirección al detalle de la reserva

### Editar una Reserva

#### 1. Acceso a Edición
- Desde el listado de reservas
- Desde el detalle de la reserva
- Botón "Editar" en la interfaz

#### 2. Modificar Información
- Actualizar campos necesarios
- El sistema preservará el contexto
- Validación en tiempo real

#### 3. Guardar Cambios
- Hacer clic en "Actualizar"
- Se creará observación de actualización
- Redirección al detalle actualizado

### Visualizar una Reserva

#### 1. Vista Detallada
- Información completa del hotel
- Detalles del proveedor
- Estado actual de la reserva
- Traslados relacionados

#### 2. Modal de Edición
- Edición rápida en modal
- Campos principales editables
- Guardado sin salir de la vista

#### 3. Acciones Disponibles
- **Editar**: Modificar la reserva
- **Eliminar**: Eliminar la reserva
- **Cambiar Estado**: Actualizar estado

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Validación de Fechas
**Síntoma**: `The departure date must be a date after or equal to arrival date`

**Solución**: Verificar que la fecha de salida sea posterior o igual a la fecha de llegada:
```php
'departure_date' => 'required|date|after_or_equal:arrival_date',
```

#### 2. Error de Slug Duplicado
**Síntoma**: `SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry`

**Solución**: El sistema genera automáticamente slugs únicos:
```php
do {
    $slug = Str::slug("{$this->name}") . '-' . Str::random(8);
} while (Request::where('slug', $slug)->exists());
```

#### 3. Error de Cálculo de Tarifas
**Síntoma**: El total no se calcula automáticamente

**Solución**: Verificar JavaScript y validaciones:
```php
public function updated($property)
{
    if (in_array($property, ['fare', 'profit_percentage'])) {
        $fare = floatval($this->fare);
        $profit = floatval($this->profit_percentage);
        $this->total_fare = round($fare + ($fare * $profit / 100), 2);
    }
}
```

#### 4. Error de Archivos Multimedia
**Síntoma**: No se pueden subir archivos

**Solución**: Verificar configuración de Storage y permisos:
```php
// Verificar que el trait HasMediaFiles esté incluido
use App\Traits\HasMediaFiles;

// Verificar permisos de Storage
php artisan storage:link
```

#### 5. Error de Eliminación
**Síntoma**: No se puede eliminar la reserva

**Solución**: Verificar logs y confirmación:
```php
public function delete($hotelId)
{
    try {
        $hotel = HotelReserve::findOrFail($hotelId);
        $hotel->delete();
        
        $this->dispatch('hotelDeleted');
        $this->loadHotels();
    } catch (\Exception $e) {
        Log::error('Error al eliminar hotel', [
            'hotel_id' => $hotelId,
            'error' => $e->getMessage()
        ]);
    }
}
```

### Logs y Debugging

#### Habilitar Logs Detallados
```php
// En el componente
Log::debug('[HOTEL] Montando componente', [
    'agency_id' => $agency->id,
    'client_id' => $client->id,
    'request_id' => $request->id,
]);

Log::debug('[HOTEL] Datos iniciales cargados', [
    'arrival_date' => $this->arrival_date,
    'departure_date' => $this->departure_date,
    'adult' => $this->adult,
]);
```

#### Verificar Logs
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Buscar errores específicos de hoteles
grep "HOTEL" storage/logs/laravel.log
```

---

## Ejemplos de Código

### Crear una Reserva Programáticamente

```php
use App\Models\HotelReserve;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;

// Crear una reserva desde código
$hotel = HotelReserve::create([
    'provider_id' => 1,
    'agency_id' => 1,
    'arrival_date' => '2025-10-15 14:00:00',
    'departure_date' => '2025-10-20 11:00:00',
    'name' => 'Hotel Marriott Bogotá',
    'reservation_code' => 'MAR123456',
    'room_type' => 'Doble',
    'type_food' => 'Desayuno y cena',
    'total_rooms' => 2,
    'adult' => 4,
    'children' => 1,
    'infant' => 0,
    'fare' => 800000,
    'profit_percentage' => 20,
    'total_fare' => 960000,
    'description' => 'Hotel de lujo en el centro de Bogotá',
    'observations' => 'Habitaciones con vista a la ciudad',
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

### Consultas de Base de Datos

```php
// Obtener reservas con relaciones
$hotels = HotelReserve::with(['provider', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('arrival_date', 'asc')
    ->get();

// Obtener reservas por tipo de habitación
$doubleRooms = HotelReserve::where('room_type', 'Doble')
    ->with('provider')
    ->get();

// Obtener reservas por proveedor
$hotels = HotelReserve::where('provider_id', $providerId)
    ->with(['client', 'agency'])
    ->paginate(20);

// Obtener reservas por rango de fechas
$hotels = HotelReserve::whereBetween('arrival_date', ['2025-10-01', '2025-10-31'])
    ->with(['provider', 'client'])
    ->get();
```

### Scopes del Modelo

```php
// En el modelo HotelReserve
public function scopeByRoomType($query, $roomType)
{
    return $query->where('room_type', $roomType);
}

public function scopeByFoodType($query, $foodType)
{
    return $query->where('type_food', $foodType);
}

public function scopeByStatus($query, $status)
{
    return $query->where('status', $status);
}

public function scopeByDateRange($query, $startDate, $endDate)
{
    return $query->whereBetween('arrival_date', [$startDate, $endDate]);
}

public function scopeByProvider($query, $providerId)
{
    return $query->where('provider_id', $providerId);
}

public function scopeWithChildren($query)
{
    return $query->where('children', '>', 0);
}

public function scopeWithInfants($query)
{
    return $query->where('infant', '>', 0);
}
```

### Uso de Scopes

```php
// Obtener reservas de habitaciones dobles
$doubleRooms = HotelReserve::byRoomType('Doble')->get();

// Obtener reservas con todo incluido
$allInclusive = HotelReserve::byFoodType('Todo incluido')->get();

// Obtener reservas vendidas en un rango de fechas
$soldHotels = HotelReserve::byStatus('vendido')
    ->byDateRange('2025-10-01', '2025-10-31')
    ->get();

// Obtener reservas con niños
$hotelsWithChildren = HotelReserve::withChildren()->get();
```

### Mutators y Accessors

```php
// En el modelo HotelReserve
public function setFareAttribute($value)
{
    $this->attributes['fare'] = $value * 100; // Convertir a centavos
}

public function getFareAttribute($value)
{
    return $value / 100; // Convertir de centavos
}

public function getFormattedFareAttribute()
{
    return '$' . number_format($this->fare, 2, ',', '.');
}

public function getFormattedTotalFareAttribute()
{
    return '$' . number_format($this->total_fare, 2, ',', '.');
}

public function getStayDurationAttribute()
{
    $arrival = Carbon::parse($this->arrival_date);
    $departure = Carbon::parse($this->departure_date);
    
    return $arrival->diffInDays($departure);
}

public function getGuestCountAttribute()
{
    return $this->adult + $this->children + $this->infant;
}

public function getIsAllInclusiveAttribute()
{
    return $this->type_food === 'Todo incluido';
}

public function getIsLongStayAttribute()
{
    return $this->stay_duration > 7; // Más de 7 días
}
```

### API Resources

```php
// app/Http/Resources/HotelReserveResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class HotelReserveResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'reservation_code' => $this->reservation_code,
            'arrival_date' => $this->arrival_date->format('Y-m-d H:i'),
            'departure_date' => $this->departure_date->format('Y-m-d H:i'),
            'room_type' => $this->room_type,
            'type_food' => $this->type_food,
            'total_rooms' => $this->total_rooms,
            'guests' => [
                'adult' => $this->adult,
                'children' => $this->children,
                'infant' => $this->infant,
                'total' => $this->guest_count,
            ],
            'pricing' => [
                'fare' => $this->fare,
                'profit_percentage' => $this->profit_percentage,
                'total_fare' => $this->total_fare,
                'formatted_fare' => $this->formatted_fare,
                'formatted_total_fare' => $this->formatted_total_fare,
            ],
            'stay_info' => [
                'duration_days' => $this->stay_duration,
                'is_all_inclusive' => $this->is_all_inclusive,
                'is_long_stay' => $this->is_long_stay,
            ],
            'status' => $this->status,
            'description' => $this->description,
            'observations' => $this->observations,
            'provider' => new ProviderResource($this->provider),
            'client' => new ClientResource($this->client),
            'agency' => new AgencyResource($this->agency),
            'transfers' => TransferReserveResource::collection($this->transfers),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Testing

```php
// tests/Feature/HotelReserveTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HotelReserve;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;
use Livewire\Livewire;
use App\Livewire\Services\Hotels\CreateHotelReserves;

class HotelReserveTest extends TestCase
{
    public function test_can_create_hotel_reserve()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        $provider = Provider::factory()->create();
        
        Livewire::test(CreateHotelReserves::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('provider_id', $provider->id)
        ->set('name', 'Hotel Test')
        ->set('arrival_date', '2025-12-01')
        ->set('departure_date', '2025-12-05')
        ->set('room_type', 'Doble')
        ->set('type_food', 'Desayuno y cena')
        ->set('total_rooms', 2)
        ->set('fare', 500000)
        ->set('profit_percentage', 15)
        ->call('save')
        ->assertHasNoErrors();
        
        $this->assertDatabaseHas('hotel_reserves', [
            'name' => 'Hotel Test',
            'room_type' => 'Doble',
            'type_food' => 'Desayuno y cena',
            'fare' => 500000,
        ]);
    }
    
    public function test_hotel_reserve_requires_name()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateHotelReserves::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('name', '')
        ->call('save')
        ->assertHasErrors(['name' => 'required']);
    }
    
    public function test_departure_date_must_be_after_arrival_date()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateHotelReserves::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('arrival_date', '2025-12-05')
        ->set('departure_date', '2025-12-01')
        ->call('save')
        ->assertHasErrors(['departure_date' => 'after_or_equal']);
    }
}
```

---

## Conclusión

El servicio de Hoteles proporciona una solución completa para la gestión de reservas de alojamiento. Con características avanzadas como cálculo automático de tarifas, observaciones automáticas, gestión de archivos multimedia, integración con traslados y una interfaz moderna, el sistema está diseñado para mejorar la eficiencia y la experiencia del usuario en las agencias de viajes.

### Características Destacadas
- ✅ **Interfaz moderna** con Livewire
- ✅ **Validación robusta** en tiempo real
- ✅ **Cálculo automático** de tarifas
- ✅ **Observaciones automáticas** para clientes
- ✅ **Gestión de archivos multimedia** con HasMediaFiles
- ✅ **Integración con traslados** relacionados
- ✅ **Estados de seguimiento** completos
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con el sistema CRM

### Próximas Mejoras
- 🔄 **Integración con APIs** de hoteles
- 🔄 **Notificaciones push** para cambios de estado
- 🔄 **Reportes avanzados** de reservas
- 🔄 **Sistema de calificaciones** de hoteles
- 🔄 **Exportación de datos** en múltiples formatos

---

*Documentación actualizada: Septiembre 2025*
*Versión del sistema: 1.0.0*
