# API Reference - Módulo de Renta de Autos

## 📋 Índice

1. [BookingCarsService API](#bookingcarsservice-api)
2. [Livewire Components API](#livewire-components-api)
3. [Modelos API](#modelos-api)
4. [Rutas API](#rutas-api)
5. [Ejemplos de Uso](#ejemplos-de-uso)

## 🔌 BookingCarsService API

### authenticate()

Autentica con la API de BookingCars y obtiene un token de acceso.

```php
public function authenticate(): array
```

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        'expires_in' => 3600
    ],
    'error' => null
]
```

**Uso:**
```php
$service = new BookingCarsService();
$result = $service->authenticate();

if ($result['status']) {
    $token = $result['data']['token'];
}
```

### getLocations(string $query)

Busca ubicaciones disponibles para recogida y devolución.

```php
public function getLocations(string $query): array
```

**Parámetros:**
- `$query` (string): Término de búsqueda (mínimo 3 caracteres)

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        [
            'id' => 1,
            'citycode' => 'BOG',
            'airportcode' => 'BOG',
            'vicinitycode' => 'T',
            'cityname' => 'Bogotá',
            'countryname' => 'Colombia',
            'address' => 'Aeropuerto El Dorado',
            'iatacountrycode' => 'CO'
        ]
    ],
    'error' => null
]
```

**Uso:**
```php
$service = new BookingCarsService();
$result = $service->getLocations('Bogotá');

if ($result['status']) {
    $locations = $result['data'];
}
```

### getAvailability(array $params)

Busca vehículos disponibles para las fechas y ubicaciones especificadas.

```php
public function getAvailability(array $params): array
```

**Parámetros:**
```php
$params = [
    'pickup' => [
        'timestamp' => '2025-10-05T15:30:00',
        'location_code' => 'BOG',
        'vicinity_code' => 'T'
    ],
    'dropoff' => [
        'timestamp' => '2025-10-08T15:30:00',
        'location_code' => 'MDE',
        'vicinity_code' => 'T'
    ],
    'destination_city' => 'BOG',
    'point_of_sale' => 'Colombia',
    'destination' => 'CO',
    'currency' => 'USD'
];
```

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'request_uuid' => 'req_123456789',
        'rates' => [
            [
                'rate_id' => 'rate_001',
                'name' => 'Toyota Corolla',
                'category' => 'Compacto',
                'price' => 150.00,
                'currency' => 'USD',
                'rental_code' => 'Hertz',
                'image' => 'https://example.com/car.jpg'
            ]
        ]
    ],
    'error' => null
]
```

### getRateInformation(string $requestUUID, string $rateId)

Obtiene información detallada de una tarifa específica.

```php
public function getRateInformation(string $requestUUID, string $rateId): array
```

**Parámetros:**
- `$requestUUID` (string): UUID de la solicitud
- `$rateId` (string): ID de la tarifa

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'rate_id' => 'rate_001',
        'name' => 'Toyota Corolla',
        'category' => 'Compacto',
        'price' => 150.00,
        'currency' => 'USD',
        'inclusions' => [
            'Kilometraje ilimitado',
            'Seguro básico',
            'GPS'
        ],
        'terms' => [
            'Edad mínima: 21 años',
            'Licencia de conducir válida'
        ]
    ],
    'error' => null
]
```

### createReservation(array $data)

Crea una nueva reserva de vehículo.

```php
public function createReservation(array $data): array
```

**Parámetros:**
```php
$data = [
    'rate_id' => 'rate_001',
    'pickup_date' => '2025-10-05T15:30:00',
    'dropoff_date' => '2025-10-08T15:30:00',
    'pickup_location' => 'BOG',
    'dropoff_location' => 'MDE',
    'driver' => [
        'first_name' => 'Juan',
        'last_name' => 'Pérez',
        'email' => 'juan@example.com',
        'phone' => '+573001234567',
        'document_type' => 'CC',
        'document_number' => '12345678'
    ],
    'payment_method' => 'prepay'
];
```

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'reservation_id' => 'res_987654321',
        'confirmation_code' => 'ABC123',
        'status' => 'confirmed',
        'total_price' => 450.00,
        'currency' => 'USD'
    ],
    'error' => null
]
```

### cancelReservation(string $reservationId, string $companyCode)

Cancela una reserva existente.

```php
public function cancelReservation(string $reservationId, string $companyCode): array
```

**Parámetros:**
- `$reservationId` (string): ID de la reserva
- `$companyCode` (string): Código de la empresa

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'reservation_id' => 'res_987654321',
        'status' => 'cancelled',
        'refund_amount' => 450.00,
        'currency' => 'USD'
    ],
    'error' => null
]
```

### getReservation(string $id)

Obtiene información de una reserva específica.

```php
public function getReservation(string $id): array
```

**Parámetros:**
- `$id` (string): ID de la reserva

**Retorna:**
```php
[
    'status' => true,
    'data' => [
        'reservation_id' => 'res_987654321',
        'confirmation_code' => 'ABC123',
        'status' => 'confirmed',
        'pickup_date' => '2025-10-05T15:30:00',
        'dropoff_date' => '2025-10-08T15:30:00',
        'vehicle' => [
            'name' => 'Toyota Corolla',
            'category' => 'Compacto'
        ],
        'total_price' => 450.00,
        'currency' => 'USD'
    ],
    'error' => null
]
```

## 🎯 Livewire Components API

### SearchCarRental

**Ruta:** `/car-rentals/search`

**Propiedades Públicas:**
```php
public string $pickupQuery = '';
public array $pickupResults = [];
public ?array $pickupSelected = null;
public string $dropoffQuery = '';
public array $dropoffResults = [];
public ?array $dropoffSelected = null;
public string $pickupDate = '';
public string $dropoffDate = '';
public string $currency = 'USD';
public bool $loading = false;
```

**Métodos Públicos:**
```php
// Búsqueda de ubicaciones
public function searchPickupLocations(): void
public function searchDropoffLocations(): void

// Selección de ubicaciones
public function selectPickupLocation(array $location): void
public function selectDropoffLocation(array $location): void

// Búsqueda principal
public function search(): void
```

**Eventos Disparados:**
- `success`: Búsqueda exitosa
- `error`: Error en la búsqueda

### ListCarResults

**Ruta:** `/car-rentals/results`

**Propiedades Públicas:**
```php
public array $searchParams = [];
public bool $loading = false;
public string $selectedCategory = '';
public string $minPrice = '';
public string $maxPrice = '';
public string $sortBy = 'price';
public string $sortDirection = 'asc';
public bool $showReservationModal = false;
public ?CarRate $selectedRate = null;
```

**Computed Properties:**
```php
public function getRatesProperty(): LengthAwarePaginator
```

**Métodos Públicos:**
```php
// Filtros
public function filterByCategory(string $category): void
public function filterByPrice(): void

// Ordenamiento
public function sortBy(string $field): void

// Reservas
public function reserve(int $rateId): void
public function closeModal(): void
```

### ConfirmCarReservation

**Ruta:** `/car-rentals/confirm/{id}`

**Propiedades Públicas:**
```php
public CarRate $rate;
public string $firstName = '';
public string $lastName = '';
public string $email = '';
public string $phone = '';
public string $documentType = 'CC';
public string $documentNumber = '';
public string $paymentMethod = 'prepay';
public bool $loading = false;
```

**Métodos Públicos:**
```php
public function reserve(): void
public function goBack(): void
```

### MyCarReservations

**Ruta:** `/car-rentals/my-reservations`

**Propiedades Públicas:**
```php
public bool $loading = false;
public ?CarReservation $selectedReservation = null;
public bool $showCancelModal = false;
```

**Computed Properties:**
```php
public function getReservationsProperty(): LengthAwarePaginator
```

**Métodos Públicos:**
```php
public function viewDetails(CarReservation $reservation): void
public function cancelReservation(CarReservation $reservation): void
public function confirmCancel(): void
public function closeCancelModal(): void
```

## 📊 Modelos API

### CarRental

```php
class CarRental extends Model
{
    protected $fillable = [
        'code', 'name', 'logo', 'status'
    ];

    // Relaciones
    public function rates(): HasMany
    {
        return $this->hasMany(CarRate::class, 'rental_code', 'code');
    }
}
```

### CarLocation

```php
class CarLocation extends Model
{
    protected $fillable = [
        'citycode', 'airportcode', 'address', 'state', 
        'countryname', 'name'
    ];

    // Scopes
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('citycode', 'like', "%{$search}%")
                    ->orWhere('airportcode', 'like', "%{$search}%")
                    ->orWhere('countryname', 'like', "%{$search}%");
    }
}
```

### CarRate

```php
class CarRate extends Model
{
    protected $fillable = [
        'request_uuid', 'rate_id', 'name', 'category', 
        'price', 'currency', 'days', 'image', 'rental_code'
    ];

    // Relaciones
    public function carRental(): BelongsTo
    {
        return $this->belongsTo(CarRental::class, 'rental_code', 'code');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(CarReservation::class, 'rate_id', 'rate_id');
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }
}
```

### CarReservation

```php
class CarReservation extends Model
{
    protected $fillable = [
        'reservation_id_api', 'client_id', 'rate_id',
        'pickup_date', 'dropoff_date', 'pickup_place',
        'dropoff_place', 'price', 'currency', 'status'
    ];

    // Relaciones
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function carRate(): BelongsTo
    {
        return $this->belongsTo(CarRate::class, 'rate_id', 'rate_id');
    }
}
```

## 🛣️ Rutas API

### Rutas Principales

```php
// Búsqueda y resultados
Route::get('/car-rentals/search', SearchCarRental::class)
    ->name('car-rentals.search');

Route::get('/car-rentals/results', ListCarResults::class)
    ->name('car-rentals.results');

// Reservas
Route::get('/car-rentals/confirm/{id}', ConfirmCarReservation::class)
    ->name('car-rentals.confirm');

Route::get('/car-rentals/my-reservations', MyCarReservations::class)
    ->name('car-rentals.my-reservations');
```

### Rutas de Pruebas (Opcionales)

```php
Route::prefix('car-rentals/test')->group(function () {
    Route::get('/rentals', [CarRentalTestController::class, 'rentals']);
    Route::get('/locations/{query}', [CarRentalTestController::class, 'locations']);
    Route::get('/availability', [CarRentalTestController::class, 'availability']);
    Route::get('/reservation/{id}', [CarRentalTestController::class, 'reservation']);
});
```

## 💡 Ejemplos de Uso

### Búsqueda Básica

```php
// En un controlador o servicio
$searchComponent = new SearchCarRental();
$searchComponent->pickupQuery = 'Bogotá';
$searchComponent->searchPickupLocations();

$locations = $searchComponent->pickupResults;
```

### Crear Reserva Programáticamente

```php
use App\Services\BookingCarsService;
use App\Models\CarReservation;

$service = new BookingCarsService();

$reservationData = [
    'rate_id' => 'rate_001',
    'pickup_date' => '2025-10-05T15:30:00',
    'dropoff_date' => '2025-10-08T15:30:00',
    'pickup_location' => 'BOG',
    'dropoff_location' => 'MDE',
    'driver' => [
        'first_name' => 'Juan',
        'last_name' => 'Pérez',
        'email' => 'juan@example.com',
        'phone' => '+573001234567',
        'document_type' => 'CC',
        'document_number' => '12345678'
    ],
    'payment_method' => 'prepay'
];

$result = $service->createReservation($reservationData);

if ($result['status']) {
    // Guardar en base de datos local
    CarReservation::create([
        'reservation_id_api' => $result['data']['reservation_id'],
        'client_id' => auth()->id(),
        'rate_id' => $reservationData['rate_id'],
        'pickup_date' => $reservationData['pickup_date'],
        'dropoff_date' => $reservationData['dropoff_date'],
        'pickup_place' => $reservationData['pickup_location'],
        'dropoff_place' => $reservationData['dropoff_location'],
        'price' => $result['data']['total_price'],
        'currency' => 'USD',
        'status' => 'confirmed'
    ]);
}
```

### Consultar Reservas

```php
use App\Models\CarReservation;

// Obtener reservas de un cliente
$reservations = CarReservation::with(['carRate.carRental', 'client'])
    ->where('client_id', auth()->id())
    ->paginate(10);

// Obtener reserva específica
$reservation = CarReservation::with(['carRate.carRental'])
    ->where('reservation_id_api', 'res_123456')
    ->first();
```

### Filtros Avanzados

```php
use App\Models\CarRate;

// Filtrar por categoría
$compactCars = CarRate::byCategory('Compacto')->get();

// Filtrar por rango de precio
$affordableCars = CarRate::byPriceRange(50, 100)->get();

// Búsqueda combinada
$results = CarRate::byCategory('SUV')
    ->byPriceRange(100, 200)
    ->where('currency', 'USD')
    ->orderBy('price', 'asc')
    ->paginate(12);
```

---

## 📞 Soporte

Para más información sobre la API, consultar la documentación completa o contactar al equipo de desarrollo.

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025
