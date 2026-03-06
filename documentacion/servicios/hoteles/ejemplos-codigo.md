# Ejemplos de Código - Servicio de Hoteles

## Ejemplos de Uso de los Componentes

### Crear una Reserva de Hotel Programáticamente

```php
use App\Models\HotelReserve;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;

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

### Crear Reserva con Traslados Relacionados

```php
use App\Models\TransferReserve;

// Crear reserva de hotel
$hotel = HotelReserve::create([...]);

// Crear traslado relacionado
$transfer = $hotel->transfers()->create([
    'provider_id' => $hotel->provider_id,
    'agency_id' => $hotel->agency_id,
    'service_type' => 'hotelero',
    'travel_type' => 'ida',
    'origin' => 'Aeropuerto Internacional',
    'destination' => $hotel->name,
    'arrival_date' => $hotel->arrival_date,
    'arrival_time' => '14:00:00',
    'adult' => $hotel->adult,
    'children' => $hotel->children,
    'infant' => $hotel->infant,
    'fare' => 50000,
    'profit_percentage' => 15,
    'total_fare' => 57500,
    'status' => 'cotizado',
    'client_id' => $hotel->client_id,
    'request_id' => $hotel->request_id,
]);
```

## Consultas de Base de Datos

### Obtener Reservas con Relaciones

```php
// Obtener todas las reservas con proveedor y cliente
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

### Consultas Avanzadas

```php
// Obtener reservas con todo incluido
$allInclusive = HotelReserve::where('type_food', 'Todo incluido')
    ->with(['provider', 'client'])
    ->get();

// Obtener reservas por hotel específico
$marriottReservations = HotelReserve::where('name', 'LIKE', '%Marriott%')
    ->with(['provider', 'client'])
    ->get();

// Obtener reservas con niños
$hotelsWithChildren = HotelReserve::where('children', '>', 0)
    ->with(['provider', 'client'])
    ->get();

// Obtener reservas por código de reserva
$hotel = HotelReserve::where('reservation_code', 'MAR123456')
    ->with(['provider', 'client', 'agency', 'transfers'])
    ->first();

// Obtener reservas de larga estadía (más de 7 días)
$longStayHotels = HotelReserve::whereRaw('DATEDIFF(departure_date, arrival_date) > 7')
    ->with(['provider', 'client'])
    ->get();
```

## Eventos y Listeners

### Crear un Listener para Reservas de Hotel

```php
// app/Listeners/HotelReserveCreatedListener.php
namespace App\Listeners;

use App\Events\HotelReserveCreated;
use App\Models\Observation;
use App\Models\TransferReserve;
use Illuminate\Support\Facades\Log;

class HotelReserveCreatedListener
{
    public function handle(HotelReserveCreated $event)
    {
        $hotel = $event->hotel;
        
        // Crear observación automática
        $hotel->client->observations()->create([
            'title' => 'Nueva reserva de hotel creada',
            'body' => "Se ha creado la reserva: {$hotel->name} - {$hotel->room_type} con {$hotel->type_food}",
            'user_id' => auth()->id(),
            'type' => 'operational',
            'priority' => 'medium',
            'is_private' => false,
            'agency_id' => $hotel->agency_id,
        ]);
        
        // Crear traslado automático si es necesario
        if ($hotel->arrival_date) {
            TransferReserve::create([
                'provider_id' => $hotel->provider_id,
                'agency_id' => $hotel->agency_id,
                'service_type' => 'hotelero',
                'travel_type' => 'ida',
                'origin' => 'Aeropuerto',
                'destination' => $hotel->name,
                'arrival_date' => $hotel->arrival_date,
                'adult' => $hotel->adult,
                'children' => $hotel->children,
                'infant' => $hotel->infant,
                'fare' => 50000,
                'profit_percentage' => 15,
                'total_fare' => 57500,
                'status' => 'cotizado',
                'client_id' => $hotel->client_id,
                'request_id' => $hotel->request_id,
            ]);
        }
        
        Log::info('Reserva de hotel creada y tareas generadas', [
            'hotel_id' => $hotel->id,
            'client_id' => $hotel->client_id
        ]);
    }
}
```

### Emitir Evento Personalizado

```php
// En el componente CreateHotelReserves
use App\Events\HotelReserveCreated;

public function save()
{
    // ... lógica de guardado ...
    
    $hotel = HotelReserve::create([...]);
    
    // Emitir evento
    event(new HotelReserveCreated($hotel));
    
    // Emitir evento Livewire
    $this->dispatch('hotelReserveCreated', ['hotel' => $hotel]);
}
```

## Validaciones Personalizadas

### Validación de Fechas de Hotel

```php
// app/Rules/HotelDateRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class HotelDateRule implements Rule
{
    public function passes($attribute, $value)
    {
        $arrivalDate = request()->input('arrival_date');
        $departureDate = request()->input('departure_date');
        
        // La fecha de salida debe ser posterior a la de llegada
        if ($arrivalDate && $departureDate) {
            return $departureDate > $arrivalDate;
        }
        
        return true;
    }
    
    public function message()
    {
        return 'La fecha de salida debe ser posterior a la fecha de llegada.';
    }
}
```

### Validación de Capacidad de Habitación

```php
// app/Rules/RoomCapacityRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class RoomCapacityRule implements Rule
{
    public function passes($attribute, $value)
    {
        $roomType = request()->input('room_type');
        $adult = request()->input('adult');
        $children = request()->input('children');
        $infant = request()->input('infant');
        $totalRooms = request()->input('total_rooms');
        
        $totalGuests = $adult + $children + $infant;
        
        // Capacidades máximas por tipo de habitación
        $capacities = [
            'Sencilla' => 1,
            'Doble' => 2,
            'Triple' => 3,
            'Cuádruple' => 4,
            'Múltiple' => 6,
        ];
        
        $maxCapacity = $capacities[$roomType] ?? 1;
        $totalCapacity = $maxCapacity * $totalRooms;
        
        return $totalGuests <= $totalCapacity;
    }
    
    public function message()
    {
        return 'El número de huéspedes excede la capacidad de las habitaciones seleccionadas.';
    }
}
```

### Uso en el Componente

```php
protected $rules = [
    'provider_id' => 'required|exists:providers,id',
    'arrival_date' => 'required|date',
    'departure_date' => ['required', 'date', new HotelDateRule()],
    'name' => 'required|string',
    'room_type' => 'required|string',
    'type_food' => 'required|string',
    'total_rooms' => ['required', 'integer', 'min:1', 'max:20', new RoomCapacityRule()],
    'adult' => 'required|integer|min:1|max:20',
    'children' => 'required|integer|min:0',
    'infant' => 'required|integer|min:0',
    'fare' => 'required|numeric|min:1',
    'profit_percentage' => 'required|numeric|min:1',
    'total_fare' => 'required|numeric|min:0',
    'description' => 'nullable|string',
    'observations' => 'nullable|string',
    'status' => 'required|string'
];
```

## Scopes del Modelo

### Scopes para HotelReserve

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

public function scopeAllInclusive($query)
{
    return $query->where('type_food', 'Todo incluido');
}

public function scopeLongStay($query, $days = 7)
{
    return $query->whereRaw("DATEDIFF(departure_date, arrival_date) > ?", [$days]);
}

public function scopeByHotelName($query, $hotelName)
{
    return $query->where('name', 'LIKE', "%{$hotelName}%");
}

public function scopeUpcoming($query)
{
    return $query->where('arrival_date', '>=', now());
}

public function scopeCurrent($query)
{
    return $query->where('arrival_date', '<=', now())
                 ->where('departure_date', '>=', now());
}
```

### Uso de Scopes

```php
// Obtener reservas de habitaciones dobles
$doubleRooms = HotelReserve::byRoomType('Doble')->get();

// Obtener reservas con todo incluido
$allInclusive = HotelReserve::allInclusive()->get();

// Obtener reservas vendidas en un rango de fechas
$soldHotels = HotelReserve::byStatus('vendido')
    ->byDateRange('2025-10-01', '2025-10-31')
    ->get();

// Obtener reservas con niños
$hotelsWithChildren = HotelReserve::withChildren()->get();

// Obtener reservas de larga estadía
$longStayHotels = HotelReserve::longStay(10)->get();

// Obtener reservas próximas
$upcomingHotels = HotelReserve::upcoming()->get();

// Obtener reservas actuales
$currentHotels = HotelReserve::current()->get();
```

## Mutators y Accessors

### Mutators para HotelReserve

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

public function getRoomCapacityAttribute()
{
    $capacities = [
        'Sencilla' => 1,
        'Doble' => 2,
        'Triple' => 3,
        'Cuádruple' => 4,
        'Múltiple' => 6,
    ];
    
    return $capacities[$this->room_type] ?? 1;
}

public function getTotalCapacityAttribute()
{
    return $this->room_capacity * $this->total_rooms;
}

public function getIsOverbookedAttribute()
{
    return $this->guest_count > $this->total_capacity;
}

public function getCheckInTimeAttribute()
{
    return Carbon::parse($this->arrival_date)->format('H:i');
}

public function getCheckOutTimeAttribute()
{
    return Carbon::parse($this->departure_date)->format('H:i');
}
```

## Jobs y Queues

### Job para Procesar Reservas de Hotel

```php
// app/Jobs/ProcessHotelReserve.php
namespace App\Jobs;

use App\Models\HotelReserve;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessHotelReserve implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $hotel;
    
    public function __construct(HotelReserve $hotel)
    {
        $this->hotel = $hotel;
    }
    
    public function handle()
    {
        // Procesar reserva (ej: enviar a sistema externo)
        Log::info('Procesando reserva de hotel', [
            'hotel_id' => $this->hotel->id,
            'hotel_name' => $this->hotel->name,
            'reservation_code' => $this->hotel->reservation_code
        ]);
        
        // Simular procesamiento
        sleep(2);
        
        // Actualizar estado
        $this->hotel->update(['status' => 'procesado']);
        
        // Crear traslado automático si es necesario
        $this->createAutomaticTransfer();
    }
    
    private function createAutomaticTransfer()
    {
        if ($this->hotel->arrival_date) {
            $this->hotel->transfers()->create([
                'provider_id' => $this->hotel->provider_id,
                'agency_id' => $this->hotel->agency_id,
                'service_type' => 'hotelero',
                'travel_type' => 'ida',
                'origin' => 'Aeropuerto',
                'destination' => $this->hotel->name,
                'arrival_date' => $this->hotel->arrival_date,
                'adult' => $this->hotel->adult,
                'children' => $this->hotel->children,
                'infant' => $this->hotel->infant,
                'fare' => 50000,
                'profit_percentage' => 15,
                'total_fare' => 57500,
                'status' => 'cotizado',
                'client_id' => $this->hotel->client_id,
                'request_id' => $this->hotel->request_id,
            ]);
        }
    }
}
```

### Despachar Job

```php
// En el componente CreateHotelReserves
use App\Jobs\ProcessHotelReserve;

public function save()
{
    // ... guardar reserva ...
    
    // Despachar job para procesar reserva
    ProcessHotelReserve::dispatch($hotel);
}
```

## API Resources

### HotelReserve Resource

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
                'room_capacity' => $this->room_capacity,
                'total_capacity' => $this->total_capacity,
                'is_overbooked' => $this->is_overbooked,
                'check_in_time' => $this->check_in_time,
                'check_out_time' => $this->check_out_time,
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

### Uso del Resource

```php
// En un controlador API
use App\Http\Resources\HotelReserveResource;

public function show(HotelReserve $hotel)
{
    return new HotelReserveResource($hotel->load(['provider', 'client', 'agency', 'transfers']));
}

public function index()
{
    $hotels = HotelReserve::with(['provider', 'client', 'agency'])->paginate(15);
    return HotelReserveResource::collection($hotels);
}
```

## Testing

### Test para Crear Reserva de Hotel

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
    
    public function test_calculates_total_fare_correctly()
    {
        $hotel = HotelReserve::factory()->create([
            'fare' => 1000000,
            'profit_percentage' => 20,
        ]);
        
        $this->assertEquals(1200000, $hotel->total_fare);
    }
    
    public function test_calculates_stay_duration_correctly()
    {
        $hotel = HotelReserve::factory()->create([
            'arrival_date' => '2025-12-01 14:00:00',
            'departure_date' => '2025-12-05 11:00:00',
        ]);
        
        $this->assertEquals(4, $hotel->stay_duration);
    }
}
```

## Middleware Personalizado

### Middleware para Reservas de Hotel

```php
// app/Http/Middleware/HotelReserveAccess.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\HotelReserve;

class HotelReserveAccess
{
    public function handle(Request $request, Closure $next)
    {
        $hotel = $request->route('hotel');
        
        if ($hotel instanceof HotelReserve) {
            // Verificar que el usuario tenga acceso a la reserva
            if (!auth()->user()->canAccessHotelReserve($hotel)) {
                abort(403, 'No tienes acceso a esta reserva de hotel');
            }
        }
        
        return $next($request);
    }
}
```

### Registrar Middleware

```php
// app/Http/Kernel.php
protected $routeMiddleware = [
    // ... otros middlewares
    'hotel.access' => \App\Http\Middleware\HotelReserveAccess::class,
];
```

### Usar en Rutas

```php
Route::get('/hotels/{hotel}', ShowHotelReserves::class)
    ->middleware(['auth', 'hotel.access'])
    ->name('hotels.show');
```

## Comandos Artisan

### Comando para Limpiar Reservas de Hotel

```php
// app/Console/Commands/CleanupHotelReserves.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HotelReserve;
use Carbon\Carbon;

class CleanupHotelReserves extends Command
{
    protected $signature = 'hotels:cleanup {--days=30 : Días de antigüedad}';
    protected $description = 'Limpiar reservas de hotel descartadas antiguas';
    
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $hotels = HotelReserve::where('status', 'descartado')
            ->where('updated_at', '<', $cutoffDate)
            ->get();
        
        foreach ($hotels as $hotel) {
            $hotel->delete();
        }
        
        $this->info("Se eliminaron {$hotels->count()} reservas de hotel descartadas");
    }
}
```

### Comando para Generar Reportes de Hotel

```php
// app/Console/Commands/GenerateHotelReport.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HotelReserve;
use Carbon\Carbon;

class GenerateHotelReport extends Command
{
    protected $signature = 'hotels:report {--month=current : Mes del reporte}';
    protected $description = 'Generar reporte de reservas de hotel';
    
    public function handle()
    {
        $month = $this->option('month');
        $startDate = $month === 'current' 
            ? Carbon::now()->startOfMonth()
            : Carbon::parse($month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $hotels = HotelReserve::whereBetween('created_at', [$startDate, $endDate])
            ->with(['provider', 'client', 'agency'])
            ->get();
        
        $this->info("Reporte de reservas de hotel para {$startDate->format('F Y')}");
        $this->info("Total de reservas: {$hotels->count()}");
        $this->info("Reservas vendidas: {$hotels->where('status', 'vendido')->count()}");
        $this->info("Reservas cotizadas: {$hotels->where('status', 'cotizado')->count()}");
        $this->info("Reservas descartadas: {$hotels->where('status', 'descartado')->count()}");
        
        $totalRevenue = $hotels->where('status', 'vendido')->sum('total_fare');
        $this->info("Ingresos totales: $" . number_format($totalRevenue, 2));
        
        // Estadísticas por tipo de habitación
        $roomTypes = $hotels->groupBy('room_type');
        $this->info("\nReservas por tipo de habitación:");
        foreach ($roomTypes as $type => $reservations) {
            $this->info("- {$type}: {$reservations->count()}");
        }
        
        // Estadísticas por tipo de alimentación
        $foodTypes = $hotels->groupBy('type_food');
        $this->info("\nReservas por tipo de alimentación:");
        foreach ($foodTypes as $type => $reservations) {
            $this->info("- {$type}: {$reservations->count()}");
        }
    }
}
```

### Registrar Comandos

```php
// app/Console/Kernel.php
protected $commands = [
    Commands\CleanupHotelReserves::class,
    Commands\GenerateHotelReport::class,
];
```

---

*Ejemplos de código actualizados: Septiembre 2025*
