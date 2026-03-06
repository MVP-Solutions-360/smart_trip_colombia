# Ejemplos de Código - Servicio de Tiquetes Aéreos

## Ejemplos de Uso de los Componentes

### Crear un Tiquete Programáticamente

```php
use App\Models\AirlineTicket;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;

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

### Crear Tiquete con Tarea de Check-in

```php
use App\Models\Task;
use App\Models\Personnel;
use Carbon\Carbon;

// Crear tiquete y tarea de check-in
$ticket = AirlineTicket::create([...]);

$user = auth()->user();
$task = Task::create([
    'agency_id'   => $ticket->agency_id,
    'client_id'   => $ticket->client_id,
    'personnel_id' => $user->personnel?->id ?? null,
    'request_id'  => $ticket->request_id,
    'airline_ticket_id' => $ticket->id,
    'title'       => 'Check-in: ' . $ticket->destination,
    'type_task'   => 'check-in',
    'description' => 'Realizar check-in para los vuelos',
    'state'       => 'Asignado',
    'created_by'  => $user->name . ' ' . $user->lastname,
    'assigned_by' => $user->name,
    'assigned_to' => Personnel::find($user->personnel?->id)?->full_name ?? 'No asignado',
    'due_date'    => Carbon::parse($ticket->departure_date)->subDays(2),
    'end_date'    => $ticket->return_date ? Carbon::parse($ticket->return_date)->subDays(2) : null,
]);
```

## Consultas de Base de Datos

### Obtener Tiquetes con Relaciones

```php
// Obtener todos los tiquetes con proveedor y cliente
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

// Obtener tiquetes por rango de fechas
$tickets = AirlineTicket::whereBetween('departure_date', ['2025-10-01', '2025-10-31'])
    ->with(['provider', 'client'])
    ->get();
```

### Consultas Avanzadas

```php
// Obtener tiquetes internacionales vendidos
$internationalTickets = AirlineTicket::where('destination_type', 'Internacional')
    ->where('status', 'vendido')
    ->with(['provider', 'client'])
    ->get();

// Obtener tiquetes por aerolínea
$aviancaTickets = AirlineTicket::where('airline', 'Avianca')
    ->with(['provider', 'client'])
    ->get();

// Obtener tiquetes con pasajeros específicos
$ticketsWithChildren = AirlineTicket::where('children', '>', 0)
    ->with(['provider', 'client'])
    ->get();

// Obtener tiquetes por código de reserva
$ticket = AirlineTicket::where('reservation_code', 'AV123456')
    ->with(['provider', 'client', 'agency'])
    ->first();
```

## Eventos y Listeners

### Crear un Listener para Tiquetes

```php
// app/Listeners/AirlineTicketCreatedListener.php
namespace App\Listeners;

use App\Events\AirlineTicketCreated;
use App\Models\Observation;
use App\Models\Task;
use Illuminate\Support\Facades\Log;

class AirlineTicketCreatedListener
{
    public function handle(AirlineTicketCreated $event)
    {
        $ticket = $event->ticket;
        
        // Crear observación automática
        $ticket->client->observations()->create([
            'title' => 'Nuevo tiquete aéreo creado',
            'body' => "Se ha creado el tiquete: {$ticket->airline} - {$ticket->origin} a {$ticket->destination}",
            'user_id' => auth()->id(),
            'type' => 'operational',
            'priority' => 'medium',
            'is_private' => false,
            'agency_id' => $ticket->agency_id,
        ]);
        
        // Crear tarea de check-in
        Task::create([
            'agency_id' => $ticket->agency_id,
            'client_id' => $ticket->client_id,
            'request_id' => $ticket->request_id,
            'airline_ticket_id' => $ticket->id,
            'title' => 'Check-in: ' . $ticket->destination,
            'type_task' => 'check-in',
            'description' => 'Realizar check-in para los vuelos',
            'state' => 'Asignado',
            'due_date' => $ticket->departure_date->subDays(2),
        ]);
        
        Log::info('Tiquete creado y tareas generadas', [
            'ticket_id' => $ticket->id,
            'client_id' => $ticket->client_id
        ]);
    }
}
```

### Emitir Evento Personalizado

```php
// En el componente CreateAirlineTickets
use App\Events\AirlineTicketCreated;

public function save()
{
    // ... lógica de guardado ...
    
    $ticket = AirlineTicket::create([...]);
    
    // Emitir evento
    event(new AirlineTicketCreated($ticket));
    
    // Emitir evento Livewire
    $this->dispatch('ticketCreated', ['ticket' => $ticket]);
}
```

## Validaciones Personalizadas

### Validación de Fechas de Vuelo

```php
// app/Rules/FlightDateRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class FlightDateRule implements Rule
{
    public function passes($attribute, $value)
    {
        $departureDate = request()->input('ticket.departure_date');
        $returnDate = request()->input('ticket.return_date');
        $flightType = request()->input('ticket.flight_type');
        
        // Para vuelos de ida y vuelta, la fecha de regreso debe ser posterior
        if ($flightType === 'roundtrip' && $returnDate) {
            return $returnDate >= $departureDate;
        }
        
        return true;
    }
    
    public function message()
    {
        return 'La fecha de regreso debe ser posterior a la fecha de salida.';
    }
}
```

### Validación de Código de Reserva

```php
// app/Rules/ReservationCodeRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class ReservationCodeRule implements Rule
{
    public function passes($attribute, $value)
    {
        // Validar formato de código de reserva (ej: AV123456)
        return preg_match('/^[A-Z]{2}\d{6}$/', $value);
    }
    
    public function message()
    {
        return 'El código de reserva debe tener el formato: 2 letras seguidas de 6 números (ej: AV123456).';
    }
}
```

### Uso en el Componente

```php
protected $rules = [
    'ticket.provider_id' => 'required|exists:providers,id',
    'ticket.flight_type' => 'required|in:oneway,roundtrip,multidestino',
    'ticket.destination_type' => 'required|in:Nacional,Internacional',
    'ticket.airline' => 'required|string|max:255',
    'ticket.reservation_code' => ['nullable', 'string', 'max:50', new ReservationCodeRule()],
    'ticket.origin' => 'required|string|max:255',
    'ticket.destination' => 'required|string|max:255',
    'ticket.departure_date' => 'required|date',
    'ticket.return_date' => ['nullable', 'date', new FlightDateRule()],
    'ticket.adult' => 'required|integer|min:1',
    'ticket.children' => 'required|integer|min:0',
    'ticket.infant' => 'required|integer|min:0',
    'ticket.fare' => 'required|numeric|min:0',
    'ticket.profit_percentage' => 'required|numeric|min:0',
    'ticket.total_fare' => 'required|numeric|min:0',
    'ticket.status' => 'required|string|max:255',
    'ticket.include' => 'required|array',
    'ticket.baggage' => 'required|array',
    'ticket.observations' => 'nullable|string'
];
```

## Scopes del Modelo

### Scopes para AirlineTicket

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

public function scopeByAirline($query, $airline)
{
    return $query->where('airline', $airline);
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

public function scopeInternational($query)
{
    return $query->where('destination_type', 'Internacional');
}

public function scopeNational($query)
{
    return $query->where('destination_type', 'Nacional');
}
```

### Uso de Scopes

```php
// Obtener tiquetes de ida y vuelta
$roundtripTickets = AirlineTicket::byFlightType('roundtrip')->get();

// Obtener tiquetes internacionales
$internationalTickets = AirlineTicket::international()->get();

// Obtener tiquetes vendidos en un rango de fechas
$soldTickets = AirlineTicket::byStatus('vendido')
    ->byDateRange('2025-10-01', '2025-10-31')
    ->get();

// Obtener tiquetes de Avianca con niños
$aviancaTicketsWithChildren = AirlineTicket::byAirline('Avianca')
    ->withChildren()
    ->get();
```

## Mutators y Accessors

### Mutators para AirlineTicket

```php
// En el modelo AirlineTicket
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

public function getFlightDurationAttribute()
{
    if (!$this->return_date) {
        return null;
    }
    
    $departure = Carbon::parse($this->departure_date);
    $return = Carbon::parse($this->return_date);
    
    return $departure->diffInDays($return);
}

public function getPassengerCountAttribute()
{
    return $this->adult + $this->children + $this->infant;
}

public function getIsRoundtripAttribute()
{
    return $this->flight_type === 'roundtrip';
}

public function getIsInternationalAttribute()
{
    return $this->destination_type === 'Internacional';
}
```

### Accessors para Conversión a Letras

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

## Jobs y Queues

### Job para Procesar Tiquetes

```php
// app/Jobs/ProcessAirlineTicket.php
namespace App\Jobs;

use App\Models\AirlineTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAirlineTicket implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $ticket;
    
    public function __construct(AirlineTicket $ticket)
    {
        $this->ticket = $ticket;
    }
    
    public function handle()
    {
        // Procesar tiquete (ej: enviar a sistema externo)
        Log::info('Procesando tiquete', [
            'ticket_id' => $this->ticket->id,
            'airline' => $this->ticket->airline,
            'reservation_code' => $this->ticket->reservation_code
        ]);
        
        // Simular procesamiento
        sleep(2);
        
        // Actualizar estado
        $this->ticket->update(['status' => 'procesado']);
    }
}
```

### Despachar Job

```php
// En el componente CreateAirlineTickets
use App\Jobs\ProcessAirlineTicket;

public function save()
{
    // ... guardar tiquete ...
    
    // Despachar job para procesar tiquete
    ProcessAirlineTicket::dispatch($ticket);
}
```

## API Resources

### AirlineTicket Resource

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
                'total' => $this->passenger_count,
            ],
            'pricing' => [
                'fare' => $this->fare,
                'profit_percentage' => $this->profit_percentage,
                'total_fare' => $this->total_fare,
                'formatted_fare' => $this->formatted_fare,
                'formatted_total_fare' => $this->formatted_total_fare,
                'total_en_letras' => $this->total_en_letras,
                'fare_en_letras' => $this->fare_en_letras,
            ],
            'services' => [
                'baggage' => $this->baggage,
                'include' => $this->include,
            ],
            'status' => $this->status,
            'observations' => $this->observations,
            'flight_info' => [
                'is_roundtrip' => $this->is_roundtrip,
                'is_international' => $this->is_international,
                'duration_days' => $this->flight_duration,
            ],
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
use App\Http\Resources\AirlineTicketResource;

public function show(AirlineTicket $ticket)
{
    return new AirlineTicketResource($ticket->load(['provider', 'client', 'agency']));
}

public function index()
{
    $tickets = AirlineTicket::with(['provider', 'client', 'agency'])->paginate(15);
    return AirlineTicketResource::collection($tickets);
}
```

## Testing

### Test para Crear Tiquete

```php
// tests/Feature/AirlineTicketTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\AirlineTicket;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use App\Models\Provider;
use Livewire\Livewire;
use App\Livewire\Services\AirlineTickets\CreateAirlineTickets;

class AirlineTicketTest extends TestCase
{
    public function test_can_create_airline_ticket()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        $provider = Provider::factory()->create();
        
        Livewire::test(CreateAirlineTickets::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('ticket.provider_id', $provider->id)
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
    
    public function test_roundtrip_requires_return_date()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateAirlineTickets::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('ticket.flight_type', 'roundtrip')
        ->set('ticket.return_date', '')
        ->call('save')
        ->assertHasErrors(['ticket.return_date' => 'required_if']);
    }
}
```

### Test para Conversión a Letras

```php
public function test_converts_numbers_to_words()
{
    $ticket = AirlineTicket::factory()->create([
        'fare' => 1000000,
        'total_fare' => 1150000,
    ]);
    
    $this->assertStringContains('un millón', $ticket->fare_en_letras);
    $this->assertStringContains('un millón ciento cincuenta mil', $ticket->total_en_letras);
}
```

## Middleware Personalizado

### Middleware para Tiquetes

```php
// app/Http/Middleware/AirlineTicketAccess.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AirlineTicket;

class AirlineTicketAccess
{
    public function handle(Request $request, Closure $next)
    {
        $ticket = $request->route('ticket');
        
        if ($ticket instanceof AirlineTicket) {
            // Verificar que el usuario tenga acceso al tiquete
            if (!auth()->user()->canAccessTicket($ticket)) {
                abort(403, 'No tienes acceso a este tiquete');
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
    'ticket.access' => \App\Http\Middleware\AirlineTicketAccess::class,
];
```

### Usar en Rutas

```php
Route::get('/tickets/{ticket}', ShowAirlineTickets::class)
    ->middleware(['auth', 'ticket.access'])
    ->name('tickets.show');
```

## Comandos Artisan

### Comando para Limpiar Tiquetes

```php
// app/Console/Commands/CleanupAirlineTickets.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AirlineTicket;
use Carbon\Carbon;

class CleanupAirlineTickets extends Command
{
    protected $signature = 'tickets:cleanup {--days=30 : Días de antigüedad}';
    protected $description = 'Limpiar tiquetes descartados antiguos';
    
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $tickets = AirlineTicket::where('status', 'descartado')
            ->where('updated_at', '<', $cutoffDate)
            ->get();
        
        foreach ($tickets as $ticket) {
            $ticket->delete();
        }
        
        $this->info("Se eliminaron {$tickets->count()} tiquetes descartados");
    }
}
```

### Comando para Generar Reportes

```php
// app/Console/Commands/GenerateTicketReport.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AirlineTicket;
use Carbon\Carbon;

class GenerateTicketReport extends Command
{
    protected $signature = 'tickets:report {--month=current : Mes del reporte}';
    protected $description = 'Generar reporte de tiquetes';
    
    public function handle()
    {
        $month = $this->option('month');
        $startDate = $month === 'current' 
            ? Carbon::now()->startOfMonth()
            : Carbon::parse($month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $tickets = AirlineTicket::whereBetween('created_at', [$startDate, $endDate])
            ->with(['provider', 'client', 'agency'])
            ->get();
        
        $this->info("Reporte de tiquetes para {$startDate->format('F Y')}");
        $this->info("Total de tiquetes: {$tickets->count()}");
        $this->info("Tiquetes vendidos: {$tickets->where('status', 'vendido')->count()}");
        $this->info("Tiquetes cotizados: {$tickets->where('status', 'cotizado')->count()}");
        $this->info("Tiquetes descartados: {$tickets->where('status', 'descartado')->count()}");
        
        $totalRevenue = $tickets->where('status', 'vendido')->sum('total_fare');
        $this->info("Ingresos totales: $" . number_format($totalRevenue, 2));
    }
}
```

### Registrar Comandos

```php
// app/Console/Kernel.php
protected $commands = [
    Commands\CleanupAirlineTickets::class,
    Commands\GenerateTicketReport::class,
];
```

---

*Ejemplos de código actualizados: Septiembre 2025*
