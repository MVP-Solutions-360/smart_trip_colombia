# 🚗 DOCUMENTACIÓN COMPLETA - SISTEMA DE TRASLADOS

## 1. ARQUITECTURA GENERAL

**Integración GDS:** Terrawind  
**Frontend:** Livewire 2.10 + AdminLTE 3.8  
**Base de datos:** MySQL  
**Autenticación:** Laravel Sanctum + Jetstream  
**Proveedores:** Múltiples operadores de traslados

## 2. CONFIGURACIÓN INICIAL

### Variables de entorno requeridas:
```env
APP_TRAVEL=https://tu-api-traslados.com
TERRAWIND_API_URL=https://api.terrawind.com
TERRAWIND_API_KEY=tu_api_key_terrawind
TERRAWIND_ENVIRONMENT=staging
```

### Dependencias Composer:
```json
{
    "laravel/framework": "^9.19",
    "livewire/livewire": "^2.10",
    "guzzlehttp/guzzle": "^7.5"
}
```

## 3. ESTRUCTURA DE BASE DE DATOS

### Tabla principal: `transfer_reserves`
```sql
CREATE TABLE transfer_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_id BIGINT UNSIGNED NOT NULL,
    transfer_type ENUM('airport', 'hotel', 'city', 'custom') NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_date DATETIME NOT NULL,
    pickup_time TIME NOT NULL,
    passengers INT NOT NULL,
    luggage INT DEFAULT 0,
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_category VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    confirmation_number VARCHAR(255) NULL,
    provider_reference VARCHAR(255) NULL,
    special_requests TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE
);
```

### Tabla: `transfer_providers`
```sql
CREATE TABLE transfer_providers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    api_endpoint VARCHAR(500) NULL,
    api_key VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    response_time INT DEFAULT 30,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Tabla: `transfer_vehicles`
```sql
CREATE TABLE transfer_vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT UNSIGNED NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_category VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    luggage_capacity INT NOT NULL,
    features JSON NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (provider_id) REFERENCES transfer_providers(id) ON DELETE CASCADE
);
```

## 4. MODELOS PRINCIPALES

### TransferReserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferReserve extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function provider()
    {
        return $this->belongsTo(TransferProvider::class);
    }
    
    public function vehicle()
    {
        return $this->belongsTo(TransferVehicle::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('transfer_type', $type);
    }
    
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
```

### TransferProvider.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferProvider extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function vehicles()
    {
        return $this->hasMany(TransferVehicle::class);
    }
    
    public function reserves()
    {
        return $this->hasMany(TransferReserve::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

## 5. TRAIT DE TRASLADOS

### TransferTrait.php
```php
<?php

namespace App\Traits\Terrawind;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait TransferTrait
{
    public function searchTransfers($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/transfers", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["transfers"]
        ];
    }
    
    public function getTransferDetails($transferId)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/transfer-details", [
            'transfer_id' => $transferId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["transfer"]
        ];
    }
    
    public function checkAvailability($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/availability", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["availability"]
        ];
    }
    
    public function createBooking($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/book", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["booking"]
        ];
    }
    
    public function cancelBooking($bookingId)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/cancel", [
            'booking_id' => $bookingId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["cancellation"]
        ];
    }
    
    public function getBookingStatus($bookingId)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/terrawind/status", [
            'booking_id' => $bookingId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["booking"]
        ];
    }
}
```

## 6. ENDPOINTS DE API TERRAWIND

### Búsqueda de traslados
```
POST /api/terrawind/transfers
Body: {
    "pickup_location": "BOG",
    "dropoff_location": "Hotel Tequendama",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2,
    "luggage": 2,
    "transfer_type": "airport"
}
```

### Detalles del traslado
```
POST /api/terrawind/transfer-details
Body: {"transfer_id": "TRANSFER001"}
```

### Verificar disponibilidad
```
POST /api/terrawind/availability
Body: {
    "transfer_id": "TRANSFER001",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2
}
```

### Crear reserva
```
POST /api/terrawind/book
Body: {
    "transfer_id": "TRANSFER001",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2,
    "luggage": 2,
    "passenger_info": {
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "3001234567"
    },
    "special_requests": "Habitación 205"
}
```

## 7. RUTAS PRINCIPALES

### routes/web/gds.php
```php
<?php

use App\Http\Livewire\Transfer\SearchTransferShow;
use App\Http\Livewire\Transfer\TransferShowResponse;
use App\Http\Livewire\Transfer\Vehicle\ShowVehicle;
use App\Http\Livewire\Transfer\Vehicle\FormVehicle;
use App\Http\Livewire\Reserve\Gds\Terrawind\IndexTerrawindReserve;
use App\Http\Livewire\Reserve\Gds\Terrawind\ShowReserve;
use Illuminate\Support\Facades\Route;

// Búsqueda y reserva de traslados
Route::get('transfer/reserve/', SearchTransferShow::class)->middleware('can:index')->name("transfer");
Route::get('transfer-show/reserve', TransferShowResponse::class)->middleware('can:index')->name("transfer-show");
Route::get('transfer-show/vehicle/reserve', ShowVehicle::class)->middleware('can:index')->name("transfer-vehicle");
Route::get('transfer/reserve/reserve', FormVehicle::class)->middleware('can:index')->name("transfer-reserve");

// Consulta de reservas Terrawind
Route::get('terrawind/{terrawind}', IndexTerrawindReserve::class)->middleware('can:index')->name("terrawind.index");
Route::get('terrawind-consult/{reserve}', ShowReserve::class)->middleware('can:index')->name("terrawind.consult");
```

## 8. CONTROLADORES DE API

### TransferController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransferReserve;
use App\Models\TransferProvider;
use App\Models\TransferVehicle;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function store(Request $request)
    {
        $transfer = TransferReserve::create([
            "reserve_id" => $request->reserve_id,
            "transfer_type" => $request->transfer_type,
            "pickup_location" => $request->pickup_location,
            "dropoff_location" => $request->dropoff_location,
            "pickup_date" => $request->pickup_date,
            "pickup_time" => $request->pickup_time,
            "passengers" => $request->passengers,
            "luggage" => $request->luggage,
            "vehicle_type" => $request->vehicle_type,
            "vehicle_category" => $request->vehicle_category,
            "total_amount" => $request->total_amount,
            "currency" => $request->currency,
            "status" => $request->status,
            "confirmation_number" => $request->confirmation_number,
            "provider_reference" => $request->provider_reference,
            "special_requests" => $request->special_requests
        ]);

        return $transfer;
    }
    
    public function getProviders()
    {
        $providers = TransferProvider::active()
            ->with('vehicles')
            ->get();
            
        return response()->json([
            'success' => true,
            'providers' => $providers
        ]);
    }
    
    public function getVehicles(Request $request)
    {
        $vehicles = TransferVehicle::where('provider_id', $request->provider_id)
            ->where('is_active', true)
            ->get();
            
        return response()->json([
            'success' => true,
            'vehicles' => $vehicles
        ]);
    }
}
```

## 9. COMPONENTES LIVEWIRE PRINCIPALES

### SearchTransferShow.php - Búsqueda de traslados
```php
<?php

namespace App\Http\Livewire\Transfer;

use Livewire\Component;
use App\Traits\Terrawind\TransferTrait;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SearchTransferShow extends Component
{
    use TransferTrait;
    
    public $transferType = 'airport';
    public $pickupLocation = '';
    public $dropoffLocation = '';
    public $pickupDate = '';
    public $pickupTime = '';
    public $passengers = 1;
    public $luggage = 0;
    public $searchPickup = '';
    public $searchDropoff = '';
    public $openPickup = false;
    public $openDropoff = false;
    public $field = [];

    protected $queryString = [
        'transferType', 'pickupLocation', 'dropoffLocation', 
        'pickupDate', 'pickupTime', 'passengers', 'luggage'
    ];

    public function updatedSearchPickup()
    {
        $this->openPickup = true;
        $this->fetchLocations($this->searchPickup, 'pickup');
    }

    public function updatedSearchDropoff()
    {
        $this->openDropoff = true;
        $this->fetchLocations($this->searchDropoff, 'dropoff');
    }

    public function selectPickup($code, $name)
    {
        $this->searchPickup = $name;
        $this->pickupLocation = $code;
        $this->openPickup = false;
    }

    public function selectDropoff($code, $name)
    {
        $this->searchDropoff = $name;
        $this->dropoffLocation = $code;
        $this->openDropoff = false;
    }

    private function fetchLocations($query, $type)
    {
        if (strlen($query) >= 3) {
            $response = Http::post(env('APP_TRAVEL')."/api/terrawind/locations", [
                'query' => $query,
                'type' => $type
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    protected $rules = [
        'transferType' => 'required|in:airport,hotel,city,custom',
        'pickupLocation' => 'required|string',
        'dropoffLocation' => 'required|string',
        'pickupDate' => 'required|date|after:today',
        'pickupTime' => 'required',
        'passengers' => 'required|integer|min:1|max:20',
        'luggage' => 'required|integer|min:0|max:10',
    ];

    public function search()
    {
        $this->validate();

        $searchData = [
            'pickup_location' => $this->pickupLocation,
            'dropoff_location' => $this->dropoffLocation,
            'pickup_date' => $this->pickupDate,
            'pickup_time' => $this->pickupTime,
            'passengers' => $this->passengers,
            'luggage' => $this->luggage,
            'transfer_type' => $this->transferType
        ];

        $result = $this->searchTransfers($searchData);
        
        if ($result['success']) {
            Cache::put('transferSearch', [
                'search' => $searchData,
                'results' => $result['data']
            ]);
            redirect()->route('transfer-show');
        } else {
            session()->flash('error', $result['message']);
        }
    }

    public function render()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $maxDate = now()->addYear()->format('Y-m-d');
        
        return view('livewire.transfer.search-transfer-show', compact('tomorrow', 'maxDate'));
    }
}
```

### TransferShowResponse.php - Mostrar resultados
```php
<?php

namespace App\Http\Livewire\Transfer;

use Livewire\Component;
use App\Traits\Terrawind\TransferTrait;
use Illuminate\Support\Facades\Cache;

class TransferShowResponse extends Component
{
    use TransferTrait;
    
    public $transfers = [];
    public $search = [];
    public $selectedTransfer = null;
    public $transferDetails = null;
    public $availability = null;

    public function mount()
    {
        $cache = Cache::get('transferSearch');
        $this->search = $cache['search'];
        $this->transfers = $cache['results'];
    }

    public function selectTransfer($transferId)
    {
        $this->selectedTransfer = $transferId;
        $result = $this->getTransferDetails($transferId);
        
        if ($result['success']) {
            $this->transferDetails = $result['data'];
        }
    }

    public function checkAvailability($transferId)
    {
        $availabilityData = array_merge($this->search, ['transfer_id' => $transferId]);
        $result = $this->checkAvailability($availabilityData);
        
        if ($result['success']) {
            $this->availability = $result['data'];
            Cache::put('transferAvailability', [
                'transfer' => $transferId,
                'search' => $this->search,
                'availability' => $this->availability
            ]);
            redirect()->route('transfer-vehicle');
        }
    }

    public function render()
    {
        return view('livewire.transfer.transfer-show-response');
    }
}
```

### FormVehicle.php - Formulario de reserva
```php
<?php

namespace App\Http\Livewire\Transfer\Vehicle;

use Livewire\Component;
use App\Models\TransferReserve;
use App\Models\TerrawindReserve;
use App\Traits\Terrawind\TransferTrait;
use Illuminate\Support\Facades\Cache;

class FormVehicle extends Component
{
    use TransferTrait;
    
    public $transfer = null;
    public $search = [];
    public $availability = null;
    public $passengerInfo = [
        'name' => '',
        'email' => '',
        'phone' => '',
        'special_requests' => ''
    ];
    public $selectedVehicle = null;
    public $totalAmount = 0;

    public function mount()
    {
        $cache = Cache::get('transferAvailability');
        $this->transfer = $cache['transfer'];
        $this->search = $cache['search'];
        $this->availability = $cache['availability'];
        
        $this->calculateTotal();
    }

    public function selectVehicle($vehicleId)
    {
        $this->selectedVehicle = $vehicleId;
        $this->calculateTotal();
    }

    private function calculateTotal()
    {
        if ($this->selectedVehicle && $this->availability) {
            $vehicle = collect($this->availability['vehicles'])->firstWhere('id', $this->selectedVehicle);
            if ($vehicle) {
                $this->totalAmount = $vehicle['price'];
            }
        }
    }

    protected $rules = [
        'passengerInfo.name' => 'required|string|max:255',
        'passengerInfo.email' => 'required|email',
        'passengerInfo.phone' => 'required|string',
        'selectedVehicle' => 'required|string',
    ];

    public function createBooking()
    {
        $this->validate();

        $bookingData = [
            'transfer_id' => $this->transfer,
            'pickup_date' => $this->search['pickup_date'],
            'pickup_time' => $this->search['pickup_time'],
            'passengers' => $this->search['passengers'],
            'luggage' => $this->search['luggage'],
            'vehicle_id' => $this->selectedVehicle,
            'passenger_info' => $this->passengerInfo,
            'special_requests' => $this->passengerInfo['special_requests']
        ];

        $result = $this->createBooking($bookingData);
        
        if ($result['success']) {
            // Crear reserva en base de datos
            $transferReserve = TransferReserve::create([
                'reserve_id' => 1, // ID de reserva principal
                'transfer_type' => $this->search['transfer_type'],
                'pickup_location' => $this->search['pickup_location'],
                'dropoff_location' => $this->search['dropoff_location'],
                'pickup_date' => $this->search['pickup_date'],
                'pickup_time' => $this->search['pickup_time'],
                'passengers' => $this->search['passengers'],
                'luggage' => $this->search['luggage'],
                'vehicle_type' => $this->availability['vehicle_type'],
                'vehicle_category' => $this->availability['vehicle_category'],
                'total_amount' => $this->totalAmount,
                'status' => 'confirmed',
                'confirmation_number' => $result['data']['confirmation_number'],
                'provider_reference' => $result['data']['booking_id']
            ]);

            TerrawindReserve::create([
                'reserve_id' => 1,
                'terrawind_booking_id' => $result['data']['booking_id'],
                'transfer_id' => $this->transfer,
                'status' => 'confirmed'
            ]);

            session()->flash('success', 'Reserva de traslado creada exitosamente');
            redirect()->route('transfer-confirmation', $transferReserve->id);
        } else {
            session()->flash('error', $result['message']);
        }
    }

    public function render()
    {
        return view('livewire.transfer.vehicle.form-vehicle');
    }
}
```

## 10. VISTAS BLADE PRINCIPALES

### search-transfer-show.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Búsqueda de Traslados</h2>
        <p class="text-gray-600">Encuentra el traslado perfecto para tu viaje</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <form wire:submit.prevent="search">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <!-- Tipo de traslado -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Traslado*</label>
                    <select wire:model="transferType" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="airport">Aeropuerto</option>
                        <option value="hotel">Hotel</option>
                        <option value="city">Ciudad</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>

                <!-- Lugar de recogida -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lugar de Recogida*</label>
                    <input type="text" wire:model.debounce.300ms="searchPickup" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar lugar de recogida">
                    <div class="relative" x-data="{ open: @entangle('openPickup') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $location)
                                <button type="button" 
                                        wire:click="selectPickup('{{ $location['code'] }}', '{{ $location['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $location['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron lugares</div>
                            @endforelse
                        </div>
                    </div>
                    @error('pickupLocation') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <!-- Lugar de destino -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lugar de Destino*</label>
                    <input type="text" wire:model.debounce.300ms="searchDropoff" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar lugar de destino">
                    <div class="relative" x-data="{ open: @entangle('openDropoff') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $location)
                                <button type="button" 
                                        wire:click="selectDropoff('{{ $location['code'] }}', '{{ $location['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $location['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron lugares</div>
                            @endforelse
                        </div>
                    </div>
                    @error('dropoffLocation') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Fecha y hora -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Recogida*</label>
                    <input type="date" wire:model="pickupDate" 
                           min="{{ $tomorrow }}" max="{{ $maxDate }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('pickupDate') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Recogida*</label>
                    <input type="time" wire:model="pickupTime" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('pickupTime') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Pasajeros y equipaje -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pasajeros*</label>
                    <select wire:model="passengers" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @for($i = 1; $i <= 20; $i++)
                            <option value="{{ $i }}">{{ $i }} {{ $i == 1 ? 'Pasajero' : 'Pasajeros' }}</option>
                        @endfor
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Equipaje</label>
                    <select wire:model="luggage" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @for($i = 0; $i <= 10; $i++)
                            <option value="{{ $i }}">{{ $i }} {{ $i == 1 ? 'Maleta' : 'Maletas' }}</option>
                        @endfor
                    </select>
                </div>
            </div>

            <button type="submit" 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Buscar Traslados
            </button>
        </form>
    </div>
</div>
```

### transfer-show-response.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Traslados Disponibles</h2>
        <p class="text-gray-600">{{ count($transfers) }} opciones de traslado encontradas</p>
    </div>

    <div class="space-y-6">
        @foreach($transfers as $transfer)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Información del vehículo -->
                    <div class="md:w-1/3">
                        <img src="{{ $transfer['vehicle_image'] ?? '/images/vehicle-placeholder.jpg' }}" 
                             alt="{{ $transfer['vehicle_type'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                    
                    <!-- Información del traslado -->
                    <div class="md:w-2/3">
                        <h3 class="text-xl font-semibold mb-2">{{ $transfer['vehicle_type'] }}</h3>
                        <p class="text-gray-600 mb-2">{{ $transfer['provider_name'] }}</p>
                        
                        <!-- Detalles del traslado -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Capacidad</p>
                                <p class="font-semibold">{{ $transfer['capacity'] }} pasajeros</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Equipaje</p>
                                <p class="font-semibold">{{ $transfer['luggage_capacity'] }} maletas</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Duración</p>
                                <p class="font-semibold">{{ $transfer['duration'] }} minutos</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Categoría</p>
                                <p class="font-semibold">{{ $transfer['category'] }}</p>
                            </div>
                        </div>
                        
                        <!-- Características del vehículo -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($transfer['features'] as $feature)
                                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {{ $feature }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Precio y botones -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-2xl font-bold text-blue-600">
                                    ${{ number_format($transfer['price'], 0, ',', '.') }}
                                </span>
                                <span class="text-gray-500">por traslado</span>
                            </div>
                            
                            <div class="flex space-x-2">
                                <button wire:click="selectTransfer('{{ $transfer['id'] }}')"
                                        class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    Ver Detalles
                                </button>
                                <button wire:click="checkAvailability('{{ $transfer['id'] }}')"
                                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Verificar Disponibilidad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    @if(empty($transfers))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron traslados para los criterios seleccionados</div>
            <button wire:click="$emit('refresh')" 
                    class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </button>
        </div>
    @endif
</div>
```

## 11. FLUJO COMPLETO DE RESERVA DE TRASLADO

### 1. Búsqueda (SearchTransferShow)
- Usuario selecciona tipo de traslado
- Especifica lugares de recogida y destino
- Selecciona fecha, hora, pasajeros y equipaje
- Envía búsqueda a API Terrawind

### 2. Resultados (TransferShowResponse)
- Muestra opciones de traslado disponibles
- Permite ver detalles del vehículo
- Verifica disponibilidad específica

### 3. Selección de Vehículo (ShowVehicle)
- Muestra vehículos disponibles
- Permite seleccionar tipo de vehículo
- Calcula precios totales

### 4. Formulario de Reserva (FormVehicle)
- Captura datos del pasajero
- Confirma selección de vehículo
- Crea reserva en API Terrawind

### 5. Confirmación
- Muestra confirmación de reserva
- Genera número de confirmación
- Envía email de confirmación

## 12. VALIDACIONES PRINCIPALES

```php
protected $rules = [
    'transferType' => 'required|in:airport,hotel,city,custom',
    'pickupLocation' => 'required|string',
    'dropoffLocation' => 'required|string',
    'pickupDate' => 'required|date|after:today',
    'pickupTime' => 'required',
    'passengers' => 'required|integer|min:1|max:20',
    'luggage' => 'required|integer|min:0|max:10',
    'passengerInfo.name' => 'required|string|max:255',
    'passengerInfo.email' => 'required|email',
    'passengerInfo.phone' => 'required|string',
    'selectedVehicle' => 'required|string',
];
```

## 13. CACHE Y SESIONES

```php
// Almacenamiento de búsqueda
Cache::put('transferSearch', [
    'search' => $searchData,
    'results' => $result['data']
]);

// Almacenamiento de disponibilidad
Cache::put('transferAvailability', [
    'transfer' => $transferId,
    'search' => $this->search,
    'availability' => $this->availability
]);
```

Esta documentación completa del sistema de traslados te permitirá implementar toda la funcionalidad de búsqueda, selección y reserva de traslados con integración Terrawind.
