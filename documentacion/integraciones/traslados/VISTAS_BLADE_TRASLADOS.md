# 🎨 VISTAS BLADE COMPLETAS - SISTEMA DE TRASLADOS

## 1. BÚSQUEDA DE TRASLADOS

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

## 2. RESULTADOS DE TRASLADOS

### transfer-show-response.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Traslados Disponibles</h2>
        <p class="text-gray-600">{{ count($transfers) }} opciones de traslado encontradas</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Categoría</label>
                <select wire:model="categoryFilter" class="border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Todas las categorías</option>
                    <option value="Económico">Económico</option>
                    <option value="Lujo">Lujo</option>
                    <option value="Premium">Premium</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Precio</label>
                <select wire:model="priceFilter" class="border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Todos los precios</option>
                    <option value="0-50000">Hasta $50,000</option>
                    <option value="50000-100000">$50,000 - $100,000</option>
                    <option value="100000-200000">$100,000 - $200,000</option>
                    <option value="200000+">Más de $200,000</option>
                </select>
            </div>
        </div>
    </div>

    <div class="space-y-6">
        @foreach($transfers as $transfer)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Imagen del vehículo -->
                    <div class="md:w-1/3">
                        <img src="{{ $transfer['vehicle_image'] ?? '/images/vehicle-placeholder.jpg' }}" 
                             alt="{{ $transfer['vehicle_type'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                    
                    <!-- Información del traslado -->
                    <div class="md:w-2/3">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-semibold">{{ $transfer['vehicle_type'] }}</h3>
                            <div class="flex items-center space-x-2">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                    <span class="text-sm text-gray-600 ml-1">{{ $transfer['rating'] }}</span>
                                </div>
                                <span class="text-sm text-gray-500">({{ $transfer['reviews_count'] }} reseñas)</span>
                            </div>
                        </div>
                        
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

## 3. SELECCIÓN DE VEHÍCULOS

### show-vehicle.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Seleccionar Vehículo</h2>
        <p class="text-gray-600">Elija el vehículo para su traslado</p>
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

    <!-- Vehículos disponibles -->
    <div class="space-y-4">
        @foreach($vehicles as $vehicle)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Imagen del vehículo -->
                    <div class="md:w-1/3">
                        <img src="{{ $vehicle['image'] ?? '/images/vehicle-placeholder.jpg' }}" 
                             alt="{{ $vehicle['type'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                    
                    <!-- Información del vehículo -->
                    <div class="md:w-2/3">
                        <h4 class="text-lg font-semibold mb-2">{{ $vehicle['type'] }}</h4>
                        <p class="text-gray-600 mb-2">{{ $vehicle['description'] }}</p>
                        
                        <!-- Detalles del vehículo -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Capacidad</p>
                                <p class="font-semibold">{{ $vehicle['capacity'] }} pasajeros</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Equipaje</p>
                                <p class="font-semibold">{{ $vehicle['luggage_capacity'] }} maletas</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Marca</p>
                                <p class="font-semibold">{{ $vehicle['brand'] }} {{ $vehicle['model'] }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Año</p>
                                <p class="font-semibold">{{ $vehicle['year'] }}</p>
                            </div>
                        </div>
                        
                        <!-- Características -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($vehicle['features'] as $feature)
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {{ $feature }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Precio y selección -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-2xl font-bold text-blue-600">
                                    ${{ number_format($vehicle['price'], 0, ',', '.') }}
                                </span>
                                <span class="text-gray-500">por traslado</span>
                            </div>
                            
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                    <label class="text-sm font-medium">Cantidad:</label>
                                    <select wire:model="vehicleSelection.{{ $vehicle['id'] }}.quantity" 
                                            class="px-3 py-1 border border-gray-300 rounded-md">
                                        @for($i = 0; $i <= $vehicle['available_units']; $i++)
                                            <option value="{{ $i }}">{{ $i }}</option>
                                        @endfor
                                    </select>
                                </div>
                                
                                <button wire:click="selectVehicle('{{ $vehicle['id'] }}')"
                                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Seleccionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Resumen de selección -->
    @if(count($selectedVehicles) > 0)
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 class="text-lg font-semibold mb-4">Resumen de Selección</h3>
            <div class="space-y-2">
                @foreach($selectedVehicles as $vehicle)
                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                            <span class="font-medium">{{ $vehicle['type'] }}</span>
                            <span class="text-sm text-gray-500 ml-2">x{{ $vehicle['quantity'] }}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-semibold">${{ number_format($vehicle['price'] * $vehicle['quantity'], 0, ',', '.') }}</span>
                        </div>
                    </div>
                @endforeach
                <div class="border-t pt-2">
                    <div class="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <button wire:click="proceedToBooking" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                    Continuar con la Reserva
                </button>
            </div>
        </div>
    @endif
</div>
```

## 4. FORMULARIO DE RESERVA

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

## 5. CONFIRMACIÓN DE RESERVA

### transfer-confirmation.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-green-600">¡Traslado Confirmado!</h2>
        <p class="text-gray-600">Su traslado ha sido reservado exitosamente</p>
    </div>

    <!-- Información de la reserva -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold">Número de Confirmación</h3>
                <p class="text-2xl font-bold text-blue-600">{{ $confirmationNumber }}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Fecha de reserva</p>
                <p class="font-medium">{{ now()->format('d/m/Y H:i') }}</p>
            </div>
        </div>
    </div>

    <!-- Detalles del traslado -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Detalles del Traslado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Desde</p>
                <p class="font-semibold">{{ $pickupLocation }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Hasta</p>
                <p class="font-semibold">{{ $dropoffLocation }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Fecha y Hora</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($pickupDate)->format('d/m/Y') }} {{ $pickupTime }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Vehículo</p>
                <p class="font-semibold">{{ $vehicleType }} - {{ $vehicleCategory }}</p>
            </div>
        </div>
    </div>

    <!-- Información del conductor -->
    @if($driverInfo)
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">Información del Conductor</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Nombre</p>
                    <p class="font-semibold">{{ $driverInfo['name'] }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Teléfono</p>
                    <p class="font-semibold">{{ $driverInfo['phone'] }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Vehículo</p>
                    <p class="font-semibold">{{ $driverInfo['vehicle_plate'] }} - {{ $driverInfo['vehicle_color'] }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Modelo</p>
                    <p class="font-semibold">{{ $driverInfo['vehicle_model'] }}</p>
                </div>
            </div>
        </div>
    @endif

    <!-- Información del pasajero -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Pasajero</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Nombre</p>
                <p class="font-semibold">{{ $passengerName }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-semibold">{{ $passengerEmail }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Teléfono</p>
                <p class="font-semibold">{{ $passengerPhone }}</p>
            </div>
            @if($specialRequests)
                <div>
                    <p class="text-sm text-gray-500">Solicitudes Especiales</p>
                    <p class="font-semibold">{{ $specialRequests }}</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Resumen de precios -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Resumen de Precios</h3>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>Traslado</span>
                <span>${{ number_format($subtotal, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between">
                <span>Tarifa aeropuerto</span>
                <span>${{ number_format($airportFee, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between">
                <span>Peajes</span>
                <span>${{ number_format($tollFee, 0, ',', '.') }}</span>
            </div>
            <div class="border-t pt-2">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Información de seguimiento -->
    <div class="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold mb-2">Seguimiento del Traslado</h3>
        <p class="text-sm text-blue-700 mb-4">
            Puede seguir el estado de su traslado en tiempo real usando el enlace de seguimiento.
        </p>
        <a href="{{ $trackingUrl }}" 
           class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Ver Seguimiento
        </a>
    </div>

    <!-- Botones de acción -->
    <div class="flex space-x-4">
        <button onclick="window.print()" 
                class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium">
            Imprimir Reserva
        </button>
        <a href="{{ route('transfer') }}" 
           class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
            Nueva Búsqueda
        </a>
    </div>
</div>
```

## 6. CONSULTA DE RESERVAS

### terrawind-reserve-index.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Reservas de Traslados</h2>
        <p class="text-gray-600">Gestiona tus reservas de traslados</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select wire:model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Completada</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                <input type="date" wire:model="dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                <input type="date" wire:model="dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div class="flex items-end">
                <button wire:click="applyFilters" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Filtrar
                </button>
            </div>
        </div>
    </div>

    <!-- Lista de reservas -->
    <div class="space-y-4">
        @foreach($reserves as $reserve)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">{{ $reserve['vehicle_type'] }} - {{ $reserve['vehicle_category'] }}</h3>
                        <p class="text-gray-600">{{ $reserve['pickup_location'] }} → {{ $reserve['dropoff_location'] }}</p>
                        <p class="text-sm text-gray-500">
                            {{ \Carbon\Carbon::parse($reserve['pickup_date'])->format('d/m/Y') }} {{ $reserve['pickup_time'] }}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
                            @if($reserve['status'] == 'confirmed') bg-green-100 text-green-800
                            @elseif($reserve['status'] == 'pending') bg-yellow-100 text-yellow-800
                            @elseif($reserve['status'] == 'cancelled') bg-red-100 text-red-800
                            @else bg-blue-100 text-blue-800 @endif">
                            {{ ucfirst($reserve['status']) }}
                        </span>
                        <p class="text-2xl font-bold text-blue-600 mt-2">
                            ${{ number_format($reserve['total_amount'], 0, ',', '.') }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-500">Número de confirmación</p>
                        <p class="font-semibold">{{ $reserve['confirmation_number'] }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Pasajeros</p>
                        <p class="font-semibold">{{ $reserve['passengers'] }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Equipaje</p>
                        <p class="font-semibold">{{ $reserve['luggage'] }}</p>
                    </div>
                </div>

                <div class="flex space-x-4">
                    <a href="{{ route('terrawind.consult', $reserve['id']) }}" 
                       class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Ver Detalles
                    </a>
                    @if($reserve['status'] == 'confirmed')
                        <button wire:click="cancelReserve({{ $reserve['id'] }})" 
                                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Cancelar
                        </button>
                    @endif
                </div>
            </div>
        @endforeach
    </div>

    @if(empty($reserves))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron reservas</div>
            <a href="{{ route('transfer') }}" 
               class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </a>
        </div>
    @endif
</div>
```

Esta documentación completa de las vistas Blade para el sistema de traslados te permitirá implementar toda la interfaz de usuario necesaria para la búsqueda, selección y reserva de traslados con integración Terrawind.
