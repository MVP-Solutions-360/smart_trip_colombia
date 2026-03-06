# 🏨 COMPONENTES LIVEWIRE DETALLADOS - SISTEMA DE HOTELES

## 1. SearchHotelShow.php - Búsqueda de Hoteles

### Propiedades principales:
```php
public $searchCountry = '';        // Búsqueda de país
public $searchCity = '';           // Búsqueda de ciudad
public $country = '';              // Código de país seleccionado
public $city = '';                 // Código de ciudad seleccionado
public $check_in = '';             // Fecha de check-in
public $check_out = '';            // Fecha de check-out
public $rooms = 1;                 // Número de habitaciones
public $adults = 2;                // Número de adultos
public $children = 0;              // Número de niños
public $countries = [];            // Países encontrados
public $cities = [];               // Ciudades encontradas
public $openCountry = false;       // Estado del dropdown país
public $openCity = false;          // Estado del dropdown ciudad
public $field = [];                // Resultados de búsqueda
```

### Métodos principales:

#### updatedSearchCountry()
```php
public function updatedSearchCountry()
{
    $this->openCountry = true;
    $this->fetchCountries($this->searchCountry);
}
```

#### updatedSearchCity()
```php
public function updatedSearchCity()
{
    $this->openCity = true;
    $this->fetchCities($this->searchCity);
}
```

#### selectCountry() / selectCity()
```php
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
```

#### fetchCountries() / fetchCities()
```php
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
```

#### search() - Realizar búsqueda
```php
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
```

### Validaciones:
```php
protected $rules = [
    'country' => 'required',
    'city' => 'required',
    'check_in' => 'required|date|after:today',
    'check_out' => 'required|date|after:check_in',
    'rooms' => 'required|integer|min:1|max:9',
    'adults' => 'required|integer|min:1|max:20',
    'children' => 'required|integer|min:0|max:10',
];
```

## 2. HotelShowResponse.php - Mostrar Resultados

### Propiedades principales:
```php
public $hotels = [];               // Lista de hoteles
public $search = [];               // Criterios de búsqueda
public $selectedHotel = null;      // Hotel seleccionado
public $hotelInfo = null;          // Información detallada del hotel
public $availability = null;       // Disponibilidad del hotel
```

### Métodos principales:

#### mount() - Cargar datos de búsqueda
```php
public function mount()
{
    $cache = Cache::get('hotelSearch');
    $this->search = $cache['search'];
    $this->hotels = $cache['results'];
}
```

#### selectHotel() - Seleccionar hotel
```php
public function selectHotel($hotelCode)
{
    $this->selectedHotel = $hotelCode;
    $result = $this->getHotelInformation($hotelCode);
    
    if ($result['success']) {
        $this->hotelInfo = $result['data'];
    }
}
```

#### checkAvailability() - Verificar disponibilidad
```php
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
```

## 3. ShowRoom.php - Selección de Habitaciones

### Propiedades principales:
```php
public $hotel = null;              // Código del hotel
public $search = [];               // Criterios de búsqueda
public $availability = null;       // Disponibilidad
public $roomTypes = [];            // Tipos de habitaciones
public $selectedRooms = [];        // Habitaciones seleccionadas
public $totalAmount = 0;           // Monto total
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('hotelAvailability');
    $this->hotel = $cache['hotel'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->loadRoomTypes();
}
```

#### loadRoomTypes() - Cargar tipos de habitaciones
```php
private function loadRoomTypes()
{
    $this->roomTypes = $this->availability['room_types'] ?? [];
}
```

#### selectRoom() - Seleccionar habitación
```php
public function selectRoom($roomType, $rate)
{
    $this->selectedRooms[] = [
        'type' => $roomType,
        'rate' => $rate,
        'nights' => $this->calculateNights()
    ];
    
    $this->calculateTotal();
}
```

#### calculateNights() - Calcular noches
```php
private function calculateNights()
{
    $checkIn = \Carbon\Carbon::parse($this->search['check_in']);
    $checkOut = \Carbon\Carbon::parse($this->search['check_out']);
    return $checkIn->diffInDays($checkOut);
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    $this->totalAmount = 0;
    foreach ($this->selectedRooms as $room) {
        $this->totalAmount += $room['rate'] * $room['nights'];
    }
}
```

## 4. FormRoom.php - Formulario de Reserva

### Propiedades principales:
```php
public $hotel = null;              // Código del hotel
public $search = [];               // Criterios de búsqueda
public $availability = null;       // Disponibilidad
public $guestInfo = [              // Información del huésped
    'name' => '',
    'email' => '',
    'phone' => '',
    'special_requests' => ''
];
public $roomSelection = [];        // Selección de habitaciones
public $totalAmount = 0;           // Monto total
public $paymentMethod = 'card';    // Método de pago
public $successMessage = '';       // Mensaje de éxito
public $errorMessage = '';         // Mensaje de error
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('hotelAvailability');
    $this->hotel = $cache['hotel'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->calculateTotal();
}
```

#### updatedRoomSelection() - Actualizar selección
```php
public function updatedRoomSelection()
{
    $this->calculateTotal();
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    $this->totalAmount = 0;
    foreach ($this->roomSelection as $room) {
        $this->totalAmount += $room['rate'] * $room['nights'];
    }
}
```

#### createBooking() - Crear reserva
```php
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

        $this->successMessage = 'Reserva de hotel creada exitosamente';
        redirect()->route('hotel-confirmation', $hotelReserve->id);
    } else {
        $this->errorMessage = $result['message'];
    }
}
```

### Validaciones:
```php
protected $rules = [
    'guestInfo.name' => 'required|string|max:255',
    'guestInfo.email' => 'required|email',
    'guestInfo.phone' => 'required|string',
    'roomSelection' => 'required|array|min:1',
];
```

## 5. IndexRestelReserve.php - Consulta de Reservas

### Propiedades principales:
```php
public $restel;                    // Datos de reserva Restel
public $reserve;                   // Reserva principal
public $hotelInfo = null;          // Información del hotel
```

### Métodos principales:

#### mount() - Cargar datos de reserva
```php
public function mount($restel)
{
    $this->restel = Http::post(env('APP_TRAVEL')."/api/reserve/restel", [
        'id' => $restel,
    ])->json();
    
    if ($this->restel) {
        $this->loadHotelInfo();
    }
}
```

#### loadHotelInfo() - Cargar información del hotel
```php
private function loadHotelInfo()
{
    $result = $this->getHotelInformation($this->restel['hotel_code']);
    
    if ($result['success']) {
        $this->hotelInfo = $result['data'];
    }
}
```

## 6. ShowReserve.php - Mostrar Reservas

### Propiedades principales:
```php
public $reserves = [];             // Lista de reservas
public $office;                    // Oficina del usuario
public $admin;                     // Administrador
public $user;                      // Usuario actual
```

### Métodos principales:

#### mount() - Cargar reservas
```php
public function mount()
{
    $this->user = User::find(auth()->id());
    $roles = $this->user->getRoleNames()->toArray();
    $this->office = $this->user->offices()->where("state", "Activo")->first();
    $this->admin = $this->office->admin;

    $rolesPrioritarios = ['super admin', 'admin', "supervisor", 'adviser'];

    $role = null;
    foreach ($rolesPrioritarios as $rol) {
        if (in_array($rol, $roles)) {
            $role = $rol;
            break;
        }
    }
    
    $this->reserves = $this->dataRestel($role);
}
```

#### dataRestel() - Obtener datos según rol
```php
public function dataRestel($role)
{
    if ($role == "super admin") {
        $user = ["user" => "", "office" => "", "admin" => ""];
    } elseif ($role == "admin") {
        $user["admin"] = $this->admin->id;
    } elseif ($role == "supervisor") {
        $user["office"] = $this->office->id;
    } elseif ($role == "adviser") {
        $user["user"] = $this->user->id;
    }
    
    return Http::get(env('APP_TRAVEL')."/api/data/restel", $user)->json();
}
```

## 7. VISTAS BLADE PRINCIPALES

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

### form-room.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Completar Reserva</h2>
        <p class="text-gray-600">Confirme los detalles de su reserva</p>
    </div>

    <!-- Información del hotel -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Hotel</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Hotel</p>
                <p class="font-semibold">{{ $availability['hotel_name'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Ubicación</p>
                <p class="font-semibold">{{ $availability['city'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Check-in</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['check_in'])->format('d/m/Y') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Check-out</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['check_out'])->format('d/m/Y') }}</p>
            </div>
        </div>
    </div>

    <!-- Información del huésped -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Huésped</h3>
        <form wire:submit.prevent="createBooking">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo*</label>
                    <input type="text" wire:model="guestInfo.name" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('guestInfo.name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input type="email" wire:model="guestInfo.email" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('guestInfo.email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
                    <input type="tel" wire:model="guestInfo.phone" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('guestInfo.phone') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Solicitudes Especiales</label>
                    <input type="text" wire:model="guestInfo.special_requests" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Opcional">
                </div>
            </div>

            <!-- Resumen de precios -->
            <div class="border-t pt-4">
                <h4 class="font-medium text-gray-700 mb-2">Resumen de Precios</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Habitaciones seleccionadas</span>
                        <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                    </div>
                    <div class="border-t pt-2">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <button type="submit" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                    Confirmar Reserva
                </button>
            </div>
        </form>
    </div>

    @if($successMessage)
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ $successMessage }}
        </div>
    @endif

    @if($errorMessage)
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ $errorMessage }}
        </div>
    @endif
</div>
```

## 8. EVENTOS Y LISTENERS

### Eventos principales:
```php
// En SearchHotelShow
$this->emit('hotelSearch', $searchData);

// En HotelShowResponse
$this->emit('hotelSelected', $hotelCode);

// Listeners en FormRoom
protected $listeners = ["roomSelected", "guestInfoUpdated"];
```

## 9. QUERY STRINGS PARA PERSISTENCIA

```php
// En SearchHotelShow
protected $queryString = [
    'searchCountry', 'searchCity', 'country', 'city', 
    'check_in', 'check_out', 'rooms', 'adults', 'children'
];

// En HotelShowResponse
protected $queryString = [
    'selectedHotel', 'hotelInfo'
];
```

Esta documentación detallada de los componentes Livewire para hoteles te permitirá implementar toda la funcionalidad de búsqueda, selección y reserva de hoteles con integración Restel.
