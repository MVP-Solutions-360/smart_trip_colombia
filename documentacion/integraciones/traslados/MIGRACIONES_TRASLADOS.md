# 🗄️ MIGRACIONES DE BASE DE DATOS - SISTEMA DE TRASLADOS

## 1. MIGRACIÓN PRINCIPAL: transfer_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->enum('transfer_type', ['airport', 'hotel', 'city', 'custom'])->default('airport');
            $table->string('pickup_location', 255);
            $table->string('dropoff_location', 255);
            $table->datetime('pickup_date');
            $table->time('pickup_time');
            $table->integer('passengers');
            $table->integer('luggage')->default(0);
            $table->string('vehicle_type', 100);
            $table->string('vehicle_category', 50);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'in_progress'])->default('pending');
            $table->string('confirmation_number', 255)->nullable();
            $table->string('provider_reference', 255)->nullable();
            $table->unsignedBigInteger('provider_id')->nullable();
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->text('special_requests')->nullable();
            $table->json('passenger_info')->nullable();
            $table->json('driver_info')->nullable();
            $table->json('route_info')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->foreign('provider_id')->references('id')->on('transfer_providers')->onDelete('set null');
            $table->foreign('vehicle_id')->references('id')->on('transfer_vehicles')->onDelete('set null');
            $table->index(['transfer_type', 'status', 'pickup_date']);
            $table->index('confirmation_number');
            $table->index('provider_reference');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_reserves');
    }
};
```

## 2. MIGRACIÓN: transfer_providers

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->string('api_endpoint', 500)->nullable();
            $table->string('api_key', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->integer('response_time')->default(30);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->json('contact_info')->nullable();
            $table->json('service_areas')->nullable();
            $table->text('description')->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->timestamps();

            $table->index('is_active');
            $table->index('rating');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_providers');
    }
};
```

## 3. MIGRACIÓN: transfer_vehicles

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_vehicles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('provider_id');
            $table->string('vehicle_type', 100);
            $table->string('vehicle_category', 50);
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->integer('year')->nullable();
            $table->string('color', 50)->nullable();
            $table->integer('capacity');
            $table->integer('luggage_capacity');
            $table->json('features')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->boolean('is_active')->default(true);
            $table->json('images')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->timestamps();

            $table->foreign('provider_id')->references('id')->on('transfer_providers')->onDelete('cascade');
            $table->index(['provider_id', 'vehicle_type']);
            $table->index(['vehicle_category', 'is_active']);
            $table->index('capacity');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_vehicles');
    }
};
```

## 4. MIGRACIÓN: terrawind_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('terrawind_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->string('terrawind_booking_id', 255);
            $table->string('transfer_id', 255);
            $table->string('status', 50);
            $table->string('confirmation_number', 255)->nullable();
            $table->json('terrawind_response')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('COP');
            $table->timestamp('booking_date')->nullable();
            $table->timestamp('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->unique('terrawind_booking_id');
            $table->index('transfer_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('terrawind_reserves');
    }
};
```

## 5. MIGRACIÓN: transfer_locations

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_locations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->string('type', 50); // airport, hotel, city, landmark
            $table->string('address', 500)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('city');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_locations');
    }
}
```

## 6. MIGRACIÓN: transfer_routes

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_routes', function (Blueprint $table) {
            $table->id();
            $table->string('pickup_location_code', 50);
            $table->string('dropoff_location_code', 50);
            $table->decimal('distance', 8, 2)->nullable();
            $table->integer('duration')->nullable(); // en minutos
            $table->json('route_data')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('pickup_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->foreign('dropoff_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->unique(['pickup_location_code', 'dropoff_location_code']);
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_routes');
    }
};
```

## 7. MIGRACIÓN: transfer_drivers

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_drivers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('provider_id');
            $table->string('name', 255);
            $table->string('phone', 20);
            $table->string('email', 255)->nullable();
            $table->string('license_number', 50);
            $table->date('license_expiry');
            $table->string('vehicle_plate', 20);
            $table->string('vehicle_color', 50);
            $table->string('vehicle_model', 100);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('trips_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('location')->nullable();
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->foreign('provider_id')->references('id')->on('transfer_providers')->onDelete('cascade');
            $table->index(['provider_id', 'is_active']);
            $table->index('license_number');
            $table->index('vehicle_plate');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_drivers');
    }
};
```

## 8. MIGRACIÓN: transfer_tracking

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_tracking', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transfer_reserve_id');
            $table->string('status', 50);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('transfer_reserve_id')->references('id')->on('transfer_reserves')->onDelete('cascade');
            $table->index(['transfer_reserve_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_tracking');
    }
};
```

## 9. MIGRACIÓN: transfer_pricing

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_pricing', function (Blueprint $table) {
            $table->id();
            $table->string('pickup_location_code', 50);
            $table->string('dropoff_location_code', 50);
            $table->string('vehicle_category', 50);
            $table->decimal('base_price', 10, 2);
            $table->decimal('airport_fee', 10, 2)->default(0);
            $table->decimal('toll_fee', 10, 2)->default(0);
            $table->decimal('waiting_fee', 10, 2)->default(0);
            $table->string('currency', 3)->default('COP');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('pickup_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->foreign('dropoff_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->unique(['pickup_location_code', 'dropoff_location_code', 'vehicle_category']);
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_pricing');
    }
};
```

## 10. MIGRACIÓN: transfer_reviews

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transfer_reserve_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('rating', 3, 2);
            $table->text('review')->nullable();
            $table->json('rating_breakdown')->nullable(); // driver, vehicle, service
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            $table->foreign('transfer_reserve_id')->references('id')->on('transfer_reserves')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['transfer_reserve_id', 'rating']);
            $table->index('is_approved');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_reviews');
    }
};
```

## 11. MIGRACIÓN: transfer_search_logs

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_search_logs', function (Blueprint $table) {
            $table->id();
            $table->string('pickup_location_code', 50);
            $table->string('dropoff_location_code', 50);
            $table->date('pickup_date');
            $table->time('pickup_time');
            $table->integer('passengers');
            $table->integer('luggage');
            $table->string('transfer_type', 50);
            $table->json('filters')->nullable();
            $table->integer('results_count')->default(0);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->foreign('pickup_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->foreign('dropoff_location_code')->references('code')->on('transfer_locations')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['pickup_location_code', 'dropoff_location_code', 'pickup_date']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_search_logs');
    }
};
```

## 12. MIGRACIÓN: transfer_modifications

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfer_modifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transfer_reserve_id');
            $table->string('modification_type', 50); // date_change, time_change, location_change
            $table->json('old_data');
            $table->json('new_data');
            $table->decimal('modification_fee', 10, 2)->default(0);
            $table->text('reason')->nullable();
            $table->string('status', 50)->default('pending');
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamps();

            $table->foreign('transfer_reserve_id')->references('id')->on('transfer_reserves')->onDelete('cascade');
            $table->foreign('modified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['transfer_reserve_id', 'modification_type']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfer_modifications');
    }
};
```

## 13. SEEDERS PARA DATOS INICIALES

### Seeder para proveedores:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransferProvider;

class TransferProviderSeeder extends Seeder
{
    public function run()
    {
        $providers = [
            [
                'name' => 'Transfers Colombia',
                'code' => 'TC001',
                'is_active' => true,
                'commission_rate' => 15.0,
                'response_time' => 15,
                'rating' => 4.5,
                'reviews_count' => 120,
                'contact_info' => [
                    'phone' => '+57 1 234 5678',
                    'email' => 'info@transferscolombia.com',
                    'website' => 'https://transferscolombia.com'
                ],
                'service_areas' => ['Bogotá', 'Medellín', 'Cali', 'Cartagena'],
                'description' => 'Servicio de traslados confiable y profesional'
            ],
            [
                'name' => 'Luxury Transfers',
                'code' => 'LT001',
                'is_active' => true,
                'commission_rate' => 20.0,
                'response_time' => 10,
                'rating' => 4.8,
                'reviews_count' => 85,
                'contact_info' => [
                    'phone' => '+57 1 876 5432',
                    'email' => 'info@luxurytransfers.com',
                    'website' => 'https://luxurytransfers.com'
                ],
                'service_areas' => ['Bogotá', 'Medellín', 'Cartagena'],
                'description' => 'Traslados de lujo con vehículos premium'
            ]
        ];

        foreach ($providers as $provider) {
            TransferProvider::create($provider);
        }
    }
}
```

### Seeder para ubicaciones:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransferLocation;

class TransferLocationSeeder extends Seeder
{
    public function run()
    {
        $locations = [
            // Aeropuertos
            ['code' => 'BOG', 'name' => 'Aeropuerto El Dorado - Bogotá', 'type' => 'airport', 'city' => 'Bogotá', 'country' => 'Colombia', 'latitude' => 4.7016, 'longitude' => -74.1469],
            ['code' => 'MDE', 'name' => 'Aeropuerto José María Córdova - Medellín', 'type' => 'airport', 'city' => 'Medellín', 'country' => 'Colombia', 'latitude' => 6.1644, 'longitude' => -75.4231],
            ['code' => 'CLO', 'name' => 'Aeropuerto Alfonso Bonilla Aragón - Cali', 'type' => 'airport', 'city' => 'Cali', 'country' => 'Colombia', 'latitude' => 3.5432, 'longitude' => -76.3815],
            
            // Hoteles principales
            ['code' => 'HOTEL_TEQUENDAMA', 'name' => 'Hotel Tequendama', 'type' => 'hotel', 'city' => 'Bogotá', 'country' => 'Colombia', 'latitude' => 4.6097, 'longitude' => -74.0817],
            ['code' => 'HOTEL_CHARLESTON', 'name' => 'Hotel Charleston', 'type' => 'hotel', 'city' => 'Cartagena', 'country' => 'Colombia', 'latitude' => 10.3919, 'longitude' => -75.4794],
            
            // Centros de ciudad
            ['code' => 'BOG_CENTER', 'name' => 'Centro de Bogotá', 'type' => 'city', 'city' => 'Bogotá', 'country' => 'Colombia', 'latitude' => 4.6097, 'longitude' => -74.0817],
            ['code' => 'MDE_CENTER', 'name' => 'Centro de Medellín', 'type' => 'city', 'city' => 'Medellín', 'country' => 'Colombia', 'latitude' => 6.2442, 'longitude' => -75.5812]
        ];

        foreach ($locations as $location) {
            TransferLocation::create($location);
        }
    }
}
```

### Seeder para vehículos:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransferVehicle;
use App\Models\TransferProvider;

class TransferVehicleSeeder extends Seeder
{
    public function run()
    {
        $providers = TransferProvider::all();
        
        foreach ($providers as $provider) {
            $vehicles = [
                [
                    'provider_id' => $provider->id,
                    'vehicle_type' => 'Sedán',
                    'vehicle_category' => 'Económico',
                    'brand' => 'Toyota',
                    'model' => 'Corolla',
                    'year' => 2023,
                    'color' => 'Blanco',
                    'capacity' => 4,
                    'luggage_capacity' => 2,
                    'features' => ['Aire acondicionado', 'WiFi', 'Conductor profesional'],
                    'base_price' => 70000,
                    'currency' => 'COP',
                    'rating' => 4.3,
                    'reviews_count' => 45
                ],
                [
                    'provider_id' => $provider->id,
                    'vehicle_type' => 'SUV',
                    'vehicle_category' => 'Lujo',
                    'brand' => 'BMW',
                    'model' => 'X5',
                    'year' => 2023,
                    'color' => 'Negro',
                    'capacity' => 6,
                    'luggage_capacity' => 4,
                    'features' => ['Aire acondicionado', 'WiFi', 'Conductor profesional', 'Agua', 'Snacks'],
                    'base_price' => 120000,
                    'currency' => 'COP',
                    'rating' => 4.8,
                    'reviews_count' => 32
                ]
            ];

            foreach ($vehicles as $vehicle) {
                TransferVehicle::create($vehicle);
            }
        }
    }
}
```

## 14. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN

```php
// En la migración de transfer_reserves
$table->index(['pickup_date', 'status', 'transfer_type']);
$table->index(['provider_id', 'status', 'created_at']);
$table->index(['vehicle_type', 'vehicle_category']);

// En la migración de transfer_providers
$table->index(['is_active', 'rating']);
$table->index(['commission_rate', 'is_active']);

// En la migración de transfer_vehicles
$table->index(['vehicle_type', 'vehicle_category', 'is_active']);
$table->index(['capacity', 'luggage_capacity']);

// En la migración de transfer_tracking
$table->index(['transfer_reserve_id', 'created_at']);
$table->index(['status', 'created_at']);
```

## 15. COMANDO PARA EJECUTAR MIGRACIONES

```bash
# Ejecutar todas las migraciones
php artisan migrate

# Ejecutar migraciones específicas
php artisan migrate --path=database/migrations/2024_01_01_000001_create_transfer_reserves_table.php

# Rollback de migraciones
php artisan migrate:rollback

# Ejecutar seeders
php artisan db:seed --class=TransferProviderSeeder
php artisan db:seed --class=TransferLocationSeeder
php artisan db:seed --class=TransferVehicleSeeder
```

## 16. POLÍTICAS DE SEGURIDAD

### Encriptación de datos sensibles:
```php
// En el modelo TransferReserve
protected $casts = [
    'passenger_info' => 'encrypted:json',
    'driver_info' => 'encrypted:json',
    'route_info' => 'encrypted:json'
];

// En el modelo TransferDriver
protected $casts = [
    'license_number' => 'encrypted',
    'phone' => 'encrypted',
    'email' => 'encrypted'
];
```

### Soft deletes para auditoría:
```php
// Agregar a las migraciones principales
$table->softDeletes();

// En los modelos
use Illuminate\Database\Eloquent\SoftDeletes;

class TransferReserve extends Model
{
    use SoftDeletes;
    // ...
}
```

Esta documentación completa de migraciones para el sistema de traslados te permitirá crear toda la estructura de base de datos necesaria para manejar traslados de forma eficiente y escalable.
