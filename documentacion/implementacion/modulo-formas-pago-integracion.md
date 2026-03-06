# Módulo de Formas de Pago - Integración con Cotizaciones Públicas

## 📋 Resumen

Este documento describe cómo integrar el futuro módulo de formas de pago de la agencia con el sistema de cotizaciones públicas existente.

## 🗄️ Estructura de Base de Datos

### Tabla: `agency_payment_methods`
```sql
CREATE TABLE agency_payment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agency_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('bank_transfer', 'mobile_payment', 'digital_wallet', 'online_payment', 'cash', 'credit_card', 'international') NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    INDEX idx_agency_active (agency_id, is_active, sort_order)
);
```

### Tabla: `agency_payment_details`
```sql
CREATE TABLE agency_payment_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    field_type ENUM('text', 'number', 'email', 'phone', 'url') DEFAULT 'text',
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (payment_method_id) REFERENCES agency_payment_methods(id) ON DELETE CASCADE,
    INDEX idx_payment_public (payment_method_id, is_public, sort_order)
);
```

## 🏗️ Modelos

### AgencyPaymentMethod
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgencyPaymentMethod extends Model
{
    protected $fillable = [
        'agency_id',
        'name',
        'type',
        'icon',
        'color',
        'is_active',
        'sort_order'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];
    
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }
    
    public function details(): HasMany
    {
        return $this->hasMany(AgencyPaymentDetail::class);
    }
    
    public function publicDetails(): HasMany
    {
        return $this->details()->where('is_public', true)->orderBy('sort_order');
    }
}
```

### AgencyPaymentDetail
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgencyPaymentDetail extends Model
{
    protected $fillable = [
        'payment_method_id',
        'field_name',
        'field_value',
        'field_type',
        'is_public',
        'sort_order'
    ];
    
    protected $casts = [
        'is_public' => 'boolean',
        'sort_order' => 'integer'
    ];
    
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(AgencyPaymentMethod::class);
    }
}
```

## 🔄 Actualización del Modelo Agency

```php
// En app/Models/Agency.php
public function paymentMethods(): HasMany
{
    return $this->hasMany(AgencyPaymentMethod::class);
}

public function activePaymentMethods(): HasMany
{
    return $this->paymentMethods()->where('is_active', true)->orderBy('sort_order');
}
```

## 🎮 Actualización del Controlador

### QuotePublicController@show()
```php
// Cargar formas de pago de la agencia
$request->load([
    'client',
    'agency.paymentMethods.details', // ✅ Nuevo
    'tickets',
    'hotels', 
    'transfers',
    'medicalAssists',
    'user'
]);

// Obtener formas de pago activas
$paymentMethods = $request->agency->activePaymentMethods;

$quoteData = [
    'request' => $request,
    'totalQuoted' => $totalQuoted,
    'totalTravelers' => $totalTravelers,
    'pricePerPerson' => $pricePerPerson,
    'hasServices' => $request->tickets->count() > 0 || 
                   $request->hotels->count() > 0 || 
                   $request->transfers->count() > 0 || 
                   $request->medicalAssists->count() > 0,
    'shareUrl' => route('quotes.public.show', ['request' => $request->slug, 'token' => $token]),
    'shareMessage' => "¡Mira esta increíble propuesta de viaje! {$request->destination} - {$request->departure_date->format('d/m/Y')}",
    'paymentMethods' => $paymentMethods, // ✅ Nuevo
];
```

## 🎨 Actualización de la Vista

### Reemplazar sección hardcodeada en quotes/shared.blade.php

```html
<!-- Formas de pago - Ancho completo -->
<div class="mb-8">
    <div class="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
        <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <i class="fas fa-credit-card text-purple-600 dark:text-purple-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Formas de pago</h3>
        </div>
        
        <div class="payment-methods-grid">
            @forelse($paymentMethods as $method)
                <div class="payment-method-card" onclick="togglePaymentDetails('{{ $method->id }}')">
                    <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg payment-method-item cursor-pointer">
                        <div class="w-8 h-8 bg-{{ $method->color }}-100 dark:bg-{{ $method->color }}-900/30 rounded-full flex items-center justify-center">
                            <i class="{{ $method->icon }} text-{{ $method->color }}-600 dark:text-{{ $method->color }}-400 text-sm payment-icon"></i>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-900 dark:text-white text-sm">{{ $method->name }}</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400">{{ ucfirst(str_replace('_', ' ', $method->type)) }}</p>
                        </div>
                        <div class="text-right">
                            @if($method->publicDetails->first())
                                <p class="text-xs font-mono text-gray-600 dark:text-gray-400">
                                    {{ Str::mask($method->publicDetails->first()->field_value, '*', 4) }}
                                </p>
                            @endif
                            <p class="text-xs text-gray-500 dark:text-gray-500">Disponible</p>
                        </div>
                        <div class="ml-2">
                            <i class="fas fa-chevron-down text-gray-400 text-xs transition-transform duration-200" id="{{ $method->id }}-arrow"></i>
                        </div>
                    </div>
                    
                    <!-- Detalles expandibles -->
                    <div class="payment-details hidden" id="{{ $method->id }}-details">
                        <div class="px-3 pb-3 pt-1 bg-gray-100 dark:bg-gray-700 rounded-b-lg">
                            <div class="space-y-2 text-xs">
                                @foreach($method->publicDetails as $detail)
                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">{{ ucfirst(str_replace('_', ' ', $detail->field_name)) }}:</span>
                                        <span class="text-gray-900 dark:text-white {{ $detail->field_type === 'number' ? 'font-mono' : '' }}">{{ $detail->field_value }}</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-credit-card text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">No hay formas de pago configuradas</p>
                </div>
            @endforelse
        </div>

        <!-- Información adicional de pagos -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div class="text-center">
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <i class="fas fa-shield-alt text-green-500 mr-1"></i>
                    Todos los pagos son seguros y encriptados
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                    Para pagos en efectivo, contacta a tu asesor
                </p>
            </div>
        </div>
    </div>
</div>
```

## 🎨 Actualización de CSS

### Agregar colores dinámicos en quotes-public.css

```css
/* Colores dinámicos para formas de pago */
.payment-method-card .bg-blue-100 { @apply bg-blue-100; }
.payment-method-card .bg-green-100 { @apply bg-green-100; }
.payment-method-card .bg-orange-100 { @apply bg-orange-100; }
.payment-method-card .bg-indigo-100 { @apply bg-indigo-100; }
.payment-method-card .bg-gray-100 { @apply bg-gray-100; }
.payment-method-card .bg-red-100 { @apply bg-red-100; }
.payment-method-card .bg-yellow-100 { @apply bg-yellow-100; }
.payment-method-card .bg-purple-100 { @apply bg-purple-100; }
.payment-method-card .bg-pink-100 { @apply bg-pink-100; }
.payment-method-card .bg-teal-100 { @apply bg-teal-100; }

/* Colores para modo oscuro */
.dark .payment-method-card .bg-blue-900\/30 { @apply bg-blue-900/30; }
.dark .payment-method-card .bg-green-900\/30 { @apply bg-green-900/30; }
.dark .payment-method-card .bg-orange-900\/30 { @apply bg-orange-900/30; }
.dark .payment-method-card .bg-indigo-900\/30 { @apply bg-indigo-900/30; }
.dark .payment-method-card .bg-gray-900\/30 { @apply bg-gray-900/30; }
.dark .payment-method-card .bg-red-900\/30 { @apply bg-red-900/30; }
.dark .payment-method-card .bg-yellow-900\/30 { @apply bg-yellow-900/30; }
.dark .payment-method-card .bg-purple-900\/30 { @apply bg-purple-900/30; }
.dark .payment-method-card .bg-pink-900\/30 { @apply bg-pink-900/30; }
.dark .payment-method-card .bg-teal-900\/30 { @apply bg-teal-900/30; }
```

## 🧪 Testing

### Test de Integración

```php
// tests/Feature/PaymentMethodsIntegrationTest.php
class PaymentMethodsIntegrationTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_payment_methods_display_in_public_quote()
    {
        $agency = Agency::factory()->create();
        $request = Request::factory()->create(['agency_id' => $agency->id]);
        
        // Crear formas de pago
        $bankTransfer = AgencyPaymentMethod::factory()->create([
            'agency_id' => $agency->id,
            'name' => 'Transferencia Bancaria',
            'type' => 'bank_transfer',
            'icon' => 'fas fa-university',
            'color' => 'blue',
            'is_active' => true
        ]);
        
        AgencyPaymentDetail::factory()->create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'banco',
            'field_value' => 'Bancolombia',
            'is_public' => true
        ]);
        
        $response = $this->get("/quote/shared/{$request->slug}/{$request->public_token}");
        
        $response->assertStatus(200);
        $response->assertSee('Transferencia Bancaria');
        $response->assertSee('Bancolombia');
    }
}
```

## 📊 Datos de Ejemplo

### Seeder para Formas de Pago

```php
// database/seeders/AgencyPaymentMethodSeeder.php
class AgencyPaymentMethodSeeder extends Seeder
{
    public function run()
    {
        $agency = Agency::first();
        
        // Transferencia bancaria
        $bankTransfer = AgencyPaymentMethod::create([
            'agency_id' => $agency->id,
            'name' => 'Transferencia Bancaria',
            'type' => 'bank_transfer',
            'icon' => 'fas fa-university',
            'color' => 'blue',
            'is_active' => true,
            'sort_order' => 1
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'a_nombre_de',
            'field_value' => 'Wellezy S.A.S',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 1
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'banco',
            'field_value' => 'Bancolombia',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 2
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'tipo_cuenta',
            'field_value' => 'Ahorros',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 3
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'nit',
            'field_value' => '901450874-9',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 4
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $bankTransfer->id,
            'field_name' => 'numero_cuenta',
            'field_value' => '37900002798',
            'field_type' => 'number',
            'is_public' => true,
            'sort_order' => 5
        ]);
        
        // Nequi
        $nequi = AgencyPaymentMethod::create([
            'agency_id' => $agency->id,
            'name' => 'Nequi',
            'type' => 'mobile_payment',
            'icon' => 'fas fa-mobile-alt',
            'color' => 'green',
            'is_active' => true,
            'sort_order' => 2
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $nequi->id,
            'field_name' => 'numero',
            'field_value' => '3506852261',
            'field_type' => 'phone',
            'is_public' => true,
            'sort_order' => 1
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $nequi->id,
            'field_name' => 'tipo',
            'field_value' => 'Pago móvil',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 2
        ]);
        
        AgencyPaymentDetail::create([
            'payment_method_id' => $nequi->id,
            'field_name' => 'disponibilidad',
            'field_value' => '24/7',
            'field_type' => 'text',
            'is_public' => true,
            'sort_order' => 3
        ]);
    }
}
```

## 🚀 Comandos de Migración

### Crear migraciones

```bash
# Crear migración para formas de pago
php artisan make:migration create_agency_payment_methods_table

# Crear migración para detalles de formas de pago
php artisan make:migration create_agency_payment_details_table

# Crear seeder
php artisan make:seeder AgencyPaymentMethodSeeder
```

### Ejecutar migraciones

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeder
php artisan db:seed --class=AgencyPaymentMethodSeeder
```

## 🔧 Configuración del Módulo

### Rutas del Módulo

```php
// routes/modules/agency-payment-methods.php
Route::middleware(['auth', 'can:manage-agency'])->group(function () {
    Route::resource('agency-payment-methods', AgencyPaymentMethodController::class);
    Route::post('agency-payment-methods/{method}/details', [AgencyPaymentMethodController::class, 'storeDetail']);
    Route::put('agency-payment-methods/{method}/details/{detail}', [AgencyPaymentMethodController::class, 'updateDetail']);
    Route::delete('agency-payment-methods/{method}/details/{detail}', [AgencyPaymentMethodController::class, 'destroyDetail']);
});
```

### Controlador del Módulo

```php
// app/Http/Controllers/AgencyPaymentMethodController.php
class AgencyPaymentMethodController extends Controller
{
    public function index()
    {
        $paymentMethods = auth()->user()->agency->paymentMethods()
            ->with('details')
            ->orderBy('sort_order')
            ->get();
            
        return view('agency.payment-methods.index', compact('paymentMethods'));
    }
    
    public function create()
    {
        return view('agency.payment-methods.create');
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank_transfer,mobile_payment,digital_wallet,online_payment,cash,credit_card,international',
            'icon' => 'required|string|max:50',
            'color' => 'required|string|max:20',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);
        
        $validated['agency_id'] = auth()->user()->agency_id;
        
        $paymentMethod = AgencyPaymentMethod::create($validated);
        
        return redirect()->route('agency-payment-methods.index')
            ->with('success', 'Forma de pago creada exitosamente');
    }
    
    // ... otros métodos
}
```

## 📝 Notas de Implementación

### Consideraciones Importantes

1. **Compatibilidad**: El sistema actual funciona con datos hardcodeados, por lo que la integración debe ser backward compatible.

2. **Performance**: Las formas de pago se cargan con `with('details')` para evitar N+1 queries.

3. **Seguridad**: Solo se muestran detalles marcados como `is_public = true`.

4. **Responsive**: El grid se adapta automáticamente al número de formas de pago.

5. **Fallback**: Si no hay formas de pago configuradas, se muestra un mensaje informativo.

### Próximos Pasos

1. Crear las migraciones
2. Crear los modelos
3. Actualizar el controlador
4. Actualizar la vista
5. Crear el módulo de administración
6. Crear tests
7. Documentar la API

---

*Documentación generada el {{ now()->format('d/m/Y H:i') }}*
*Versión: 1.0.0*
