# 💳 INTEGRACIÓN PAYMENTEZ COMPLETA

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
PAYMENTEZ_APP_CODE=tu_app_code
PAYMENTEZ_APP_KEY=tu_app_key
PAYMENTEZ_URL=https://noccapi.paymentez.com
PAYMENTEZ_ENVIRONMENT=staging
PAYMENTEZ_WEBHOOK_SECRET=tu_webhook_secret
```

### Configuración en config/services.php:
```php
<?php

return [
    'paymentez' => [
        'app_code' => env('PAYMENTEZ_APP_CODE'),
        'app_key' => env('PAYMENTEZ_APP_KEY'),
        'url' => env('PAYMENTEZ_URL'),
        'environment' => env('PAYMENTEZ_ENVIRONMENT'),
        'webhook_secret' => env('PAYMENTEZ_WEBHOOK_SECRET'),
    ],
];
```

## 2. SERVICIO PAYMENTEZ

### PaymentezService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentezService
{
    private $appCode;
    private $appKey;
    private $baseUrl;
    private $environment;

    public function __construct()
    {
        $this->appCode = config('services.paymentez.app_code');
        $this->appKey = config('services.paymentez.app_key');
        $this->baseUrl = config('services.paymentez.url');
        $this->environment = config('services.paymentez.environment');
    }

    public function generateAuthToken()
    {
        $timestamp = time();
        $unixtime = $timestamp;
        $string_to_sign = $this->appCode . $unixtime;
        $auth_token = hash_hmac('sha256', $string_to_sign, $this->appKey);

        $response = Http::post($this->baseUrl . '/v2/card/add', [
            'app_code' => $this->appCode,
            'app_key' => $this->appKey,
            'unixtime' => $unixtime,
            'auth_token' => $auth_token
        ]);

        if ($response->successful()) {
            return $response->json()['auth_token'];
        }

        throw new \Exception('Error generando token de autenticación Paymentez');
    }

    public function addCard($userData, $cardData)
    {
        $authToken = $this->generateAuthToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->post($this->baseUrl . '/v2/card/add', [
            'user' => [
                'id' => $userData['id'],
                'email' => $userData['email'],
                'phone' => $userData['phone'] ?? '',
                'first_name' => $userData['first_name'] ?? '',
                'last_name' => $userData['last_name'] ?? ''
            ],
            'card' => [
                'number' => $cardData['number'],
                'holder_name' => $cardData['holder_name'],
                'expiry_month' => $cardData['expiry_month'],
                'expiry_year' => $cardData['expiry_year'],
                'cvc' => $cardData['cvc']
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'success' => true,
                'card_token' => $data['card']['token'],
                'card_type' => $data['card']['type'],
                'bank_name' => $data['card']['bank_name'],
                'response' => $data
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error agregando tarjeta',
            'response' => $response->json()
        ];
    }

    public function chargeCard($userData, $orderData, $cardToken)
    {
        $authToken = $this->generateAuthToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->post($this->baseUrl . '/v2/card/charge', [
            'user' => [
                'id' => $userData['id'],
                'email' => $userData['email']
            ],
            'order' => [
                'amount' => $orderData['amount'],
                'description' => $orderData['description'],
                'dev_reference' => $orderData['dev_reference'],
                'vat' => $orderData['vat'] ?? 0
            ],
            'card' => [
                'token' => $cardToken
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'success' => true,
                'transaction_id' => $data['transaction']['id'],
                'status' => $data['transaction']['status'],
                'message' => $data['transaction']['message'],
                'response' => $data
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error procesando pago',
            'response' => $response->json()
        ];
    }

    public function refundTransaction($transactionId, $amount = null)
    {
        $authToken = $this->generateAuthToken();

        $payload = [
            'transaction_id' => $transactionId
        ];

        if ($amount) {
            $payload['amount'] = $amount;
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->post($this->baseUrl . '/v2/card/refund', $payload);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'success' => true,
                'refund_id' => $data['transaction']['id'],
                'status' => $data['transaction']['status'],
                'response' => $data
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error procesando reembolso',
            'response' => $response->json()
        ];
    }

    public function getTransactionStatus($transactionId)
    {
        $authToken = $this->generateAuthToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->get($this->baseUrl . '/v2/card/status', [
            'transaction_id' => $transactionId
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'transaction' => $response->json()['transaction']
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error consultando transacción'
        ];
    }

    public function deleteCard($cardToken)
    {
        $authToken = $this->generateAuthToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $authToken,
            'Content-Type' => 'application/json'
        ])->delete($this->baseUrl . '/v2/card/delete', [
            'card_token' => $cardToken
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'Tarjeta eliminada exitosamente'
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()['message'] ?? 'Error eliminando tarjeta'
        ];
    }

    public function verifyWebhookSignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', json_encode($payload), config('services.paymentez.webhook_secret'));
        return hash_equals($expectedSignature, $signature);
    }

    public function processWebhook($payload)
    {
        $event = $payload['event'];
        $data = $payload['data'];

        Log::info('Paymentez Webhook received', [
            'event' => $event,
            'data' => $data
        ]);

        switch ($event) {
            case 'payment.completed':
                return $this->handlePaymentCompleted($data);
            case 'payment.failed':
                return $this->handlePaymentFailed($data);
            case 'payment.refunded':
                return $this->handlePaymentRefunded($data);
            case 'card.added':
                return $this->handleCardAdded($data);
            case 'card.deleted':
                return $this->handleCardDeleted($data);
            default:
                Log::warning('Unknown Paymentez webhook event', ['event' => $event]);
                return false;
        }
    }

    private function handlePaymentCompleted($data)
    {
        // Actualizar estado del pago en base de datos
        $transactionId = $data['transaction']['id'];
        $payment = \App\Models\Payment::where('transaction_id', $transactionId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'processed_at' => now(),
                'provider_response' => $data
            ]);
        }

        return true;
    }

    private function handlePaymentFailed($data)
    {
        $transactionId = $data['transaction']['id'];
        $payment = \App\Models\Payment::where('transaction_id', $transactionId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $data['transaction']['message'],
                'provider_response' => $data
            ]);
        }

        return true;
    }

    private function handlePaymentRefunded($data)
    {
        $transactionId = $data['transaction']['id'];
        $payment = \App\Models\Payment::where('transaction_id', $transactionId)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'refunded',
                'provider_response' => $data
            ]);
        }

        return true;
    }

    private function handleCardAdded($data)
    {
        // Lógica para manejar tarjeta agregada
        Log::info('Card added via webhook', $data);
        return true;
    }

    private function handleCardDeleted($data)
    {
        // Lógica para manejar tarjeta eliminada
        Log::info('Card deleted via webhook', $data);
        return true;
    }
}
```

## 3. CONTROLADOR PAYMENTEZ

### PaymentezController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentezService;
use App\Models\Payment;
use App\Models\PaymentCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentezController extends Controller
{
    protected $paymentezService;

    public function __construct(PaymentezService $paymentezService)
    {
        $this->paymentezService = $paymentezService;
    }

    public function addCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_number' => 'required|string|min:13|max:19',
            'card_holder' => 'required|string|max:255',
            'expiry_month' => 'required|integer|between:1,12',
            'expiry_year' => 'required|integer|min:' . date('Y'),
            'cvc' => 'required|string|min:3|max:4'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = auth()->user();
        $userData = [
            'id' => $user->id,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'first_name' => $user->first_name ?? '',
            'last_name' => $user->last_name ?? ''
        ];

        $cardData = [
            'number' => $request->card_number,
            'holder_name' => $request->card_holder,
            'expiry_month' => $request->expiry_month,
            'expiry_year' => $request->expiry_year,
            'cvc' => $request->cvc
        ];

        $result = $this->paymentezService->addCard($userData, $cardData);

        if ($result['success']) {
            // Guardar tarjeta en base de datos
            $card = PaymentCard::create([
                'user_id' => $user->id,
                'card_token' => $result['card_token'],
                'card_number' => substr($request->card_number, -4),
                'card_type' => $result['card_type'],
                'bank_name' => $result['bank_name'],
                'expiry_month' => $request->expiry_month,
                'expiry_year' => $request->expiry_year,
                'is_default' => !PaymentCard::where('user_id', $user->id)->exists()
            ]);

            return response()->json([
                'success' => true,
                'card' => $card,
                'message' => 'Tarjeta agregada exitosamente'
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function chargeCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_token' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'dev_reference' => 'required|string',
            'vat' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = auth()->user();
        $userData = [
            'id' => $user->id,
            'email' => $user->email
        ];

        $orderData = [
            'amount' => $request->amount,
            'description' => $request->description,
            'dev_reference' => $request->dev_reference,
            'vat' => $request->vat ?? 0
        ];

        $result = $this->paymentezService->chargeCard($userData, $orderData, $request->card_token);

        if ($result['success']) {
            // Crear registro de pago
            $payment = Payment::create([
                'user_id' => $user->id,
                'paymentable_type' => $request->paymentable_type ?? 'general',
                'paymentable_id' => $request->paymentable_id ?? 0,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'COP',
                'payment_method' => 'credit_card',
                'status' => $result['status'] === 'success' ? 'completed' : 'failed',
                'transaction_id' => $result['transaction_id'],
                'payment_reference' => $request->dev_reference,
                'payment_provider' => 'paymentez',
                'provider_response' => $result['response'],
                'processed_at' => $result['status'] === 'success' ? now() : null
            ]);

            return response()->json([
                'success' => $result['status'] === 'success',
                'payment' => $payment,
                'message' => $result['message']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function refundPayment(Request $request, $transactionId)
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

        $result = $this->paymentezService->refundTransaction($transactionId, $request->amount);

        if ($result['success']) {
            // Actualizar estado del pago
            $payment = Payment::where('transaction_id', $transactionId)->first();
            if ($payment) {
                $payment->update(['status' => 'refunded']);
            }

            return response()->json([
                'success' => true,
                'refund_id' => $result['refund_id'],
                'message' => 'Reembolso procesado exitosamente'
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function getTransactionStatus($transactionId)
    {
        $result = $this->paymentezService->getTransactionStatus($transactionId);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'transaction' => $result['transaction']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function deleteCard($cardId)
    {
        $card = PaymentCard::where('id', $cardId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $result = $this->paymentezService->deleteCard($card->card_token);

        if ($result['success']) {
            $card->update(['is_active' => false]);
            
            return response()->json([
                'success' => true,
                'message' => 'Tarjeta eliminada exitosamente'
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error']
        ], 400);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();
        $signature = $request->header('X-Paymentez-Signature');

        if (!$this->paymentezService->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $this->paymentezService->processWebhook($payload);

        return response()->json(['status' => 'success']);
    }
}
```

## 4. RUTAS PAYMENTEZ

### routes/api.php
```php
<?php

use App\Http\Controllers\Api\PaymentezController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Tarjetas
    Route::post('/paymentez/cards', [PaymentezController::class, 'addCard']);
    Route::delete('/paymentez/cards/{card}', [PaymentezController::class, 'deleteCard']);
    
    // Pagos
    Route::post('/paymentez/charge', [PaymentezController::class, 'chargeCard']);
    Route::post('/paymentez/refund/{transactionId}', [PaymentezController::class, 'refundPayment']);
    Route::get('/paymentez/transaction/{transactionId}', [PaymentezController::class, 'getTransactionStatus']);
});

// Webhooks (sin autenticación)
Route::post('/paymentez/webhook', [PaymentezController::class, 'webhook']);
```

## 5. COMPONENTE LIVEWIRE PAYMENTEZ

### PaymentezPayment.php
```php
<?php

namespace App\Http\Livewire\Payment;

use Livewire\Component;
use App\Services\PaymentezService;
use App\Models\PaymentCard;
use Illuminate\Support\Facades\Http;

class PaymentezPayment extends Component
{
    public $amount;
    public $description;
    public $paymentableType;
    public $paymentableId;
    
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
    
    public $isProcessing = false;
    public $successMessage = '';
    public $errorMessage = '';

    protected $paymentezService;

    public function mount($amount, $description, $paymentableType = null, $paymentableId = null)
    {
        $this->amount = $amount;
        $this->description = $description;
        $this->paymentableType = $paymentableType;
        $this->paymentableId = $paymentableId;
        
        $this->paymentezService = app(PaymentezService::class);
        $this->loadSavedCards();
    }

    public function loadSavedCards()
    {
        $this->savedCards = PaymentCard::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('is_default', 'desc')
            ->get()
            ->toArray();
    }

    public function processPayment()
    {
        $this->isProcessing = true;
        $this->errorMessage = '';
        $this->successMessage = '';

        try {
            if ($this->selectedCard) {
                $this->chargeWithSavedCard();
            } else {
                $this->chargeWithNewCard();
            }
        } catch (\Exception $e) {
            $this->errorMessage = 'Error interno del servidor';
        }

        $this->isProcessing = false;
    }

    private function chargeWithSavedCard()
    {
        $card = PaymentCard::find($this->selectedCard);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . auth()->user()->createToken('api')->plainTextToken,
            'Content-Type' => 'application/json'
        ])->post(url('/api/paymentez/charge'), [
            'card_token' => $card->card_token,
            'amount' => $this->amount,
            'description' => $this->description,
            'dev_reference' => 'PAY_' . time(),
            'paymentable_type' => $this->paymentableType,
            'paymentable_id' => $this->paymentableId
        ]);

        $result = $response->json();

        if ($result['success']) {
            $this->successMessage = 'Pago procesado exitosamente';
            $this->emit('paymentCompleted', $result['payment']);
        } else {
            $this->errorMessage = $result['error'];
        }
    }

    private function chargeWithNewCard()
    {
        $this->validate([
            'cardNumber' => 'required|string|min:13|max:19',
            'cardHolder' => 'required|string|max:255',
            'expiryMonth' => 'required|integer|between:1,12',
            'expiryYear' => 'required|integer|min:' . date('Y'),
            'cvc' => 'required|string|min:3|max:4'
        ]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . auth()->user()->createToken('api')->plainTextToken,
            'Content-Type' => 'application/json'
        ])->post(url('/api/paymentez/cards'), [
            'card_number' => $this->cardNumber,
            'card_holder' => $this->cardHolder,
            'expiry_month' => $this->expiryMonth,
            'expiry_year' => $this->expiryYear,
            'cvc' => $this->cvc
        ]);

        $cardResult = $response->json();

        if ($cardResult['success']) {
            // Procesar pago con la tarjeta recién creada
            $chargeResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . auth()->user()->createToken('api')->plainTextToken,
                'Content-Type' => 'application/json'
            ])->post(url('/api/paymentez/charge'), [
                'card_token' => $cardResult['card']['card_token'],
                'amount' => $this->amount,
                'description' => $this->description,
                'dev_reference' => 'PAY_' . time(),
                'paymentable_type' => $this->paymentableType,
                'paymentable_id' => $this->paymentableId
            ]);

            $chargeResult = $chargeResponse->json();

            if ($chargeResult['success']) {
                $this->successMessage = 'Pago procesado exitosamente';
                $this->emit('paymentCompleted', $chargeResult['payment']);
                $this->loadSavedCards(); // Recargar tarjetas
            } else {
                $this->errorMessage = $chargeResult['error'];
            }
        } else {
            $this->errorMessage = $cardResult['error'];
        }
    }

    public function updatedSelectedCard()
    {
        $this->errorMessage = '';
        $this->successMessage = '';
    }

    public function render()
    {
        return view('livewire.payment.paymentez-payment');
    }
}
```

## 6. VISTA PAYMENTEZ

### paymentez-payment.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Pago con Paymentez</h2>
        <p class="text-gray-600">Procese su pago de forma segura</p>
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

        <!-- Tarjetas guardadas -->
        @if(count($savedCards) > 0)
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Tarjetas Guardadas</h3>
                <div class="space-y-2">
                    @foreach($savedCards as $card)
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50
                            {{ $selectedCard == $card['id'] ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                            <input type="radio" wire:model="selectedCard" value="{{ $card['id'] }}" class="mr-3">
                            <div class="flex-1">
                                <div class="font-medium">{{ $card['card_type'] }} ****{{ $card['card_number'] }}</div>
                                <div class="text-sm text-gray-500">{{ $card['bank_name'] }}</div>
                            </div>
                        </label>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Formulario de nueva tarjeta -->
        @if(!$selectedCard)
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4">Nueva Tarjeta</h3>
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

## 7. TESTING PAYMENTEZ

### PaymentezTest.php
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\PaymentezService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentezTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_card()
    {
        $user = \App\Models\User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/paymentez/cards', [
                'card_number' => '4111111111111111',
                'card_holder' => 'Test User',
                'expiry_month' => 12,
                'expiry_year' => 2025,
                'cvc' => '123'
            ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'card' => [
                        'id',
                        'card_token',
                        'card_type',
                        'bank_name'
                    ]
                ]);
    }

    public function test_charge_card()
    {
        $user = \App\Models\User::factory()->create();
        $card = \App\Models\PaymentCard::factory()->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/paymentez/charge', [
                'card_token' => $card->card_token,
                'amount' => 100000,
                'description' => 'Test payment',
                'dev_reference' => 'TEST_123'
            ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'payment' => [
                        'id',
                        'amount',
                        'status',
                        'transaction_id'
                    ]
                ]);
    }

    public function test_webhook_verification()
    {
        $payload = ['test' => 'data'];
        $signature = hash_hmac('sha256', json_encode($payload), config('services.paymentez.webhook_secret'));
        
        $response = $this->postJson('/api/paymentez/webhook', $payload, [
            'X-Paymentez-Signature' => $signature
        ]);

        $response->assertStatus(200)
                ->assertJson(['status' => 'success']);
    }
}
```

Esta documentación completa de la integración Paymentez te permitirá implementar todo el sistema de pagos con tarjetas de crédito de forma segura y eficiente.
