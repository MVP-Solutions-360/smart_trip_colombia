# 🗄️ MIGRACIONES DE BASE DE DATOS - SISTEMA DE PAGOS

## 1. MIGRACIÓN PRINCIPAL: payments

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('paymentable_type');
            $table->unsignedBigInteger('paymentable_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('payment_method', ['credit_card', 'pse', 'cash', 'transfer', 'crypto'])->default('credit_card');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_provider', 50);
            $table->json('provider_response')->nullable();
            $table->text('failure_reason')->nullable();
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['paymentable_type', 'paymentable_id']);
            $table->index('status');
            $table->index('transaction_id');
            $table->index('payment_reference');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
```

## 2. MIGRACIÓN: payment_cards

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_cards', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('card_token', 255);
            $table->string('card_number', 4);
            $table->string('card_type', 50);
            $table->string('bank_name', 100);
            $table->integer('expiry_month');
            $table->integer('expiry_year');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('holder_name', 255)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
            $table->index('card_token');
            $table->index('is_active');
            $table->index('is_default');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_cards');
    }
};
```

## 3. MIGRACIÓN: payment_transactions

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id');
            $table->enum('transaction_type', ['payment', 'refund', 'void', 'capture', 'partial_refund'])->default('payment');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('provider_transaction_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            $table->index('payment_id');
            $table->index('transaction_type');
            $table->index('status');
            $table->index('provider_transaction_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_transactions');
    }
};
```

## 4. MIGRACIÓN: payment_webhooks

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50);
            $table->string('event_type', 100);
            $table->json('payload');
            $table->string('signature', 255)->nullable();
            $table->boolean('processed')->default(false);
            $table->text('processing_error')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('provider');
            $table->index('event_type');
            $table->index('processed');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_webhooks');
    }
};
```

## 5. MIGRACIÓN: payment_refunds

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_refunds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id');
            $table->string('refund_reference', 255);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('provider_refund_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->text('reason')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            $table->index('payment_id');
            $table->index('refund_reference');
            $table->index('status');
            $table->index('provider_refund_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_refunds');
    }
};
```

## 6. MIGRACIÓN: payment_methods

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->string('description', 500)->nullable();
            $table->string('provider', 50);
            $table->boolean('is_active')->default(true);
            $table->decimal('fee_percentage', 5, 2)->default(0);
            $table->decimal('fee_fixed', 10, 2)->default(0);
            $table->json('configuration')->nullable();
            $table->json('supported_currencies')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('provider');
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_methods');
    }
};
```

## 7. MIGRACIÓN: payment_currencies

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name', 255);
            $table->string('symbol', 10);
            $table->integer('decimal_places')->default(2);
            $table->decimal('exchange_rate', 15, 6)->default(1);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('is_active');
            $table->index('is_default');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_currencies');
    }
};
```

## 8. MIGRACIÓN: payment_fees

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_fees', function (Blueprint $table) {
            $table->id();
            $table->string('payment_method', 50);
            $table->string('currency', 3);
            $table->decimal('fee_percentage', 5, 2)->default(0);
            $table->decimal('fee_fixed', 10, 2)->default(0);
            $table->decimal('min_amount', 10, 2)->default(0);
            $table->decimal('max_amount', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['payment_method', 'currency']);
            $table->index('payment_method');
            $table->index('currency');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_fees');
    }
};
```

## 9. MIGRACIÓN: payment_limits

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_limits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('payment_method', 50);
            $table->string('currency', 3);
            $table->decimal('daily_limit', 10, 2)->default(0);
            $table->decimal('monthly_limit', 10, 2)->default(0);
            $table->decimal('transaction_limit', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
            $table->index('payment_method');
            $table->index('currency');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_limits');
    }
};
```

## 10. MIGRACIÓN: payment_audit_logs

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 100);
            $table->string('old_status', 50)->nullable();
            $table->string('new_status', 50)->nullable();
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index('payment_id');
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_audit_logs');
    }
};
```

## 11. MIGRACIÓN: payment_notifications

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id');
            $table->string('type', 50); // email, sms, push
            $table->string('recipient', 255);
            $table->string('subject', 255)->nullable();
            $table->text('message');
            $table->enum('status', ['pending', 'sent', 'failed', 'delivered'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            $table->index('payment_id');
            $table->index('type');
            $table->index('status');
            $table->index('sent_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_notifications');
    }
};
```

## 12. MIGRACIÓN: payment_analytics

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('payment_method', 50);
            $table->string('currency', 3);
            $table->integer('total_transactions');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('successful_amount', 15, 2);
            $table->decimal('failed_amount', 15, 2);
            $table->decimal('refunded_amount', 15, 2);
            $table->decimal('average_transaction', 10, 2);
            $table->decimal('success_rate', 5, 2);
            $table->timestamps();

            $table->unique(['date', 'payment_method', 'currency']);
            $table->index('date');
            $table->index('payment_method');
            $table->index('currency');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_analytics');
    }
};
```

## 13. SEEDERS PARA DATOS INICIALES

### Seeder para métodos de pago:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    public function run()
    {
        $methods = [
            [
                'code' => 'credit_card',
                'name' => 'Tarjeta de Crédito',
                'description' => 'Pago con tarjeta de crédito Visa, Mastercard, American Express',
                'provider' => 'paymentez',
                'is_active' => true,
                'fee_percentage' => 3.5,
                'fee_fixed' => 0,
                'supported_currencies' => ['COP', 'USD'],
                'sort_order' => 1
            ],
            [
                'code' => 'pse',
                'name' => 'PSE',
                'description' => 'Pago Seguro en Línea desde cuenta bancaria',
                'provider' => 'pse',
                'is_active' => true,
                'fee_percentage' => 2.0,
                'fee_fixed' => 0,
                'supported_currencies' => ['COP'],
                'sort_order' => 2
            ],
            [
                'code' => 'cash',
                'name' => 'Efectivo',
                'description' => 'Pago en efectivo en oficina',
                'provider' => 'manual',
                'is_active' => true,
                'fee_percentage' => 0,
                'fee_fixed' => 0,
                'supported_currencies' => ['COP'],
                'sort_order' => 3
            ],
            [
                'code' => 'transfer',
                'name' => 'Transferencia Bancaria',
                'description' => 'Transferencia bancaria directa',
                'provider' => 'manual',
                'is_active' => true,
                'fee_percentage' => 0,
                'fee_fixed' => 0,
                'supported_currencies' => ['COP', 'USD'],
                'sort_order' => 4
            ]
        ];

        foreach ($methods as $method) {
            PaymentMethod::create($method);
        }
    }
}
```

### Seeder para monedas:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentCurrency;

class PaymentCurrencySeeder extends Seeder
{
    public function run()
    {
        $currencies = [
            [
                'code' => 'COP',
                'name' => 'Peso Colombiano',
                'symbol' => '$',
                'decimal_places' => 0,
                'exchange_rate' => 1.0,
                'is_active' => true,
                'is_default' => true
            ],
            [
                'code' => 'USD',
                'name' => 'Dólar Estadounidense',
                'symbol' => '$',
                'decimal_places' => 2,
                'exchange_rate' => 0.00025,
                'is_active' => true,
                'is_default' => false
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'decimal_places' => 2,
                'exchange_rate' => 0.00023,
                'is_active' => true,
                'is_default' => false
            ]
        ];

        foreach ($currencies as $currency) {
            PaymentCurrency::create($currency);
        }
    }
}
```

### Seeder para comisiones:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentFee;

class PaymentFeeSeeder extends Seeder
{
    public function run()
    {
        $fees = [
            // Tarjeta de crédito
            ['payment_method' => 'credit_card', 'currency' => 'COP', 'fee_percentage' => 3.5, 'fee_fixed' => 0, 'min_amount' => 1000, 'max_amount' => 50000000],
            ['payment_method' => 'credit_card', 'currency' => 'USD', 'fee_percentage' => 3.5, 'fee_fixed' => 0, 'min_amount' => 1, 'max_amount' => 10000],
            
            // PSE
            ['payment_method' => 'pse', 'currency' => 'COP', 'fee_percentage' => 2.0, 'fee_fixed' => 0, 'min_amount' => 1000, 'max_amount' => 20000000],
            
            // Efectivo
            ['payment_method' => 'cash', 'currency' => 'COP', 'fee_percentage' => 0, 'fee_fixed' => 0, 'min_amount' => 1000, 'max_amount' => 10000000],
            
            // Transferencia
            ['payment_method' => 'transfer', 'currency' => 'COP', 'fee_percentage' => 0, 'fee_fixed' => 0, 'min_amount' => 1000, 'max_amount' => 100000000],
            ['payment_method' => 'transfer', 'currency' => 'USD', 'fee_percentage' => 0, 'fee_fixed' => 0, 'min_amount' => 1, 'max_amount' => 50000]
        ];

        foreach ($fees as $fee) {
            PaymentFee::create($fee);
        }
    }
}
```

## 14. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN

```php
// En la migración de payments
$table->index(['user_id', 'status', 'created_at']);
$table->index(['payment_method', 'status', 'created_at']);
$table->index(['payment_provider', 'status', 'created_at']);
$table->index(['amount', 'currency', 'status']);

// En la migración de payment_cards
$table->index(['user_id', 'is_active', 'is_default']);
$table->index(['card_type', 'is_active']);

// En la migración de payment_transactions
$table->index(['payment_id', 'transaction_type', 'status']);
$table->index(['provider_transaction_id', 'status']);

// En la migración de payment_webhooks
$table->index(['provider', 'event_type', 'processed']);
$table->index(['processed', 'created_at']);

// En la migración de payment_analytics
$table->index(['date', 'payment_method']);
$table->index(['date', 'currency']);
```

## 15. COMANDO PARA EJECUTAR MIGRACIONES

```bash
# Ejecutar todas las migraciones
php artisan migrate

# Ejecutar migraciones específicas
php artisan migrate --path=database/migrations/2024_01_01_000001_create_payments_table.php

# Rollback de migraciones
php artisan migrate:rollback

# Ejecutar seeders
php artisan db:seed --class=PaymentMethodSeeder
php artisan db:seed --class=PaymentCurrencySeeder
php artisan db:seed --class=PaymentFeeSeeder
```

## 16. POLÍTICAS DE SEGURIDAD

### Encriptación de datos sensibles:
```php
// En el modelo Payment
protected $casts = [
    'provider_response' => 'encrypted:json',
    'failure_reason' => 'encrypted'
];

// En el modelo PaymentCard
protected $casts = [
    'card_token' => 'encrypted',
    'metadata' => 'encrypted:json'
];
```

### Soft deletes para auditoría:
```php
// Agregar a las migraciones principales
$table->softDeletes();

// En los modelos
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;
    // ...
}
```

Esta documentación completa de migraciones para el sistema de pagos te permitirá crear toda la estructura de base de datos necesaria para manejar pagos de forma segura y eficiente.
