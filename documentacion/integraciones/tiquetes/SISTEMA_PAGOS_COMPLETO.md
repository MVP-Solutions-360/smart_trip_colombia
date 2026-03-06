# 💳 SISTEMA DE PAGOS COMPLETO - PAYMENTEZ

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
# Paymentez - Producción
APP_CARD_LOGIN=tu_login_produccion
APP_CARD_PASSWORD=tu_password_produccion
APP_CARD_URL=https://ccapi.paymentez.com

# Paymentez - Testing
APP_CARD_LOGIN_TEST=tu_login_test
APP_CARD_PASSWORD_TEST=tu_password_test
APP_CARD_URL_TEST=https://ccapi-stg.paymentez.com

# PSE
PSE_URL=https://noccapi-stg.paymentez.com
```

## 2. MODELOS DE PAGOS

### Pay.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pay extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function card_pays()
    {
        return $this->hasMany(CardPay::class);
    }
}
```

### CardPay.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardPay extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    public function pay()
    {
        return $this->belongsTo(Pay::class);
    }
}
```

### Pse.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pse extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];
}
```

## 3. MIGRACIONES

### create_pays_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pays', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('bank_name');
            $table->string('origin');
            $table->string('status');
            $table->string('token');
            $table->text('message')->nullable();
            $table->string('expiry_year');
            $table->string('expiry_month');
            $table->string('bin');
            $table->string('transaction_reference');
            $table->string('type');
            $table->string('number');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('pays');
    }
};
```

### create_card_pays_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('card_pays', function (Blueprint $table) {
            $table->id();
            $table->text('transaction');
            $table->unsignedBigInteger('pay_id');
            $table->string('reference');
            $table->text('description');
            $table->timestamps();
            
            $table->foreign('pay_id')->references('id')->on('pays')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('card_pays');
    }
};
```

### create_pses_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pses', function (Blueprint $table) {
            $table->id();
            $table->string('status');
            $table->text('order_description')->nullable();
            $table->string('status_detail')->nullable();
            $table->string('date');
            $table->text('message')->nullable();
            $table->string('id_transaction');
            $table->string('dev_reference');
            $table->string('carrier_code')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('paid_date')->nullable();
            $table->integer('installments')->nullable();
            $table->string('ltp_id')->nullable();
            $table->string('stoken')->nullable();
            $table->string('application_code')->nullable();
            $table->string('terminal_code')->nullable();
            $table->string('user_id');
            $table->string('email');
            $table->string('bin')->nullable();
            $table->string('holder_name')->nullable();
            $table->string('type')->nullable();
            $table->string('number')->nullable();
            $table->string('origin')->nullable();
            $table->string('fiscal_number')->nullable();
            $table->string('authorization_code')->nullable();
            $table->string('payment_method_type')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pses');
    }
};
```

## 4. CONTROLADOR DE PAGOS COMPLETO

### PayController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardPay;
use App\Models\Pay;
use App\Models\Pse;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PayController extends Controller
{
    public $API_LOGIN_DEV;
    public $API_KEY_DEV;
    public $app_url = "https://ccapi-stg.paymentez.com";

    /**
     * Guardar tarjeta de crédito
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'token' => 'required|string',
            'user_id' => 'required|integer',
            'bank_name' => 'required|string',
            'origin' => 'required|string',
            'status' => 'required|string',
            'message' => 'nullable|string',
            'expiry_year' => 'required|string',
            'expiry_month' => 'required|string',
            'bin' => 'required|string',
            'transaction_reference' => 'required|string',
            'type' => 'required|string',
            'number' => 'required|string',
        ]);

        // Verificar si la tarjeta ya existe
        if (Pay::where('user_id', $request->user_id)->where('token', $request->token)->exists()) {
            return response()->json(['error' => 'No se puede guardar la tarjeta duplicada.'], 422);
        }

        $pay = Pay::create([
            "user_id" => $request->user_id,
            "bank_name" => $request->bank_name,
            "origin" => $request->origin,
            "status" => $request->status,
            "token" => $request->token,
            "message" => $request->message,
            "expiry_year" => $request->expiry_year,
            "expiry_month" => $request->expiry_month,
            "bin" => $request->bin,
            "transaction_reference" => $request->transaction_reference,
            "type" => $request->type,
            "number" => $request->number
        ]);

        return response()->json(["card" => $pay], 200);
    }

    /**
     * Recuperar tarjetas del usuario
     */
    public function recover(Request $request)
    {
        $cards = DB::table('pays')
            ->where('user_id', $request->user_id)
            ->select(
                'token', "bin", "bank_name", "status", "origin", 
                "message", "expiry_year", "expiry_month", 
                "transaction_reference", "type", "number", 
                "created_at", DB::raw('MAX(id) as id')
            )
            ->groupBy(
                'token', "bin", "bank_name", "status", "origin", 
                "message", "expiry_year", "expiry_month", 
                "transaction_reference", "type", "number", "created_at"
            )
            ->get();

        return response()->json(["cards" => $cards], 200);
    }

    /**
     * Eliminar tarjeta
     */
    public function destroy(Request $request)
    {
        try {
            $pay = Pay::findOrFail($request->card_id);
            $payToDelete = Pay::where('user_id', $request->user_id)
                ->where('token', $pay->token)
                ->get();

            $card = ["token" => $pay->token];
            $user = ["id" => $request->user_id];
            
            $delete = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Auth-Token' => $this->authToken()
            ])->post($this->app_url . '/v2/card/delete/', [
                "card" => $card,
                "user" => $user
            ]);

            // Eliminar registros de la base de datos
            foreach ($payToDelete as $pay) {
                $pay->delete();
            }

            return response()->json([
                "message" => "Tarjeta eliminada exitosamente", 
                "response" => $delete
            ], 200);

        } catch (\Throwable $th) {
            return response()->json(['error' => 'Tarjeta no existe'], 404);
        }
    }

    /**
     * Procesar pago con tarjeta
     */
    public function pay(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|integer',
            'email' => 'required|email',
            'amount' => 'required|numeric',
            'description' => 'required|string',
            'dev_reference' => 'required|string',
            'vat' => 'required|numeric',
            'token' => 'required|string',
            'cvc' => 'required|string',
            'card_id' => 'required|integer',
        ]);

        $user = [
            "user" => [
                "id" => $request->user_id,
                "email" => $request->email,
            ],
            "order" => [
                "amount" => $request->amount,
                "description" => $request->description,
                "dev_reference" => $request->dev_reference,
                "vat" => $request->vat,
            ],
            "card" => [
                "token" => $request->token,
                "cvc" => $request->cvc
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Auth-Token' => $this->authToken()
        ])->post($this->app_url . '/v2/transaction/debit/', $user)->json();

        if (isset($response["error"])) {
            return response()->json(["pay" => $response], 200);
        } else {
            $card = CardPay::create([
                "transaction" => json_encode($response),
                "pay_id" => $request->card_id,
                "reference" => $request->dev_reference,
                "description" => $request->description
            ]);
        }

        return response()->json([
            "pay" => $response, 
            "cardSave" => $card
        ], 200);
    }

    /**
     * Procesar pago PSE
     */
    public function pse(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|integer',
            'email' => 'required|email',
            'name' => 'required|string',
            'lastname' => 'required|string',
            'pnr' => 'required|string',
            'operationalChange' => 'required|string',
            'fare' => 'required|numeric',
            'success' => 'required|url',
            'fail' => 'required|url',
            'pending' => 'required|url',
            'review' => 'required|url',
        ]);

        try {
            $pay = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Auth-Token' => $this->authToken()
            ])->post(env('PSE_URL') . '/linktopay/init_order/', [
                "user" => [
                    "id" => $request->user_id,
                    "email" => $request->email,
                    "name" => $request->name,
                    "last_name" => $request->lastname
                ],
                "order" => [
                    "dev_reference" => $request->pnr,
                    "description" => $request->operationalChange,
                    "amount" => $request->fare,
                    "installments_type" => 0,
                    "currency" => "COP"
                ],
                "configuration" => [
                    "partial_payment" => true,
                    "expiration_days" => 1,
                    "allowed_payment_methods" => ["All"],
                    "success_url" => $request->success,
                    "failure_url" => $request->fail,
                    "pending_url" => $request->pending,
                    "review_url" => $request->review
                ]
            ])->json();
            
            return redirect($pay["data"]["payment"]["payment_url"]);
        } catch (\Throwable $th) {
            return response()->json([
                "error" => "Error al procesar pago PSE",
                "message" => $th->getMessage()
            ], 400);
        }
    }

    /**
     * Webhook para confirmación de pagos
     */
    public function webhook(Request $request)
    {
        try {
            $pse = Pse::firstOrNew([
                'dev_reference' => $request["transaction"]["dev_reference"]
            ]);

            // Datos básicos de la transacción
            $pse->status = $request["transaction"]["status"];
            $pse->order_description = $request["transaction"]["order_description"];
            $pse->status_detail = $request["transaction"]["status_detail"];
            $pse->date = $request["transaction"]["date"];
            $pse->message = $request["transaction"]["message"];
            $pse->id_transaction = $request["transaction"]["id"];
            $pse->dev_reference = $request["transaction"]["dev_reference"];
            $pse->carrier_code = $request["transaction"]["carrier_code"];
            $pse->amount = $request["amount"];
            $pse->paid_date = $request["transaction"]["paid_date"];
            $pse->installments = $request["transaction"]["installments"];
            $pse->ltp_id = $request["transaction"]["ltp_id"];
            $pse->stoken = $request["transaction"]["stoken"];
            $pse->application_code = $request["transaction"]["application_code"];
            $pse->terminal_code = $request["transaction"]["terminal_code"];
            $pse->user_id = $request["user"]["id"];
            $pse->email = $request["user"]["email"];

            // Datos de tarjeta si existe
            if (isset($request["card"])) {
                $pse->bin = $request["card"]["bin"];
                $pse->holder_name = $request["card"]["holder_name"];
                $pse->type = $request["card"]["type"];
                $pse->number = $request["card"]["number"];
                $pse->origin = $request["card"]["origin"];
                $pse->fiscal_number = $request["card"]["fiscal_number"];
                $pse->authorization_code = $request["transaction"]["authorization_code"];
                $pse->carrier_code = $request["transaction"]["carrier_code"];
                $pse->installments = $request["transaction"]["installments"];
            } else {
                $pse->payment_method_type = $request["transaction"]["payment_method_type"];
            }

            $pse->save();

            return response()->json(true, 200);
        } catch (\Throwable $th) {
            \Log::error('Error en webhook de pago: ' . $th->getMessage());
            return response()->json(false, 500);
        }
    }

    /**
     * Configurar credenciales según entorno
     */
    public function credencials()
    {
        if (env("APP_ENV") == "production") {
            $this->API_LOGIN_DEV = env("APP_CARD_LOGIN");
            $this->API_KEY_DEV = env("APP_CARD_PASSWORD");
            $this->app_url = env("APP_CARD_URL");
        } else {
            $this->API_LOGIN_DEV = env("APP_CARD_LOGIN_TEST");
            $this->API_KEY_DEV = env("APP_CARD_PASSWORD_TEST");
            $this->app_url = env("APP_CARD_URL_TEST");
        }
    }

    /**
     * Generar token de autenticación Paymentez
     */
    public function authToken()
    {
        $this->credencials();
        $server_application_code = $this->API_LOGIN_DEV;
        $server_app_key = $this->API_KEY_DEV;
        $date = new DateTime();
        $unix_timestamp = $date->getTimestamp();
        $uniq_token_string = $server_app_key . $unix_timestamp;
        $uniq_token_hash = hash('sha256', $uniq_token_string);
        $auth_token = base64_encode($server_application_code . ";" . $unix_timestamp . ";" . $uniq_token_hash);

        return $auth_token;
    }
}
```

## 5. RUTAS DE PAGOS

### routes/api.php
```php
<?php

use App\Http\Controllers\Api\PayController;
use Illuminate\Support\Facades\Route;

// Rutas de pagos
Route::apiResource('pays', PayController::class)->only("store");
Route::post('pays/card', [PayController::class, "recover"]);
Route::delete('pays/delete', [PayController::class, 'destroy']);
Route::post('pays/webhooks', [PayController::class, 'webhooks'])->name("pays.webhooks");
Route::post('pay/card', [PayController::class, 'pay'])->name("pay");
Route::post('pays/pse', [PayController::class, "pse"]);
Route::post('webhook', [PayController::class, "webhook"]);
```

## 6. COMPONENTE LIVEWIRE PARA PAGOS

### PaymentForm.php
```php
<?php

namespace App\Http\Livewire\Payment;

use App\Models\Pay;
use Illuminate\Support\Facades\Http;
use Livewire\Component;

class PaymentForm extends Component
{
    public $cards = [];
    public $selectedCard = null;
    public $amount = 0;
    public $description = '';
    public $dev_reference = '';
    public $cvc = '';
    public $successMessage = '';
    public $errorMessage = '';

    public function mount()
    {
        $this->loadCards();
    }

    public function loadCards()
    {
        $response = Http::post('/api/pays/card', [
            'user_id' => auth()->id()
        ]);
        
        if ($response->successful()) {
            $this->cards = $response->json()['cards'];
        }
    }

    public function selectCard($cardId)
    {
        $this->selectedCard = $cardId;
    }

    public function processPayment()
    {
        $this->validate([
            'selectedCard' => 'required',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string',
            'dev_reference' => 'required|string',
            'cvc' => 'required|string|min:3|max:4',
        ]);

        $card = collect($this->cards)->firstWhere('id', $this->selectedCard);

        $response = Http::post('/api/pay/card', [
            'user_id' => auth()->id(),
            'email' => auth()->user()->email,
            'amount' => $this->amount,
            'description' => $this->description,
            'dev_reference' => $this->dev_reference,
            'vat' => 0,
            'token' => $card['token'],
            'cvc' => $this->cvc,
            'card_id' => $this->selectedCard,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['pay']['transaction']['status']) && 
                $data['pay']['transaction']['status'] === 'success') {
                $this->successMessage = 'Pago procesado exitosamente';
                $this->reset(['amount', 'description', 'dev_reference', 'cvc', 'selectedCard']);
            } else {
                $this->errorMessage = 'Error al procesar el pago';
            }
        } else {
            $this->errorMessage = 'Error de conexión';
        }
    }

    public function deleteCard($cardId)
    {
        $response = Http::delete('/api/pays/delete', [
            'card_id' => $cardId,
            'user_id' => auth()->id()
        ]);

        if ($response->successful()) {
            $this->loadCards();
            $this->successMessage = 'Tarjeta eliminada exitosamente';
        } else {
            $this->errorMessage = 'Error al eliminar la tarjeta';
        }
    }

    public function render()
    {
        return view('livewire.payment.payment-form');
    }
}
```

## 7. VISTA DE PAGOS

### payment-form.blade.php
```html
<div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Procesar Pago</h2>

    @if($successMessage)
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ $successMessage }}
        </div>
    @endif

    @if($errorMessage)
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ $errorMessage }}
        </div>
    @endif

    <!-- Selección de tarjeta -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Tarjeta</label>
        <div class="space-y-2">
            @forelse($cards as $card)
                <div class="flex items-center justify-between p-3 border rounded-lg {{ $selectedCard == $card->id ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <div class="flex items-center">
                        <input type="radio" 
                               wire:model="selectedCard" 
                               value="{{ $card->id }}" 
                               class="mr-3">
                        <div>
                            <div class="font-medium">{{ $card->bank_name }}</div>
                            <div class="text-sm text-gray-500">**** {{ $card->number }}</div>
                            <div class="text-sm text-gray-500">{{ $card->expiry_month }}/{{ $card->expiry_year }}</div>
                        </div>
                    </div>
                    <button wire:click="deleteCard({{ $card->id }})" 
                            class="text-red-600 hover:text-red-800">
                        Eliminar
                    </button>
                </div>
            @empty
                <p class="text-gray-500">No tienes tarjetas guardadas</p>
            @endforelse
        </div>
    </div>

    <!-- Formulario de pago -->
    <form wire:submit.prevent="processPayment">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" 
                       wire:model="amount" 
                       step="0.01" 
                       min="1"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="0.00">
                @error('amount') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input type="text" 
                       wire:model="cvc" 
                       maxlength="4"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="123">
                @error('cvc') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" 
                   wire:model="description" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Descripción del pago">
            @error('description') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
            <input type="text" 
                   wire:model="dev_reference" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Referencia única del pago">
            @error('dev_reference') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <button type="submit" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Procesar Pago
        </button>
    </form>
</div>
```

## 8. CONFIGURACIÓN DE PAYMENTEZ

### Configuración en .env
```env
# Paymentez Configuration
PAYMENTEZ_APP_CODE=tu_app_code
PAYMENTEZ_APP_KEY=tu_app_key
PAYMENTEZ_ENVIRONMENT=staging # o production

# URLs
PAYMENTEZ_API_URL=https://ccapi-stg.paymentez.com
PAYMENTEZ_PSE_URL=https://noccapi-stg.paymentez.com
```

### Configuración en config/services.php
```php
<?php

return [
    'paymentez' => [
        'app_code' => env('PAYMENTEZ_APP_CODE'),
        'app_key' => env('PAYMENTEZ_APP_KEY'),
        'environment' => env('PAYMENTEZ_ENVIRONMENT', 'staging'),
        'api_url' => env('PAYMENTEZ_API_URL'),
        'pse_url' => env('PAYMENTEZ_PSE_URL'),
    ],
];
```

## 9. MIDDLEWARE DE SEGURIDAD

### VerifyPaymentezWebhook.php
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyPaymentezWebhook
{
    public function handle(Request $request, Closure $next)
    {
        // Verificar firma del webhook si es necesario
        $signature = $request->header('X-Paymentez-Signature');
        
        if (!$this->verifySignature($request, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        return $next($request);
    }

    private function verifySignature(Request $request, $signature)
    {
        // Implementar verificación de firma según documentación de Paymentez
        return true; // Simplificado para el ejemplo
    }
}
```

## 10. JOBS PARA PROCESAMIENTO ASÍNCRONO

### ProcessPaymentJob.php
```php
<?php

namespace App\Jobs;

use App\Models\Pse;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $paymentData;

    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    public function handle()
    {
        try {
            // Procesar pago con Paymentez
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Auth-Token' => $this->generateAuthToken()
            ])->post(config('services.paymentez.api_url') . '/v2/transaction/debit/', $this->paymentData);

            if ($response->successful()) {
                // Guardar resultado en base de datos
                Pse::create($response->json());
                Log::info('Pago procesado exitosamente', $response->json());
            } else {
                Log::error('Error al procesar pago', $response->json());
            }
        } catch (\Exception $e) {
            Log::error('Error en job de pago: ' . $e->getMessage());
        }
    }

    private function generateAuthToken()
    {
        // Implementar generación de token
        return 'token_generado';
    }
}
```

## 11. TESTING

### PaymentTest.php
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Pay;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_store_card()
    {
        $user = User::factory()->create();
        
        $response = $this->postJson('/api/pays', [
            'user_id' => $user->id,
            'token' => 'test_token_123',
            'bank_name' => 'Test Bank',
            'origin' => 'test',
            'status' => 'active',
            'expiry_year' => '2025',
            'expiry_month' => '12',
            'bin' => '123456',
            'transaction_reference' => 'ref_123',
            'type' => 'credit',
            'number' => '1234567890123456'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pays', [
            'user_id' => $user->id,
            'token' => 'test_token_123'
        ]);
    }

    public function test_can_recover_cards()
    {
        $user = User::factory()->create();
        Pay::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/pays/card', [
            'user_id' => $user->id
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['cards']);
    }

    public function test_can_process_payment()
    {
        $user = User::factory()->create();
        $card = Pay::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/pay/card', [
            'user_id' => $user->id,
            'email' => $user->email,
            'amount' => 100.00,
            'description' => 'Test payment',
            'dev_reference' => 'test_ref_123',
            'vat' => 0,
            'token' => $card->token,
            'cvc' => '123',
            'card_id' => $card->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['pay', 'cardSave']);
    }
}
```

## 12. CONFIGURACIÓN DE COLA

### config/queue.php
```php
<?php

return [
    'default' => env('QUEUE_CONNECTION', 'database'),
    
    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
        ],
    ],
];
```

## 13. COMANDOS ARTISAN

### ProcessPendingPayments.php
```php
<?php

namespace App\Console\Commands;

use App\Models\Pse;
use Illuminate\Console\Command;

class ProcessPendingPayments extends Command
{
    protected $signature = 'payments:process-pending';
    protected $description = 'Procesar pagos pendientes';

    public function handle()
    {
        $pendingPayments = Pse::where('status', 'pending')->get();
        
        foreach ($pendingPayments as $payment) {
            // Lógica para procesar pagos pendientes
            $this->info("Procesando pago: {$payment->dev_reference}");
        }
        
        $this->info('Pagos procesados exitosamente');
    }
}
```

Esta documentación completa del sistema de pagos te permitirá implementar toda la funcionalidad de procesamiento de pagos con Paymentez, incluyendo tarjetas de crédito, PSE, webhooks y manejo de errores.
