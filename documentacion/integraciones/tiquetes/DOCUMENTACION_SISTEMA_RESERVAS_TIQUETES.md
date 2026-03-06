# 📚 DOCUMENTACIÓN COMPLETA - SISTEMA DE RESERVAS Y EMISIÓN DE TIQUETES

## 1. ARQUITECTURA GENERAL

**Framework:** Laravel 9.19 con PHP 8.0+  
**Frontend:** Livewire 2.10 + AdminLTE 3.8  
**Base de datos:** MySQL  
**Autenticación:** Laravel Sanctum + Jetstream  
**Integración GDS:** Amadeus  
**Pagos:** Paymentez  

## 2. CONFIGURACIÓN INICIAL

### Variables de entorno requeridas:
```env
APP_TRAVEL=https://tu-api-amadeus.com
APP_CARD_LOGIN=tu_login_paymentez
APP_CARD_PASSWORD=tu_password_paymentez
APP_CARD_URL=https://ccapi-stg.paymentez.com
APP_CARD_URL_TEST=https://ccapi-stg.paymentez.com
APP_CARD_LOGIN_TEST=tu_login_test_paymentez
APP_CARD_PASSWORD_TEST=tu_password_test_paymentez
```

### Dependencias Composer:
```json
{
    "laravel/framework": "^9.19",
    "livewire/livewire": "^2.10",
    "jeroennoten/laravel-adminlte": "^3.8",
    "laravel/sanctum": "^3.0",
    "laravel/jetstream": "^2.13",
    "guzzlehttp/guzzle": "^7.5",
    "spatie/laravel-permission": "^5.10",
    "maatwebsite/excel": "^3.1",
    "barryvdh/laravel-dompdf": "^2.0"
}
```

## 3. ESTRUCTURA DE BASE DE DATOS

### Tabla principal: `reserves`
```sql
CREATE TABLE reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    city_dep VARCHAR(255) NULL,
    city_arr VARCHAR(255) NULL,
    dep_date DATE NULL,
    arr_date DATE NULL,
    deal_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);
```

### Tabla: `amadeus_reserves`
```sql
CREATE TABLE amadeus_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_id BIGINT NOT NULL,
    control_number VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE
);
```

### Tabla: `flight_reserves`
```sql
CREATE TABLE flight_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    control_number VARCHAR(255) NULL,
    provider VARCHAR(255) NULL,
    fare DECIMAL(10,2) NULL,
    child VARCHAR(255) NULL,
    adult VARCHAR(255) NULL,
    seat VARCHAR(255) NULL,
    baby VARCHAR(255) NULL,
    airline VARCHAR(255) NULL,
    state ENUM('quote', 'sale', 'pack') NOT NULL,
    reserve_id BIGINT UNSIGNED NULL,
    medical_package_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE,
    FOREIGN KEY (medical_package_id) REFERENCES medical_packages(id) ON DELETE CASCADE
);
```

### Tabla: `tickets`
```sql
CREATE TABLE tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    state TEXT NULL,
    priority VARCHAR(255) NULL,
    office_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE
);
```

### Tabla: `itinerary_reserves`
```sql
CREATE TABLE itinerary_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    flight_reserve_id BIGINT UNSIGNED NOT NULL,
    city_dep VARCHAR(255) NOT NULL,
    city_arr VARCHAR(255) NOT NULL,
    flight_number VARCHAR(255) NOT NULL,
    equipment VARCHAR(255) NULL,
    time_flight VARCHAR(255) NULL,
    dep_date_time DATETIME NOT NULL,
    arr_date_time DATETIME NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (flight_reserve_id) REFERENCES flight_reserves(id) ON DELETE CASCADE
);
```

### Tabla: `people_reserves`
```sql
CREATE TABLE people_reserves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    flight_reserve_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    number VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (flight_reserve_id) REFERENCES flight_reserves(id) ON DELETE CASCADE
);
```

## 4. MODELOS PRINCIPALES

### Reserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reserve extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function transfer_reserves()
    {
        return $this->hasMany(TransferReserve::class);
    }

    public function hotel_reserves()
    {
        return $this->hasMany(HotelReserve::class);
    }

    public function flight_reserves()
    {
        return $this->hasMany(FlightReserve::class);
    }

    public function tour_reserves()
    {
        return $this->hasMany(TourReserve::class);
    }

    public function activity_reserves()
    {
        return $this->hasMany(ActivityReserve::class);
    }

    public function assistance_reserves()
    {
        return $this->hasMany(AssistanceReserve::class);
    }
    
    public function pay_reserves()
    {
        return $this->hasMany(PayReserve::class);
    }
    
    public function amadeus_reserves()
    {
        return $this->hasMany(AmadeusReserve::class);
    }
    
    public function restel_reserves()
    {
        return $this->hasMany(RestelReserve::class);
    }
    
    public function politan_reserves()
    {
        return $this->hasMany(PollitanReserve::class);
    }
    
    public function supplier_credits()
    {
        return $this->hasMany(SupplierCredit::class);
    }

    public function quick_quotes()
    {
        return $this->hasMany(QuickQuote::class);
    }
}
```

### AmadeusReserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmadeusReserve extends Model
{
    use HasFactory;

    protected $guarded = ["id", "created_at", "updated_at"];

    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
}
```

### FlightReserve.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class FlightReserve extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function itinerary_reserves()
    {
        return $this->hasMany(ItineraryReserve::class);
    }
    
    public function people_reserves()
    {
        return $this->hasMany(PeopleReserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    public function carts(): MorphMany
    {
        return $this->morphMany(Cart::class, 'cartable');
    }
    
    public function document()
    {
        return $this->morphMany(Document::class, "documentable");
    }
}
```

### Ticket.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $guarded = ["id", "created_at", "updated_at"];

    public function merchants()
    {
        return $this->morphedByMany(Merchant::class, 'ticketable');
    }

    public function users()
    {
        return $this->morphedByMany(User::class, 'ticketable')->withPivot('state');
    }

    public function contacts()
    {
        return $this->morphedByMany(Contact::class, 'ticketable');
    }

    public function deals()
    {
        return $this->morphedByMany(Deal::class, 'ticketable');
    }

    public function tasks()
    {
        return $this->morphedToMany(Task::class, 'taskable');
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    public function office()
    {
        return $this->belongsTo(Office::class);
    }
}
```

## 5. TRAIT DE AMADEUS

### FlightTicketTrait.php
```php
<?php

namespace App\Traits\Amadeus;

use Illuminate\Support\Facades\Http;

trait FlightTicketTrait
{
    public function pnrRetrieve($tkt)
    {
        $record = Http::post(env('APP_TRAVEL')."/api/retrieve", ['record' => $tkt])->json();
        
        if (isset($record["itinerary"]) || $record == null || isset($record["error"])) {
            $record = isset($record["itinerary"]) ? $record["itinerary"] : "Alguno de los itinerarios fue cancelado o tuve un cambio operacional muy prolongado por favor contactarse con servicio al cliente o intentar con otra busqueda";
             
            return $record;
        } else {
            if ($record['itineraryChange'] == 0 || $record['passengerChange'] == 0) {
                $record["rec"] = 0;
            } else {
                $record["rec"] = 1;
            }
            return $record;
        }
    }
}
```

## 6. ENDPOINTS DE API AMADEUS

### Búsqueda de aeropuertos
```
POST /api/airports
Body: {"code": "BOG"}
Response: [{"iata": "BOG", "city": "Bogotá", "name": "El Dorado"}]
```

### Búsqueda de vuelos
```
POST /api/flights
Body: {
    "searchs": 250,
    "qtyPassengers": 2,
    "adult": 2,
    "baby": 0,
    "seat": 0,
    "child": 0,
    "itinerary": [
        {
            "departureCity": "BOG",
            "arrivalCity": "MAD",
            "hour": "2024-01-15T00:00:00+0000"
        }
    ]
}
```

### Obtener familias tarifarias
```
POST /api/upsell
Body: {
    "adult": 2,
    "child": 0,
    "baby": 0,
    "seat": 0,
    "rountrip": false,
    "fare": "RP",
    "bag": false,
    "segments": [
        {
            "group": 1,
            "from": "BOG",
            "to": "MAD",
            "company": "AV",
            "flightNumber": "AV001",
            "companyName": "Avianca",
            "class": "Y",
            "hour": "2024-01-15 00:00:00"
        }
    ]
}
```

### Crear PNR
```
POST /api/savepnr
Body: {
    "user_id": 1,
    "office": 1,
    "admin": 1,
    "company": "AV",
    "bag": false,
    "fare": "RP",
    "tel": "3001234567",
    "email": "test@example.com",
    "emailTwo": "test@example.com",
    "travellers": [
        {
            "number": 1,
            "name": "Juan",
            "lastName": "Pérez",
            "passengerType": "ADT",
            "free": "----15JAN84-M--"
        }
    ],
    "itinerary": [
        {
            "group": 1,
            "from": "BOG",
            "to": "MAD",
            "bookingClass": "Y",
            "dateDeparture": "2024-01-15T10:30:00+0000",
            "company": "AV",
            "flightNumber": "AV001"
        }
    ]
}
```

### Consultar reserva
```
POST /api/reserve/amadeus
Body: {"id": 123}
```

### Recuperar PNR
```
POST /api/retrieve
Body: {"record": "ABC123"}
```

### Emitir tiquete
```
POST /api/ticket
Body: {
    "session": "session_id",
    "record": "ABC123",
    "day": "2024-01-15",
    "hour": "10:30",
    "value": 500000,
    "rec": 0,
    "cash": true,
    "ti": false,
    "multi": false,
    "pay": {
        "card_id": 1,
        "user_id": "1",
        "email": "test@example.com",
        "description": "emit_ticket",
        "dev_reference": "ref123",
        "token": "token123",
        "amount": 500000,
        "vat": 0,
        "cvc": ""
    }
}
```

## 7. RUTAS PRINCIPALES

### routes/web/gds.php
```php
<?php

use App\Http\Livewire\Flight\SearchShow;
use App\Http\Livewire\Flight\ShowResponse;
use App\Http\Livewire\Flight\Segment\ShowSegment;
use App\Http\Livewire\Flight\Pnr\ShowPnr;
use App\Http\Livewire\Flight\Pnr\ShowTicket;
use App\Http\Livewire\Flight\Pnr\ConsultPnr;
use App\Http\Livewire\Reserve\Gds\Amadeus\IndexReserve;
use Illuminate\Support\Facades\Route;

// Búsqueda y reserva de vuelos
Route::get('flights/reserve', SearchShow::class)->middleware('can:index')->name("flights");
Route::get('flights-response/reserve', ShowResponse::class)->middleware('can:index')->name("flights.response");
Route::get('flights-response/pnr/reserve', ShowSegment::class)->middleware('can:index')->name("flights.pnr");
Route::get('flights-pnr/reserve', ShowPnr::class)->middleware('can:index')->name("flights.ticket");
Route::get('flights-emit-ticket', ShowTicket::class)->middleware('can:issue')->name("flights.emit-ticket");

// Consulta de reservas Amadeus
Route::get('amadeus/{amadeus}', IndexReserve::class)->middleware('can:index')->name("amadeus.index");
Route::get('amadeus-consult/{reserve}', ConsultPnr::class)->middleware('can:index')->name("amadeus.consult");
```

### routes/api.php
```php
<?php

use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\PayController;
use Illuminate\Support\Facades\Route;

// Vuelos
Route::post("flight", [FlightController::class, "store"]);

// Pagos
Route::apiResource('pays', PayController::class)->only("store");
Route::post('pays/card', [PayController::class,"recover"]);
Route::delete('pays/delete', [PayController::class,'destroy']);
Route::post('pays/webhooks', [PayController::class,'webhooks'])->name("pays.webwooks");
Route::post('pay/card', [PayController::class,'pay'])->name("pay");
Route::post('pays/pse', [PayController::class,"pse"]);
Route::post('webhook', [PayController::class,"webhook"]);
```

## 8. CONTROLADORES DE API

### FlightController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlightReserve;
use App\Models\ItineraryReserve;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    public function store(Request $request)
    {
        $flight = FlightReserve::create([
            "control_number" => $request->control_number,
            "date_time" => $request->date_time,
            "agent_id" => $request->agent_id,
            "dep_date_time" => $request->dep_date_time,
            "arr_date_time" => $request->arr_date_time,
            "city_dep" => $request->city_dep,
            "city_arr" => $request->city_arr,
            "code_airline" => $request->code_airline,
            "fare" => $request->fare,
            "last_time" => $request->last_time,
            "tax" => $request->tax,
            "fare_qualifier" => $request->fare_qualifier,
            "warning" => $request->warning,
            "tst" => $request->tst,
            "num_of_stops" => $request->num_of_stops,
            "tel" => $request->tel,
        ]);

        // Crear itinerarios
        foreach ($request->itinerary as $itinerary) {
            $flight->itinerary_reserves()->create([
                "city_dep" => $itinerary["city_dep"],
                "city_arr" => $itinerary["city_arr"],
                "flight_number" => $itinerary["flight_number"],
                "equipment" => $itinerary["equipment"],
                "time_flight" => $itinerary["time_flight"],
                "dep_date_time" => $itinerary["dep_date_time"],
                "arr_date_time" => $itinerary["arr_date_time"]
            ]);
        }

        // Crear pasajeros
        foreach ($request->people as $people) {
            $flight->people_reserves()->create([
                "name" => $people["name"],
                "last_name" => $people["last_name"],
                "number" => $people["number"],
                "type" => $people["type"]
            ]);
        }

        return $flight;
    }
}
```

## 9. SISTEMA DE PAGOS

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
use Illuminate\Support\Facades\Http;

class PayController extends Controller
{
    public $API_LOGIN_DEV;
    public $API_KEY_DEV;
    public $app_url = "https://ccapi-stg.paymentez.com";

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'token' => 'required|string',
        ]);

        if (Pay::where('user_id', $request->tel)->where('token', $request->token)->exists()) {
            return response()->json(['error' => 'No se puede guardar la tarjeta duplicada.'], 422);
        } else {
            $pay = Pay::create([
                "user_id" => $request->tel,
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
    }

    public function recover(Request $request)
    {
        $cards = DB::table('pays')->where('user_id', $request->tel)
            ->select('token', "bin", "bank_name", "status", "origin", "message", "expiry_year", "expiry_month", "transaction_reference", "type", "number", "created_at", DB::raw('MAX(id) as id'))
            ->groupBy('token', "bin", "bank_name", "status", "origin", "message", "expiry_year", "expiry_month", "transaction_reference", "type", "number", "created_at")
            ->get();

        return response()->json(["cards" => $cards], 200);
    }

    public function pay(Request $request)
    {
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

        $guard = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Auth-Token' => $this->authToken()
        ])->post($this->app_url . '/v2/transaction/debit/', $user)->json();

        if (isset($guard["error"])) {
            return response()->json(["pay" => $guard], 200);
        } else {
            $card = CardPay::create([
                "transaction" => json_encode($guard),
                "pay_id" => $request->card_id,
                "reference" => $request->dev_reference,
                "description" => $request->description
            ]);
        }

        return response()->json(["pay" => $guard, "cardSave" => $card], 200);
    }

    public function pse(Request $request)
    {
        try {
            $pay = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Auth-Token' => $this->authToken()
            ])->post('https://noccapi-stg.paymentez.com/linktopay/init_order/', [
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
            return response()->json("", 400);
        }
    }

    public function webhook(Request $request)
    {
        $pse = Pse::firstOrNew(['dev_reference' => $request["transaction"]["dev_reference"]]);

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
    }

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

## 10. FLUJO COMPLETO DE RESERVA

### 1. Búsqueda de Vuelos (SearchShow)
- Usuario selecciona origen/destino con autocompletado
- Selecciona fechas y número de pasajeros
- Envía búsqueda a API Amadeus `/api/flights`

### 2. Mostrar Resultados (ShowResponse)
- Procesa respuesta de Amadeus
- Muestra vuelos disponibles con precios
- Permite seleccionar vuelo específico
- Obtiene familias tarifarias con `/api/upsell`

### 3. Formulario de Pasajeros (ShowSegment)
- Captura datos de todos los pasajeros
- Validación de información personal
- Crea estructura de datos para PNR
- Envía a API `/api/savepnr` para crear reserva

### 4. Confirmación de Reserva (ShowPnr)
- Muestra resumen de la reserva creada
- Presenta opciones de pago
- Almacena datos en cache para emisión

### 5. Emisión de Tiquetes (ShowTicket)
- Procesa pago con tarjeta o PSE
- Envía solicitud de emisión a `/api/ticket`
- Confirma emisión exitosa
- Actualiza estado de la reserva

## 11. VALIDACIONES PRINCIPALES

```php
protected $rules = [
    "tel" => "required",
    "email" => "required|email",
    "name.*.adult" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*.adult" => "required|regex:/^[a-zA-Z\s]+$/",
    "gener.*.adult" => "required",
    "sex.*.adult" => "required",
    "birth.*.adult" => "required",
    "name.*.baby" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*.baby" => "required|regex:/^[a-zA-Z\s]+$/",
    "sex.*.baby" => "required",
    "birth.*.baby" => "required",
    "name.*" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*" => "required|regex:/^[a-zA-Z\s]+$/",
    "gener.*" => "required",
    "sex.*" => "required",
    "birth.*" => "required"
];
```

## 12. CACHE Y SESIONES

```php
// Almacenamiento de búsqueda de vuelos
Cache::put('flightResponse', [
    'response' => $response, 
    'flights' => $flights, 
    'passenger' => $this->passenger
]);

// Almacenamiento de selección de vuelo
Cache::put('keyFligth', [
    "going" => $this->going,
    "return" => $this->return,
    'passengers' => $this->passenger
]);

// Almacenamiento de datos para emisión
Cache::put("ticket", [
    "pnr" => $this->pnr["reserve"]["control_number"],
    "going" => $this->going,
    "return" => $this->return,
    "family" => $this->family,
    "reserve_id" => $this->pnr["reserve"]["id"],
    "paxes" => $this->pnr["reserve"]["travellers"]
]);
```

## 13. MIDDLEWARE Y PERMISOS

```php
// Rutas protegidas por permisos
Route::middleware('can:index')->group(function () {
    Route::get('flights/reserve', SearchShow::class);
    Route::get('flights-response/reserve', ShowResponse::class);
    Route::get('flights-response/pnr/reserve', ShowSegment::class);
    Route::get('flights-pnr/reserve', ShowPnr::class);
});

Route::middleware('can:issue')->group(function () {
    Route::get('flights-emit-ticket', ShowTicket::class);
});
```

## 14. INSTALACIÓN Y CONFIGURACIÓN

### 1. Instalar dependencias
```bash
composer install
npm install
```

### 2. Configurar base de datos
```bash
php artisan migrate
php artisan db:seed
```

### 3. Configurar permisos
```bash
php artisan permission:create-role "super admin"
php artisan permission:create-role "admin"
php artisan permission:create-role "supervisor"
php artisan permission:create-role "adviser"
php artisan permission:create-permission "index"
php artisan permission:create-permission "create"
php artisan permission:create-permission "issue"
```

### 4. Compilar assets
```bash
npm run dev
# o para producción
npm run build
```

### 5. Configurar variables de entorno
```env
APP_NAME="CRM Wellezy"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm_wellezy
DB_USERNAME=root
DB_PASSWORD=

APP_TRAVEL=https://tu-api-amadeus.com
APP_CARD_LOGIN=tu_login_paymentez
APP_CARD_PASSWORD=tu_password_paymentez
APP_CARD_URL=https://ccapi-stg.paymentez.com
```

## 15. ESTRUCTURA DE ARCHIVOS

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── FlightController.php
│   │       └── PayController.php
│   └── Livewire/
│       └── Flight/
│           ├── SearchShow.php
│           ├── ShowResponse.php
│           ├── Segment/
│           │   └── ShowSegment.php
│           └── Pnr/
│               ├── ShowPnr.php
│               ├── ShowTicket.php
│               └── ConsultPnr.php
├── Models/
│   ├── Reserve.php
│   ├── AmadeusReserve.php
│   ├── FlightReserve.php
│   └── Ticket.php
└── Traits/
    └── Amadeus/
        └── FlightTicketTrait.php

resources/views/livewire/flight/
├── search-show.blade.php
├── show-response.blade.php
├── segment/
│   └── show-segment.blade.php
└── pnr/
    ├── show-pnr.blade.php
    └── show-ticket.blade.php

routes/
├── web.php
├── api.php
└── web/
    └── gds.php
```

Esta documentación te permitirá recrear completamente el sistema de reservas y emisión de tiquetes. Cada sección incluye el código necesario y las configuraciones requeridas para implementar la funcionalidad completa.
