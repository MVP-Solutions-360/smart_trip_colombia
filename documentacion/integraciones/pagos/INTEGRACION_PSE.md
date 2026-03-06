# 🏦 INTEGRACIÓN PSE COMPLETA

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
PSE_BANK_CODE=1007
PSE_BANK_NAME=BANCO DE BOGOTÁ
PSE_API_URL=https://api.pse.com.co
PSE_MERCHANT_ID=tu_merchant_id
PSE_API_KEY=tu_api_key
PSE_RETURN_URL=https://tu-dominio.com/pse/return
PSE_CONFIRMATION_URL=https://tu-dominio.com/pse/confirmation
```

### Configuración en config/services.php:
```php
<?php

return [
    'pse' => [
        'bank_code' => env('PSE_BANK_CODE'),
        'bank_name' => env('PSE_BANK_NAME'),
        'api_url' => env('PSE_API_URL'),
        'merchant_id' => env('PSE_MERCHANT_ID'),
        'api_key' => env('PSE_API_KEY'),
        'return_url' => env('PSE_RETURN_URL'),
        'confirmation_url' => env('PSE_CONFIRMATION_URL'),
    ],
];
```

## 2. SERVICIO PSE

### PSEService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PSEService
{
    private $bankCode;
    private $bankName;
    private $apiUrl;
    private $merchantId;
    private $apiKey;
    private $returnUrl;
    private $confirmationUrl;

    public function __construct()
    {
        $this->bankCode = config('services.pse.bank_code');
        $this->bankName = config('services.pse.bank_name');
        $this->apiUrl = config('services.pse.api_url');
        $this->merchantId = config('services.pse.merchant_id');
        $this->apiKey = config('services.pse.api_key');
        $this->returnUrl = config('services.pse.return_url');
        $this->confirmationUrl = config('services.pse.confirmation_url');
    }

    public function getBanks()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->get($this->apiUrl . '/banks');

        if ($response->successful()) {
            return [
                'success' => true,
                'banks' => $response->json()['data']
            ];
        }

        return [
            'success' => false,
            'error' => 'Error obteniendo bancos'
        ];
    }

    public function createPayment($paymentData)
    {
        $payload = [
            'merchant_id' => $this->merchantId,
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'] ?? 'COP',
            'reference' => $paymentData['reference'],
            'description' => $paymentData['description'],
            'customer' => [
                'name' => $paymentData['customer_name'],
                'email' => $paymentData['customer_email'],
                'phone' => $paymentData['customer_phone'] ?? '',
                'document' => $paymentData['customer_document'] ?? ''
            ],
            'bank' => [
                'code' => $paymentData['bank_code'],
                'name' => $paymentData['bank_name']
            ],
            'account_type' => $paymentData['account_type'] ?? 'savings',
            'return_url' => $this->returnUrl,
            'confirmation_url' => $this->confirmationUrl,
            'metadata' => $paymentData['metadata'] ?? []
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->post($this->apiUrl . '/payments', $payload);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'success' => true,
                'payment_id' => $data['payment_id'],
                'redirect_url' => $data['redirect_url'],
                'status' => $data['status'],
                'response' => $data
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error creando pago PSE',
            'response' => $response->json()
        ];
    }

    public function getPaymentStatus($paymentId)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->get($this->apiUrl . '/payments/' . $paymentId);

        if ($response->successful()) {
            return [
                'success' => true,
                'payment' => $response->json()['data']
            ];
        }

        return [
            'success' => false,
            'error' => 'Error consultando estado del pago'
        ];
    }

    public function cancelPayment($paymentId)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->post($this->apiUrl . '/payments/' . $paymentId . '/cancel');

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'Pago cancelado exitosamente'
            ];
        }

        return [
            'success' => false,
            'error' => 'Error cancelando pago'
        ];
    }

    public function processWebhook($payload)
    {
        $event = $payload['event'];
        $data = $payload['data'];

        Log::info('PSE Webhook received', [
            'event' => $event,
            'data' => $data
        ]);

        switch ($event) {
            case 'payment.completed':
                return $this->handlePaymentCompleted($data);
            case 'payment.failed':
                return $this->handlePaymentFailed($data);
            case 'payment.cancelled':
                return $this->handlePaymentCancelled($data);
            default:
                Log::warning('Unknown PSE webhook event', ['event' => $event]);
                return false;
        }
    }

    private function handlePaymentCompleted($data)
    {
        $paymentId = $data['payment_id'];
        $payment = \App\Models\Payment::where('payment_reference', $paymentId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'transaction_id' => $data['transaction_id'],
                'processed_at' => now(),
                'provider_response' => $data
            ]);
        }

        return true;
    }

    private function handlePaymentFailed($data)
    {
        $paymentId = $data['payment_id'];
        $payment = \App\Models\Payment::where('payment_reference', $paymentId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $data['error_message'],
                'provider_response' => $data
            ]);
        }

        return true;
    }

    private function handlePaymentCancelled($data)
    {
        $paymentId = $data['payment_id'];
        $payment = \App\Models\Payment::where('payment_reference', $paymentId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'cancelled',
                'provider_response' => $data
            ]);
        }

        return true;
    }

    public function verifyWebhookSignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', json_encode($payload), $this->apiKey);
        return hash_equals($expectedSignature, $signature);
    }
}
```

## 3. CONTROLADOR PSE

### PSEController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PSEService;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PSEController extends Controller
{
    protected $pseService;

    public function __construct(PSEService $pseService)
    {
        $this->pseService = $pseService;
    }

    public function getBanks()
    {
        $result = $this->pseService->getBanks();

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'banks' => $result['banks']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function createPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'description' => 'required|string|max:255',
            'bank_code' => 'required|string',
            'bank_name' => 'required|string',
            'account_type' => 'required|string|in:savings,checking',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'customer_document' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = auth()->user();
        $paymentReference = 'PSE_' . time() . '_' . $user->id;

        // Crear registro de pago
        $payment = Payment::create([
            'user_id' => $user->id,
            'paymentable_type' => $request->paymentable_type ?? 'general',
            'paymentable_id' => $request->paymentable_id ?? 0,
            'amount' => $request->amount,
            'currency' => $request->currency,
            'payment_method' => 'pse',
            'status' => 'pending',
            'payment_reference' => $paymentReference,
            'payment_provider' => 'pse'
        ]);

        $paymentData = [
            'amount' => $request->amount,
            'currency' => $request->currency,
            'reference' => $paymentReference,
            'description' => $request->description,
            'bank_code' => $request->bank_code,
            'bank_name' => $request->bank_name,
            'account_type' => $request->account_type,
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email,
            'customer_phone' => $request->customer_phone,
            'customer_document' => $request->customer_document,
            'metadata' => [
                'payment_id' => $payment->id,
                'user_id' => $user->id
            ]
        ];

        $result = $this->pseService->createPayment($paymentData);

        if ($result['success']) {
            $payment->update([
                'transaction_id' => $result['payment_id'],
                'provider_response' => $result['response']
            ]);

            return response()->json([
                'success' => true,
                'payment' => $payment,
                'redirect_url' => $result['redirect_url'],
                'message' => 'Pago PSE creado exitosamente'
            ]);
        }

        $payment->update([
            'status' => 'failed',
            'failure_reason' => $result['error']
        ]);

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function getPaymentStatus($paymentId)
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $result = $this->pseService->getPaymentStatus($payment->transaction_id);

        if ($result['success']) {
            // Actualizar estado del pago
            $psePayment = $result['payment'];
            $payment->update([
                'status' => $this->mapPSEStatus($psePayment['status']),
                'provider_response' => $psePayment
            ]);

            return response()->json([
                'success' => true,
                'payment' => $payment,
                'pse_status' => $psePayment['status']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function cancelPayment($paymentId)
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'error' => 'Solo se pueden cancelar pagos pendientes'
            ], 400);
        }

        $result = $this->pseService->cancelPayment($payment->transaction_id);

        if ($result['success']) {
            $payment->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Pago cancelado exitosamente'
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function returnUrl(Request $request)
    {
        $paymentId = $request->get('payment_id');
        $status = $request->get('status');

        $payment = Payment::where('transaction_id', $paymentId)->first();

        if ($payment) {
            $payment->update([
                'status' => $this->mapPSEStatus($status),
                'processed_at' => now()
            ]);
        }

        return redirect()->route('payment.result', [
            'payment' => $payment->id,
            'status' => $status
        ]);
    }

    public function confirmationUrl(Request $request)
    {
        $payload = $request->all();
        $signature = $request->header('X-PSE-Signature');

        if (!$this->pseService->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $this->pseService->processWebhook($payload);

        return response()->json(['status' => 'success']);
    }

    private function mapPSEStatus($pseStatus)
    {
        $statusMap = [
            'pending' => 'pending',
            'completed' => 'completed',
            'failed' => 'failed',
            'cancelled' => 'cancelled',
            'expired' => 'failed'
        ];

        return $statusMap[$pseStatus] ?? 'pending';
    }
}
```

## 4. COMPONENTE LIVEWIRE PSE

### PSEPayment.php
```php
<?php

namespace App\Http\Livewire\Payment;

use Livewire\Component;
use App\Services\PSEService;
use Illuminate\Support\Facades\Http;

class PSEPayment extends Component
{
    public $amount;
    public $description;
    public $paymentableType;
    public $paymentableId;
    
    // Datos PSE
    public $bankCode = '';
    public $bankName = '';
    public $accountType = 'savings';
    public $customerName = '';
    public $customerEmail = '';
    public $customerPhone = '';
    public $customerDocument = '';
    
    // Bancos disponibles
    public $banks = [];
    
    public $isProcessing = false;
    public $successMessage = '';
    public $errorMessage = '';

    protected $pseService;

    public function mount($amount, $description, $paymentableType = null, $paymentableId = null)
    {
        $this->amount = $amount;
        $this->description = $description;
        $this->paymentableType = $paymentableType;
        $this->paymentableId = $paymentableId;
        
        $this->pseService = app(PSEService::class);
        $this->loadBanks();
        $this->loadCustomerData();
    }

    public function loadBanks()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . auth()->user()->createToken('api')->plainTextToken,
            'Content-Type' => 'application/json'
        ])->get(url('/api/pse/banks'));

        $result = $response->json();

        if ($result['success']) {
            $this->banks = $result['banks'];
        }
    }

    public function loadCustomerData()
    {
        $user = auth()->user();
        $this->customerName = $user->name;
        $this->customerEmail = $user->email;
        $this->customerPhone = $user->phone ?? '';
        $this->customerDocument = $user->document ?? '';
    }

    public function processPayment()
    {
        $this->isProcessing = true;
        $this->errorMessage = '';
        $this->successMessage = '';

        $this->validate([
            'bankCode' => 'required|string',
            'bankName' => 'required|string',
            'accountType' => 'required|string|in:savings,checking',
            'customerName' => 'required|string|max:255',
            'customerEmail' => 'required|email',
            'customerPhone' => 'nullable|string',
            'customerDocument' => 'nullable|string'
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . auth()->user()->createToken('api')->plainTextToken,
                'Content-Type' => 'application/json'
            ])->post(url('/api/pse/payments'), [
                'amount' => $this->amount,
                'currency' => 'COP',
                'description' => $this->description,
                'bank_code' => $this->bankCode,
                'bank_name' => $this->bankName,
                'account_type' => $this->accountType,
                'customer_name' => $this->customerName,
                'customer_email' => $this->customerEmail,
                'customer_phone' => $this->customerPhone,
                'customer_document' => $this->customerDocument,
                'paymentable_type' => $this->paymentableType,
                'paymentable_id' => $this->paymentableId
            ]);

            $result = $response->json();

            if ($result['success']) {
                $this->successMessage = 'Pago PSE creado exitosamente. Será redirigido al banco...';
                $this->emit('psePaymentCreated', $result['payment']);
                
                // Redirigir al banco
                return redirect($result['redirect_url']);
            } else {
                $this->errorMessage = $result['error'];
            }
        } catch (\Exception $e) {
            $this->errorMessage = 'Error interno del servidor';
        }

        $this->isProcessing = false;
    }

    public function updatedBankCode()
    {
        $bank = collect($this->banks)->firstWhere('code', $this->bankCode);
        if ($bank) {
            $this->bankName = $bank['name'];
        }
    }

    public function render()
    {
        return view('livewire.payment.pse-payment');
    }
}
```

## 5. VISTA PSE

### pse-payment.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Pago PSE</h2>
        <p class="text-gray-600">Pago Seguro en Línea - Transfiera desde su cuenta bancaria</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Resumen del pago -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Resumen del Pago</h3>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ $description }}</span>
                <span class="text-2xl font-bold text-blue-600">
                    ${{ number_format($amount, 0, ',', '.') }} COP
                </span>
            </div>
        </div>

        <!-- Formulario PSE -->
        <form wire:submit.prevent="processPayment">
            <div class="space-y-6">
                <!-- Información del banco -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Información Bancaria</h3>
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

                <!-- Información del cliente -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Información del Cliente</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo*</label>
                            <input type="text" wire:model="customerName" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @error('customerName') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                            <input type="email" wire:model="customerEmail" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @error('customerEmail') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input type="tel" wire:model="customerPhone" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @error('customerPhone') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                            <input type="text" wire:model="customerDocument" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @error('customerDocument') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                        </div>
                    </div>
                </div>

                <!-- Información de PSE -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-medium text-blue-800 mb-2">¿Qué es PSE?</h4>
                    <p class="text-sm text-blue-700">
                        PSE (Pago Seguro en Línea) le permite realizar pagos directamente desde su cuenta bancaria 
                        sin necesidad de tarjetas de crédito. Es un método seguro y confiable respaldado por los 
                        principales bancos de Colombia.
                    </p>
                </div>

                <!-- Botón de pago -->
                <div class="flex justify-end">
                    <button type="submit" 
                            wire:loading.attr="disabled"
                            class="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-medium disabled:opacity-50">
                        <span wire:loading.remove wire:target="processPayment">
                            Pagar con PSE
                        </span>
                        <span wire:loading wire:target="processPayment">
                            Procesando...
                        </span>
                    </button>
                </div>
            </div>
        </form>

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

## 6. RUTAS PSE

### routes/api.php
```php
<?php

use App\Http\Controllers\Api\PSEController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Bancos
    Route::get('/pse/banks', [PSEController::class, 'getBanks']);
    
    // Pagos
    Route::post('/pse/payments', [PSEController::class, 'createPayment']);
    Route::get('/pse/payments/{payment}', [PSEController::class, 'getPaymentStatus']);
    Route::post('/pse/payments/{payment}/cancel', [PSEController::class, 'cancelPayment']);
});

// URLs de retorno y confirmación (sin autenticación)
Route::get('/pse/return', [PSEController::class, 'returnUrl'])->name('pse.return');
Route::post('/pse/confirmation', [PSEController::class, 'confirmationUrl'])->name('pse.confirmation');
```

### routes/web.php
```php
<?php

use App\Http\Livewire\Payment\PSEPayment;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pse/payment/{amount}/{description}', PSEPayment::class)
        ->name('pse.payment');
});
```

## 7. VISTA DE RESULTADO

### payment-result.blade.php
```html
<div class="container mx-auto p-4">
    <div class="max-w-2xl mx-auto">
        @if($status === 'completed')
            <div class="text-center">
                <div class="mb-6">
                    <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h2>
                    <p class="text-gray-600">Su pago PSE ha sido procesado correctamente</p>
                </div>
            </div>
        @elseif($status === 'failed')
            <div class="text-center">
                <div class="mb-6">
                    <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-red-600 mb-2">Pago Fallido</h2>
                    <p class="text-gray-600">Su pago PSE no pudo ser procesado</p>
                </div>
            </div>
        @else
            <div class="text-center">
                <div class="mb-6">
                    <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-yellow-600 mb-2">Pago Pendiente</h2>
                    <p class="text-gray-600">Su pago PSE está siendo procesado</p>
                </div>
            </div>
        @endif

        <!-- Información del pago -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">Detalles del Pago</h3>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Referencia:</span>
                    <span class="font-medium">{{ $payment->payment_reference }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Monto:</span>
                    <span class="font-medium">${{ number_format($payment->amount, 0, ',', '.') }} {{ $payment->currency }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Estado:</span>
                    <span class="font-medium capitalize">{{ $payment->status }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Fecha:</span>
                    <span class="font-medium">{{ $payment->created_at->format('d/m/Y H:i') }}</span>
                </div>
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-4">
            <a href="{{ route('dashboard') }}" 
               class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center">
                Ir al Dashboard
            </a>
            @if($status === 'failed')
                <a href="{{ route('pse.payment', ['amount' => $payment->amount, 'description' => $payment->description]) }}" 
                   class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-center">
                    Intentar Nuevamente
                </a>
            @endif
        </div>
    </div>
</div>
```

## 8. TESTING PSE

### PSETest.php
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\PSEService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PSETest extends TestCase
{
    use RefreshDatabase;

    public function test_get_banks()
    {
        $response = $this->getJson('/api/pse/banks');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'banks' => [
                        '*' => [
                            'code',
                            'name'
                        ]
                    ]
                ]);
    }

    public function test_create_payment()
    {
        $user = \App\Models\User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pse/payments', [
                'amount' => 100000,
                'currency' => 'COP',
                'description' => 'Test PSE payment',
                'bank_code' => '1007',
                'bank_name' => 'BANCO DE BOGOTÁ',
                'account_type' => 'savings',
                'customer_name' => 'Test User',
                'customer_email' => 'test@example.com'
            ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'payment' => [
                        'id',
                        'amount',
                        'status',
                        'payment_reference'
                    ],
                    'redirect_url'
                ]);
    }

    public function test_webhook_verification()
    {
        $payload = ['test' => 'data'];
        $signature = hash_hmac('sha256', json_encode($payload), config('services.pse.api_key'));
        
        $response = $this->postJson('/api/pse/confirmation', $payload, [
            'X-PSE-Signature' => $signature
        ]);

        $response->assertStatus(200)
                ->assertJson(['status' => 'success']);
    }
}
```

Esta documentación completa de la integración PSE te permitirá implementar el sistema de pagos PSE de forma segura y eficiente, incluyendo toda la funcionalidad necesaria para procesar pagos desde cuentas bancarias.
