# Documentación del Servicio de Tiquetes Aéreos

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

El servicio de Tiquetes Aéreos es un módulo integral del CRM que permite a las agencias de viajes gestionar reservas de vuelos para sus clientes. El sistema está construido con Laravel y Livewire, proporcionando una experiencia de usuario moderna y reactiva para la gestión completa de tiquetes aéreos.

### Características Principales
- ✅ **Gestión completa de tiquetes** con información detallada de vuelos
- ✅ **Múltiples tipos de vuelo** (ida, ida y vuelta, multidestino)
- ✅ **Gestión de pasajeros** (adultos, niños, infantes)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Estados de tiquete** (cotizado, vendido, descartado)
- ✅ **Observaciones automáticas** para clientes
- ✅ **Tareas automáticas** de check-in
- ✅ **Conversión de números a letras** para facturación
- ✅ **Gestión de equipaje** e inclusiones
- ✅ **Integración completa** con requests y clientes

---

## Arquitectura del Sistema

### Estructura de Directorios
```
app/
├── Livewire/Services/AirlineTickets/
│   ├── CreateAirlineTickets.php
│   ├── EditAirlineTickets.php
│   ├── ShowAirlineTickets.php
│   ├── IndexAirlineTickets.php
│   └── Component/
│       ├── EditAirlineTickets.php
│       └── IndexAirlineTickets.php
├── Models/
│   ├── AirlineTicket.php
│   ├── Provider.php
│   ├── Client.php
│   ├── Request.php
│   └── Task.php
└── ...

resources/views/livewire/services/airline-tickets/
├── create-airline-tickets.blade.php
├── edit-airline-tickets.blade.php
├── show-airline-tickets.blade.php
├── index-airline-tickets.blade.php
└── component/
    ├── edit-airline-tickets.blade.php
    └── index-airline-tickets.blade.php

database/migrations/
└── 2025_07_16_192959_create_airline_tickets_table.php

routes/modules/services/
└── tickets.php
```

---

## Modelo de Datos

### Modelo AirlineTicket

#### Estructura de la Tabla `airline_tickets`
```sql
CREATE TABLE airline_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agency_id BIGINT NULL,
    service_type VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    provider_id BIGINT NULL,
    flight_type VARCHAR(255) NULL,
    destination_type VARCHAR(255) NULL,
    airline VARCHAR(255) NULL,
    reservation_code VARCHAR(255) NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NULL,
    adult TINYINT UNSIGNED NOT NULL,
    children TINYINT UNSIGNED DEFAULT 0,
    infant TINYINT UNSIGNED DEFAULT 0,
    baggage JSON NULL,
    include JSON NULL,
    fare INT NULL,
    profit_percentage INT NULL,
    total_fare INT NULL,
    image_path VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    observations TEXT NULL,
    client_id BIGINT NOT NULL,
    request_id BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

#### Campos Principales
- **`service_type`**: Tipo de servicio (airline_ticket)
- **`provider_id`**: ID del proveedor de tiquetes
- **`flight_type`**: Tipo de vuelo (oneway, roundtrip, multidestino)
- **`destination_type`**: Tipo de destino (Nacional, Internacional)
- **`airline`**: Nombre de la aerolínea
- **`reservation_code`**: Código de reserva del vuelo
- **`origin/destination`**: Origen y destino del vuelo
- **`departure_date/return_date`**: Fechas de salida y regreso
- **`adult/children/infant`**: Cantidad de pasajeros por tipo
- **`baggage`**: Información de equipaje (JSON)
- **`include`**: Servicios incluidos (JSON)
- **`fare`**: Tarifa base del tiquete
- **`profit_percentage`**: Porcentaje de utilidad
- **`total_fare`**: Tarifa total calculada
- **`status`**: Estado del tiquete
- **`observations`**: Observaciones adicionales

### Tipos de Vuelo
- **`oneway`**: Solo ida
- **`roundtrip`**: Ida y vuelta
- **`multidestino`**: Múltiples destinos

### Tipos de Destino
- **`Nacional`**: Vuelos nacionales
- **`Internacional`**: Vuelos internacionales

### Estados de Tiquete
- **`cotizado`**: Tiquete en proceso de cotización
- **`vendido`**: Tiquete confirmado y vendido
- **`descartado`**: Tiquete descartado por el cliente

---

## Componentes Livewire

### 1. CreateAirlineTickets
**Ubicación**: `app/Livewire/Services/AirlineTickets/CreateAirlineTickets.php`

**Funcionalidades**:
- Creación de nuevos tiquetes aéreos
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos
- Observaciones automáticas
- Creación de tareas de check-in

**Propiedades Principales**:
```php
public $ticket = [
    'service_type' => 'airline_ticket',
    'provider_id' => '',
    'flight_type' => '',
    'destination_type' => '',
    'airline' => '',
    'reservation_code' => '',
    'origin' => '',
    'destination' => '',
    'departure_date' => '',
    'return_date' => '',
    'adult' => 1,
    'children' => 0,
    'infant' => 0,
    'fare' => 0,
    'profit_percentage' => 0,
    'total_fare' => 0,
    'status' => '',
    'include' => ['Artículo personal'],
    'baggage' => ['Artículo personal'],
    'observations' => ''
];
```

**Métodos Clave**:
- `mount()`: Inicialización del componente
- `save()`: Guardado del tiquete
- `createAutomaticObservation()`: Creación de observación automática
- `updated()`: Cálculo automático de tarifas

### 2. EditAirlineTickets
**Ubicación**: `app/Livewire/Services/AirlineTickets/EditAirlineTickets.php`

**Funcionalidades**:
- Edición de tiquetes existentes
- Carga de datos actuales
- Actualización de información
- Preservación de contexto

### 3. ShowAirlineTickets
**Ubicación**: `app/Livewire/Services/AirlineTickets/ShowAirlineTickets.php`

**Funcionalidades**:
- Visualización detallada del tiquete
- Conversión de números a letras
- Modal de edición
- Eliminación de tiquetes

**Características Especiales**:
- **Conversión a letras**: Utiliza `NumberToWords` para convertir tarifas
- **Modal de edición**: Interfaz flyout para edición rápida
- **Información completa**: Muestra todos los detalles del vuelo

### 4. IndexAirlineTickets
**Ubicación**: `app/Livewire/Services/AirlineTickets/IndexAirlineTickets.php`

**Funcionalidades**:
- Listado de tiquetes
- Filtros y búsqueda
- Acciones masivas
- Navegación entre tiquetes

---

## Base de Datos

### Relaciones Principales

#### AirlineTicket
```php
// Tiquete pertenece a una agencia
public function agency()
{
    return $this->belongsTo(Agency::class);
}

// Tiquete pertenece a un proveedor
public function provider()
{
    return $this->belongsTo(Provider::class);
}

// Tiquete pertenece a un cliente
public function client()
{
    return $this->belongsTo(Client::class);
}

// Tiquete pertenece a un request
public function request()
{
    return $this->belongsTo(Request::class);
}

// Tiquete tiene observaciones
public function observations()
{
    return $this->morphMany(Observation::class, 'observable');
}
```

### Índices y Optimizaciones
- **Índice único** en slug para evitar duplicados
- **Foreign keys** con cascada para integridad referencial
- **Soft deletes** para preservar historial
- **Casts** para campos JSON y fechas

---

## API y Rutas

### Rutas de Tiquetes
```php
Route::prefix('agency/{agency:slug}/clients/{client:slug}/request/{request:slug}')
    ->middleware(['auth', 'verified'])
    ->name('requests.')
    ->group(function () {
        Route::get('/tickets', IndexAirlineTickets::class)->name('tickets.index');
        Route::get('/tickets/create', CreateAirlineTickets::class)->name('tickets.create');
        Route::get('/tickets/{ticket}', ShowAirlineTickets::class)->name('tickets.show');
        Route::get('/tickets/{ticket}/edit', EditAirlineTickets::class)->name('tickets.edit');
    });
```

### Parámetros de Ruta
- **`agency`**: Slug de la agencia
- **`client`**: Slug del cliente
- **`request`**: Slug del request
- **`ticket`**: Slug del tiquete

---

## Funcionalidades Avanzadas

### Sistema de Observaciones Automáticas

#### Creación Automática
```php
private function createAutomaticObservation($ticket)
{
    $user = auth()->user();
    
    $observationText = "Se ha creado un tiquete aéreo: {$this->ticket['airline']}. ";
    $observationText .= "Origen: {$this->ticket['origin']}. ";
    $observationText .= "Destino: {$this->ticket['destination']}. ";
    $observationText .= "Fecha de salida: {$this->ticket['departure_date']}. ";
    
    if ($this->ticket['return_date']) {
        $observationText .= "Fecha de regreso: {$this->ticket['return_date']}. ";
    }
    
    $observationText .= "Estado: {$this->ticket['status']}. ";
    
    if ($this->ticket['fare'] > 0) {
        $observationText .= "Tarifa: $" . number_format($this->ticket['fare'], 2) . ". ";
        $observationText .= "Total: $" . number_format($this->ticket['total_fare'], 2) . ". ";
    }
    
    $this->client->observations()->create([
        'title' => 'Nuevo tiquete aéreo creado',
        'body' => $observationText,
        'user_id' => $user->id,
        'type' => 'operational',
        'priority' => 'medium',
        'is_private' => false,
        'agency_id' => $this->agency->id,
    ]);
}
```

### Sistema de Tareas Automáticas

#### Creación de Tarea de Check-in
```php
$task = Task::create([
    'agency_id'   => $this->agency->id,
    'client_id'   => $this->client->id,
    'personnel_id' => $user->personnel?->id ?? null,
    'request_id'  => $this->request->id,
    'airline_ticket_id' => $ticket->id,
    'title'       => 'Check-in: ' . $this->ticket['destination'],
    'type_task'   => 'check-in',
    'description' => 'Realizar check-in para los vuelos',
    'state'       => 'Asignado',
    'created_by'  => $user->name . ' ' . $user->lastname,
    'assigned_by' => $user->name,
    'assigned_to' => Personnel::find($user->personnel?->id)?->full_name ?? 'No asignado',
    'due_date'    => Carbon::parse($this->ticket['departure_date'])->subDays(2),
    'end_date'    => $this->ticket['return_date'] ? Carbon::parse($this->ticket['return_date'])->subDays(2) : null,
]);
```

### Conversión de Números a Letras

#### Accessor para Total en Letras
```php
public function getTotalEnLetrasAttribute()
{
    if (!is_numeric($this->total_fare)) {
        return 'Valor inválido';
    }

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('es');

    return ucfirst($numberTransformer->toWords((int) $this->total_fare)) . ' pesos';
}
```

#### Accessor para Tarifa en Letras
```php
public function getFareEnLetrasAttribute()
{
    if (!is_numeric($this->fare)) {
        return 'Valor inválido';
    }

    $numberToWords = new NumberToWords();
    $numberTransformer = $numberToWords->getNumberTransformer('es');

    return ucfirst($numberTransformer->toWords((int) $this->fare)) . ' pesos';
}
```

### Cálculo Automático de Tarifas

#### JavaScript para Cálculo en Tiempo Real
```javascript
function ticket() {
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

### Crear un Tiquete Aéreo

#### 1. Acceso al Formulario
```
URL: /agency/{agency}/clients/{client}/request/{request}/tickets/create
```

#### 2. Llenar Información Básica
- **Proveedor**: Seleccionar de la lista de proveedores
- **Tipo de Destino**: Nacional o Internacional
- **Tipo de Vuelo**: Solo ida, Ida y vuelta, o Multidestino
- **Aerolínea**: Nombre de la aerolínea
- **Código de Reserva**: Código de reserva del vuelo

#### 3. Configurar Vuelo
- **Origen**: Ciudad o aeropuerto de origen
- **Destino**: Ciudad o aeropuerto de destino
- **Fecha de Salida**: Fecha del vuelo de ida
- **Fecha de Regreso**: Fecha del vuelo de vuelta (si aplica)

#### 4. Configurar Pasajeros
- **Adultos**: Cantidad de adultos (mínimo 1)
- **Niños**: Cantidad de niños (opcional)
- **Infantes**: Cantidad de infantes (opcional)

#### 5. Establecer Tarifas
- **Tarifa Neta**: Costo base del tiquete
- **% de Utilidad**: Porcentaje de ganancia
- **Total**: Se calcula automáticamente

#### 6. Configurar Servicios
- **Equipaje**: Seleccionar tipos de equipaje incluidos
- **Inclusiones**: Servicios adicionales incluidos
- **Observaciones**: Notas adicionales

#### 7. Guardar
- Hacer clic en "Crear Tiquete"
- El sistema generará un slug único
- Se creará una observación automática
- Se creará una tarea de check-in
- Redirección al detalle del tiquete

### Editar un Tiquete

#### 1. Acceso a Edición
- Desde el listado de tiquetes
- Desde el detalle del tiquete
- Botón "Editar Tiquete" en la interfaz

#### 2. Modificar Información
- Actualizar campos necesarios
- El sistema preservará el contexto
- Validación en tiempo real

#### 3. Guardar Cambios
- Hacer clic en "Actualizar"
- Se creará observación de actualización
- Redirección al detalle actualizado

### Visualizar un Tiquete

#### 1. Vista Detallada
- Información completa del vuelo
- Detalles del proveedor
- Estado actual del tiquete
- Conversión de tarifas a letras

#### 2. Modal de Edición
- Edición rápida en modal flyout
- Campos principales editables
- Guardado sin salir de la vista

#### 3. Acciones Disponibles
- **Editar**: Modificar el tiquete
- **Eliminar**: Eliminar el tiquete
- **Cambiar Estado**: Actualizar estado

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Validación de Fechas
**Síntoma**: `The return date must be a date after or equal to departure date`

**Solución**: Verificar que la fecha de regreso sea posterior o igual a la fecha de salida:
```php
'ticket.return_date' => 'nullable|date|after_or_equal:ticket.departure_date',
```

#### 2. Error de Slug Duplicado
**Síntoma**: `SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry`

**Solución**: El sistema genera automáticamente slugs únicos:
```php
do {
    $slug = Str::slug("{$this->ticket['destination_type']} {$this->ticket['destination']}") . '-' . Str::random(8);
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

#### 4. Error de Conversión a Letras
**Síntoma**: Error al convertir números a letras

**Solución**: Verificar que el valor sea numérico:
```php
public function getTotalEnLetrasAttribute()
{
    if (!is_numeric($this->total_fare)) {
        return 'Valor inválido';
    }
    // ... resto del código
}
```

#### 5. Error de Tarea de Check-in
**Síntoma**: No se crea la tarea automática

**Solución**: Verificar que el usuario tenga personnel asociado:
```php
'personnel_id' => $user->personnel?->id ?? null,
```

### Logs y Debugging

#### Habilitar Logs Detallados
```php
// En el componente
\Log::info('=== INICIO CREACIÓN TIQUETE ===');
\Log::info('Datos recibidos:', $this->ticket);
```

#### Verificar Logs
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Buscar errores específicos
grep "ERROR" storage/logs/laravel.log
```

---

## Ejemplos de Código

### Crear un Tiquete Programáticamente

```php
use App\Models\AirlineTicket;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;

// Crear un tiquete desde código
$ticket = AirlineTicket::create([
    'service_type' => 'airline_ticket',
    'provider_id' => 1,
    'flight_type' => 'roundtrip',
    'destination_type' => 'Internacional',
    'airline' => 'Avianca',
    'reservation_code' => 'AV123456',
    'origin' => 'Bogotá',
    'destination' => 'Madrid',
    'departure_date' => '2025-10-15',
    'return_date' => '2025-10-25',
    'adult' => 2,
    'children' => 1,
    'infant' => 0,
    'fare' => 2500000,
    'profit_percentage' => 15,
    'total_fare' => 2875000,
    'status' => 'cotizado',
    'include' => json_encode(['Artículo personal', 'Comida']),
    'baggage' => json_encode(['Artículo personal', 'Equipaje de cabina']),
    'observations' => 'Vuelo con conexión en Madrid',
    'agency_id' => 1,
    'client_id' => 1,
    'request_id' => 1,
]);
```

### Consultas de Base de Datos

```php
// Obtener tiquetes con relaciones
$tickets = AirlineTicket::with(['provider', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('departure_date', 'asc')
    ->get();

// Obtener tiquetes por tipo de vuelo
$roundtripTickets = AirlineTicket::where('flight_type', 'roundtrip')
    ->with('provider')
    ->get();

// Obtener tiquetes por proveedor
$tickets = AirlineTicket::where('provider_id', $providerId)
    ->with(['client', 'agency'])
    ->paginate(20);
```

### Scopes del Modelo

```php
// En el modelo AirlineTicket
public function scopeByFlightType($query, $flightType)
{
    return $query->where('flight_type', $flightType);
}

public function scopeByDestinationType($query, $destinationType)
{
    return $query->where('destination_type', $destinationType);
}

public function scopeByStatus($query, $status)
{
    return $query->where('status', $status);
}

public function scopeByDateRange($query, $startDate, $endDate)
{
    return $query->whereBetween('departure_date', [$startDate, $endDate]);
}
```

### Uso de Scopes

```php
// Obtener tiquetes de ida y vuelta
$roundtripTickets = AirlineTicket::byFlightType('roundtrip')->get();

// Obtener tiquetes internacionales
$internationalTickets = AirlineTicket::byDestinationType('Internacional')->get();

// Obtener tiquetes vendidos en un rango de fechas
$soldTickets = AirlineTicket::byStatus('vendido')
    ->byDateRange('2025-10-01', '2025-10-31')
    ->get();
```

### API Resources

```php
// app/Http/Resources/AirlineTicketResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AirlineTicketResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'service_type' => $this->service_type,
            'flight_type' => $this->flight_type,
            'destination_type' => $this->destination_type,
            'airline' => $this->airline,
            'reservation_code' => $this->reservation_code,
            'origin' => $this->origin,
            'destination' => $this->destination,
            'departure_date' => $this->departure_date->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'passengers' => [
                'adult' => $this->adult,
                'children' => $this->children,
                'infant' => $this->infant,
            ],
            'pricing' => [
                'fare' => $this->fare,
                'profit_percentage' => $this->profit_percentage,
                'total_fare' => $this->total_fare,
                'total_en_letras' => $this->total_en_letras,
            ],
            'services' => [
                'baggage' => $this->baggage,
                'include' => $this->include,
            ],
            'status' => $this->status,
            'observations' => $this->observations,
            'provider' => new ProviderResource($this->provider),
            'client' => new ClientResource($this->client),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Testing

```php
// tests/Feature/AirlineTicketTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\AirlineTicket;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use Livewire\Livewire;
use App\Livewire\Services\AirlineTickets\CreateAirlineTickets;

class AirlineTicketTest extends TestCase
{
    public function test_can_create_airline_ticket()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateAirlineTickets::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('ticket.airline', 'Avianca')
        ->set('ticket.origin', 'Bogotá')
        ->set('ticket.destination', 'Madrid')
        ->set('ticket.departure_date', '2025-12-01')
        ->set('ticket.fare', 1000000)
        ->set('ticket.profit_percentage', 10)
        ->call('save')
        ->assertHasNoErrors();
        
        $this->assertDatabaseHas('airline_tickets', [
            'airline' => 'Avianca',
            'origin' => 'Bogotá',
            'destination' => 'Madrid',
            'fare' => 1000000,
        ]);
    }
    
    public function test_airline_ticket_requires_airline()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateAirlineTickets::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('ticket.airline', '')
        ->call('save')
        ->assertHasErrors(['ticket.airline' => 'required']);
    }
}
```

---

## Conclusión

El servicio de Tiquetes Aéreos proporciona una solución completa para la gestión de reservas de vuelos. Con características avanzadas como cálculo automático de tarifas, observaciones automáticas, tareas de check-in, conversión de números a letras y una interfaz moderna, el sistema está diseñado para mejorar la eficiencia y la experiencia del usuario en las agencias de viajes.

### Características Destacadas
- ✅ **Interfaz moderna** con Livewire
- ✅ **Validación robusta** en tiempo real
- ✅ **Cálculo automático** de tarifas
- ✅ **Observaciones automáticas** para clientes
- ✅ **Tareas automáticas** de check-in
- ✅ **Conversión a letras** para facturación
- ✅ **Estados de seguimiento** completos
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con el sistema CRM

### Próximas Mejoras
- 🔄 **Integración con APIs** de aerolíneas
- 🔄 **Notificaciones push** para cambios de estado
- 🔄 **Reportes avanzados** de tiquetes
- 🔄 **Sistema de calificaciones** de proveedores
- 🔄 **Exportación de datos** en múltiples formatos

---

*Documentación actualizada: Septiembre 2025*
*Versión del sistema: 1.0.0*
