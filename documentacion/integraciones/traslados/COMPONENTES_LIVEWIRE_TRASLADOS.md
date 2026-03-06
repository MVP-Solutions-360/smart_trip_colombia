# 🚗 COMPONENTES LIVEWIRE DETALLADOS - SISTEMA DE TRASLADOS

## 1. SearchTransferShow.php - Búsqueda de Traslados

### Propiedades principales:
```php
public $transferType = 'airport';     // Tipo de traslado
public $pickupLocation = '';          // Lugar de recogida
public $dropoffLocation = '';         // Lugar de destino
public $pickupDate = '';              // Fecha de recogida
public $pickupTime = '';              // Hora de recogida
public $passengers = 1;               // Número de pasajeros
public $luggage = 0;                  // Número de maletas
public $searchPickup = '';            // Búsqueda de recogida
public $searchDropoff = '';           // Búsqueda de destino
public $openPickup = false;           // Estado del dropdown recogida
public $openDropoff = false;          // Estado del dropdown destino
public $field = [];                   // Resultados de búsqueda
```

### Métodos principales:

#### updatedSearchPickup() / updatedSearchDropoff()
```php
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
```

#### selectPickup() / selectDropoff()
```php
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
```

#### fetchLocations()
```php
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
```

#### search() - Realizar búsqueda
```php
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
```

### Validaciones:
```php
protected $rules = [
    'transferType' => 'required|in:airport,hotel,city,custom',
    'pickupLocation' => 'required|string',
    'dropoffLocation' => 'required|string',
    'pickupDate' => 'required|date|after:today',
    'pickupTime' => 'required',
    'passengers' => 'required|integer|min:1|max:20',
    'luggage' => 'required|integer|min:0|max:10',
];
```

## 2. TransferShowResponse.php - Mostrar Resultados

### Propiedades principales:
```php
public $transfers = [];               // Lista de traslados
public $search = [];                  // Criterios de búsqueda
public $selectedTransfer = null;      // Traslado seleccionado
public $transferDetails = null;       // Detalles del traslado
public $availability = null;          // Disponibilidad del traslado
```

### Métodos principales:

#### mount() - Cargar datos de búsqueda
```php
public function mount()
{
    $cache = Cache::get('transferSearch');
    $this->search = $cache['search'];
    $this->transfers = $cache['results'];
}
```

#### selectTransfer() - Seleccionar traslado
```php
public function selectTransfer($transferId)
{
    $this->selectedTransfer = $transferId;
    $result = $this->getTransferDetails($transferId);
    
    if ($result['success']) {
        $this->transferDetails = $result['data'];
    }
}
```

#### checkAvailability() - Verificar disponibilidad
```php
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
```

## 3. ShowVehicle.php - Selección de Vehículos

### Propiedades principales:
```php
public $transfer = null;              // ID del traslado
public $search = [];                  // Criterios de búsqueda
public $availability = null;          // Disponibilidad
public $vehicles = [];                // Vehículos disponibles
public $selectedVehicle = null;       // Vehículo seleccionado
public $totalAmount = 0;              // Monto total
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('transferAvailability');
    $this->transfer = $cache['transfer'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->loadVehicles();
}
```

#### loadVehicles() - Cargar vehículos
```php
private function loadVehicles()
{
    $this->vehicles = $this->availability['vehicles'] ?? [];
}
```

#### selectVehicle() - Seleccionar vehículo
```php
public function selectVehicle($vehicleId)
{
    $this->selectedVehicle = $vehicleId;
    $this->calculateTotal();
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    if ($this->selectedVehicle && $this->vehicles) {
        $vehicle = collect($this->vehicles)->firstWhere('id', $this->selectedVehicle);
        if ($vehicle) {
            $this->totalAmount = $vehicle['price'];
        }
    }
}
```

## 4. FormVehicle.php - Formulario de Reserva

### Propiedades principales:
```php
public $transfer = null;              // ID del traslado
public $search = [];                  // Criterios de búsqueda
public $availability = null;          // Disponibilidad
public $passengerInfo = [             // Información del pasajero
    'name' => '',
    'email' => '',
    'phone' => '',
    'special_requests' => ''
];
public $selectedVehicle = null;       // Vehículo seleccionado
public $totalAmount = 0;              // Monto total
public $successMessage = '';          // Mensaje de éxito
public $errorMessage = '';            // Mensaje de error
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('transferAvailability');
    $this->transfer = $cache['transfer'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->calculateTotal();
}
```

#### selectVehicle() - Seleccionar vehículo
```php
public function selectVehicle($vehicleId)
{
    $this->selectedVehicle = $vehicleId;
    $this->calculateTotal();
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    if ($this->selectedVehicle && $this->availability) {
        $vehicle = collect($this->availability['vehicles'])->firstWhere('id', $this->selectedVehicle);
        if ($vehicle) {
            $this->totalAmount = $vehicle['price'];
        }
    }
}
```

#### createBooking() - Crear reserva
```php
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

        $this->successMessage = 'Reserva de traslado creada exitosamente';
        redirect()->route('transfer-confirmation', $transferReserve->id);
    } else {
        $this->errorMessage = $result['message'];
    }
}
```

### Validaciones:
```php
protected $rules = [
    'passengerInfo.name' => 'required|string|max:255',
    'passengerInfo.email' => 'required|email',
    'passengerInfo.phone' => 'required|string',
    'selectedVehicle' => 'required|string',
];
```

## 5. IndexTerrawindReserve.php - Consulta de Reservas

### Propiedades principales:
```php
public $terrawind;                    // Datos de reserva Terrawind
public $reserve;                      // Reserva principal
public $transferDetails = null;       // Detalles del traslado
```

### Métodos principales:

#### mount() - Cargar datos de reserva
```php
public function mount($terrawind)
{
    $this->terrawind = Http::post(env('APP_TRAVEL')."/api/reserve/terrawind", [
        'id' => $terrawind,
    ])->json();
    
    if ($this->terrawind) {
        $this->loadTransferDetails();
    }
}
```

#### loadTransferDetails() - Cargar detalles del traslado
```php
private function loadTransferDetails()
{
    $result = $this->getTransferDetails($this->terrawind['transfer_id']);
    
    if ($result['success']) {
        $this->transferDetails = $result['data'];
    }
}
```

## 6. ShowReserve.php - Mostrar Reservas

### Propiedades principales:
```php
public $reserves = [];                // Lista de reservas
public $office;                       // Oficina del usuario
public $admin;                        // Administrador
public $user;                         // Usuario actual
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
    
    $this->reserves = $this->dataTerrawind($role);
}
```

#### dataTerrawind() - Obtener datos según rol
```php
public function dataTerrawind($role)
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
    
    return Http::get(env('APP_TRAVEL')."/api/data/terrawind", $user)->json();
}
```

## 7. VISTAS BLADE PRINCIPALES

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

### form-vehicle.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Completar Reserva de Traslado</h2>
        <p class="text-gray-600">Confirme los detalles de su traslado</p>
    </div>

    <!-- Información del traslado -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Traslado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Desde</p>
                <p class="font-semibold">{{ $search['pickup_location'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Hasta</p>
                <p class="font-semibold">{{ $search['dropoff_location'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Fecha</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['pickup_date'])->format('d/m/Y') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Hora</p>
                <p class="font-semibold">{{ $search['pickup_time'] }}</p>
            </div>
        </div>
    </div>

    <!-- Selección de vehículo -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Seleccionar Vehículo</h3>
        <div class="space-y-4">
            @foreach($availability['vehicles'] as $vehicle)
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                    {{ $selectedVehicle == $vehicle['id'] ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <input type="radio" wire:model="selectedVehicle" value="{{ $vehicle['id'] }}" class="mr-4">
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium">{{ $vehicle['type'] }}</h4>
                                <p class="text-sm text-gray-600">{{ $vehicle['description'] }}</p>
                                <div class="flex space-x-4 mt-2">
                                    <span class="text-sm text-gray-500">Capacidad: {{ $vehicle['capacity'] }} pasajeros</span>
                                    <span class="text-sm text-gray-500">Equipaje: {{ $vehicle['luggage_capacity'] }} maletas</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-xl font-bold text-blue-600">
                                    ${{ number_format($vehicle['price'], 0, ',', '.') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </label>
            @endforeach
        </div>
    </div>

    <!-- Información del pasajero -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Pasajero</h3>
        <form wire:submit.prevent="createBooking">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo*</label>
                    <input type="text" wire:model="passengerInfo.name" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('passengerInfo.name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input type="email" wire:model="passengerInfo.email" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('passengerInfo.email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
                    <input type="tel" wire:model="passengerInfo.phone" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('passengerInfo.phone') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Solicitudes Especiales</label>
                    <input type="text" wire:model="passengerInfo.special_requests" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Opcional">
                </div>
            </div>

            <!-- Resumen de precios -->
            <div class="border-t pt-4">
                <h4 class="font-medium text-gray-700 mb-2">Resumen de Precios</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Traslado seleccionado</span>
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
// En SearchTransferShow
$this->emit('transferSearch', $searchData);

// En TransferShowResponse
$this->emit('transferSelected', $transferId);

// Listeners en FormVehicle
protected $listeners = ["vehicleSelected", "passengerInfoUpdated"];
```

## 9. QUERY STRINGS PARA PERSISTENCIA

```php
// En SearchTransferShow
protected $queryString = [
    'transferType', 'pickupLocation', 'dropoffLocation', 
    'pickupDate', 'pickupTime', 'passengers', 'luggage'
];

// En TransferShowResponse
protected $queryString = [
    'selectedTransfer', 'transferDetails'
];
```

Esta documentación detallada de los componentes Livewire para traslados te permitirá implementar toda la funcionalidad de búsqueda, selección y reserva de traslados con integración Terrawind.
