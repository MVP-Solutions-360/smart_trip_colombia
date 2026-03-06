# 🏨 DOCUMENTACIÓN COMPLETA - SISTEMA DE HOTELES

## 1. ARQUITECTURA GENERAL

**Integración GDS:** Restel  
**Frontend:** Livewire 2.10 + AdminLTE 3.8  
**Base de datos:** MySQL  
**Autenticación:** Laravel Sanctum + Jetstream  

## 2. CONFIGURACIÓN INICIAL

### Variables de entorno requeridas:
```env
APP_TRAVEL=https://tu-api-hotel.com
RESTEL_API_URL=https://api-restel.com
RESTEL_API_KEY=tu_api_key_restel
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

### Tabla principal: `hotel_reserves`
```sql
CREATE TABLE hotel_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_id BIGINT UNSIGNED NOT NULL,
    hotel_code VARCHAR(255) NOT NULL,
    hotel_name VARCHAR(255) NOT NULL,
    city_code VARCHAR(255) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rooms INT NOT NULL,
    adults INT NOT NULL,
    children INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    confirmation_number VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE
);
```

### Tabla: `hotel_distribution_reserves`
```sql
CREATE TABLE hotel_distribution_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_reserve_id BIGINT UNSIGNED NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    room_description TEXT NULL,
    room_rate DECIMAL(10,2) NOT NULL,
    room_occupancy INT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (hotel_reserve_id) REFERENCES hotel_reserves(id) ON DELETE CASCADE
);
```

### Tabla: `restel_reserves`
```sql
CREATE TABLE restel_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_id BIGINT UNSIGNED NOT NULL,
    restel_booking_id VARCHAR(255) NOT NULL,
    hotel_code VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE
);
```

## 4. MODELOS PRINCIPALES

### HotelReserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HotelReserve extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function hotel_distribution_reserves()
    {
        return $this->hasMany(HotelDistributionReserve::class);
    }
    
    public function restel_reserves()
    {
        return $this->hasMany(RestelReserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
}
```

### RestelReserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestelReserve extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
}
```

## 5. TRAIT DE RESTEL

### HotelTrait.php
```php
<?php

namespace App\Traits\Restel;

use Illuminate\Support\Facades\Http;

trait HotelTrait
{
    public function searchHotels($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/restel/hotels", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["hotels"]
        ];
    }
    
    public function getHotelInformation($hotelCode)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/restel/information", [
            'hotel' => $hotelCode
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["hotel"]
        ];
    }
    
    public function checkAvailability($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/restel/disponibility", $data)->json();
        
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
        $response = Http::post(env('APP_TRAVEL')."/api/restel/book", $data)->json();
        
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

## 6. ENDPOINTS DE API RESTEL

### Búsqueda de países
```
POST /api/restel/country
Body: {"code": "CO"}
Response: [{"code": "CO", "name": "Colombia"}]
```

### Búsqueda de ciudades
```
POST /api/restel/cities
Body: {"code": "BOG"}
Response: [{"code": "BOG", "name": "Bogotá", "country": "CO"}]
```

### Búsqueda de hoteles
```
POST /api/restel/hotels
Body: {
    "city": "BOG",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0
}
```

### Información del hotel
```
POST /api/restel/information
Body: {"hotel": "HOTEL001"}
```

### Verificar disponibilidad
```
POST /api/restel/disponibility
Body: {
    "hotel": "HOTEL001",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0
}
```

### Crear reserva
```
POST /api/restel/book
Body: {
    "hotel": "HOTEL001",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0,
    "guest_info": {
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "3001234567"
    }
}
```

## 7. RUTAS PRINCIPALES

### routes/web/gds.php
```php
<?php

use App\Http\Livewire\Hotel\SearchHotelShow;
use App\Http\Livewire\Hotel\HotelShowResponse;
use App\Http\Livewire\Hotel\Room\ShowRoom;
use App\Http\Livewire\Hotel\Room\FormRoom;
use App\Http\Livewire\Reserve\Gds\Restel\IndexRestelReserve;
use App\Http\Livewire\Reserve\Gds\Restel\ShowReserve;
use Illuminate\Support\Facades\Route;

// Búsqueda y reserva de hoteles
Route::get('hotel/reserve/', SearchHotelShow::class)->middleware('can:index')->name("hotel");
Route::get('hotel-show/reserve', HotelShowResponse::class)->middleware('can:index')->name("hotel-show");
Route::get('hotel-show/room/reserve', ShowRoom::class)->middleware('can:index')->name("hotel-room");
Route::get('hotel/reserve/reserve', FormRoom::class)->middleware('can:index')->name("hotel-reserve");

// Consulta de reservas Restel
Route::get('restel/{restel}', IndexRestelReserve::class)->middleware('can:index')->name("restel.index");
Route::get('restel-consult/{reserve}', ShowReserve::class)->middleware('can:index')->name("restel.consult");
```

## 8. CONTROLADORES DE API

### HotelController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HotelReserve;
use App\Models\HotelDistributionReserve;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function store(Request $request)
    {
        $hotel = HotelReserve::create([
            "reserve_id" => $request->reserve_id,
            "hotel_code" => $request->hotel_code,
            "hotel_name" => $request->hotel_name,
            "city_code" => $request->city_code,
            "check_in" => $request->check_in,
            "check_out" => $request->check_out,
            "rooms" => $request->rooms,
            "adults" => $request->adults,
            "children" => $request->children,
            "total_amount" => $request->total_amount,
            "currency" => $request->currency,
            "status" => $request->status,
            "confirmation_number" => $request->confirmation_number,
        ]);

        // Crear distribuciones de habitaciones
        foreach ($request->room_distributions as $distribution) {
            $hotel->hotel_distribution_reserves()->create([
                "room_type" => $distribution["room_type"],
                "room_description" => $distribution["room_description"],
                "room_rate" => $distribution["room_rate"],
                "room_occupancy" => $distribution["room_occupancy"],
            ]);
        }

        return $hotel;
    }
}
```

## 9. COMPONENTES LIVEWIRE PRINCIPALES

### SearchHotelShow.php - Búsqueda de hoteles
```php
<?php

namespace App\Http\Livewire\Hotel;

use Livewire\Component;
use App\Traits\Restel\HotelTrait;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SearchHotelShow extends Component
{
    use HotelTrait;
    
    public $searchCountry = '';
    public $searchCity = '';
    public $country = '';
    public $city = '';
    public $check_in = '';
    public $check_out = '';
    public $rooms = 1;
    public $adults = 2;
    public $children = 0;
    public $countries = [];
    public $cities = [];
    public $openCountry = false;
    public $openCity = false;
    public $field = [];

    protected $queryString = [
        'searchCountry', 'searchCity', 'country', 'city', 
        'check_in', 'check_out', 'rooms', 'adults', 'children'
    ];

    public function updatedSearchCountry()
    {
        $this->openCountry = true;
        $this->fetchCountries($this->searchCountry);
    }

    public function updatedSearchCity()
    {
        $this->openCity = true;
        $this->fetchCities($this->searchCity);
    }

    public function selectCountry($code, $name)
    {
        $this->searchCountry = $name;
        $this->country = $code;
        $this->openCountry = false;
    }

    public function selectCity($code, $name)
    {
        $this->searchCity = $name;
        $this->city = $code;
        $this->openCity = false;
    }

    private function fetchCountries($code)
    {
        if (strlen($code) >= 2) {
            $response = Http::post(env('APP_TRAVEL')."/api/restel/country", [
                'code' => $code
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    private function fetchCities($code)
    {
        if (strlen($code) >= 3) {
            $response = Http::post(env('APP_TRAVEL')."/api/restel/cities", [
                'code' => $code
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    protected $rules = [
        'country' => 'required',
        'city' => 'required',
        'check_in' => 'required|date|after:today',
        'check_out' => 'required|date|after:check_in',
        'rooms' => 'required|integer|min:1|max:9',
        'adults' => 'required|integer|min:1|max:20',
        'children' => 'required|integer|min:0|max:10',
    ];

    public function search()
    {
        $this->validate();

        $searchData = [
            'city' => $this->city,
            'check_in' => $this->check_in,
            'check_out' => $this->check_out,
            'rooms' => $this->rooms,
            'adults' => $this->adults,
            'children' => $this->children
        ];

        $result = $this->searchHotels($searchData);
        
        if ($result['success']) {
            Cache::put('hotelSearch', [
                'search' => $searchData,
                'results' => $result['data']
            ]);
            redirect()->route('hotel-show');
        } else {
            session()->flash('error', $result['message']);
        }
    }

    public function render()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $maxDate = now()->addYear()->format('Y-m-d');
        
        return view('livewire.hotel.search-hotel-show', compact('tomorrow', 'maxDate'));
    }
}
```

### HotelShowResponse.php - Mostrar resultados
```php
<?php

namespace App\Http\Livewire\Hotel;

use Livewire\Component;
use App\Traits\Restel\HotelTrait;
use Illuminate\Support\Facades\Cache;

class HotelShowResponse extends Component
{
    use HotelTrait;
    
    public $hotels = [];
    public $search = [];
    public $selectedHotel = null;
    public $hotelInfo = null;
    public $availability = null;

    public function mount()
    {
        $cache = Cache::get('hotelSearch');
        $this->search = $cache['search'];
        $this->hotels = $cache['results'];
    }

    public function selectHotel($hotelCode)
    {
        $this->selectedHotel = $hotelCode;
        $result = $this->getHotelInformation($hotelCode);
        
        if ($result['success']) {
            $this->hotelInfo = $result['data'];
        }
    }

    public function checkAvailability($hotelCode)
    {
        $availabilityData = array_merge($this->search, ['hotel' => $hotelCode]);
        $result = $this->checkAvailability($availabilityData);
        
        if ($result['success']) {
            $this->availability = $result['data'];
            Cache::put('hotelAvailability', [
                'hotel' => $hotelCode,
                'search' => $this->search,
                'availability' => $this->availability
            ]);
            redirect()->route('hotel-room');
        }
    }

    public function render()
    {
        return view('livewire.hotel.hotel-show-response');
    }
}
```

### FormRoom.php - Formulario de reserva
```php
<?php

namespace App\Http\Livewire\Hotel\Room;

use Livewire\Component;
use App\Models\HotelReserve;
use App\Models\RestelReserve;
use App\Traits\Restel\HotelTrait;
use Illuminate\Support\Facades\Cache;

class FormRoom extends Component
{
    use HotelTrait;
    
    public $hotel = null;
    public $search = [];
    public $availability = null;
    public $guestInfo = [
        'name' => '',
        'email' => '',
        'phone' => '',
        'special_requests' => ''
    ];
    public $roomSelection = [];
    public $totalAmount = 0;

    public function mount()
    {
        $cache = Cache::get('hotelAvailability');
        $this->hotel = $cache['hotel'];
        $this->search = $cache['search'];
        $this->availability = $cache['availability'];
        
        $this->calculateTotal();
    }

    public function updatedRoomSelection()
    {
        $this->calculateTotal();
    }

    private function calculateTotal()
    {
        $this->totalAmount = 0;
        foreach ($this->roomSelection as $room) {
            $this->totalAmount += $room['rate'] * $room['nights'];
        }
    }

    protected $rules = [
        'guestInfo.name' => 'required|string|max:255',
        'guestInfo.email' => 'required|email',
        'guestInfo.phone' => 'required|string',
        'roomSelection' => 'required|array|min:1',
    ];

    public function createBooking()
    {
        $this->validate();

        $bookingData = [
            'hotel' => $this->hotel,
            'check_in' => $this->search['check_in'],
            'check_out' => $this->search['check_out'],
            'rooms' => $this->search['rooms'],
            'adults' => $this->search['adults'],
            'children' => $this->search['children'],
            'guest_info' => $this->guestInfo,
            'room_selection' => $this->roomSelection
        ];

        $result = $this->createBooking($bookingData);
        
        if ($result['success']) {
            // Crear reserva en base de datos
            $hotelReserve = HotelReserve::create([
                'reserve_id' => 1, // ID de reserva principal
                'hotel_code' => $this->hotel,
                'hotel_name' => $this->availability['hotel_name'],
                'city_code' => $this->search['city'],
                'check_in' => $this->search['check_in'],
                'check_out' => $this->search['check_out'],
                'rooms' => $this->search['rooms'],
                'adults' => $this->search['adults'],
                'children' => $this->search['children'],
                'total_amount' => $this->totalAmount,
                'status' => 'confirmed',
                'confirmation_number' => $result['data']['confirmation_number']
            ]);

            RestelReserve::create([
                'reserve_id' => 1,
                'restel_booking_id' => $result['data']['booking_id'],
                'hotel_code' => $this->hotel,
                'status' => 'confirmed'
            ]);

            session()->flash('success', 'Reserva de hotel creada exitosamente');
            redirect()->route('hotel-confirmation', $hotelReserve->id);
        } else {
            session()->flash('error', $result['message']);
        }
    }

    public function render()
    {
        return view('livewire.hotel.room.form-room');
    }
}
```

## 10. VISTAS BLADE PRINCIPALES

### search-hotel-show.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Búsqueda de Hoteles</h2>
        <p class="text-gray-600">Encuentra el hotel perfecto para tu viaje</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <form wire:submit.prevent="search">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <!-- País -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">País*</label>
                    <input type="text" wire:model.debounce.300ms="searchCountry" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar país">
                    <div class="relative" x-data="{ open: @entangle('openCountry') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $country)
                                <button type="button" 
                                        wire:click="selectCountry('{{ $country['code'] }}', '{{ $country['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $country['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron países</div>
                            @endforelse
                        </div>
                    </div>
                    @error('country') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <!-- Ciudad -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad*</label>
                    <input type="text" wire:model.debounce.300ms="searchCity" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar ciudad">
                    <div class="relative" x-data="{ open: @entangle('openCity') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $city)
                                <button type="button" 
                                        wire:click="selectCity('{{ $city['code'] }}', '{{ $city['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $city['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron ciudades</div>
                            @endforelse
                        </div>
                    </div>
                    @error('city') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <!-- Fechas -->
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Check-in*</label>
                        <input type="date" wire:model="check_in" 
                               min="{{ $tomorrow }}" max="{{ $maxDate }}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @error('check_in') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Check-out*</label>
                        <input type="date" wire:model="check_out" 
                               min="{{ $check_in ?: $tomorrow }}" max="{{ $maxDate }}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @error('check_out') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                    </div>
                </div>
            </div>

            <!-- Huéspedes -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Habitaciones*</label>
                    <select wire:model="rooms" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @for($i = 1; $i <= 9; $i++)
                            <option value="{{ $i }}">{{ $i }} {{ $i == 1 ? 'Habitación' : 'Habitaciones' }}</option>
                        @endfor
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adultos*</label>
                    <select wire:model="adults" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @for($i = 1; $i <= 20; $i++)
                            <option value="{{ $i }}">{{ $i }} {{ $i == 1 ? 'Adulto' : 'Adultos' }}</option>
                        @endfor
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Niños</label>
                    <select wire:model="children" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @for($i = 0; $i <= 10; $i++)
                            <option value="{{ $i }}">{{ $i }} {{ $i == 1 ? 'Niño' : 'Niños' }}</option>
                        @endfor
                    </select>
                </div>
            </div>

            <button type="submit" 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Buscar Hoteles
            </button>
        </form>
    </div>
</div>
```

### hotel-show-response.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Hoteles Disponibles</h2>
        <p class="text-gray-600">{{ count($hotels) }} hoteles encontrados</p>
    </div>

    <div class="space-y-6">
        @foreach($hotels as $hotel)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Imagen del hotel -->
                    <div class="md:w-1/3">
                        <img src="{{ $hotel['image'] ?? '/images/hotel-placeholder.jpg' }}" 
                             alt="{{ $hotel['name'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                    
                    <!-- Información del hotel -->
                    <div class="md:w-2/3">
                        <h3 class="text-xl font-semibold mb-2">{{ $hotel['name'] }}</h3>
                        <p class="text-gray-600 mb-2">{{ $hotel['address'] }}</p>
                        <p class="text-sm text-gray-500 mb-4">{{ $hotel['description'] }}</p>
                        
                        <!-- Amenidades -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($hotel['amenities'] as $amenity)
                                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {{ $amenity }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Precio -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-2xl font-bold text-blue-600">
                                    ${{ number_format($hotel['price'], 0, ',', '.') }}
                                </span>
                                <span class="text-gray-500">por noche</span>
                            </div>
                            
                            <div class="flex space-x-2">
                                <button wire:click="selectHotel('{{ $hotel['code'] }}')"
                                        class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    Ver Detalles
                                </button>
                                <button wire:click="checkAvailability('{{ $hotel['code'] }}')"
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

    @if(empty($hotels))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron hoteles para los criterios seleccionados</div>
            <button wire:click="$emit('refresh')" 
                    class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </button>
        </div>
    @endif
</div>
```

## 11. FLUJO COMPLETO DE RESERVA DE HOTEL

### 1. Búsqueda (SearchHotelShow)
- Usuario selecciona país/ciudad con autocompletado
- Selecciona fechas de check-in/check-out
- Especifica número de habitaciones y huéspedes
- Envía búsqueda a API Restel

### 2. Resultados (HotelShowResponse)
- Muestra hoteles disponibles con precios
- Permite ver detalles del hotel
- Verifica disponibilidad específica

### 3. Selección de Habitaciones (ShowRoom)
- Muestra tipos de habitaciones disponibles
- Permite seleccionar habitaciones específicas
- Calcula precios totales

### 4. Formulario de Reserva (FormRoom)
- Captura datos del huésped
- Confirma selección de habitaciones
- Crea reserva en API Restel

### 5. Confirmación
- Muestra confirmación de reserva
- Genera número de confirmación
- Envía email de confirmación

## 12. VALIDACIONES PRINCIPALES

```php
protected $rules = [
    'country' => 'required|string',
    'city' => 'required|string',
    'check_in' => 'required|date|after:today',
    'check_out' => 'required|date|after:check_in',
    'rooms' => 'required|integer|min:1|max:9',
    'adults' => 'required|integer|min:1|max:20',
    'children' => 'required|integer|min:0|max:10',
    'guestInfo.name' => 'required|string|max:255',
    'guestInfo.email' => 'required|email',
    'guestInfo.phone' => 'required|string',
    'roomSelection' => 'required|array|min:1',
];
```

## 13. CACHE Y SESIONES

```php
// Almacenamiento de búsqueda
Cache::put('hotelSearch', [
    'search' => $searchData,
    'results' => $result['data']
]);

// Almacenamiento de disponibilidad
Cache::put('hotelAvailability', [
    'hotel' => $hotelCode,
    'search' => $this->search,
    'availability' => $this->availability
]);
```

Esta documentación completa del sistema de hoteles te permitirá implementar toda la funcionalidad de búsqueda, reserva y gestión de hoteles con integración Restel.
