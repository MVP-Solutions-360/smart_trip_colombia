# Ejemplos de Código - Servicio de Tours

## Ejemplos de Uso de los Componentes

### Crear un Tour Programáticamente

```php
use App\Models\Tour;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;

// Crear un tour desde código
$tour = Tour::create([
    'agency_id' => 1,
    'name' => 'Tour por la Ciudad de Bogotá',
    'start_date' => '2025-10-15',
    'start_time' => '08:00:00',
    'end_date' => '2025-10-15',
    'end_time' => '18:00:00',
    'description' => 'Recorrido completo por los principales atractivos de Bogotá',
    'additional_details' => 'Incluye almuerzo y guía bilingüe',
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

### Crear Tour con Imágenes

```php
use App\Models\TourImage;

// Crear tour
$tour = Tour::create([...]);

// Agregar imagen principal
$mainImage = $tour->images()->create([
    'image_path' => 'tours/tour-bogota-main.jpg',
    'is_main' => true,
    'order' => 1,
    'description' => 'Imagen principal del tour',
]);

// Agregar imágenes de galería
$galleryImages = [
    [
        'image_path' => 'tours/tour-bogota-1.jpg',
        'is_main' => false,
        'order' => 2,
        'description' => 'Plaza de Bolívar',
    ],
    [
        'image_path' => 'tours/tour-bogota-2.jpg',
        'is_main' => false,
        'order' => 3,
        'description' => 'Museo del Oro',
    ],
];

foreach ($galleryImages as $imageData) {
    $tour->images()->create($imageData);
}
```

## Consultas de Base de Datos

### Obtener Tours con Relaciones

```php
// Obtener todos los tours con imágenes y cliente
$tours = Tour::with(['images', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('start_date', 'asc')
    ->get();

// Obtener tours por estado
$cotizedTours = Tour::where('status', 'cotizado')
    ->with(['client', 'agency'])
    ->get();

// Obtener tours por rango de fechas
$tours = Tour::whereBetween('start_date', ['2025-10-01', '2025-10-31'])
    ->with(['client', 'agency', 'images'])
    ->get();

// Obtener tours con imágenes
$toursWithImages = Tour::whereHas('images')
    ->with(['images', 'client'])
    ->get();
```

### Consultas Avanzadas

```php
// Obtener tours por nombre
$bogotaTours = Tour::where('name', 'LIKE', '%Bogotá%')
    ->with(['client', 'agency'])
    ->get();

// Obtener tours con niños
$toursWithChildren = Tour::where('children', '>', 0)
    ->with(['client', 'agency'])
    ->get();

// Obtener tours por tarifa mínima
$expensiveTours = Tour::where('total_fare', '>', 200000)
    ->with(['client', 'agency'])
    ->get();

// Obtener tours próximos
$upcomingTours = Tour::where('start_date', '>=', now())
    ->with(['client', 'agency'])
    ->orderBy('start_date', 'asc')
    ->get();
```

## Eventos y Listeners

### Crear un Listener para Tours

```php
// app/Listeners/TourCreatedListener.php
namespace App\Listeners;

use App\Events\TourCreated;
use App\Models\Observation;
use Illuminate\Support\Facades\Log;

class TourCreatedListener
{
    public function handle(TourCreated $event)
    {
        $tour = $event->tour;
        
        // Crear observación automática
        $tour->client->observations()->create([
            'title' => 'Nuevo tour creado',
            'body' => "Se ha creado el tour: {$tour->name} para el {$tour->start_date}",
            'user_id' => auth()->id(),
            'type' => 'operational',
            'priority' => 'medium',
            'is_private' => false,
            'agency_id' => $tour->agency_id,
        ]);
        
        Log::info('Tour creado y observación generada', [
            'tour_id' => $tour->id,
            'client_id' => $tour->client_id
        ]);
    }
}
```

### Emitir Evento Personalizado

```php
// En el componente CreateTourReserve
use App\Events\TourCreated;

public function save()
{
    // ... lógica de guardado ...
    
    $tour = Tour::create([...]);
    
    // Emitir evento
    event(new TourCreated($tour));
    
    // Emitir evento Livewire
    $this->dispatch('tourCreated', ['tour' => $tour]);
}
```

## Validaciones Personalizadas

### Validación de Fechas de Tour

```php
// app/Rules/TourDateRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class TourDateRule implements Rule
{
    public function passes($attribute, $value)
    {
        $startDate = request()->input('start_date');
        $endDate = request()->input('end_date');
        
        // La fecha de fin debe ser posterior o igual a la de inicio
        if ($startDate && $endDate) {
            return $endDate >= $startDate;
        }
        
        return true;
    }
    
    public function message()
    {
        return 'La fecha de fin debe ser posterior o igual a la fecha de inicio.';
    }
}
```

### Validación de Participantes

```php
// app/Rules/TourParticipantsRule.php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class TourParticipantsRule implements Rule
{
    public function passes($attribute, $value)
    {
        $adult = request()->input('adult');
        $children = request()->input('children');
        $infant = request()->input('infant');
        
        $totalParticipants = $adult + $children + $infant;
        
        // Máximo 20 participantes por tour
        return $totalParticipants <= 20 && $totalParticipants > 0;
    }
    
    public function message()
    {
        return 'El número total de participantes debe estar entre 1 y 20.';
    }
}
```

### Uso en el Componente

```php
protected $rules = [
    'name' => 'required|string|max:255',
    'start_date' => 'required|date',
    'end_date' => ['required', 'date', new TourDateRule()],
    'start_time' => 'required|date_format:H:i',
    'end_time' => 'required|date_format:H:i',
    'adult' => ['required', 'integer', 'min:1', 'max:20', new TourParticipantsRule()],
    'children' => 'required|integer|min:0|max:20',
    'infant' => 'required|integer|min:0|max:20',
    'fare' => 'required|numeric|min:1',
    'profit_percentage' => 'required|numeric|min:0',
    'total_fare' => 'required|numeric|min:0',
    'description' => 'nullable|string',
    'additional_details' => 'nullable|string',
    'status' => 'required|in:cotizado,vendido,descartado'
];
```

## Scopes del Modelo

### Scopes para Tour

```php
// En el modelo Tour
public function scopeByStatus($query, $status)
{
    return $query->where('status', $status);
}

public function scopeCotizado($query)
{
    return $query->where('status', 'cotizado');
}

public function scopeVendido($query)
{
    return $query->where('status', 'vendido');
}

public function scopeDescartado($query)
{
    return $query->where('status', 'descartado');
}

public function scopeByDateRange($query, $startDate, $endDate)
{
    return $query->whereBetween('start_date', [$startDate, $endDate]);
}

public function scopeUpcoming($query)
{
    return $query->where('start_date', '>=', now());
}

public function scopeWithChildren($query)
{
    return $query->where('children', '>', 0);
}

public function scopeWithInfants($query)
{
    return $query->where('infant', '>', 0);
}

public function scopeByTourName($query, $tourName)
{
    return $query->where('name', 'LIKE', "%{$tourName}%");
}

public function scopeByMinFare($query, $minFare)
{
    return $query->where('total_fare', '>=', $minFare);
}

public function scopeWithImages($query)
{
    return $query->whereHas('images');
}
```

### Uso de Scopes

```php
// Obtener tours cotizados
$cotizedTours = Tour::cotizado()->get();

// Obtener tours vendidos
$soldTours = Tour::vendido()->get();

// Obtener tours próximos
$upcomingTours = Tour::upcoming()->get();

// Obtener tours con niños
$toursWithChildren = Tour::withChildren()->get();

// Obtener tours por rango de fechas
$tours = Tour::byDateRange('2025-10-01', '2025-10-31')->get();

// Obtener tours con imágenes
$toursWithImages = Tour::withImages()->get();
```

## Mutators y Accessors

### Mutators para Tour

```php
// En el modelo Tour
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

public function getDurationAttribute()
{
    $start = Carbon::parse($this->start_date . ' ' . $this->start_time);
    $end = Carbon::parse($this->end_date . ' ' . $this->end_time);
    
    return $start->diffInHours($end);
}

public function getParticipantCountAttribute()
{
    return $this->adult + $this->children + $this->infant;
}

public function getIsUpcomingAttribute()
{
    return $this->start_date >= now()->toDateString();
}

public function getIsTodayAttribute()
{
    return $this->start_date == now()->toDateString();
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
```

## Jobs y Queues

### Job para Procesar Tours

```php
// app/Jobs/ProcessTour.php
namespace App\Jobs;

use App\Models\Tour;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessTour implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $tour;
    
    public function __construct(Tour $tour)
    {
        $this->tour = $tour;
    }
    
    public function handle()
    {
        // Procesar tour (ej: enviar a sistema externo)
        Log::info('Procesando tour', [
            'tour_id' => $this->tour->id,
            'tour_name' => $this->tour->name,
            'start_date' => $this->tour->start_date
        ]);
        
        // Simular procesamiento
        sleep(2);
        
        // Actualizar estado
        $this->tour->update(['status' => 'procesado']);
    }
}
```

### Despachar Job

```php
// En el componente CreateTourReserve
use App\Jobs\ProcessTour;

public function save()
{
    // ... guardar tour ...
    
    // Despachar job para procesar tour
    ProcessTour::dispatch($tour);
}
```

## API Resources

### Tour Resource

```php
// app/Http/Resources/TourResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $this->start_date,
            'start_time' => $this->start_time,
            'end_date' => $this->end_date,
            'end_time' => $this->end_time,
            'description' => $this->description,
            'additional_details' => $this->additional_details,
            'participants' => [
                'adult' => $this->adult,
                'children' => $this->children,
                'infant' => $this->infant,
                'total' => $this->participant_count,
            ],
            'pricing' => [
                'fare' => $this->fare,
                'profit_percentage' => $this->profit_percentage,
                'total_fare' => $this->total_fare,
                'formatted_fare' => $this->formatted_fare,
                'formatted_total_fare' => $this->formatted_total_fare,
            ],
            'tour_info' => [
                'duration_hours' => $this->duration,
                'is_upcoming' => $this->is_upcoming,
                'is_today' => $this->is_today,
                'status_label' => $this->status_label,
            ],
            'status' => $this->status,
            'client' => new ClientResource($this->client),
            'agency' => new AgencyResource($this->agency),
            'images' => TourImageResource::collection($this->images),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Uso del Resource

```php
// En un controlador API
use App\Http\Resources\TourResource;

public function show(Tour $tour)
{
    return new TourResource($tour->load(['client', 'agency', 'images']));
}

public function index()
{
    $tours = Tour::with(['client', 'agency', 'images'])->paginate(15);
    return TourResource::collection($tours);
}
```

## Testing

### Test para Crear Tour

```php
// tests/Feature/TourTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Tour;
use App\Models\Agency;
use App\Models\Client;
use App\Models\Request;
use Livewire\Livewire;
use App\Livewire\Services\Tours\CreateTourReserve;

class TourTest extends TestCase
{
    public function test_can_create_tour()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateTourReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('name', 'Tour Test')
        ->set('start_date', '2025-12-01')
        ->set('end_date', '2025-12-01')
        ->set('start_time', '08:00')
        ->set('end_time', '18:00')
        ->set('adult', 2)
        ->set('fare', 100000)
        ->set('profit_percentage', 15)
        ->call('save')
        ->assertHasNoErrors();
        
        $this->assertDatabaseHas('tours', [
            'name' => 'Tour Test',
            'adult' => 2,
            'fare' => 100000,
        ]);
    }
    
    public function test_tour_requires_name()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateTourReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('name', '')
        ->call('save')
        ->assertHasErrors(['name' => 'required']);
    }
    
    public function test_end_date_must_be_after_start_date()
    {
        $agency = Agency::factory()->create();
        $client = Client::factory()->create();
        $request = Request::factory()->create();
        
        Livewire::test(CreateTourReserve::class, [
            'agency' => $agency,
            'client' => $client,
            'request' => $request,
        ])
        ->set('start_date', '2025-12-05')
        ->set('end_date', '2025-12-01')
        ->call('save')
        ->assertHasErrors(['end_date']);
    }
}
```

## Middleware Personalizado

### Middleware para Tours

```php
// app/Http/Middleware/TourAccess.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tour;

class TourAccess
{
    public function handle(Request $request, Closure $next)
    {
        $tour = $request->route('tour');
        
        if ($tour instanceof Tour) {
            // Verificar que el usuario tenga acceso al tour
            if (!auth()->user()->canAccessTour($tour)) {
                abort(403, 'No tienes acceso a este tour');
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
    'tour.access' => \App\Http\Middleware\TourAccess::class,
];
```

### Usar en Rutas

```php
Route::get('/tours/{tour}', ShowTourReserve::class)
    ->middleware(['auth', 'tour.access'])
    ->name('tours.show');
```

## Comandos Artisan

### Comando para Limpiar Tours

```php
// app/Console/Commands/CleanupTours.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tour;
use Carbon\Carbon;

class CleanupTours extends Command
{
    protected $signature = 'tours:cleanup {--days=30 : Días de antigüedad}';
    protected $description = 'Limpiar tours descartados antiguos';
    
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $tours = Tour::where('status', 'descartado')
            ->where('updated_at', '<', $cutoffDate)
            ->get();
        
        foreach ($tours as $tour) {
            $tour->delete();
        }
        
        $this->info("Se eliminaron {$tours->count()} tours descartados");
    }
}
```

### Comando para Generar Reportes de Tours

```php
// app/Console/Commands/GenerateTourReport.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tour;
use Carbon\Carbon;

class GenerateTourReport extends Command
{
    protected $signature = 'tours:report {--month=current : Mes del reporte}';
    protected $description = 'Generar reporte de tours';
    
    public function handle()
    {
        $month = $this->option('month');
        $startDate = $month === 'current' 
            ? Carbon::now()->startOfMonth()
            : Carbon::parse($month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $tours = Tour::whereBetween('created_at', [$startDate, $endDate])
            ->with(['client', 'agency'])
            ->get();
        
        $this->info("Reporte de tours para {$startDate->format('F Y')}");
        $this->info("Total de tours: {$tours->count()}");
        $this->info("Tours vendidos: {$tours->where('status', 'vendido')->count()}");
        $this->info("Tours cotizados: {$tours->where('status', 'cotizado')->count()}");
        $this->info("Tours descartados: {$tours->where('status', 'descartado')->count()}");
        
        $totalRevenue = $tours->where('status', 'vendido')->sum('total_fare');
        $this->info("Ingresos totales: $" . number_format($totalRevenue, 2));
        
        // Estadísticas por participante
        $toursWithChildren = $tours->where('children', '>', 0)->count();
        $this->info("Tours con niños: {$toursWithChildren}");
        
        $toursWithInfants = $tours->where('infant', '>', 0)->count();
        $this->info("Tours con infantes: {$toursWithInfants}");
    }
}
```

### Registrar Comandos

```php
// app/Console/Kernel.php
protected $commands = [
    Commands\CleanupTours::class,
    Commands\GenerateTourReport::class,
];
```

---

*Ejemplos de código actualizados: Septiembre 2025*