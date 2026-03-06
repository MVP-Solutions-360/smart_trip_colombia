# Testing Guide - Módulo de Renta de Autos

## 📋 Índice

1. [Estructura de Tests](#estructura-de-tests)
2. [Tests de Feature](#tests-de-feature)
3. [Tests de Unit](#tests-de-unit)
4. [Tests de Integración](#tests-de-integración)
5. [Mocking y Stubbing](#mocking-y-stubbing)
6. [Configuración de Tests](#configuración-de-tests)
7. [Ejecución de Tests](#ejecución-de-tests)
8. [Cobertura de Código](#cobertura-de-código)

## 🧪 Estructura de Tests

### Organización de Archivos

```
tests/
├── Feature/
│   ├── CarRentalTest.php
│   ├── BookingCarsServiceTest.php
│   ├── CarReservationTest.php
│   ├── CarRentalAutocompleteTest.php
│   ├── CarRentalBasicTest.php
│   ├── CarRentalSearchTest.php
│   ├── CarRentalSearchSimpleTest.php
│   └── CarRentalSimpleTest.php
└── Unit/
    └── CarRentalRelationshipsTest.php
```

### Traits Utilizados

```php
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
```

## 🔬 Tests de Feature

### CarRentalTest.php

**Propósito**: Tests principales del módulo de renta de autos

```php
<?php

namespace Tests\Feature;

use App\Models\CarRental;
use App\Models\CarLocation;
use App\Models\CarRate;
use App\Models\CarReservation;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarRentalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            \Database\Seeders\CarRentalSeeder::class,
            \Database\Seeders\CarLocationSeeder::class,
            \Database\Seeders\CarRateSeeder::class,
        ]);
    }

    /** @test */
    public function car_rental_search_page_loads()
    {
        $response = $this->get('/car-rentals/search');
        $response->assertStatus(200);
        $response->assertSee('Buscar Autos de Renta');
    }

    /** @test */
    public function car_rental_models_can_be_created()
    {
        $carRental = CarRental::create([
            'code' => 'TEST',
            'name' => 'Test Rental',
            'status' => 'active'
        ]);

        $this->assertDatabaseHas('car_rentals', [
            'code' => 'TEST',
            'name' => 'Test Rental'
        ]);
    }

    /** @test */
    public function car_rental_relationships_work()
    {
        $carRental = CarRental::first();
        $rate = CarRate::where('rental_code', $carRental->code)->first();
        
        $this->assertTrue($carRental->rates->contains($rate));
        $this->assertEquals($carRental->code, $rate->carRental->code);
    }
}
```

### BookingCarsServiceTest.php

**Propósito**: Tests del servicio de integración con BookingCars API

```php
<?php

namespace Tests\Feature;

use App\Services\BookingCarsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class BookingCarsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('bookingcars_token');
        config(['services.bookingcars.api_key' => 'test_api_key']);
        config(['services.bookingcars.base_url' => 'https://api.bookingcars.com']);
    }

    /** @test */
    public function authenticate_returns_valid_token()
    {
        Http::fake([
            '*/auth/client-token' => Http::response([
                'token' => 'fake-token',
                'expires_in' => 3600
            ], 200),
        ]);

        $service = new BookingCarsService();
        $result = $service->authenticate();

        $this->assertTrue($result['status']);
        $this->assertArrayHasKey('token', $result['data']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function get_locations_returns_results()
    {
        Http::fake([
            '*/auth/client-token' => Http::response(['token' => 'fake-token', 'expires_in' => 3600], 200),
            '*/v1/locations*' => Http::response([
                ['citycode' => 'BOG', 'cityname' => 'Bogotá', 'countryname' => 'Colombia']
            ], 200),
        ]);

        $service = new BookingCarsService();
        $result = $service->getLocations('Bogotá');

        $this->assertTrue($result['status']);
        $this->assertIsArray($result['data']);
        $this->assertCount(1, $result['data']);
    }

    /** @test */
    public function get_availability_returns_rates()
    {
        Http::fake([
            '*/auth/client-token' => Http::response(['token' => 'fake-token', 'expires_in' => 3600], 200),
            '*/v1/rates/availability' => Http::response([
                'request_uuid' => 'test-uuid',
                'rates' => [
                    [
                        'rate_id' => 'rate-001',
                        'name' => 'Test Car',
                        'price' => 100.00,
                        'currency' => 'USD'
                    ]
                ]
            ], 200),
        ]);

        $service = new BookingCarsService();
        $params = [
            'pickup' => ['timestamp' => '2025-10-05T15:30:00', 'location_code' => 'BOG'],
            'dropoff' => ['timestamp' => '2025-10-08T15:30:00', 'location_code' => 'MDE'],
            'destination_city' => 'BOG',
            'point_of_sale' => 'Colombia',
            'destination' => 'CO',
            'currency' => 'USD'
        ];

        $result = $service->getAvailability($params);

        $this->assertTrue($result['status']);
        $this->assertArrayHasKey('rates', $result['data']);
    }
}
```

### CarReservationTest.php

**Propósito**: Tests de funcionalidad de reservas

```php
<?php

namespace Tests\Feature;

use App\Models\CarReservation;
use App\Models\CarRate;
use App\Models\Client;
use App\Services\BookingCarsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CarReservationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            \Database\Seeders\CarRentalSeeder::class,
            \Database\Seeders\CarRateSeeder::class,
        ]);
    }

    /** @test */
    public function create_reservation_saves_to_database()
    {
        $client = Client::factory()->create();
        $rate = CarRate::first();

        $reservation = CarReservation::create([
            'reservation_id_api' => 'res_123456',
            'client_id' => $client->id,
            'rate_id' => $rate->rate_id,
            'pickup_date' => now()->addDays(2),
            'dropoff_date' => now()->addDays(5),
            'pickup_place' => 'Bogotá',
            'dropoff_place' => 'Medellín',
            'price' => 300.00,
            'currency' => 'USD',
            'status' => 'confirmed'
        ]);

        $this->assertDatabaseHas('car_reservations', [
            'reservation_id_api' => 'res_123456',
            'client_id' => $client->id,
            'status' => 'confirmed'
        ]);
    }

    /** @test */
    public function cancel_reservation_changes_status()
    {
        $reservation = CarReservation::factory()->create(['status' => 'confirmed']);
        
        $reservation->update(['status' => 'cancelled']);
        
        $this->assertDatabaseHas('car_reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled'
        ]);
    }
}
```

### CarRentalAutocompleteTest.php

**Propósito**: Tests de funcionalidad de autocomplete

```php
<?php

namespace Tests\Feature;

use App\Livewire\CarRental\SearchCarRental;
use App\Services\BookingCarsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class CarRentalAutocompleteTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function pickup_autocomplete_works_with_valid_query()
    {
        Http::fake([
            '*/auth/client-token' => Http::response(['token' => 'fake-token', 'expires_in' => 3600], 200),
            '*/v1/locations*' => Http::response([
                ['citycode' => 'BOG', 'cityname' => 'Bogotá', 'countryname' => 'Colombia']
            ], 200),
        ]);

        Livewire::test(SearchCarRental::class)
            ->set('pickupQuery', 'Bog')
            ->assertSet('pickupResults', [
                ['citycode' => 'BOG', 'cityname' => 'Bogotá', 'countryname' => 'Colombia']
            ]);
    }

    /** @test */
    public function location_selection_works()
    {
        $location = ['citycode' => 'BOG', 'cityname' => 'Bogotá', 'countryname' => 'Colombia'];

        Livewire::test(SearchCarRental::class)
            ->call('selectPickupLocation', $location)
            ->assertSet('pickupSelected', $location)
            ->assertSet('pickupResults', []);
    }
}
```

## 🔬 Tests de Unit

### CarRentalRelationshipsTest.php

**Propósito**: Tests de relaciones entre modelos

```php
<?php

namespace Tests\Unit;

use App\Models\CarRental;
use App\Models\CarRate;
use App\Models\CarReservation;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarRentalRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function car_rental_has_many_rates()
    {
        $carRental = CarRental::factory()->create();
        $rate1 = CarRate::factory()->create(['rental_code' => $carRental->code]);
        $rate2 = CarRate::factory()->create(['rental_code' => $carRental->code]);

        $this->assertCount(2, $carRental->rates);
        $this->assertTrue($carRental->rates->contains($rate1));
        $this->assertTrue($carRental->rates->contains($rate2));
    }

    /** @test */
    public function car_rate_belongs_to_car_rental()
    {
        $carRental = CarRental::factory()->create();
        $rate = CarRate::factory()->create(['rental_code' => $carRental->code]);

        $this->assertEquals($carRental->id, $rate->carRental->id);
        $this->assertEquals($carRental->code, $rate->carRental->code);
    }

    /** @test */
    public function car_reservation_belongs_to_client()
    {
        $client = Client::factory()->create();
        $reservation = CarReservation::factory()->create(['client_id' => $client->id]);

        $this->assertEquals($client->id, $reservation->client->id);
    }
}
```

## 🔗 Tests de Integración

### Test de Flujo Completo

```php
<?php

namespace Tests\Feature;

use App\Livewire\CarRental\SearchCarRental;
use App\Livewire\CarRental\ListCarResults;
use App\Models\CarRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CarRentalIntegrationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function complete_search_flow_works()
    {
        // 1. Usuario accede a la página de búsqueda
        $this->get('/car-rentals/search')
            ->assertStatus(200)
            ->assertSee('Buscar Autos de Renta');

        // 2. Usuario realiza búsqueda
        Livewire::test(SearchCarRental::class)
            ->set('pickupSelected', ['citycode' => 'BOG', 'cityname' => 'Bogotá'])
            ->set('dropoffSelected', ['citycode' => 'MDE', 'cityname' => 'Medellín'])
            ->set('pickupDate', now()->addDay()->format('Y-m-d\TH:i'))
            ->set('dropoffDate', now()->addDays(3)->format('Y-m-d\TH:i'))
            ->set('currency', 'USD')
            ->call('search')
            ->assertRedirect('/car-rentals/results');

        // 3. Usuario ve resultados
        $this->get('/car-rentals/results')
            ->assertStatus(200)
            ->assertSee('Resultados de Búsqueda');
    }
}
```

## 🎭 Mocking y Stubbing

### HTTP Mocking

```php
use Illuminate\Support\Facades\Http;

// Mock de autenticación
Http::fake([
    '*/auth/client-token' => Http::response([
        'token' => 'fake-token',
        'expires_in' => 3600
    ], 200),
]);

// Mock de búsqueda de ubicaciones
Http::fake([
    '*/v1/locations*' => Http::response([
        ['citycode' => 'BOG', 'cityname' => 'Bogotá', 'countryname' => 'Colombia']
    ], 200),
]);

// Mock de disponibilidad
Http::fake([
    '*/v1/rates/availability' => Http::response([
        'request_uuid' => 'test-uuid',
        'rates' => [
            [
                'rate_id' => 'rate-001',
                'name' => 'Test Car',
                'price' => 100.00,
                'currency' => 'USD'
            ]
        ]
    ], 200),
]);
```

### Cache Mocking

```php
use Illuminate\Support\Facades\Cache;

// Limpiar cache antes del test
Cache::forget('bookingcars_token');

// Verificar que se guardó en cache
Cache::shouldReceive('put')
    ->with('bookingcars_token', 'fake-token', 3600)
    ->once();
```

### Service Mocking

```php
use App\Services\BookingCarsService;
use Mockery;

// Mock del servicio
$mockService = Mockery::mock(BookingCarsService::class);
$mockService->shouldReceive('getLocations')
    ->with('Bogotá')
    ->andReturn([
        'status' => true,
        'data' => [['citycode' => 'BOG', 'cityname' => 'Bogotá']],
        'error' => null
    ]);

$this->app->instance(BookingCarsService::class, $mockService);
```

## ⚙️ Configuración de Tests

### phpunit.xml

```xml
<phpunit>
    <testsuite name="Feature">
        <directory suffix="Test.php">./tests/Feature</directory>
    </testsuite>
    <testsuite name="Unit">
        <directory suffix="Test.php">./tests/Unit</directory>
    </testsuite>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
        <env name="BOOKINGCARS_API_KEY" value="test_key"/>
        <env name="BOOKINGCARS_BASE_URL" value="https://api.test.com"/>
    </php>
</phpunit>
```

### TestCase Base

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Configuración específica para tests
        config(['services.bookingcars.api_key' => 'test_api_key']);
        config(['services.bookingcars.base_url' => 'https://api.test.com']);
    }
}
```

## 🚀 Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests específicos del módulo
php artisan test --filter=CarRental

# Ejecutar tests de feature
php artisan test tests/Feature/

# Ejecutar tests de unit
php artisan test tests/Unit/

# Ejecutar test específico
php artisan test tests/Feature/CarRentalTest.php
```

### Comandos con Opciones

```bash
# Con cobertura de código
php artisan test --coverage

# Con verbose output
php artisan test --verbose

# Parar en el primer fallo
php artisan test --stop-on-failure

# Ejecutar tests en paralelo
php artisan test --parallel
```

### Tests de Integración

```bash
# Tests con base de datos real
php artisan test --env=testing

# Tests con migraciones
php artisan migrate:fresh --seed
php artisan test --filter=CarRental
```

## 📊 Cobertura de Código

### Configuración de Cobertura

```bash
# Instalar Xdebug para cobertura
pecl install xdebug

# Ejecutar con cobertura
php artisan test --coverage --min=80
```

### Archivos de Cobertura

```bash
# Generar reporte HTML
php artisan test --coverage-html coverage/

# Generar reporte Clover
php artisan test --coverage-clover coverage.xml
```

### Métricas de Cobertura

- **Líneas**: > 80%
- **Funciones**: > 90%
- **Clases**: > 85%
- **Métodos**: > 90%

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Base de Datos

```bash
# Limpiar base de datos de test
php artisan migrate:fresh --env=testing
```

#### 2. Error de Cache

```bash
# Limpiar cache de test
php artisan cache:clear --env=testing
```

#### 3. Error de Configuración

```bash
# Limpiar configuración
php artisan config:clear --env=testing
```

#### 4. Error de Livewire

```php
// En el test, asegurar que Livewire esté configurado
use Livewire\Livewire;
use Livewire\Testing\TestableLivewire;
```

### Debug de Tests

```php
// Usar dd() para debug
dd($result);

// Usar dump() para debug sin parar
dump($result);

// Usar assertDump() en Livewire
Livewire::test(SearchCarRental::class)
    ->set('pickupQuery', 'Bog')
    ->assertDump('pickupResults');
```

---

## 📞 Soporte

Para más información sobre testing del módulo de renta de autos, consultar la documentación completa o contactar al equipo de desarrollo.

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025
