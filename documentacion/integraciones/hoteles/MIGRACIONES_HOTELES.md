# 🗄️ MIGRACIONES DE BASE DE DATOS - SISTEMA DE HOTELES

## 1. MIGRACIÓN PRINCIPAL: hotel_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->string('hotel_code', 255);
            $table->string('hotel_name', 255);
            $table->string('city_code', 255);
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('rooms');
            $table->integer('adults');
            $table->integer('children');
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'modified'])->default('pending');
            $table->string('confirmation_number', 255)->nullable();
            $table->text('special_requests')->nullable();
            $table->json('guest_info')->nullable();
            $table->json('room_details')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->index(['hotel_code', 'check_in', 'check_out']);
            $table->index('status');
            $table->index('confirmation_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_reserves');
    }
};
```

## 2. MIGRACIÓN: hotel_distribution_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_distribution_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hotel_reserve_id');
            $table->string('room_type', 255);
            $table->string('room_description', 500)->nullable();
            $table->decimal('room_rate', 10, 2);
            $table->integer('room_occupancy');
            $table->integer('room_quantity')->default(1);
            $table->decimal('total_rate', 10, 2);
            $table->json('room_amenities')->nullable();
            $table->string('bed_type', 100)->nullable();
            $table->boolean('smoking_allowed')->default(false);
            $table->timestamps();

            $table->foreign('hotel_reserve_id')->references('id')->on('hotel_reserves')->onDelete('cascade');
            $table->index('room_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_distribution_reserves');
    }
};
```

## 3. MIGRACIÓN: restel_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('restel_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->string('restel_booking_id', 255);
            $table->string('hotel_code', 255);
            $table->string('status', 50);
            $table->string('confirmation_number', 255)->nullable();
            $table->json('restel_response')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('COP');
            $table->timestamp('booking_date')->nullable();
            $table->timestamp('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->unique('restel_booking_id');
            $table->index('hotel_code');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('restel_reserves');
    }
};
```

## 4. MIGRACIÓN: hotel_amenities

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_amenities', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->string('description', 500)->nullable();
            $table->string('icon', 100)->nullable();
            $table->string('category', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_amenities');
    }
};
```

## 5. MIGRACIÓN: hotel_room_types

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_room_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->string('description', 500)->nullable();
            $table->integer('max_occupancy');
            $table->integer('max_adults');
            $table->integer('max_children');
            $table->decimal('base_rate', 10, 2)->nullable();
            $table->string('currency', 3)->default('COP');
            $table->json('amenities')->nullable();
            $table->string('bed_type', 100)->nullable();
            $table->integer('room_size')->nullable(); // en metros cuadrados
            $table->boolean('smoking_allowed')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('max_occupancy');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_room_types');
    }
};
```

## 6. MIGRACIÓN: hotel_cities

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_cities', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name', 255);
            $table->string('country_code', 3);
            $table->string('state', 255)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('timezone', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('country_code');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_cities');
    }
};
```

## 7. MIGRACIÓN: hotel_countries

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_countries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name', 255);
            $table->string('currency', 3);
            $table->string('timezone', 50)->nullable();
            $table->string('phone_code', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_countries');
    }
};
```

## 8. MIGRACIÓN: hotel_policies

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_policies', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_code', 255);
            $table->string('policy_type', 50); // cancellation, check_in, check_out, pets, smoking
            $table->text('policy_description');
            $table->json('policy_rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('hotel_code')->references('code')->on('hotels')->onDelete('cascade');
            $table->index(['hotel_code', 'policy_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_policies');
    }
};
```

## 9. MIGRACIÓN: hotel_images

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_images', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_code', 255);
            $table->string('image_url', 500);
            $table->string('image_type', 50); // main, room, amenity, exterior
            $table->string('room_type', 50)->nullable();
            $table->string('description', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('hotel_code')->references('code')->on('hotels')->onDelete('cascade');
            $table->index(['hotel_code', 'image_type']);
            $table->index('sort_order');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_images');
    }
};
```

## 10. MIGRACIÓN: hotel_ratings

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_ratings', function (Blueprint $table) {
            $table->id();
            $table->string('hotel_code', 255);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('rating', 2, 1); // 1.0 a 5.0
            $table->text('review')->nullable();
            $table->json('rating_breakdown')->nullable(); // cleanliness, service, location, value
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            $table->foreign('hotel_code')->references('code')->on('hotels')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['hotel_code', 'rating']);
            $table->index('is_approved');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_ratings');
    }
};
```

## 11. MIGRACIÓN: hotel_search_logs

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_search_logs', function (Blueprint $table) {
            $table->id();
            $table->string('city_code', 10);
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('rooms');
            $table->integer('adults');
            $table->integer('children');
            $table->json('filters')->nullable();
            $table->integer('results_count')->default(0);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->foreign('city_code')->references('code')->on('hotel_cities')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['city_code', 'check_in', 'check_out']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_search_logs');
    }
};
```

## 12. MIGRACIÓN: hotel_booking_modifications

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotel_booking_modifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hotel_reserve_id');
            $table->string('modification_type', 50); // date_change, room_change, guest_change
            $table->json('old_data');
            $table->json('new_data');
            $table->decimal('modification_fee', 10, 2)->default(0);
            $table->text('reason')->nullable();
            $table->string('status', 50)->default('pending');
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamps();

            $table->foreign('hotel_reserve_id')->references('id')->on('hotel_reserves')->onDelete('cascade');
            $table->foreign('modified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['hotel_reserve_id', 'modification_type']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotel_booking_modifications');
    }
};
```

## 13. SEEDERS PARA DATOS INICIALES

### Seeder para países:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HotelCountry;

class HotelCountrySeeder extends Seeder
{
    public function run()
    {
        $countries = [
            ['code' => 'CO', 'name' => 'Colombia', 'currency' => 'COP', 'timezone' => 'America/Bogota', 'phone_code' => '+57'],
            ['code' => 'MX', 'name' => 'México', 'currency' => 'MXN', 'timezone' => 'America/Mexico_City', 'phone_code' => '+52'],
            ['code' => 'AR', 'name' => 'Argentina', 'currency' => 'ARS', 'timezone' => 'America/Argentina/Buenos_Aires', 'phone_code' => '+54'],
            ['code' => 'BR', 'name' => 'Brasil', 'currency' => 'BRL', 'timezone' => 'America/Sao_Paulo', 'phone_code' => '+55'],
            ['code' => 'PE', 'name' => 'Perú', 'currency' => 'PEN', 'timezone' => 'America/Lima', 'phone_code' => '+51'],
        ];

        foreach ($countries as $country) {
            HotelCountry::create($country);
        }
    }
}
```

### Seeder para ciudades:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HotelCity;

class HotelCitySeeder extends Seeder
{
    public function run()
    {
        $cities = [
            ['code' => 'BOG', 'name' => 'Bogotá', 'country_code' => 'CO', 'state' => 'Cundinamarca', 'latitude' => 4.6097100, 'longitude' => -74.0817500, 'timezone' => 'America/Bogota'],
            ['code' => 'MDE', 'name' => 'Medellín', 'country_code' => 'CO', 'state' => 'Antioquia', 'latitude' => 6.2442000, 'longitude' => -75.5812000, 'timezone' => 'America/Bogota'],
            ['code' => 'CLO', 'name' => 'Cali', 'country_code' => 'CO', 'state' => 'Valle del Cauca', 'latitude' => 3.4372200, 'longitude' => -76.5225000, 'timezone' => 'America/Bogota'],
            ['code' => 'MEX', 'name' => 'Ciudad de México', 'country_code' => 'MX', 'state' => 'CDMX', 'latitude' => 19.4326000, 'longitude' => -99.1332000, 'timezone' => 'America/Mexico_City'],
            ['code' => 'BUE', 'name' => 'Buenos Aires', 'country_code' => 'AR', 'state' => 'Buenos Aires', 'latitude' => -34.6118000, 'longitude' => -58.3960000, 'timezone' => 'America/Argentina/Buenos_Aires'],
        ];

        foreach ($cities as $city) {
            HotelCity::create($city);
        }
    }
}
```

### Seeder para amenidades:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HotelAmenity;

class HotelAmenitySeeder extends Seeder
{
    public function run()
    {
        $amenities = [
            ['code' => 'wifi', 'name' => 'WiFi Gratuito', 'description' => 'Acceso a internet inalámbrico', 'icon' => 'wifi', 'category' => 'internet'],
            ['code' => 'pool', 'name' => 'Piscina', 'description' => 'Piscina disponible para huéspedes', 'icon' => 'pool', 'category' => 'recreation'],
            ['code' => 'gym', 'name' => 'Gimnasio', 'description' => 'Gimnasio equipado', 'icon' => 'fitness', 'category' => 'recreation'],
            ['code' => 'spa', 'name' => 'Spa', 'description' => 'Servicios de spa y relajación', 'icon' => 'spa', 'category' => 'wellness'],
            ['code' => 'restaurant', 'name' => 'Restaurante', 'description' => 'Restaurante en el hotel', 'icon' => 'restaurant', 'category' => 'dining'],
            ['code' => 'parking', 'name' => 'Estacionamiento', 'description' => 'Estacionamiento gratuito', 'icon' => 'parking', 'category' => 'transportation'],
            ['code' => 'airport_shuttle', 'name' => 'Transporte al Aeropuerto', 'description' => 'Servicio de transporte al aeropuerto', 'icon' => 'airport', 'category' => 'transportation'],
            ['code' => 'business_center', 'name' => 'Centro de Negocios', 'description' => 'Centro de negocios con computadoras', 'icon' => 'business', 'category' => 'business'],
            ['code' => 'concierge', 'name' => 'Conserjería', 'description' => 'Servicio de conserjería 24/7', 'icon' => 'concierge', 'category' => 'service'],
            ['code' => 'room_service', 'name' => 'Servicio a la Habitación', 'description' => 'Servicio de comida a la habitación', 'icon' => 'room_service', 'category' => 'dining'],
        ];

        foreach ($amenities as $amenity) {
            HotelAmenity::create($amenity);
        }
    }
}
```

## 14. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN

```php
// En la migración de hotel_reserves
$table->index(['check_in', 'check_out', 'status']);
$table->index(['hotel_code', 'status', 'created_at']);
$table->index(['total_amount', 'currency']);

// En la migración de restel_reserves
$table->index(['status', 'booking_date']);
$table->index(['hotel_code', 'status', 'created_at']);

// En la migración de hotel_search_logs
$table->index(['user_id', 'created_at']);
$table->index(['city_code', 'created_at']);
```

## 15. COMANDO PARA EJECUTAR MIGRACIONES

```bash
# Ejecutar todas las migraciones
php artisan migrate

# Ejecutar migraciones específicas
php artisan migrate --path=database/migrations/2024_01_01_000001_create_hotel_reserves_table.php

# Rollback de migraciones
php artisan migrate:rollback

# Ejecutar seeders
php artisan db:seed --class=HotelCountrySeeder
php artisan db:seed --class=HotelCitySeeder
php artisan db:seed --class=HotelAmenitySeeder
```

Esta documentación completa de migraciones te permitirá crear toda la estructura de base de datos necesaria para el sistema de hoteles con integración Restel.
