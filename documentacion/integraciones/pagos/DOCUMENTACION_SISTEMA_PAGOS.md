# 💳 DOCUMENTACIÓN COMPLETA - SISTEMA DE PAGOS

## 1. ARQUITECTURA GENERAL

**Proveedores de Pago:** Paymentez, PSE, Tarjetas de Crédito  
**Frontend:** Livewire 2.10 + AdminLTE 3.8  
**Base de datos:** MySQL  
**Autenticación:** Laravel Sanctum + Jetstream  
**Seguridad:** PCI DSS Compliance, Tokenización

## 2. CONFIGURACIÓN INICIAL

### Variables de entorno requeridas:
```env
# Paymentez
PAYMENTEZ_APP_CODE=tu_app_code
PAYMENTEZ_APP_KEY=tu_app_key
PAYMENTEZ_URL=https://noccapi.paymentez.com
PAYMENTEZ_ENVIRONMENT=staging

# PSE
PSE_BANK_CODE=1007
PSE_BANK_NAME=BANCO DE BOGOTÁ

# Configuración general
APP_PAYMENT_CURRENCY=COP
APP_PAYMENT_TAX_RATE=19
APP_PAYMENT_FEE_RATE=3.5
```

### Dependencias Composer:
```json
{
    "laravel/framework": "^9.19",
    "livewire/livewire": "^2.10",
    "guzzlehttp/guzzle": "^7.5",
    "stripe/stripe-php": "^10.0"
}
```

## 3. ESTRUCTURA DE BASE DE DATOS

### Tabla principal: `payments`
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    paymentable_type VARCHAR(255) NOT NULL,
    paymentable_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_method ENUM('credit_card', 'pse', 'cash', 'transfer') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    payment_reference VARCHAR(255) NULL,
    payment_provider VARCHAR(50) NOT NULL,
    provider_response JSON NULL,
    failure_reason TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_paymentable (paymentable_type, paymentable_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
);
```

### Tabla: `payment_cards`
```sql
CREATE TABLE payment_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    card_token VARCHAR(255) NOT NULL,
    card_number VARCHAR(4) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_card_token (card_token)
);
```

### Tabla: `payment_transactions`
```sql
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('payment', 'refund', 'void', 'capture') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    provider_transaction_id VARCHAR(255) NULL,
    provider_response JSON NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_type (transaction_type)
);
```

## 4. MODELOS PRINCIPALES

### Payment.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function paymentable()
    {
        return $this->morphTo();
    }
    
    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }
    
    public function cards()
    {
        return $this->hasMany(PaymentCard::class);
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
```

### PaymentCard.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentCard extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
```

## 5. TRAIT DE PAGOS

### PaymentTrait.php
```php
<?php

namespace App\Traits;

use App\Models\Payment;
use App\Models\PaymentCard;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait PaymentTrait
{
    public function processPayment($data)
    {
        try {
            $payment = Payment::create([
                'user_id' => $data['user_id'],
                'paymentable_type' => $data['paymentable_type'],
                'paymentable_id' => $data['paymentable_id'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'COP',
                'payment_method' => $data['payment_method'],
                'payment_provider' => $data['payment_provider'],
                'status' => 'pending'
            ]);

            $result = $this->sendToProvider($payment, $data);
            
            if ($result['success']) {
                $payment->update([
                    'status' => 'completed',
                    'transaction_id' => $result['transaction_id'],
                    'payment_reference' => $result['reference'],
                    'provider_response' => $result['response'],
                    'processed_at' => now()
                ]);

                return [
                    'success' => true,
                    'payment' => $payment,
                    'message' => 'Pago procesado exitosamente'
                ];
            } else {
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => $result['error'],
                    'provider_response' => $result['response']
                ]);

                return [
                    'success' => false,
                    'error' => $result['error']
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment processing error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error interno del servidor'
            ];
        }
    }

    public function sendToProvider($payment, $data)
    {
        switch ($data['payment_provider']) {
            case 'paymentez':
                return $this->processPaymentezPayment($payment, $data);
            case 'pse':
                return $this->processPSEPayment($payment, $data);
            case 'stripe':
                return $this->processStripePayment($payment, $data);
            default:
                return [
                    'success' => false,
                    'error' => 'Proveedor de pago no soportado'
                ];
        }
    }

    public function processPaymentezPayment($payment, $data)
    {
        $authToken = $this->getPaymentezAuthToken();
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->post(env('PAYMENTEZ_URL') . '/v2/card/add', [
            'user' => [
                'id' => $data['user_id'],
                'email' => $data['user_email'],
                'phone' => $data['user_phone']
            ],
            'card' => [
                'number' => $data['card_number'],
                'holder_name' => $data['card_holder'],
                'expiry_month' => $data['expiry_month'],
                'expiry_year' => $data['expiry_year'],
                'cvc' => $data['cvc']
            ]
        ]);

        if ($response->successful()) {
            $responseData = $response->json();
            
            // Guardar tarjeta
            PaymentCard::create([
                'user_id' => $data['user_id'],
                'card_token' => $responseData['card']['token'],
                'card_number' => substr($data['card_number'], -4),
                'card_type' => $responseData['card']['type'],
                'bank_name' => $responseData['card']['bank_name'],
                'expiry_month' => $data['expiry_month'],
                'expiry_year' => $data['expiry_year']
            ]);

            // Procesar pago
            $paymentResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $authToken,
                'Content-Type' => 'application/json'
            ])->post(env('PAYMENTEZ_URL') . '/v2/card/charge', [
                'user' => [
                    'id' => $data['user_id'],
                    'email' => $data['user_email']
                ],
                'order' => [
                    'amount' => $payment->amount,
                    'description' => $data['description'],
                    'dev_reference' => $payment->id,
                    'vat' => $data['vat'] ?? 0
                ],
                'card' => [
                    'token' => $responseData['card']['token']
                ]
            ]);

            if ($paymentResponse->successful()) {
                $paymentData = $paymentResponse->json();
                return [
                    'success' => true,
                    'transaction_id' => $paymentData['transaction']['id'],
                    'reference' => $paymentData['transaction']['dev_reference'],
                    'response' => $paymentData
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $paymentResponse->json()['message'] ?? 'Error en el pago',
                    'response' => $paymentResponse->json()
                ];
            }
        } else {
            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error al procesar la tarjeta',
                'response' => $response->json()
            ];
        }
    }

    public function processPSEPayment($payment, $data)
    {
        // Implementar lógica de PSE
        $response = Http::post(env('APP_TRAVEL') . '/api/pse/payment', [
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'reference' => $payment->id,
            'user_id' => $data['user_id'],
            'bank_code' => $data['bank_code'],
            'account_type' => $data['account_type']
        ]);

        if ($response->successful()) {
            $responseData = $response->json();
            return [
                'success' => true,
                'transaction_id' => $responseData['transaction_id'],
                'reference' => $responseData['reference'],
                'response' => $responseData
            ];
        } else {
            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error en PSE',
                'response' => $response->json()
            ];
        }
    }

    public function getPaymentezAuthToken()
    {
        $timestamp = time();
        $unixtime = $timestamp;
        $app_code = env('PAYMENTEZ_APP_CODE');
        $app_key = env('PAYMENTEZ_APP_KEY');
        $string_to_sign = $app_code . $unixtime;
        $auth_token = hash_hmac('sha256', $string_to_sign, $app_key);

        $response = Http::post(env('PAYMENTEZ_URL') . '/v2/card/add', [
            'app_code' => $app_code,
            'app_key' => $app_key,
            'unixtime' => $unixtime,
            'auth_token' => $auth_token
        ]);

        return $response->json()['auth_token'];
    }

    public function refundPayment($paymentId, $amount = null)
    {
        $payment = Payment::findOrFail($paymentId);
        
        if ($payment->status !== 'completed') {
            return [
                'success' => false,
                'error' => 'Solo se pueden reembolsar pagos completados'
            ];
        }

        $refundAmount = $amount ?? $payment->amount;
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->getPaymentezAuthToken(),
            'Content-Type' => 'application/json'
        ])->post(env('PAYMENTEZ_URL') . '/v2/card/refund', [
            'transaction_id' => $payment->transaction_id,
            'amount' => $refundAmount
        ]);

        if ($response->successful()) {
            $refundData = $response->json();
            
            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'transaction_type' => 'refund',
                'amount' => $refundAmount,
                'currency' => $payment->currency,
                'status' => 'completed',
                'provider_transaction_id' => $refundData['transaction']['id'],
                'provider_response' => $refundData,
                'processed_at' => now()
            ]);

            return [
                'success' => true,
                'refund_id' => $refundData['transaction']['id'],
                'message' => 'Reembolso procesado exitosamente'
            ];
        } else {
            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error en el reembolso'
            ];
        }
    }
}
```

## 6. CONTROLADORES DE API

### PayController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentCard;
use App\Traits\PaymentTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PayController extends Controller
{
    use PaymentTrait;

    public function storeCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_number' => 'required|string|min:13|max:19',
            'card_holder' => 'required|string|max:255',
            'expiry_month' => 'required|integer|between:1,12',
            'expiry_year' => 'required|integer|min:' . date('Y'),
            'cvc' => 'required|string|min:3|max:4',
            'user_email' => 'required|email',
            'user_phone' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->processPayment([
            'user_id' => auth()->id(),
            'paymentable_type' => 'card_storage',
            'paymentable_id' => 0,
            'amount' => 0,
            'currency' => 'COP',
            'payment_method' => 'credit_card',
            'payment_provider' => 'paymentez',
            'card_number' => $request->card_number,
            'card_holder' => $request->card_holder,
            'expiry_month' => $request->expiry_month,
            'expiry_year' => $request->expiry_year,
            'cvc' => $request->cvc,
            'user_email' => $request->user_email,
            'user_phone' => $request->user_phone
        ]);

        return response()->json($result);
    }

    public function getCards(Request $request)
    {
        $cards = PaymentCard::where('user_id', auth()->id())
            ->active()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'cards' => $cards
        ]);
    }

    public function processPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'payment_method' => 'required|in:credit_card,pse,cash,transfer',
            'payment_provider' => 'required|in:paymentez,pse,stripe',
            'description' => 'required|string|max:255',
            'paymentable_type' => 'required|string',
            'paymentable_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->processPayment([
            'user_id' => auth()->id(),
            'paymentable_type' => $request->paymentable_type,
            'paymentable_id' => $request->paymentable_id,
            'amount' => $request->amount,
            'currency' => $request->currency,
            'payment_method' => $request->payment_method,
            'payment_provider' => $request->payment_provider,
            'description' => $request->description,
            'card_token' => $request->card_token,
            'bank_code' => $request->bank_code,
            'account_type' => $request->account_type
        ]);

        return response()->json($result);
    }

    public function refundPayment(Request $request, $paymentId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'nullable|numeric|min:0.01'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->refundPayment($paymentId, $request->amount);

        return response()->json($result);
    }

    public function getPaymentStatus($paymentId)
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'payment' => $payment
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();
        $signature = $request->header('X-Paymentez-Signature');

        if (!$this->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $this->processWebhook($payload);

        return response()->json(['status' => 'success']);
    }

    private function verifyWebhookSignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', json_encode($payload), env('PAYMENTEZ_APP_KEY'));
        return hash_equals($expectedSignature, $signature);
    }

    private function processWebhook($payload)
    {
        $event = $payload['event'];
        $data = $payload['data'];

        switch ($event) {
            case 'payment.completed':
                $this->handlePaymentCompleted($data);
                break;
            case 'payment.failed':
                $this->handlePaymentFailed($data);
                break;
            case 'payment.refunded':
                $this->handlePaymentRefunded($data);
                break;
        }
    }

    private function handlePaymentCompleted($data)
    {
        $payment = Payment::where('transaction_id', $data['transaction']['id'])->first();
        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'processed_at' => now()
            ]);
        }
    }

    private function handlePaymentFailed($data)
    {
        $payment = Payment::where('transaction_id', $data['transaction']['id'])->first();
        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $data['transaction']['message']
            ]);
        }
    }

    private function handlePaymentRefunded($data)
    {
        $payment = Payment::where('transaction_id', $data['transaction']['id'])->first();
        if ($payment) {
            $payment->update(['status' => 'refunded']);
        }
    }
}
```

## 7. COMPONENTES LIVEWIRE

### PaymentForm.php
```php
<?php

namespace App\Http\Livewire\Payment;

use Livewire\Component;
use App\Models\PaymentCard;
use App\Traits\PaymentTrait;
use Illuminate\Support\Facades\Http;

class PaymentForm extends Component
{
    use PaymentTrait;
    
    public $paymentableType;
    public $paymentableId;
    public $amount;
    public $currency = 'COP';
    public $description;
    public $paymentMethod = 'credit_card';
    public $paymentProvider = 'paymentez';
    
    // Datos de tarjeta
    public $cardNumber = '';
    public $cardHolder = '';
    public $expiryMonth = '';
    public $expiryYear = '';
    public $cvc = '';
    public $saveCard = false;
    
    // Tarjetas guardadas
    public $savedCards = [];
    public $selectedCard = '';
    
    // Datos PSE
    public $bankCode = '';
    public $accountType = 'savings';
    public $banks = [];
    
    public $isProcessing = false;
    public $successMessage = '';
    public $errorMessage = '';

    public function mount($paymentableType, $paymentableId, $amount, $description = '')
    {
        $this->paymentableType = $paymentableType;
        $this->paymentableId = $paymentableId;
        $this->amount = $amount;
        $this->description = $description;
        
        $this->loadSavedCards();
        $this->loadBanks();
    }

    public function loadSavedCards()
    {
        $this->savedCards = PaymentCard::where('user_id', auth()->id())
            ->active()
            ->orderBy('is_default', 'desc')
            ->get()
            ->toArray();
    }

    public function loadBanks()
    {
        $this->banks = [
            ['code' => '1007', 'name' => 'BANCO DE BOGOTÁ'],
            ['code' => '1013', 'name' => 'BBVA COLOMBIA'],
            ['code' => '1022', 'name' => 'BANCOLOMBIA'],
            ['code' => '1032', 'name' => 'BANCO DE OCCIDENTE'],
            ['code' => '1052', 'name' => 'BANCO POPULAR']
        ];
    }

    public function processPayment()
    {
        $this->isProcessing = true;
        $this->errorMessage = '';
        $this->successMessage = '';

        try {
            $paymentData = [
                'user_id' => auth()->id(),
                'paymentable_type' => $this->paymentableType,
                'paymentable_id' => $this->paymentableId,
                'amount' => $this->amount,
                'currency' => $this->currency,
                'payment_method' => $this->paymentMethod,
                'payment_provider' => $this->paymentProvider,
                'description' => $this->description
            ];

            if ($this->paymentMethod === 'credit_card') {
                if ($this->selectedCard) {
                    $card = PaymentCard::find($this->selectedCard);
                    $paymentData['card_token'] = $card->card_token;
                } else {
                    $paymentData['card_number'] = $this->cardNumber;
                    $paymentData['card_holder'] = $this->cardHolder;
                    $paymentData['expiry_month'] = $this->expiryMonth;
                    $paymentData['expiry_year'] = $this->expiryYear;
                    $paymentData['cvc'] = $this->cvc;
                    $paymentData['user_email'] = auth()->user()->email;
                    $paymentData['user_phone'] = auth()->user()->phone ?? '';
                }
            } elseif ($this->paymentMethod === 'pse') {
                $paymentData['bank_code'] = $this->bankCode;
                $paymentData['account_type'] = $this->accountType;
            }

            $result = $this->processPayment($paymentData);

            if ($result['success']) {
                $this->successMessage = 'Pago procesado exitosamente';
                $this->emit('paymentCompleted', $result['payment']);
            } else {
                $this->errorMessage = $result['error'];
            }
        } catch (\Exception $e) {
            $this->errorMessage = 'Error interno del servidor';
        }

        $this->isProcessing = false;
    }

    public function updatedPaymentMethod()
    {
        $this->errorMessage = '';
        $this->successMessage = '';
    }

    public function updatedSelectedCard()
    {
        $this->errorMessage = '';
        $this->successMessage = '';
    }

    protected $rules = [
        'cardNumber' => 'required_if:paymentMethod,credit_card|string|min:13|max:19',
        'cardHolder' => 'required_if:paymentMethod,credit_card|string|max:255',
        'expiryMonth' => 'required_if:paymentMethod,credit_card|integer|between:1,12',
        'expiryYear' => 'required_if:paymentMethod,credit_card|integer|min:' . date('Y'),
        'cvc' => 'required_if:paymentMethod,credit_card|string|min:3|max:4',
        'bankCode' => 'required_if:paymentMethod,pse|string',
        'accountType' => 'required_if:paymentMethod,pse|string'
    ];

    public function render()
    {
        return view('livewire.payment.payment-form');
    }
}
```

## 8. RUTAS PRINCIPALES

### routes/api.php
```php
<?php

use App\Http\Controllers\Api\PayController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Gestión de tarjetas
    Route::post('/cards', [PayController::class, 'storeCard']);
    Route::get('/cards', [PayController::class, 'getCards']);
    Route::delete('/cards/{card}', [PayController::class, 'deleteCard']);
    
    // Procesamiento de pagos
    Route::post('/payments', [PayController::class, 'processPayment']);
    Route::get('/payments/{payment}', [PayController::class, 'getPaymentStatus']);
    Route::post('/payments/{payment}/refund', [PayController::class, 'refundPayment']);
    
    // Webhooks
    Route::post('/webhooks/paymentez', [PayController::class, 'webhook']);
});
```

### routes/web.php
```php
<?php

use App\Http\Livewire\Payment\PaymentForm;
use App\Http\Livewire\Payment\PaymentHistory;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/payment/form/{paymentableType}/{paymentableId}', PaymentForm::class)
        ->name('payment.form');
    Route::get('/payment/history', PaymentHistory::class)
        ->name('payment.history');
});
```

## 9. VISTAS BLADE

### payment-form.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Procesar Pago</h2>
        <p class="text-gray-600">Complete la información de pago</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Resumen del pago -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Resumen del Pago</h3>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ $description }}</span>
                <span class="text-2xl font-bold text-blue-600">
                    ${{ number_format($amount, 0, ',', '.') }} {{ $currency }}
                </span>
            </div>
        </div>

        <!-- Selección de método de pago -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">Método de Pago</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                    {{ $paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <input type="radio" wire:model="paymentMethod" value="credit_card" class="mr-3">
                    <div>
                        <div class="font-medium">Tarjeta de Crédito</div>
                        <div class="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                    </div>
                </label>
                
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                    {{ $paymentMethod === 'pse' ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <input type="radio" wire:model="paymentMethod" value="pse" class="mr-3">
                    <div>
                        <div class="font-medium">PSE</div>
                        <div class="text-sm text-gray-500">Pago Seguro en Línea</div>
                    </div>
                </label>
                
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                    {{ $paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <input type="radio" wire:model="paymentMethod" value="cash" class="mr-3">
                    <div>
                        <div class="font-medium">Efectivo</div>
                        <div class="text-sm text-gray-500">Pago en oficina</div>
                    </div>
                </label>
            </div>
        </div>

        @if($paymentMethod === 'credit_card')
            <!-- Formulario de tarjeta -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Información de la Tarjeta</h3>
                
                @if(count($savedCards) > 0)
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tarjetas Guardadas</label>
                        <select wire:model="selectedCard" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Seleccionar tarjeta guardada</option>
                            @foreach($savedCards as $card)
                                <option value="{{ $card['id'] }}">
                                    {{ $card['card_type'] }} ****{{ $card['card_number'] }} - {{ $card['bank_name'] }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                @endif

                @if(!$selectedCard)
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta*</label>
                            <input type="text" wire:model="cardNumber" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="1234 5678 9012 3456">
                            @error('cardNumber') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular*</label>
                            <input type="text" wire:model="cardHolder" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="Juan Pérez">
                            @error('cardHolder') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mes de Vencimiento*</label>
                            <select wire:model="expiryMonth" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Mes</option>
                                @for($i = 1; $i <= 12; $i++)
                                    <option value="{{ $i }}">{{ str_pad($i, 2, '0', STR_PAD_LEFT) }}</option>
                                @endfor
                            </select>
                            @error('expiryMonth') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Año de Vencimiento*</label>
                            <select wire:model="expiryYear" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Año</option>
                                @for($i = date('Y'); $i <= date('Y') + 10; $i++)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                            @error('expiryYear') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CVC*</label>
                            <input type="text" wire:model="cvc" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="123" maxlength="4">
                            @error('cvc') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <label class="flex items-center">
                            <input type="checkbox" wire:model="saveCard" class="mr-2">
                            <span class="text-sm text-gray-700">Guardar tarjeta para futuros pagos</span>
                        </label>
                    </div>
                @endif
            </div>
        @endif

        @if($paymentMethod === 'pse')
            <!-- Formulario PSE -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Información PSE</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Banco*</label>
                        <select wire:model="bankCode" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar banco</option>
                            @foreach($banks as $bank)
                                <option value="{{ $bank['code'] }}">{{ $bank['name'] }}</option>
                            @endforeach
                        </select>
                        @error('bankCode') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta*</label>
                        <select wire:model="accountType" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="savings">Ahorros</option>
                            <option value="checking">Corriente</option>
                        </select>
                        @error('accountType') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                    </div>
                </div>
            </div>
        @endif

        <!-- Botón de pago -->
        <div class="flex justify-end">
            <button wire:click="processPayment" 
                    wire:loading.attr="disabled"
                    class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
                <span wire:loading.remove wire:target="processPayment">
                    Procesar Pago
                </span>
                <span wire:loading wire:target="processPayment">
                    Procesando...
                </span>
            </button>
        </div>

        <!-- Mensajes -->
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
</div>
```

## 10. CONFIGURACIÓN DE SEGURIDAD

### Middleware de validación de pagos
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidatePaymentData
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('post') && $request->is('api/payments*')) {
            $this->validatePaymentRequest($request);
        }

        return $next($request);
    }

    private function validatePaymentRequest(Request $request)
    {
        $rules = [
            'amount' => 'required|numeric|min:0.01|max:999999999.99',
            'currency' => 'required|string|size:3|in:COP,USD,EUR',
            'payment_method' => 'required|string|in:credit_card,pse,cash,transfer',
            'payment_provider' => 'required|string|in:paymentez,pse,stripe'
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }
    }
}
```

### Encriptación de datos sensibles
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class PaymentEncryptionService
{
    public function encryptCardData($cardData)
    {
        return [
            'card_number' => Crypt::encryptString($cardData['card_number']),
            'cvc' => Crypt::encryptString($cardData['cvc']),
            'expiry_month' => $cardData['expiry_month'],
            'expiry_year' => $cardData['expiry_year']
        ];
    }

    public function decryptCardData($encryptedData)
    {
        return [
            'card_number' => Crypt::decryptString($encryptedData['card_number']),
            'cvc' => Crypt::decryptString($encryptedData['cvc']),
            'expiry_month' => $encryptedData['expiry_month'],
            'expiry_year' => $encryptedData['expiry_year']
        ];
    }
}
```

Esta documentación completa del sistema de pagos te permitirá implementar toda la funcionalidad de procesamiento de pagos con múltiples proveedores y métodos de pago de forma segura y eficiente.
