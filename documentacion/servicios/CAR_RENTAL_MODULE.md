# Módulo de Renta de Autos - CRM

## 📋 Resumen

Este documento describe la implementación completa del módulo de renta de autos en el sistema CRM, integrado con la API de BookingCars. El módulo incluye búsqueda, reserva, gestión y cancelación de vehículos de alquiler.

## 🎯 Características Principales

- **Búsqueda de Autos**: Formulario intuitivo con autocompletado de ubicaciones
- **Resultados Filtrados**: Lista de vehículos con filtros por categoría, precio y ordenamiento
- **Reserva de Vehículos**: Proceso completo de confirmación con datos del conductor y pago
- **Gestión de Reservas**: Visualización y cancelación de reservas existentes
- **Integración API**: Conexión completa con BookingCars API

## 🏗️ Arquitectura del Módulo

### Base de Datos

#### Tabla: `car_rentals`
```sql
- id (bigint, primary key)
- code (string, unique) - Código de la compañía
- name (string) - Nombre de la compañía
- logo (string, nullable) - URL del logo
- status (enum: active, inactive) - Estado de la compañía
- timestamps
```

#### Tabla: `car_locations`
```sql
- id (bigint, primary key)
- citycode (string, nullable) - Código de ciudad
- airportcode (string, nullable) - Código de aeropuerto
- countryname (string) - Nombre del país
- state (string, nullable) - Estado/Provincia
- address (text, nullable) - Dirección completa
- name (string) - Nombre de la ubicación
- timestamps
- index: [citycode, airportcode]
```

#### Tabla: `car_rates`
```sql
- id (bigint, primary key)
- request_uuid (string) - UUID de la solicitud
- rate_id (string) - ID de la tarifa
- name (string) - Nombre del vehículo
- category (string) - Categoría del vehículo
- price (decimal 10,2) - Precio total
- currency (string, 3) - Moneda (USD, EUR, COP)
- days (integer) - Número de días
- image (string, nullable) - URL de la imagen
- rental_code (string) - Código de la compañía de renta
- inclusions (json, nullable) - Inclusiones del vehículo
- features (json, nullable) - Características del vehículo
- timestamps
- foreign key: rental_code -> car_rentals.code
- index: [request_uuid, rate_id]
```

#### Tabla: `car_reservations`
```sql
- id (bigint, primary key)
- reservation_id_api (string, unique) - ID de la API
- client_id (bigint) - ID del cliente
- rate_id (string) - ID de la tarifa
- pickup_date (date) - Fecha de recogida
- dropoff_date (date) - Fecha de devolución
- pickup_place (string) - Lugar de recogida
- dropoff_place (string) - Lugar de devolución
- price (decimal 10,2) - Precio total
- currency (string, 3) - Moneda
- status (enum: pending, confirmed, cancelled, completed)
- driver_info (json, nullable) - Información del conductor
- payment_info (json, nullable) - Información de pago
- notes (text, nullable) - Notas adicionales
- timestamps
- foreign key: client_id -> users.id
- index: [client_id, status], [reservation_id_api]
```

### Modelos

#### CarRental
- **Relaciones**: `hasMany(CarRate::class)`
- **Fillable**: code, name, logo, status
- **Casts**: status -> string

#### CarLocation
- **Scopes**: `search($query)` - Búsqueda por nombre, citycode, airportcode
- **Fillable**: citycode, airportcode, countryname, state, address, name
- **Casts**: Todos los campos como string

#### CarRate
- **Relaciones**: `belongsTo(CarRental::class)`
- **Scopes**: `byCategory($category)`, `byPriceRange($min, $max)`
- **Fillable**: request_uuid, rate_id, name, category, price, currency, days, image, rental_code, inclusions, features
- **Casts**: price -> decimal:2, days -> integer, inclusions/features -> array

#### CarReservation
- **Relaciones**: `belongsTo(User::class, 'client_id')`
- **Scopes**: `byStatus($status)`, `byClient($clientId)`
- **Fillable**: reservation_id_api, client_id, rate_id, pickup_date, dropoff_date, pickup_place, dropoff_place, price, currency, status, driver_info, payment_info, notes
- **Casts**: pickup_date/dropoff_date -> date, price -> decimal:2, driver_info/payment_info -> array

### Servicio: BookingCarsService

#### Métodos Principales

```php
// Autenticación
public function authenticate(): array

// Gestión de Compañías
public function getRentals(): array

// Gestión de Ubicaciones
public function getLocations(string $query): array

// Disponibilidad de Vehículos
public function getAvailability(string $pickup, string $dropoff, string $destination, string $pos, string $currency = 'USD'): array

// Información de Tarifas
public function getRateInformation(string $requestUUID, string $rateId): array

// Gestión de Reservas
public function createReservation(array $data): array
public function cancelReservation(string $reservationId, string $companyCode): array
public function getReservation(string $reservationId): array
```

#### Características del Servicio

- **Cache de Tokens**: Los tokens de autenticación se almacenan en cache hasta su expiración
- **Manejo de Errores**: Logging completo de errores y respuestas de error estructuradas
- **Timeouts Configurables**: Timeouts personalizables para diferentes operaciones
- **Persistencia Automática**: Los datos de la API se guardan automáticamente en la base de datos

### Componentes Livewire

#### SearchCarRental
**Funcionalidades:**
- Formulario de búsqueda con validación
- Autocompletado de ubicaciones en tiempo real
- Validación de fechas (pickup < dropoff)
- Soporte para múltiples monedas (USD, EUR, COP)

**Propiedades:**
```php
public $pickupLocation = '';
public $dropoffLocation = '';
public $pickupDate = '';
public $dropoffDate = '';
public $currency = 'USD';
public $pickupSuggestions = [];
public $dropoffSuggestions = [];
```

**Métodos:**
```php
public function searchPickupLocations()
public function searchDropoffLocations()
public function selectPickupLocation($location)
public function selectDropoffLocation($location)
public function search()
```

#### ListCarResults
**Funcionalidades:**
- Visualización de resultados de búsqueda
- Filtros por categoría, precio mínimo/máximo
- Ordenamiento por precio, nombre, categoría
- Integración con sesión para mantener parámetros de búsqueda

**Propiedades:**
```php
public $searchParams = [];
public $rates = [];
public $loading = false;
public $selectedCategory = '';
public $minPrice = '';
public $maxPrice = '';
public $sortBy = 'price';
public $sortDirection = 'asc';
```

**Métodos:**
```php
public function searchCars($params)
public function filterByCategory($category)
public function filterByPrice()
public function sortBy($field)
public function applyFilters()
public function reserve($rateId)
```

#### ConfirmCarReservation
**Funcionalidades:**
- Formulario de confirmación de reserva
- Validación de datos del conductor
- Múltiples métodos de pago (tarjeta de crédito, débito, PayPal)
- Pre-llenado con datos del usuario autenticado

**Propiedades:**
```php
public $rateId;
public $rate;
public $driverName = '';
public $driverDocument = '';
public $driverEmail = '';
public $driverPhone = '';
public $paymentMethod = 'credit_card';
// ... más campos de pago
```

**Métodos:**
```php
public function mount($rateId)
public function updated($propertyName)
public function confirmReservation()
```

#### MyCarReservations
**Funcionalidades:**
- Lista paginada de reservas del usuario
- Filtros por estado (pending, confirmed, cancelled, completed)
- Acciones de ver detalles y cancelar
- Verificación de autenticación

**Propiedades:**
```php
public $statusFilter = '';
public $loading = false;
```

**Métodos:**
```php
public function filterByStatus($status)
public function cancelReservation($reservationId)
public function viewReservation($reservationId)
```

### Rutas

#### Estructura de Rutas
```
/car-rentals/
├── / (SearchCarRental) - Búsqueda principal
├── /results (ListCarResults) - Resultados de búsqueda
├── /confirm/{rate_id} (ConfirmCarReservation) - Confirmar reserva
├── /my-reservations (MyCarReservations) - Mis reservas
└── /api/
    ├── /locations - Autocompletado de ubicaciones
    ├── /rate/{rateId} - Información de tarifa
    └── /reservation/{reservationId} - Cancelar reserva
```

#### Middleware
- `auth`: Requerido para todas las rutas
- `verified`: Verificación de email requerida

### Vistas Blade

#### Diseño con Tailwind + Flux

**SearchCarRental:**
- Formulario responsivo con grid layout
- Autocompletado con dropdowns estilizados
- Información adicional con iconos y descripciones
- Validación visual en tiempo real

**ListCarResults:**
- Cards responsivas para cada vehículo
- Filtros en barra superior
- Imágenes de vehículos con fallback
- Estados de carga y sin resultados

**ConfirmCarReservation:**
- Layout de dos columnas (info del auto + formulario)
- Formularios condicionales según método de pago
- Validación visual de campos
- Botones de acción claramente definidos

**MyCarReservations:**
- Lista de cards con información completa
- Filtros por estado con botones
- Estados visuales con colores y iconos
- Acciones contextuales por estado

## ⚙️ Configuración

### Variables de Entorno
```env
# BookingCars API Configuration
BOOKINGCARS_BASE_URL=https://api.bookingcars.com/v1
BOOKINGCARS_API_KEY=your_api_key_here
BOOKINGCARS_API_SECRET=your_api_secret_here
```

### Configuración de Servicios
```php
// config/services.php
'bookingcars' => [
    'base_url' => env('BOOKINGCARS_BASE_URL', 'https://api.bookingcars.com/v1'),
    'api_key' => env('BOOKINGCARS_API_KEY'),
    'api_secret' => env('BOOKINGCARS_API_SECRET'),
],
```

## 🚀 Uso del Módulo

### 1. Búsqueda de Autos
```php
// Acceder a la búsqueda
Route::get('/car-rentals', SearchCarRental::class);

// Parámetros de búsqueda
$searchParams = [
    'pickup' => 'Bogotá',
    'dropoff' => 'Medellín',
    'pickup_date' => '2025-10-01',
    'dropoff_date' => '2025-10-05',
    'currency' => 'USD'
];
```

### 2. Crear Reserva
```php
$bookingCarsService = new BookingCarsService();

$reservationData = [
    'rate_id' => 'RATE123',
    'request_uuid' => 'UUID123',
    'pickup_date' => '2025-10-01',
    'dropoff_date' => '2025-10-05',
    'pickup_place' => 'Bogotá',
    'dropoff_place' => 'Medellín',
    'driver_info' => [
        'name' => 'Juan Pérez',
        'document' => '12345678',
        'email' => 'juan@ejemplo.com',
        'phone' => '+57 300 123 4567'
    ],
    'payment_info' => [
        'method' => 'credit_card',
        'card_number' => '1234567890123456',
        'card_expiry' => '12/25',
        'card_cvv' => '123',
        'cardholder_name' => 'Juan Pérez',
        'billing_address' => 'Calle 123 #45-67'
    ]
];

$result = $bookingCarsService->createReservation($reservationData);
```

### 3. Consultar Reservas
```php
// Obtener reservas del usuario
$reservations = CarReservation::where('client_id', auth()->id())
    ->with('client')
    ->orderBy('created_at', 'desc')
    ->paginate(10);

// Filtrar por estado
$pendingReservations = CarReservation::byStatus('pending')
    ->byClient(auth()->id())
    ->get();
```

## 🔧 Próximos Pasos

### 1. Configuración de Base de Datos
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE crm;"

# Ejecutar migraciones
php artisan migrate
```

### 2. Configuración de API
- Obtener credenciales de BookingCars
- Configurar variables de entorno
- Probar conectividad con la API

### 3. Testing
- Pruebas unitarias para modelos
- Pruebas de integración para el servicio
- Pruebas de funcionalidad para componentes Livewire

### 4. Mejoras Futuras
- Notificaciones por email/SMS
- Integración con sistema de pagos
- Reportes y analytics
- API REST para móviles
- Integración con sistema de puntos

## 📊 Estados de Reserva

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `pending` | Reserva pendiente de confirmación | Ver detalles, Cancelar |
| `confirmed` | Reserva confirmada | Ver detalles, Cancelar |
| `cancelled` | Reserva cancelada | Ver detalles |
| `completed` | Reserva completada | Ver detalles |

## 🔍 Monitoreo y Logs

### Logs Importantes
- Autenticación con BookingCars API
- Creación y cancelación de reservas
- Errores de validación
- Errores de API

### Métricas Recomendadas
- Tasa de conversión de búsqueda a reserva
- Tiempo promedio de búsqueda
- Errores por tipo de operación
- Satisfacción del usuario

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Error de autenticación API**
   - Verificar credenciales en .env
   - Verificar conectividad con BookingCars
   - Revisar logs de autenticación

2. **Ubicaciones no encontradas**
   - Verificar que la API de ubicaciones esté funcionando
   - Revisar cache de ubicaciones
   - Verificar índices de base de datos

3. **Reservas no se crean**
   - Verificar datos del conductor
   - Revisar información de pago
   - Verificar conectividad con API

4. **Problemas de UI**
   - Verificar que Tailwind CSS esté cargado
   - Revisar componentes Flux
   - Verificar JavaScript de Livewire

---

**Fecha de implementación:** 27 de septiembre de 2025  
**Versión:** 1.0.0  
**Desarrollador:** Sistema CRM  
**Branch:** `rental-cars`
