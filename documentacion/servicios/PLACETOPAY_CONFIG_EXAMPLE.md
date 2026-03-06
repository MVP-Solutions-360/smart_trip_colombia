# Configuración de PlaceToPay - Ejemplo

## 🔧 Configuración del Servicio

### 1. Variables de Entorno (.env)

```env
# PlaceToPay Configuration
PLACETOPAY_LOGIN=your_login_here
PLACETOPAY_TRAN_KEY=your_tran_key_here
PLACETOPAY_ENDPOINT=https://checkout-test.placetopay.com/redirection

# Para producción usar:
# PLACETOPAY_ENDPOINT=https://checkout.placetopay.com/redirection
```

### 2. Configuración de Servicios (config/services.php)

```php
<?php

return [
    // ... otras configuraciones existentes ...

    'placetopay' => [
        'login' => env('PLACETOPAY_LOGIN'),
        'tran_key' => env('PLACETOPAY_TRAN_KEY'),
        'endpoint' => env('PLACETOPAY_ENDPOINT'),
        'timeout' => env('PLACETOPAY_TIMEOUT', 45),
        'connect_timeout' => env('PLACETOPAY_CONNECT_TIMEOUT', 30),
    ],
];
```

### 3. Service Provider (opcional)

```php
<?php

namespace App\Providers;

use App\Services\Payment\PlaceToPayService;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(PlaceToPayService::class, function ($app) {
            return new PlaceToPayService(
                config('services.placetopay.login'),
                config('services.placetopay.tran_key'),
                config('services.placetopay.endpoint')
            );
        });
    }
}
```

## 🎯 Ejemplo de Controlador

```php
<?php

namespace App\Http\Controllers;

use App\Services\Payment\PlaceToPayService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PlaceToPayService $placeToPay;

    public function __construct(PlaceToPayService $placeToPay)
    {
        $this->placeToPay = $placeToPay;
    }

    public function create(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|max:255',
            'total' => 'required|numeric|min:1',
            'description' => 'required|string|max:500',
            'buyer_email' => 'required|email',
        ]);

        $result = $this->placeToPay->createSession([
            'reference' => $request->reference,
            'total' => $request->total,
            'description' => $request->description,
            'buyer_email' => $request->buyer_email,
            'return_url' => route('payment.return'),
        ]);

        if ($result['success']) {
            return redirect($result['process_url']);
        }

        return back()->with('error', $result['error']);
    }

    public function return(Request $request)
    {
        $requestId = $request->query('requestId');
        
        if (!$requestId) {
            return redirect()->route('payment.error')
                ->with('error', 'ID de solicitud no encontrado');
        }

        $status = $this->placeToPay->queryTransaction($requestId);

        if ($status['success']) {
            switch ($status['status']) {
                case 'APPROVED':
                    return redirect()->route('payment.success')
                        ->with('message', 'Pago aprobado exitosamente');
                
                case 'PENDING':
                    return redirect()->route('payment.pending')
                        ->with('message', 'Pago pendiente de aprobación');
                
                case 'REJECTED':
                    return redirect()->route('payment.error')
                        ->with('error', 'Pago rechazado');
                
                default:
                    return redirect()->route('payment.error')
                        ->with('error', 'Estado de pago desconocido');
            }
        }

        return redirect()->route('payment.error')
            ->with('error', $status['error']);
    }
}
```

## 🛣️ Rutas de Ejemplo

```php
<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

// Rutas de pago
Route::middleware(['auth'])->group(function () {
    Route::post('/payment/create', [PaymentController::class, 'create'])
        ->name('payment.create');
    
    Route::get('/payment/return', [PaymentController::class, 'return'])
        ->name('payment.return');
    
    Route::get('/payment/success', function () {
        return view('payment.success');
    })->name('payment.success');
    
    Route::get('/payment/pending', function () {
        return view('payment.pending');
    })->name('payment.pending');
    
    Route::get('/payment/error', function () {
        return view('payment.error');
    })->name('payment.error');
});
```

## 📊 Migración de Base de Datos

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('request_id')->nullable();
            $table->string('process_url')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('COP');
            $table->text('description');
            $table->string('buyer_email');
            $table->string('status')->default('PENDING');
            $table->string('return_url');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['reference', 'status']);
            $table->index('request_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_transactions');
    }
}
```

## 🎨 Vistas de Ejemplo

### payment/create.blade.php
```blade
@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Crear Pago</div>
                <div class="card-body">
                    <form action="{{ route('payment.create') }}" method="POST">
                        @csrf
                        
                        <div class="mb-3">
                            <label for="reference" class="form-label">Referencia</label>
                            <input type="text" class="form-control" id="reference" 
                                   name="reference" value="{{ 'PAGO-' . time() }}" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="total" class="form-label">Total (COP)</label>
                            <input type="number" class="form-control" id="total" 
                                   name="total" min="1" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">Descripción</label>
                            <textarea class="form-control" id="description" 
                                      name="description" rows="3" required></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label for="buyer_email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="buyer_email" 
                                   name="buyer_email" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            Proceder al Pago
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
```

### payment/success.blade.php
```blade
@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header text-success">
                    <i class="fas fa-check-circle"></i> Pago Exitoso
                </div>
                <div class="card-body text-center">
                    <h4 class="text-success">¡Pago Aprobado!</h4>
                    <p>Tu pago ha sido procesado exitosamente.</p>
                    
                    @if(session('message'))
                        <div class="alert alert-info">
                            {{ session('message') }}
                        </div>
                    @endif
                    
                    <a href="{{ route('dashboard') }}" class="btn btn-primary">
                        Volver al Dashboard
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
```

## 🔐 Consideraciones de Seguridad

### 1. Validación de Datos
- Siempre validar datos de entrada
- Sanitizar emails y referencias
- Verificar rangos de valores

### 2. Manejo de Errores
- No exponer información sensible en errores
- Log de errores para debugging
- Mensajes de error amigables para usuarios

### 3. Configuración Segura
- Usar variables de entorno para credenciales
- Diferentes endpoints para desarrollo/producción
- Timeouts apropiados para evitar bloqueos

## 📈 Monitoreo y Logs

### Log de Transacciones
```php
Log::info('PlaceToPay Transaction Created', [
    'reference' => $reference,
    'amount' => $amount,
    'buyer_email' => $buyerEmail,
    'request_id' => $requestId
]);
```

### Métricas Recomendadas
- Tasa de éxito de pagos
- Tiempo promedio de procesamiento
- Errores por tipo de validación
- Volumen de transacciones por día

---

**Nota:** Este es un ejemplo de configuración. Ajusta según las necesidades específicas de tu aplicación.
