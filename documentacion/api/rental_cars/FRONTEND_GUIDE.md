# Frontend Guide - Módulo de Renta de Autos

## 📋 Índice

1. [Componentes Livewire](#componentes-livewire)
2. [Vistas Blade](#vistas-blade)
3. [Estilos y UI](#estilos-y-ui)
4. [Interactividad](#interactividad)
5. [Responsive Design](#responsive-design)
6. [Dark Mode](#dark-mode)
7. [Ejemplos de Uso](#ejemplos-de-uso)

## 🎯 Componentes Livewire

### SearchCarRental

**Ubicación:** `app/Livewire/CarRental/SearchCarRental.php`  
**Vista:** `resources/views/livewire/car-rental/search-car-rental.blade.php`

#### Propiedades

```php
// Autocomplete de ubicaciones
public string $pickupQuery = '';
public array $pickupResults = [];
public ?array $pickupSelected = null;

public string $dropoffQuery = '';
public array $dropoffResults = [];
public ?array $dropoffSelected = null;

// Formulario de búsqueda
public string $pickupDate = '';
public string $dropoffDate = '';
public string $currency = 'USD';
public bool $loading = false;
```

#### Métodos Principales

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

#### Uso en Blade

```blade
<livewire:car-rental.search-car-rental />
```

### ListCarResults

**Ubicación:** `app/Livewire/CarRental/ListCarResults.php`  
**Vista:** `resources/views/livewire/car-rental/list-car-results.blade.php`

#### Propiedades

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

#### Computed Properties

```php
public function getRatesProperty(): LengthAwarePaginator
```

#### Uso en Blade

```blade
<livewire:car-rental.list-car-results />
```

### ConfirmCarReservation

**Ubicación:** `app/Livewire/CarRental/ConfirmCarReservation.php`  
**Vista:** `resources/views/livewire/car-rental/confirm-car-reservation.blade.php`

#### Propiedades

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

#### Uso en Blade

```blade
<livewire:car-rental.confirm-car-reservation :rate="$rate" />
```

### MyCarReservations

**Ubicación:** `app/Livewire/CarRental/MyCarReservations.php`  
**Vista:** `resources/views/livewire/car-rental/my-car-reservations.blade.php`

#### Propiedades

```php
public bool $loading = false;
public ?CarReservation $selectedReservation = null;
public bool $showCancelModal = false;
```

#### Computed Properties

```php
public function getReservationsProperty(): LengthAwarePaginator
```

#### Uso en Blade

```blade
<livewire:car-rental.my-car-reservations />
```

## 🎨 Vistas Blade

### Estructura de Archivos

```
resources/views/livewire/car-rental/
├── search-car-rental.blade.php
├── list-car-results.blade.php
├── confirm-car-reservation.blade.php
└── my-car-reservations.blade.php
```

### Componentes Flux UI Utilizados

#### Breadcrumbs

```blade
<flux:breadcrumbs>
    <flux:breadcrumbs.item href="{{ route('dashboard') }}">Inicio</flux:breadcrumbs.item>
    <flux:breadcrumbs.item href="{{ route('car-rentals.search') }}">Búsqueda de Autos</flux:breadcrumbs.item>
</flux:breadcrumbs>
```

#### Headings

```blade
<flux:heading level="2" class="text-gray-900 dark:text-white mb-6 text-center">
    Buscar Autos de Renta
</flux:heading>
```

#### Forms

```blade
<flux:form wire:submit.prevent="search" class="space-y-8">
    <!-- Contenido del formulario -->
</flux:form>
```

#### Inputs

```blade
<flux:input 
    type="text" 
    wire:model.live="pickupQuery" 
    placeholder="Ciudad o aeropuerto de recogida"
    class="w-full"
/>
```

#### Buttons

```blade
<flux:button 
    variant="primary" 
    type="submit" 
    class="w-full md:w-auto"
>
    Buscar Autos
</flux:button>
```

#### Cards

```blade
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
    <!-- Contenido de la tarjeta -->
</div>
```

#### Modals

```blade
@if($showReservationModal)
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <!-- Contenido del modal -->
    </div>
@endif
```

## 🎨 Estilos y UI

### Clases Tailwind Utilizadas

#### Layout y Espaciado

```css
/* Contenedores principales */
.min-h-screen
.max-w-4xl, .max-w-7xl
.mx-auto
.p-6, .p-8
.py-8

/* Grids */
.grid
.grid-cols-1
.md:grid-cols-2
.lg:grid-cols-3
.gap-6, .gap-8

/* Espaciado */
.space-y-2, .space-y-8
.mb-6, .mb-8
.mt-2, .mt-8
```

#### Colores y Temas

```css
/* Fondos */
.bg-gray-100, .bg-gray-50
.dark:bg-gray-900, .dark:bg-gray-800

/* Texto */
.text-gray-900, .text-gray-700, .text-gray-600, .text-gray-500
.dark:text-white, .dark:text-gray-300, .dark:text-gray-400

/* Bordes */
.border-gray-200, .border-gray-300
.dark:border-gray-600, .dark:border-gray-700

/* Estados */
.text-green-600, .text-red-500
.dark:text-green-400, .dark:text-red-400
```

#### Componentes Específicos

```css
/* Tarjetas de vehículos */
.rounded-lg
.shadow-md, .shadow-lg
.hover:shadow-lg
.transition-shadow
.duration-300

/* Botones */
.rounded-full
.px-2, .px-3, .px-4
.py-1, .py-2, .py-3

/* Imágenes */
.object-cover
.h-48, .h-full
.w-full
```

### Iconos

```blade
<!-- Iconos de estado -->
<span class="text-6xl">🚗</span>
<span class="text-2xl">🚗</span>

<!-- Iconos de información -->
<flux:icon name="lightbulb" class="inline-block mr-2" />
```

## ⚡ Interactividad

### Autocomplete en Tiempo Real

```blade
<!-- Input con autocomplete -->
<flux:input 
    type="text" 
    wire:model.live="pickupQuery" 
    placeholder="Ciudad o aeropuerto de recogida"
    class="w-full"
/>

<!-- Lista de resultados -->
@if(!empty($pickupResults))
    <ul class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded mt-1 shadow-lg max-h-60 overflow-auto">
        @foreach($pickupResults as $location)
            <li class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                wire:click="selectPickupLocation({{ json_encode($location) }})">
                <div class="font-medium text-gray-900 dark:text-white">{{ $location['cityname'] }} ({{ $location['citycode'] }})</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ $location['countryname'] }}</div>
            </li>
        @endforeach
    </ul>
@endif
```

### Filtros Dinámicos

```blade
<!-- Filtro por categoría -->
<select wire:model.live="selectedCategory" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
    <option value="">Todas las categorías</option>
    <option value="Compacto">Compacto</option>
    <option value="SUV">SUV</option>
    <option value="Sedán">Sedán</option>
    <option value="Lujo">Lujo</option>
</select>

<!-- Filtro por precio -->
<select wire:model.live="maxPrice" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
    <option value="">Sin límite</option>
    <option value="50">Hasta $50</option>
    <option value="100">Hasta $100</option>
    <option value="200">Hasta $200</option>
    <option value="500">Hasta $500</option>
</select>
```

### Paginación

```blade
<!-- Paginación de resultados -->
@if($this->rates->hasPages())
    <div class="mt-8">
        {{ $this->rates->links() }}
    </div>
@endif
```

### Estados de Carga

```blade
<!-- Indicador de carga -->
@if($loading)
    <div class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="ml-3 text-blue-600 dark:text-blue-400">Buscando autos...</p>
    </div>
@else
    <!-- Contenido normal -->
@endif
```

## 📱 Responsive Design

### Breakpoints Utilizados

```css
/* Mobile First */
.grid-cols-1

/* Tablet */
.md:grid-cols-2

/* Desktop */
.lg:grid-cols-3
```

### Ejemplos de Layout Responsivo

```blade
<!-- Grid de búsqueda -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Pickup Location -->
    <div class="space-y-2">
        <!-- Contenido -->
    </div>
    
    <!-- Dropoff Location -->
    <div class="space-y-2">
        <!-- Contenido -->
    </div>
</div>

<!-- Grid de resultados -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    @forelse($this->rates as $rate)
        <!-- Tarjeta de vehículo -->
    @empty
        <!-- Estado vacío -->
    @endforelse
</div>
```

### Botones Responsivos

```blade
<!-- Botón que se adapta al ancho -->
<flux:button 
    variant="primary" 
    type="submit" 
    class="w-full md:w-auto"
>
    Buscar Autos
</flux:button>
```

## 🌙 Dark Mode

### Clases Dark Mode

```css
/* Fondos */
.bg-white
.dark:bg-gray-800

/* Texto */
.text-gray-900
.dark:text-white

/* Bordes */
.border-gray-300
.dark:border-gray-600

/* Estados hover */
.hover:bg-gray-100
.dark:hover:bg-gray-700
```

### Ejemplo de Componente con Dark Mode

```blade
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
    <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ $rate->name }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $rate->carRental->name }}</p>
        
        <div class="mb-4">
            <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">${{ number_format($rate->price, 0) }}</span>
            <span class="text-gray-600 dark:text-gray-400">/ {{ $rate->days }} días</span>
        </div>
    </div>
</div>
```

## 💡 Ejemplos de Uso

### Integración en Layout Principal

```blade
<!-- En resources/views/components/layouts/app.blade.php -->
<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    @include('components.layouts.app.sidebar')
    
    <main class="flex-1">
        @yield('content')
    </main>
</div>
```

### Navegación en Sidebar

```blade
<!-- En resources/views/components/layouts/app/sidebar.blade.php -->
<flux:navlist.group expandable :expanded="false" heading="Buscadores" class="grid">
    <flux:navlist.item :href="route('car-rentals.search')" 
        class="loading-link" wire:navigate>
        {{ __('Renta de Autos') }}
    </flux:navlist.item>
</flux:navlist.group>
```

### Manejo de Errores

```blade
<!-- Validación de campos -->
@error('pickupSelected') 
    <span class="text-red-500 dark:text-red-400 text-sm">{{ $message }}</span> 
@enderror

<!-- Estado vacío -->
@empty
    <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
        <p class="text-gray-600 dark:text-gray-400">Intenta ajustar tus filtros de búsqueda</p>
    </div>
@endempty
```

### Eventos Livewire

```blade
<!-- Escuchar eventos -->
<script>
    document.addEventListener('livewire:init', () => {
        Livewire.on('success', (message) => {
            // Mostrar notificación de éxito
            console.log('Success:', message);
        });
        
        Livewire.on('error', (message) => {
            // Mostrar notificación de error
            console.error('Error:', message);
        });
    });
</script>
```

### Formularios con Validación

```blade
<!-- Formulario de confirmación -->
<flux:form wire:submit.prevent="reserve" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <flux:label for="firstName">Nombre</flux:label>
            <flux:input 
                id="firstName"
                type="text" 
                wire:model="firstName" 
                placeholder="Ingresa tu nombre"
                class="w-full"
            />
            @error('firstName') 
                <span class="text-red-500 dark:text-red-400 text-sm">{{ $message }}</span> 
            @enderror
        </div>
        
        <div>
            <flux:label for="lastName">Apellido</flux:label>
            <flux:input 
                id="lastName"
                type="text" 
                wire:model="lastName" 
                placeholder="Ingresa tu apellido"
                class="w-full"
            />
            @error('lastName') 
                <span class="text-red-500 dark:text-red-400 text-sm">{{ $message }}</span> 
            @enderror
        </div>
    </div>
    
    <!-- Más campos... -->
    
    <div class="flex justify-end space-x-4">
        <flux:button 
            type="button" 
            wire:click="goBack"
            variant="ghost"
        >
            Volver
        </flux:button>
        
        <flux:button 
            type="submit" 
            variant="primary"
            :disabled="$loading"
        >
            @if($loading)
                Procesando...
            @else
                Confirmar Reserva
            @endif
        </flux:button>
    </div>
</flux:form>
```

---

## 📞 Soporte

Para más información sobre el frontend del módulo de renta de autos, consultar la documentación completa o contactar al equipo de desarrollo.

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025
