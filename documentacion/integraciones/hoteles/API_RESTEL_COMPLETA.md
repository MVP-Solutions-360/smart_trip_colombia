# 🌐 API RESTEL COMPLETA - INTEGRACIÓN DE HOTELES

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
APP_TRAVEL=https://tu-api-restel.com
RESTEL_API_URL=https://api.restel.com
RESTEL_API_KEY=tu_api_key_restel
RESTEL_API_SECRET=tu_api_secret_restel
RESTEL_ENVIRONMENT=staging # o production
```

### Configuración en config/services.php:
```php
<?php

return [
    'restel' => [
        'api_url' => env('RESTEL_API_URL'),
        'api_key' => env('RESTEL_API_KEY'),
        'api_secret' => env('RESTEL_API_SECRET'),
        'environment' => env('RESTEL_ENVIRONMENT', 'staging'),
    ],
];
```

## 2. ENDPOINTS PRINCIPALES

### 2.1 Búsqueda de Países
```
POST /api/restel/country
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "code": "CO"
}

Response:
{
    "success": true,
    "data": [
        {
            "code": "CO",
            "name": "Colombia",
            "currency": "COP",
            "timezone": "America/Bogota"
        }
    ]
}
```

### 2.2 Búsqueda de Ciudades
```
POST /api/restel/cities
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "code": "BOG"
}

Response:
{
    "success": true,
    "data": [
        {
            "code": "BOG",
            "name": "Bogotá",
            "country": "CO",
            "state": "Cundinamarca",
            "latitude": 4.6097100,
            "longitude": -74.0817500
        }
    ]
}
```

### 2.3 Búsqueda de Hoteles
```
POST /api/restel/hotels
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "city": "BOG",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0,
    "filters": {
        "price_min": 100000,
        "price_max": 500000,
        "stars": [4, 5],
        "amenities": ["wifi", "pool", "gym"]
    }
}

Response:
{
    "success": true,
    "data": {
        "hotels": [
            {
                "code": "HOTEL001",
                "name": "Hotel Tequendama",
                "address": "Carrera 10 # 26-21, Bogotá",
                "description": "Hotel de lujo en el centro de Bogotá",
                "stars": 5,
                "rating": 4.5,
                "price": 350000,
                "currency": "COP",
                "image": "https://example.com/hotel1.jpg",
                "amenities": ["wifi", "pool", "gym", "spa", "restaurant"],
                "location": {
                    "latitude": 4.6097100,
                    "longitude": -74.0817500,
                    "address": "Carrera 10 # 26-21, Bogotá"
                },
                "policies": {
                    "check_in": "15:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation until 24 hours before check-in"
                }
            }
        ],
        "total": 1,
        "pagination": {
            "current_page": 1,
            "per_page": 20,
            "total_pages": 1
        }
    }
}
```

### 2.4 Información Detallada del Hotel
```
POST /api/restel/information
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "hotel": "HOTEL001"
}

Response:
{
    "success": true,
    "data": {
        "code": "HOTEL001",
        "name": "Hotel Tequendama",
        "description": "Hotel de lujo en el centro de Bogotá",
        "address": "Carrera 10 # 26-21, Bogotá",
        "stars": 5,
        "rating": 4.5,
        "images": [
            "https://example.com/hotel1.jpg",
            "https://example.com/hotel2.jpg",
            "https://example.com/hotel3.jpg"
        ],
        "amenities": [
            {
                "code": "wifi",
                "name": "WiFi Gratuito",
                "icon": "wifi-icon"
            },
            {
                "code": "pool",
                "name": "Piscina",
                "icon": "pool-icon"
            }
        ],
        "room_types": [
            {
                "code": "STD",
                "name": "Habitación Estándar",
                "description": "Habitación con cama doble",
                "max_occupancy": 2,
                "amenities": ["wifi", "tv", "ac"]
            },
            {
                "code": "SUITE",
                "name": "Suite",
                "description": "Suite con sala de estar",
                "max_occupancy": 4,
                "amenities": ["wifi", "tv", "ac", "minibar", "balcony"]
            }
        ],
        "policies": {
            "check_in": "15:00",
            "check_out": "12:00",
            "cancellation": "Free cancellation until 24 hours before check-in",
            "pets": "Pets not allowed",
            "smoking": "Non-smoking rooms available"
        },
        "location": {
            "latitude": 4.6097100,
            "longitude": -74.0817500,
            "address": "Carrera 10 # 26-21, Bogotá",
            "nearby_attractions": [
                {
                    "name": "Museo del Oro",
                    "distance": "0.5 km"
                }
            ]
        }
    }
}
```

### 2.5 Verificar Disponibilidad
```
POST /api/restel/disponibility
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "hotel": "HOTEL001",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0
}

Response:
{
    "success": true,
    "data": {
        "hotel_code": "HOTEL001",
        "hotel_name": "Hotel Tequendama",
        "check_in": "2024-01-15",
        "check_out": "2024-01-17",
        "nights": 2,
        "availability": true,
        "room_types": [
            {
                "code": "STD",
                "name": "Habitación Estándar",
                "description": "Habitación con cama doble",
                "max_occupancy": 2,
                "rate": 350000,
                "currency": "COP",
                "rate_type": "per_night",
                "available_rooms": 5,
                "amenities": ["wifi", "tv", "ac"],
                "images": ["https://example.com/room1.jpg"],
                "cancellation_policy": "Free cancellation until 24 hours before check-in"
            },
            {
                "code": "SUITE",
                "name": "Suite",
                "description": "Suite con sala de estar",
                "max_occupancy": 4,
                "rate": 500000,
                "currency": "COP",
                "rate_type": "per_night",
                "available_rooms": 2,
                "amenities": ["wifi", "tv", "ac", "minibar", "balcony"],
                "images": ["https://example.com/suite1.jpg"],
                "cancellation_policy": "Free cancellation until 24 hours before check-in"
            }
        ],
        "total_amount": 700000,
        "currency": "COP"
    }
}
```

### 2.6 Crear Reserva
```
POST /api/restel/book
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "hotel": "HOTEL001",
    "check_in": "2024-01-15",
    "check_out": "2024-01-17",
    "rooms": 1,
    "adults": 2,
    "children": 0,
    "room_selection": [
        {
            "room_type": "STD",
            "rate": 350000,
            "nights": 2
        }
    ],
    "guest_info": {
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "3001234567",
        "special_requests": "Habitación en piso alto"
    },
    "payment_info": {
        "method": "credit_card",
        "card_token": "token_123456"
    }
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "RESTEL_123456",
        "confirmation_number": "HT001-20240115-123456",
        "status": "confirmed",
        "hotel": {
            "code": "HOTEL001",
            "name": "Hotel Tequendama",
            "address": "Carrera 10 # 26-21, Bogotá"
        },
        "dates": {
            "check_in": "2024-01-15",
            "check_out": "2024-01-17",
            "nights": 2
        },
        "rooms": [
            {
                "room_type": "STD",
                "rate": 350000,
                "nights": 2,
                "total": 700000
            }
        ],
        "guest": {
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "3001234567"
        },
        "total_amount": 700000,
        "currency": "COP",
        "payment_status": "paid",
        "cancellation_policy": "Free cancellation until 24 hours before check-in",
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.7 Consultar Reserva
```
POST /api/reserve/restel
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "id": "RESTEL_123456"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "RESTEL_123456",
        "confirmation_number": "HT001-20240115-123456",
        "status": "confirmed",
        "hotel": {
            "code": "HOTEL001",
            "name": "Hotel Tequendama",
            "address": "Carrera 10 # 26-21, Bogotá"
        },
        "dates": {
            "check_in": "2024-01-15",
            "check_out": "2024-01-17",
            "nights": 2
        },
        "rooms": [
            {
                "room_type": "STD",
                "rate": 350000,
                "nights": 2,
                "total": 700000
            }
        ],
        "guest": {
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "3001234567"
        },
        "total_amount": 700000,
        "currency": "COP",
        "payment_status": "paid",
        "cancellation_policy": "Free cancellation until 24 hours before check-in",
        "created_at": "2024-01-10T10:30:00Z",
        "updated_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.8 Cancelar Reserva
```
POST /api/restel/cancel
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "booking_id": "RESTEL_123456",
    "reason": "Change of plans"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "RESTEL_123456",
        "status": "cancelled",
        "cancellation_fee": 0,
        "refund_amount": 700000,
        "refund_currency": "COP",
        "cancelled_at": "2024-01-12T14:30:00Z"
    }
}
```

### 2.9 Modificar Reserva
```
POST /api/restel/modify
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "booking_id": "RESTEL_123456",
    "new_check_in": "2024-01-16",
    "new_check_out": "2024-01-18",
    "reason": "Schedule change"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "RESTEL_123456",
        "new_confirmation_number": "HT001-20240116-123456",
        "status": "modified",
        "old_dates": {
            "check_in": "2024-01-15",
            "check_out": "2024-01-17"
        },
        "new_dates": {
            "check_in": "2024-01-16",
            "check_out": "2024-01-18"
        },
        "modification_fee": 50000,
        "total_amount": 750000,
        "currency": "COP",
        "modified_at": "2024-01-12T16:45:00Z"
    }
}
```

## 3. CÓDIGOS DE ERROR

### Errores comunes:
```json
{
    "success": false,
    "error": {
        "code": "HOTEL_NOT_FOUND",
        "message": "Hotel no encontrado",
        "details": "El código de hotel especificado no existe"
    }
}

{
    "success": false,
    "error": {
        "code": "NO_AVAILABILITY",
        "message": "No hay disponibilidad",
        "details": "No hay habitaciones disponibles para las fechas seleccionadas"
    }
}

{
    "success": false,
    "error": {
        "code": "INVALID_DATES",
        "message": "Fechas inválidas",
        "details": "La fecha de check-out debe ser posterior a la fecha de check-in"
    }
}

{
    "success": false,
    "error": {
        "code": "PAYMENT_FAILED",
        "message": "Error en el pago",
        "details": "No se pudo procesar el pago con la tarjeta proporcionada"
    }
}

{
    "success": false,
    "error": {
        "code": "BOOKING_NOT_FOUND",
        "message": "Reserva no encontrada",
        "details": "El ID de reserva especificado no existe"
    }
}
```

## 4. AUTENTICACIÓN

### Generar token de acceso:
```php
public function generateAccessToken()
{
    $timestamp = time();
    $nonce = uniqid();
    $signature = hash_hmac('sha256', $timestamp . $nonce, env('RESTEL_API_SECRET'));
    
    $response = Http::post(env('RESTEL_API_URL') . '/auth/token', [
        'api_key' => env('RESTEL_API_KEY'),
        'timestamp' => $timestamp,
        'nonce' => $nonce,
        'signature' => $signature
    ]);
    
    return $response->json()['access_token'];
}
```

### Usar token en requests:
```php
public function makeAuthenticatedRequest($endpoint, $data)
{
    $token = $this->generateAccessToken();
    
    return Http::withHeaders([
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json'
    ])->post(env('RESTEL_API_URL') . $endpoint, $data);
}
```

## 5. RATE LIMITING

### Límites de API:
- **Búsquedas**: 100 requests por minuto
- **Reservas**: 20 requests por minuto
- **Consultas**: 200 requests por minuto

### Manejo de rate limiting:
```php
public function handleRateLimit($response)
{
    if ($response->status() === 429) {
        $retryAfter = $response->header('Retry-After');
        sleep($retryAfter);
        return $this->retryRequest();
    }
    
    return $response;
}
```

## 6. WEBHOOKS

### Configurar webhook:
```php
public function setupWebhook()
{
    $webhookUrl = env('APP_URL') . '/api/restel/webhook';
    
    return Http::post(env('RESTEL_API_URL') . '/webhooks', [
        'url' => $webhookUrl,
        'events' => [
            'booking.confirmed',
            'booking.cancelled',
            'booking.modified',
            'payment.completed',
            'payment.failed'
        ]
    ]);
}
```

### Procesar webhook:
```php
public function processWebhook(Request $request)
{
    $payload = $request->all();
    $signature = $request->header('X-Restel-Signature');
    
    if (!$this->verifyWebhookSignature($payload, $signature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }
    
    $event = $payload['event'];
    $data = $payload['data'];
    
    switch ($event) {
        case 'booking.confirmed':
            $this->handleBookingConfirmed($data);
            break;
        case 'booking.cancelled':
            $this->handleBookingCancelled($data);
            break;
        case 'payment.completed':
            $this->handlePaymentCompleted($data);
            break;
    }
    
    return response()->json(['status' => 'success']);
}
```

## 7. TESTING

### Tests unitarios:
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RestelApiTest extends TestCase
{
    public function test_search_hotels()
    {
        $response = $this->postJson('/api/restel/hotels', [
            'city' => 'BOG',
            'check_in' => '2024-01-15',
            'check_out' => '2024-01-17',
            'rooms' => 1,
            'adults' => 2,
            'children' => 0
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'hotels' => [
                            '*' => [
                                'code',
                                'name',
                                'price',
                                'amenities'
                            ]
                        ]
                    ]
                ]);
    }

    public function test_create_booking()
    {
        $response = $this->postJson('/api/restel/book', [
            'hotel' => 'HOTEL001',
            'check_in' => '2024-01-15',
            'check_out' => '2024-01-17',
            'rooms' => 1,
            'adults' => 2,
            'children' => 0,
            'guest_info' => [
                'name' => 'Juan Pérez',
                'email' => 'juan@example.com',
                'phone' => '3001234567'
            ]
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'booking_id',
                        'confirmation_number',
                        'status'
                    ]
                ]);
    }
}
```

## 8. MONITOREO Y LOGS

### Configurar logging:
```php
// config/logging.php
'channels' => [
    'restel' => [
        'driver' => 'daily',
        'path' => storage_path('logs/restel.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

### Logging de requests:
```php
public function logApiRequest($endpoint, $data, $response)
{
    \Log::channel('restel')->info('RESTEL API Request', [
        'endpoint' => $endpoint,
        'request_data' => $data,
        'response_status' => $response->status(),
        'response_data' => $response->json(),
        'timestamp' => now()
    ]);
}
```

Esta documentación completa de la API Restel te permitirá integrar completamente el sistema de hoteles con todas las funcionalidades necesarias para búsqueda, reserva y gestión de hoteles.
