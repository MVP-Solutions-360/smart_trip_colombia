# Ejemplos de Código - Servicio de Traslados

## Ejemplos de Uso de los Componentes

### Crear un Traslado Programáticamente

```php
use App\Models\TransferReserve;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;

// Crear un traslado desde código
$transfer = TransferReserve::create([
    'provider_id' => 1,
    'agency_id' => 1,
    'service_type' => 'aeroportuario',
    'travel_type' => 'ida',
    'origin' => 'Aeropuerto Internacional El Dorado',
    'destination' => 'Hotel Marriott Bogotá',
    'arrival_date' => '2025-10-15',
    'arrival_time' => '14:00:00',
    'departure_date' => null,
    'departure_time' => null,
    'adult' => 2,
    'children' => 1,
    'infant' => 0,
    'fare' => 80000,
    'profit_percentage' => 20,
    'total_fare' => 96000,
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

### Crear Traslado Ida y Vuelta

```php
// Crear traslado ida y vuelta
$transfer = TransferReserve::create([
    'provider_id' => 1,
    'agency_id' => 1,
    'service_type' => 'aeroportuario',
    'travel_type' => 'ida y vuelta',
    'origin' => 'Aeropuerto Internacional El Dorado',
    'destination' => 'Hotel Marriott Bogotá',
    'arrival_date' => '2025-10-15',
    'arrival_time' => '14:00:00',
    'departure_date' => '2025-10-20',
    'departure_time' => '11:00:00',
    'adult' => 2,
    'children' => 1,
    'infant' => 0,
    'fare' => 150000,
    'profit_percentage' => 20,
    'total_fare' => 180000,
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

## Consultas de Base de Datos

### Obtener Traslados con Relaciones

```php
// Obtener todos los traslados con proveedor y cliente
$transfers = TransferReserve::with(['provider', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('arrival_date', 'asc')
    ->get();

// Obtener traslados por tipo de servicio
$airportTransfers = TransferReserve::where('service_type', 'aeroportuario')
    ->with('provider')
    ->get();

// Obtener traslados por proveedor
$transfers = TransferReserve::where('provider_id', $providerId)
    ->with(['client', 'agency'])
    ->paginate(20);

// Obtener traslados por rango de fechas
$transfers = TransferReserve::whereBetween('arrival_date', ['2025-10-01', '2025-10-31'])
    ->with(['provider', 'client'])
    ->get();
```

### Consultas Avanzadas

```php
// Obtener traslados aeroportuarios
$airportTransfers = TransferReserve::where('service_type', 'aeroportuario')
    ->with(['provider', 'client'])
    ->get();

// Obtener traslados ida y vuelta
$roundTripTransfers = TransferReserve::where('travel_type', 'ida y vuelta')
    ->with(['provider', 'client'])
    ->get();

// Obtener traslados con niños
$transfersWithChildren = TransferReserve::where('children', '>', 0)
    ->with(['provider', 'client'])
    ->get();

// Obtener traslados por origen específico
$transfers = TransferReserve::where('origin', 'LIKE', '%Aeropuerto%')
    ->with(['provider', 'client'])
    ->get();

// Obtener traslados por destino específico
$transfers = TransferReserve::where('destination', 'LIKE', '%Hotel%')
    ->with(['provider', 'client'])
    ->get();
```

## Eventos y Listeners

### Crear un Listener para Traslados

```php
// app/Listeners/TransferCreatedListener.php
namespace App\Listeners;

use App\Events\TransferCreated;
use App\Models\Observation;
use Illuminate\Support\Facades\Log;

class TransferCreatedListener
{
    public function handle(TransferCreated $event)
    {
        $transfer = $event->transfer;
        
        // Crear observación automática
        $transfer->client->observations()->create([
            'title' => 'Nuevo traslado creado',
            'body' => "Se ha creado un traslado {$transfer->service_type} de {$transfer->origin} a {$transfer->destination} para el {$transfer->arrival_date}",
            'user_id' => auth()->id(),
            'type' => 'operational',
            'priority' => 'medium',
            'is_private' => false,
            'agency_id' => $transfer->agency_id,
        ]);
        
        Log::info('Traslado creado y observación generada', [
            'transfer_id' => $transfer->id,
            'client_id' => $transfer->client_id
        ]);
    }
}
```

### Emitir Evento Personalizado

```php
// En el componente CreateTransferReserve
use App\Events\TransferCreated;

public function save()
{
    // ... lógica de guardado ...
    
    $transfer = TransferReserve::create([...]);
    
    // Emitir evento
    event(new TransferCreated($transfer));
    
    // Emitir evento Livewire
    $this->dispatch('transferCreated', ['transfer' => $transfer]);
}
```

## Validaciones Personalizadas

### Validación de Fechas de Traslado

```php
// app/Rules/TransferDateRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class TransferDateRule implements Rule
{
    public function passes($attribute, $value)
    {
        $arrivalDate = request()->input('arrival_date');
        $departureDate = request()->input('departure_date');
        $travelType = request()->input('travel_type');
        
        // Para traslados ida y vuelta, la fecha de salida debe ser posterior a la de llegada
        if ($travelType === 'ida y vuelta' && $arrivalDate && $departureDate) {
            return $departureDate > $arrivalDate;
        }
        
        return true;
    }
    
    public function message()
    {
        return 'Para traslados ida y vuelta, la fecha de salida debe ser posterior a la fecha de llegada.';
    }
}
```

### Validación de Pasajeros

```php
// app/Rules/TransferPassengersRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class TransferPassengersRule implements Rule
{
    public function passes($attribute, $value)
    {
        $adult = request()->input('adult');
        $children = request()->input('children');
        $infant = request()->input('infant');
        
        $totalPassengers = $adult + $children + $infant;
        
        // Máximo 8 pasajeros por traslado
        return $totalPassengers <= 8 && $totalPassengers > 0;
    }
    
    public function message()
    {
        return 'El número total de pasajeros debe estar entre 1 y 8.';
    }
}
```

### Uso en el Componente

```php
protected $rules = [
    'provider_id' => 'required|exists:providers,id',
    'service_type' => 'required|in:aeroportuario,hotelero,personalizado',
    'travel_type' => 'required|in:ida,ida y vuelta,múltiple',
    'origin' => 'required|string|max:255',
    'destination' => 'required|string|max:255',
    'arrival_date' => 'required|date',
    'arrival_time' => 'required|date_format:H:i',
    'departure_date' => 'nullable|date|after_or_equal:arrival_date',
    'departure_time' => 'nullable|date_format:H:i',
    'adult' => ['required', 'integer', 'min:1', 'max:8', new TransferPassengersRule()],
    'children' => 'required|integer|min:0|max:8',
    'infant' => 'required|integer|min:0|max:8',
    'fare' => 'required|numeric|min:1',
    'profit_percentage' => 'required|numeric|min:0',
    'total_fare' => 'required|numeric|min:0',
    'status' => 'required|in:cotizado,vendido,descartado'
];
```

## Scopes del Modelo

### Scopes para TransferReserve

```php
// En el modelo TransferReserve
public function scopeByServiceType($query, $serviceType)
{
    return $query->where('service_type', $serviceType);
}

public function scopeByTravelType($query, $travelType)
{
    return $query->where('travel_type', $travelType);
}

public function scopeByStatus($query, $status)
{
    return $query->where('status', $status);
}

public function scopeAeroportuario($query)
{
    return $query->where('service_type', 'aeroportuario');
}

public function scopeHotelero($query)
{
    return $query->where('service_type', 'hotelero');
}

public function scopePersonalizado($query)
{
    return $query->where('service_type', 'personalizado');
}

public function scopeIda($query)
{
    return $query->where('travel_type', 'ida');
}

public function scopeIdaYVuelta($query)
{
    return $query->where('travel_type', 'ida y vuelta');
}

public function scopeMultiple($query)
{
    return $query->where('travel_type', 'múltiple');
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

public function scopeUpcoming($query)
{
    return $query->where('arrival_date', '>=', now());
}

public function scopeByOrigin($query, $origin)
{
    return $query->where('origin', 'LIKE', "%{$origin}%");
}

public function scopeByDestination($query, $destination)
{
    return $query->where('destination', 'LIKE', "%{$destination}%");
}
```

### Uso de Scopes

```php
// Obtener traslados aeroportuarios
$airportTransfers = TransferReserve::aeroportuario()->get();

// Obtener traslados ida y vuelta
$roundTripTransfers = TransferReserve::idaYVuelta()->get();

// Obtener traslados con niños
$transfersWithChildren = TransferReserve::withChildren()->get();

// Obtener traslados por rango de fechas
$transfers = TransferReserve::byDateRange('2025-10-01', '2025-10-31')->get();

// Obtener traslados próximos
$upcomingTransfers = TransferReserve::upcoming()->get();

// Obtener traslados por origen
$transfers = TransferReserve::byOrigin('Aeropuerto')->get();
```

## Mutators y Accessors

### Mutators para TransferReserve

```php
// En el modelo TransferReserve
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

public function getPassengerCountAttribute()
{
    return $this->adult + $this->children + $this->infant;
}

public function getIsRoundTripAttribute()
{
    return $this->travel_type === 'ida y vuelta';
}

public function getIsAirportTransferAttribute()
{
    return $this->service_type === 'aeroportuario';
}

public function getIsHotelTransferAttribute()
{
    return $this->service_type === 'hotelero';
}

public function getIsCustomTransferAttribute()
{
    return $this->service_type === 'personalizado';
}

public function getStatusLabelAttribute()
{
    return match($this->status) {
        'cotizado' => 'Cotizado',
        'vendido' => 'Vendido',
        'descartado' => 'Descartado',
        default => 'Desconocido'
    };
}

public function getServiceTypeLabelAttribute()
{
    return match($this->service_type) {
        'aeroportuario' => 'Aeroportuario',
        'hotelero' => 'Hotelero',
        'personalizado' => 'Personalizado',
        default => 'Desconocido'
    };
}

public function getTravelTypeLabelAttribute()
{
    return match($this->travel_type) {
        'ida' => 'Solo Ida',
        'ida y vuelta' => 'Ida y Vuelta',
        'múltiple' => 'Múltiple',
        default => 'Desconocido'
    };
}
```

## Jobs y Queues

### Job para Procesar Traslados

```php
// app/Jobs/ProcessTransfer.php
namespace App\Jobs;

use App\Models\TransferReserve;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessTransfer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $transfer;
    
    public function __construct(TransferReserve $transfer)
    {
        $this->transfer = $transfer;
    }
    
    public function handle()
    {
        // Procesar traslado (ej: enviar a sistema externo)
        Log::info('Procesando traslado', [
            'transfer_id' => $this->transfer->id,
            'service_type' => $this->transfer->service_type,
            'travel_type' => $this->transfer->travel_type,
            'arrival_date' => $this->transfer->arrival_date
        ]);
        
        // Simular procesamiento
        sleep(2);
        
        // Actualizar estado
        $this->transfer->update(['status' => 'procesado']);
    }
}
```

### Despachar Job

```php
// En el componente CreateTransferReserve
use App\Jobs\ProcessTransfer;

public function save()
{
    // ... guardar traslado ...
    
    // Despachar job para procesar traslado
    ProcessTransfer::dispatch($transfer);
}
```

## API Resources

### TransferReserve Resource

```php
// app/Http/Resources/TransferReserveResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransferReserveResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'service_type' => $this->service_type,
            'service_type_label' => $this->service_type_label,
            'travel_type' => $this->travel_type,
            'travel_type_label' => $this->travel_type_label,
            'origin' => $this->origin,
            'destination' => $this->destination,
            'arrival_date' => $this->arrival_date,
            'arrival_time' => $this->arrival_time,
            'departure_date' => $this->departure_date,
            'departure_time' => $this->departure_time,
            'passengers' => [
                'adult' => $this->adult,
                'children' => $this->children,
                'infant' => $this->infant,
                'total' => $this->passenger_count,
            ],
            'pricing' => [
                'fare' => $this->fare,
                'profit_percentage' => $this->profit_percentage,
                'total_fare' => $this->total_fare,
                'formatted_fare' => $this->formatted_fare,
                'formatted_total_fare' => $this->formatted_total_fare,
            ],
            'transfer_info' => [
                'is_round_trip' => $this->is_round_trip,
                'is_airport_transfer' => $this->is_airport_transfer,
                'is_hotel_transfer' => $this->is_hotel_transfer,
                'is_custom_transfer' => $this->is_custom_transfer,
                'status_label' => $this->status_label,
            ],
            'status' => $this->status,
            'provider' => new ProviderResource($this->provider),
            'client' => new ClientResource($this->client),
            'agency' => new AgencyResource($this->agency),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Uso del Resource

```php
// En un controlador API
use App\Http\Resources\TransferReserveResource;

public function show(TransferReserve $transfer)
{
    return new TransferReserveResource($transfer->load(['provider', 'client', 'agency']));
}

public function index()
{
    $transfers = TransferReserve::with(['provider', 'client', 'agency'])->paginate(15);
    return TransferReserveResource::collection($transfers);
}
```

## Testing

### Test para Crear Traslado

```php
// tests/Feature/TransferReserveTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\TransferReserve;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;
use Livewire\Livewire;
use App\Livewire\Services\Transfer\CreateTransferReserve;

class TransferReserveTest extends TestCase
{
    public function test_can_create_transfer()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        $provider = Provider::factory()->create();
        
        Livewire::test(CreateTransferReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('provider_id', $provider->id)
        ->set('service_type', 'aeroportuario')
        ->set('travel_type', 'ida')
        ->set('origin', 'Aeropuerto')
        ->set('destination', 'Hotel')
        ->set('arrival_date', '2025-12-01')
        ->set('arrival_time', '14:00')
        ->set('adult', 2)
        ->set('fare', 50000)
        ->set('profit_percentage', 15)
        ->call('save')
        ->assertHasNoErrors();
        
        $this->assertDatabaseHas('transfer_reserves', [
            'service_type' => 'aeroportuario',
            'travel_type' => 'ida',
            'origin' => 'Aeropuerto',
            'destination' => 'Hotel',
            'fare' => 50000,
        ]);
    }
    
    public function test_transfer_requires_origin()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateTransferReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('origin', '')
        ->call('save')
        ->assertHasErrors(['origin' => 'required']);
    }
    
    public function test_departure_date_must_be_after_arrival_date_for_round_trip()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateTransferReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('travel_type', 'ida y vuelta')
        ->set('arrival_date', '2025-12-05')
        ->set('departure_date', '2025-12-01')
        ->call('save')
        ->assertHasErrors(['departure_date' => 'after_or_equal']);
    }
}
```

## Middleware Personalizado

### Middleware para Traslados

```php
// app/Http/Middleware/TransferAccess.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\TransferReserve;

class TransferAccess
{
    public function handle(Request $request, Closure $next)
    {
        $transfer = $request->route('transfer');
        
        if ($transfer instanceof TransferReserve) {
            // Verificar que el usuario tenga acceso al traslado
            if (!auth()->user()->canAccessTransfer($transfer)) {
                abort(403, 'No tienes acceso a este traslado');
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
    'transfer.access' => \App\Http\Middleware\TransferAccess::class,
];
```

### Usar en Rutas

```php
Route::get('/transfers/{transfer}', ShowTransferReserve::class)
    ->middleware(['auth', 'transfer.access'])
    ->name('transfers.show');
```

## Comandos Artisan

### Comando para Limpiar Traslados

```php
// app/Console/Commands/CleanupTransfers.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TransferReserve;
use Carbon\Carbon;

class CleanupTransfers extends Command
{
    protected $signature = 'transfers:cleanup {--days=30 : Días de antigüedad}';
    protected $description = 'Limpiar traslados descartados antiguos';
    
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $transfers = TransferReserve::where('status', 'descartado')
            ->where('updated_at', '<', $cutoffDate)
            ->get();
        
        foreach ($transfers as $transfer) {
            $transfer->delete();
        }
        
        $this->info("Se eliminaron {$transfers->count()} traslados descartados");
    }
}
```

### Comando para Generar Reportes de Traslados

```php
// app/Console/Commands/GenerateTransferReport.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TransferReserve;
use Carbon\Carbon;

class GenerateTransferReport extends Command
{
    protected $signature = 'transfers:report {--month=current : Mes del reporte}';
    protected $description = 'Generar reporte de traslados';
    
    public function handle()
    {
        $month = $this->option('month');
        $startDate = $month === 'current' 
            ? Carbon::now()->startOfMonth()
            : Carbon::parse($month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $transfers = TransferReserve::whereBetween('created_at', [$startDate, $endDate])
            ->with(['provider', 'client', 'agency'])
            ->get();
        
        $this->info("Reporte de traslados para {$startDate->format('F Y')}");
        $this->info("Total de traslados: {$transfers->count()}");
        $this->info("Traslados vendidos: {$transfers->where('status', 'vendido')->count()}");
        $this->info("Traslados cotizados: {$transfers->where('status', 'cotizado')->count()}");
        $this->info("Traslados descartados: {$transfers->where('status', 'descartado')->count()}");
        
        $totalRevenue = $transfers->where('status', 'vendido')->sum('total_fare');
        $this->info("Ingresos totales: $" . number_format($totalRevenue, 2));
        
        // Estadísticas por tipo de servicio
        $serviceTypes = $transfers->groupBy('service_type');
        $this->info("\nTraslados por tipo de servicio:");
        foreach ($serviceTypes as $type => $transfers) {
            $this->info("- {$type}: {$transfers->count()}");
        }
        
        // Estadísticas por tipo de viaje
        $travelTypes = $transfers->groupBy('travel_type');
        $this->info("\nTraslados por tipo de viaje:");
        foreach ($travelTypes as $type => $transfers) {
            $this->info("- {$type}: {$transfers->count()}");
        }
    }
}
```

### Registrar Comandos

```php
// app/Console/Kernel.php
protected $commands = [
    Commands\CleanupTransfers::class,
    Commands\GenerateTransferReport::class,
];
```

---

*Ejemplos de código actualizados: Septiembre 2025*
