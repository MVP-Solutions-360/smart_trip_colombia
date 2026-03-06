# 🎨 VISTAS BLADE COMPLETAS - SISTEMA DE HOTELES

## 1. BÚSQUEDA DE HOTELES

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

## 2. RESULTADOS DE HOTELES

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

## 3. SELECCIÓN DE HABITACIONES

### show-room.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Seleccionar Habitaciones</h2>
        <p class="text-gray-600">Elija las habitaciones para su estadía</p>
    </div>

    <!-- Información del hotel -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">{{ $availability['hotel_name'] }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Check-in</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['check_in'])->format('d/m/Y') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Check-out</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['check_out'])->format('d/m/Y') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Noches</p>
                <p class="font-semibold">{{ $availability['nights'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Huéspedes</p>
                <p class="font-semibold">{{ $search['adults'] }} adultos, {{ $search['children'] }} niños</p>
            </div>
        </div>
    </div>

    <!-- Tipos de habitaciones -->
    <div class="space-y-4">
        @foreach($roomTypes as $roomType)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Imagen de la habitación -->
                    <div class="md:w-1/3">
                        <img src="{{ $roomType['images'][0] ?? '/images/room-placeholder.jpg' }}" 
                             alt="{{ $roomType['name'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                    
                    <!-- Información de la habitación -->
                    <div class="md:w-2/3">
                        <h4 class="text-lg font-semibold mb-2">{{ $roomType['name'] }}</h4>
                        <p class="text-gray-600 mb-2">{{ $roomType['description'] }}</p>
                        
                        <!-- Amenidades de la habitación -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($roomType['amenities'] as $amenity)
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {{ $amenity }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Detalles de la habitación -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Capacidad máxima</p>
                                <p class="font-semibold">{{ $roomType['max_occupancy'] }} personas</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Habitaciones disponibles</p>
                                <p class="font-semibold">{{ $roomType['available_rooms'] }}</p>
                            </div>
                        </div>
                        
                        <!-- Precio y selección -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-2xl font-bold text-blue-600">
                                    ${{ number_format($roomType['rate'], 0, ',', '.') }}
                                </span>
                                <span class="text-gray-500">por noche</span>
                            </div>
                            
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                    <label class="text-sm font-medium">Cantidad:</label>
                                    <select wire:model="roomSelection.{{ $roomType['code'] }}.quantity" 
                                            class="px-3 py-1 border border-gray-300 rounded-md">
                                        @for($i = 0; $i <= $roomType['available_rooms']; $i++)
                                            <option value="{{ $i }}">{{ $i }}</option>
                                        @endfor
                                    </select>
                                </div>
                                
                                <button wire:click="selectRoom('{{ $roomType['code'] }}', {{ $roomType['rate'] }})"
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
    @if(count($selectedRooms) > 0)
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 class="text-lg font-semibold mb-4">Resumen de Selección</h3>
            <div class="space-y-2">
                @foreach($selectedRooms as $room)
                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                            <span class="font-medium">{{ $room['type'] }}</span>
                            <span class="text-sm text-gray-500 ml-2">{{ $room['nights'] }} noches</span>
                        </div>
                        <div class="text-right">
                            <span class="font-semibold">${{ number_format($room['rate'] * $room['nights'], 0, ',', '.') }}</span>
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

## 5. CONFIRMACIÓN DE RESERVA

### hotel-confirmation.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-green-600">¡Reserva Confirmada!</h2>
        <p class="text-gray-600">Su reserva de hotel ha sido procesada exitosamente</p>
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

    <!-- Detalles del hotel -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Hotel</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Hotel</p>
                <p class="font-semibold">{{ $hotelName }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Ubicación</p>
                <p class="font-semibold">{{ $city }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Check-in</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($checkIn)->format('d/m/Y') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Check-out</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($checkOut)->format('d/m/Y') }}</p>
            </div>
        </div>
    </div>

    <!-- Habitaciones reservadas -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Habitaciones Reservadas</h3>
        <div class="space-y-4">
            @foreach($roomDetails as $room)
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium">{{ $room['type'] }}</h4>
                            <p class="text-sm text-gray-600">{{ $room['description'] }}</p>
                            <p class="text-sm text-gray-500">{{ $room['nights'] }} noches</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">${{ number_format($room['total'], 0, ',', '.') }}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Información del huésped -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Huésped</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Nombre</p>
                <p class="font-semibold">{{ $guestName }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-semibold">{{ $guestEmail }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Teléfono</p>
                <p class="font-semibold">{{ $guestPhone }}</p>
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
                <span>Habitaciones</span>
                <span>${{ number_format($subtotal, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between">
                <span>Impuestos</span>
                <span>${{ number_format($taxes, 0, ',', '.') }}</span>
            </div>
            <div class="border-t pt-2">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex space-x-4">
        <button onclick="window.print()" 
                class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium">
            Imprimir Reserva
        </button>
        <a href="{{ route('hotel') }}" 
           class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
            Nueva Búsqueda
        </a>
    </div>
</div>
```

## 6. CONSULTA DE RESERVAS

### restel-reserve-index.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Reservas de Hoteles</h2>
        <p class="text-gray-600">Gestiona tus reservas de hoteles</p>
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
                        <h3 class="text-lg font-semibold">{{ $reserve['hotel_name'] }}</h3>
                        <p class="text-gray-600">{{ $reserve['city'] }}</p>
                        <p class="text-sm text-gray-500">
                            {{ \Carbon\Carbon::parse($reserve['check_in'])->format('d/m/Y') }} - 
                            {{ \Carbon\Carbon::parse($reserve['check_out'])->format('d/m/Y') }}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
                            @if($reserve['status'] == 'confirmed') bg-green-100 text-green-800
                            @elseif($reserve['status'] == 'pending') bg-yellow-100 text-yellow-800
                            @else bg-red-100 text-red-800 @endif">
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
                        <p class="text-sm text-gray-500">Habitaciones</p>
                        <p class="font-semibold">{{ $reserve['rooms'] }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Huéspedes</p>
                        <p class="font-semibold">{{ $reserve['adults'] }} adultos, {{ $reserve['children'] }} niños</p>
                    </div>
                </div>

                <div class="flex space-x-4">
                    <a href="{{ route('restel.consult', $reserve['id']) }}" 
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
            <a href="{{ route('hotel') }}" 
               class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </a>
        </div>
    @endif
</div>
```

Esta documentación completa de las vistas Blade para el sistema de hoteles te permitirá implementar toda la interfaz de usuario necesaria para la búsqueda, selección y reserva de hoteles con integración Restel.
