# 🎨 VISTAS BLADE COMPLETAS - SISTEMA CRM WELLEZY

## 1. LAYOUT PRINCIPAL

### app.blade.php
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'CRM Wellezy')</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    @livewireStyles
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 bg-gray-800 text-white">
            <div class="p-4">
                <h1 class="text-xl font-bold">CRM Wellezy</h1>
            </div>
            <nav class="mt-4">
                <a href="{{ route('dashboard') }}" class="block px-4 py-2 hover:bg-gray-700">
                    <i class="fas fa-home mr-2"></i> Dashboard
                </a>
                <a href="{{ route('reserves.index') }}" class="block px-4 py-2 hover:bg-gray-700">
                    <i class="fas fa-calendar mr-2"></i> Reservas
                </a>
                <a href="{{ route('contacts.index') }}" class="block px-4 py-2 hover:bg-gray-700">
                    <i class="fas fa-users mr-2"></i> Contactos
                </a>
                <a href="{{ route('deals.index') }}" class="block px-4 py-2 hover:bg-gray-700">
                    <i class="fas fa-handshake mr-2"></i> Negocios
                </a>
            </nav>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1">
            <header class="bg-white shadow">
                <div class="px-4 py-3">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-semibold">@yield('page-title')</h2>
                        <div class="flex items-center space-x-4">
                            <span class="text-gray-600">{{ auth()->user()->name }}</span>
                            <a href="{{ route('logout') }}" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-sign-out-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="p-6">
                @yield('content')
            </main>
        </div>
    </div>
    
    @livewireScripts
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</body>
</html>
```

## 2. BÚSQUEDA PRINCIPAL

### search-show.blade.php
```html
<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">Buscar Servicios</h2>
    
    <!-- Tabs de tipos de servicio -->
    <div class="flex space-x-4 mb-6">
        <button wire:click="$set('searchType', 'flight')" 
                class="px-4 py-2 rounded {{ $searchType === 'flight' ? 'bg-blue-600 text-white' : 'bg-gray-200' }}">
            <i class="fas fa-plane mr-2"></i> Vuelos
        </button>
        <button wire:click="$set('searchType', 'hotel')" 
                class="px-4 py-2 rounded {{ $searchType === 'hotel' ? 'bg-blue-600 text-white' : 'bg-gray-200' }}">
            <i class="fas fa-bed mr-2"></i> Hoteles
        </button>
        <button wire:click="$set('searchType', 'transfer')" 
                class="px-4 py-2 rounded {{ $searchType === 'transfer' ? 'bg-blue-600 text-white' : 'bg-gray-200' }}">
            <i class="fas fa-car mr-2"></i> Traslados
        </button>
        <button wire:click="$set('searchType', 'medical')" 
                class="px-4 py-2 rounded {{ $searchType === 'medical' ? 'bg-blue-600 text-white' : 'bg-gray-200' }}">
            <i class="fas fa-user-md mr-2"></i> Asistencia Médica
        </button>
    </div>

    <!-- Formulario de búsqueda -->
    <form wire:submit.prevent="search">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <!-- Origen -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <input type="text" wire:model="searchDeparture" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Ciudad o aeropuerto">
                @if($openDep && count($field) > 0)
                    <div class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        @foreach($field as $location)
                            <button type="button" wire:click="selectDeparture('{{ $location['code'] }}', '{{ $location['city'] }}', '{{ $location['name'] }}')"
                                    class="w-full text-left px-3 py-2 hover:bg-gray-100">
                                {{ $location['code'] }} - {{ $location['city'] }}
                            </button>
                        @endforeach
                    </div>
                @endif
            </div>

            <!-- Destino -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <input type="text" wire:model="searchArrival" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Ciudad o aeropuerto">
                @if($openArr && count($field) > 0)
                    <div class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        @foreach($field as $location)
                            <button type="button" wire:click="selectArrival('{{ $location['code'] }}', '{{ $location['city'] }}', '{{ $location['name'] }}')"
                                    class="w-full text-left px-3 py-2 hover:bg-gray-100">
                                {{ $location['code'] }} - {{ $location['city'] }}
                            </button>
                        @endforeach
                    </div>
                @endif
            </div>

            <!-- Fecha de ida -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Ida</label>
                <input type="date" wire:model="departureDate" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       min="{{ $tomorrow }}">
            </div>

            <!-- Fecha de vuelta (solo para vuelos) -->
            @if($searchType === 'flight')
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Vuelta</label>
                    <input type="date" wire:model="returnDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           min="{{ $departureDate }}">
                </div>
            @endif

            <!-- Pasajeros -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pasajeros</label>
                <input type="number" wire:model="passengers" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       min="1" max="9">
            </div>
        </div>

        <!-- Botón de búsqueda -->
        <div class="text-center">
            <button type="submit" 
                    class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium">
                <i class="fas fa-search mr-2"></i> Buscar
            </button>
        </div>
    </form>
</div>
```

## 3. RESULTADOS DE BÚSQUEDA

### search-results.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Resultados de Búsqueda</h2>
        <p class="text-gray-600">Se encontraron {{ count($results) }} opciones</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Precio</label>
                <select class="border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Todos los precios</option>
                    <option value="0-500000">$0 - $500,000</option>
                    <option value="500000-1000000">$500,000 - $1,000,000</option>
                    <option value="1000000+">$1,000,000+</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Lista de resultados -->
    <div class="space-y-4">
        @foreach($results as $index => $result)
            <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800">
                            {{ $result['title'] ?? 'Opción ' . ($index + 1) }}
                        </h3>
                        <div class="text-sm text-gray-600 mt-2">
                            {{ $result['description'] ?? '' }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-blue-600">
                            ${{ number_format($result['price'], 0, ',', '.') }}
                        </div>
                        <div class="text-sm text-gray-500">
                            {{ $result['currency'] ?? 'COP' }}
                        </div>
                    </div>
                </div>

                <!-- Detalles específicos según el tipo -->
                @if($search['type'] === 'flight')
                    <div class="mb-4">
                        <div class="flex items-center space-x-4">
                            <span class="font-medium">{{ $result['airline'] ?? '' }}</span>
                            <span class="text-gray-400">→</span>
                            <span class="font-medium">{{ $result['departure_time'] ?? '' }}</span>
                            <span class="text-gray-400">→</span>
                            <span class="font-medium">{{ $result['arrival_time'] ?? '' }}</span>
                        </div>
                    </div>
                @elseif($search['type'] === 'hotel')
                    <div class="mb-4">
                        <div class="flex items-center space-x-4">
                            <span class="font-medium">{{ $result['hotel_name'] ?? '' }}</span>
                            <span class="text-gray-400">•</span>
                            <span class="font-medium">{{ $result['location'] ?? '' }}</span>
                            <span class="text-gray-400">•</span>
                            <span class="font-medium">{{ $result['rating'] ?? '' }} estrellas</span>
                        </div>
                    </div>
                @endif

                <!-- Botones de acción -->
                <div class="flex space-x-4">
                    <button wire:click="selectResult({{ $result['id'] }})" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Ver Detalles
                    </button>
                    <button wire:click="proceedToBooking({{ $result['id'] }})" 
                            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Reservar
                    </button>
                </div>
            </div>
        @endforeach
    </div>

    @if(empty($results))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron resultados</div>
            <button wire:click="$emit('refresh')" 
                    class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </button>
        </div>
    @endif
</div>
```

## 4. FORMULARIO DE RESERVA

### booking-form.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Completar Reserva</h2>
        <p class="text-gray-600">Complete la información para confirmar su reserva</p>
    </div>

    <!-- Información de contacto -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información de Contacto</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                <input type="text" wire:model="contactInfo.first_name" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('contactInfo.first_name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido*</label>
                <input type="text" wire:model="contactInfo.last_name" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('contactInfo.last_name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input type="email" wire:model="contactInfo.email" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('contactInfo.email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
                <input type="tel" wire:model="contactInfo.phone" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('contactInfo.phone') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
        </div>
    </div>

    <!-- Información de pasajeros -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Pasajeros</h3>
            <button wire:click="addPassenger" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i> Agregar Pasajero
            </button>
        </div>
        
        <div class="space-y-4">
            @foreach($passengerInfo as $index => $passenger)
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-medium">Pasajero {{ $index + 1 }}</h4>
                        @if($index > 0)
                            <button wire:click="removePassenger({{ $index }})" 
                                    class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        @endif
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                            <input type="text" wire:model="passengerInfo.{{ $index }}.first_name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Apellido*</label>
                            <input type="text" wire:model="passengerInfo.{{ $index }}.last_name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Documento*</label>
                            <input type="text" wire:model="passengerInfo.{{ $index }}.document" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento*</label>
                            <input type="date" wire:model="passengerInfo.{{ $index }}.birth_date" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Género*</label>
                            <select wire:model="passengerInfo.{{ $index }}.gender" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Seleccionar</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Solicitudes especiales -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Solicitudes Especiales</h3>
        <textarea wire:model="specialRequests" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4" placeholder="Comentarios adicionales..."></textarea>
    </div>

    <!-- Resumen de precios -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Resumen de Precios</h3>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between">
                <span>Impuestos</span>
                <span>$0</span>
            </div>
            <div class="border-t pt-2">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Botón de confirmar -->
    <div class="text-center">
        <button wire:click="createBooking" 
                class="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-medium">
            <i class="fas fa-check mr-2"></i> Confirmar Reserva
        </button>
    </div>

    <!-- Mensajes de estado -->
    @if($successMessage)
        <div class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {{ $successMessage }}
        </div>
    @endif

    @if($errorMessage)
        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ $errorMessage }}
        </div>
    @endif
</div>
```

## 5. CONFIRMACIÓN DE RESERVA

### reserve-confirmation.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-green-600">¡Reserva Confirmada!</h2>
        <p class="text-gray-600">Su reserva ha sido procesada exitosamente</p>
    </div>

    <!-- Información de la reserva -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold">Número de Reserva</h3>
                <p class="text-2xl font-bold text-blue-600">{{ $reserve->id }}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Fecha de reserva</p>
                <p class="font-medium">{{ $reserve->created_at->format('d/m/Y H:i') }}</p>
            </div>
        </div>
    </div>

    <!-- Detalles de la reserva -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Detalles de la Reserva</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Tipo de Servicio</p>
                <p class="font-medium">{{ ucfirst($reserve->type) }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Estado</p>
                <span class="px-2 py-1 rounded text-sm {{ $reserve->status_color === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }}">
                    {{ ucfirst($reserve->status) }}
                </span>
            </div>
            <div>
                <p class="text-sm text-gray-500">Total</p>
                <p class="font-medium">${{ number_format($reserve->total_amount, 0, ',', '.') }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Contacto</p>
                <p class="font-medium">{{ $reserve->contact->first_name }} {{ $reserve->contact->last_name }}</p>
            </div>
        </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex space-x-4">
        <button wire:click="printReserve" 
                class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
            <i class="fas fa-print mr-2"></i> Imprimir
        </button>
        <button wire:click="sendConfirmationEmail" 
                class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium">
            <i class="fas fa-envelope mr-2"></i> Enviar por Email
        </button>
        <a href="{{ route('reserves.index') }}" 
           class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium">
            <i class="fas fa-list mr-2"></i> Ver Todas las Reservas
        </a>
    </div>
</div>
```

## 6. LISTA DE RESERVAS

### reserve-list.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Reservas</h2>
        <p class="text-gray-600">Gestiona todas las reservas del sistema</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select wire:model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Completada</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select wire:model="filters.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Todos los tipos</option>
                    <option value="flight">Vuelo</option>
                    <option value="hotel">Hotel</option>
                    <option value="transfer">Traslado</option>
                    <option value="medical">Asistencia Médica</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input type="date" wire:model="filters.date_from" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input type="date" wire:model="filters.date_to" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        <div class="mt-4 flex space-x-4">
            <button wire:click="applyFilters" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Aplicar Filtros
            </button>
            <button wire:click="clearFilters" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                Limpiar
            </button>
        </div>
    </div>

    <!-- Tabla de reservas -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @foreach($reserves as $reserve)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{{ $reserve->id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ ucfirst($reserve->type) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $reserve->contact->first_name }} {{ $reserve->contact->last_name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${{ number_format($reserve->total_amount, 0, ',', '.') }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full 
                                {{ $reserve->status_color === 'green' ? 'bg-green-100 text-green-800' : 
                                   ($reserve->status_color === 'red' ? 'bg-red-100 text-red-800' : 
                                   ($reserve->status_color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800')) }}">
                                {{ ucfirst($reserve->status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $reserve->created_at->format('d/m/Y') }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a href="{{ route('reserves.show', $reserve->id) }}" 
                               class="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                            <a href="{{ route('reserves.edit', $reserve->id) }}" 
                               class="text-green-600 hover:text-green-900 mr-3">Editar</a>
                            <button wire:click="deleteReserve({{ $reserve->id }})" 
                                    class="text-red-600 hover:text-red-900">Eliminar</button>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if(empty($reserves))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron reservas</div>
        </div>
    @endif
</div>
```

## 7. DASHBOARD

### dashboard.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Dashboard</h2>
        <p class="text-gray-600">Resumen general del sistema</p>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                    <i class="fas fa-calendar text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Reservas</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['total_reserves'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <i class="fas fa-clock text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Pendientes</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['pending_reserves'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 text-green-600">
                    <i class="fas fa-check text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Confirmadas</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ $stats['confirmed_reserves'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                    <i class="fas fa-dollar-sign text-2xl"></i>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Ingresos Totales</p>
                    <p class="text-2xl font-semibold text-gray-900">${{ number_format($stats['total_revenue'], 0, ',', '.') }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenido principal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Reservas recientes -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Reservas Recientes</h3>
            <div class="space-y-4">
                @foreach($recentReserves as $reserve)
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium">#{{ $reserve->id }} - {{ ucfirst($reserve->type) }}</p>
                            <p class="text-sm text-gray-500">{{ $reserve->contact->first_name }} {{ $reserve->contact->last_name }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">${{ number_format($reserve->total_amount, 0, ',', '.') }}</p>
                            <span class="px-2 py-1 text-xs rounded-full 
                                {{ $reserve->status_color === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }}">
                                {{ ucfirst($reserve->status) }}
                            </span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Contactos recientes -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Contactos Recientes</h3>
            <div class="space-y-4">
                @foreach($recentContacts as $contact)
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium">{{ $contact->first_name }} {{ $contact->last_name }}</p>
                            <p class="text-sm text-gray-500">{{ $contact->email }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">{{ $contact->created_at->format('d/m/Y') }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
```

Esta documentación de vistas Blade está completa y lista para implementar toda la interfaz de usuario del sistema CRM.
