# 🌐 API TERRAWIND COMPLETA - INTEGRACIÓN DE TRASLADOS

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
APP_TRAVEL=https://tu-api-terrawind.com
TERRAWIND_API_URL=https://api.terrawind.com
TERRAWIND_API_KEY=tu_api_key_terrawind
TERRAWIND_ENVIRONMENT=staging
TERRAWIND_WEBHOOK_SECRET=tu_webhook_secret
```

### Configuración en config/services.php:
```php
<?php

return [
    'terrawind' => [
        'api_url' => env('TERRAWIND_API_URL'),
        'api_key' => env('TERRAWIND_API_KEY'),
        'environment' => env('TERRAWIND_ENVIRONMENT'),
        'webhook_secret' => env('TERRAWIND_WEBHOOK_SECRET'),
    ],
];
```

## 2. ENDPOINTS PRINCIPALES

### 2.1 Búsqueda de ubicaciones
```
POST /api/terrawind/locations
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "query": "Bogotá",
    "type": "pickup"
}

Response:
{
    "success": true,
    "data": [
        {
            "code": "BOG",
            "name": "Aeropuerto El Dorado - Bogotá",
            "type": "airport",
            "address": "Aeropuerto El Dorado, Bogotá",
            "coordinates": {
                "latitude": 4.7016,
                "longitude": -74.1469
            }
        },
        {
            "code": "BOG_CITY",
            "name": "Centro de Bogotá",
            "type": "city",
            "address": "Centro de Bogotá, Colombia",
            "coordinates": {
                "latitude": 4.6097,
                "longitude": -74.0817
            }
        }
    ]
}
```

### 2.2 Búsqueda de traslados
```
POST /api/terrawind/transfers
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "pickup_location": "BOG",
    "dropoff_location": "Hotel Tequendama",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2,
    "luggage": 2,
    "transfer_type": "airport"
}

Response:
{
    "success": true,
    "data": {
        "transfers": [
            {
                "id": "TRANSFER001",
                "provider_id": "PROV001",
                "provider_name": "Transfers Colombia",
                "vehicle_type": "Sedán",
                "vehicle_category": "Económico",
                "capacity": 4,
                "luggage_capacity": 2,
                "duration": 45,
                "price": 85000,
                "currency": "COP",
                "features": ["Aire acondicionado", "WiFi", "Conductor profesional"],
                "vehicle_image": "https://example.com/sedan.jpg",
                "rating": 4.5,
                "reviews_count": 120
            },
            {
                "id": "TRANSFER002",
                "provider_id": "PROV002",
                "provider_name": "Luxury Transfers",
                "vehicle_type": "SUV",
                "vehicle_category": "Lujo",
                "capacity": 6,
                "luggage_capacity": 4,
                "duration": 50,
                "price": 120000,
                "currency": "COP",
                "features": ["Aire acondicionado", "WiFi", "Conductor profesional", "Agua", "Snacks"],
                "vehicle_image": "https://example.com/suv.jpg",
                "rating": 4.8,
                "reviews_count": 85
            }
        ],
        "total": 2,
        "search_criteria": {
            "pickup_location": "BOG",
            "dropoff_location": "Hotel Tequendama",
            "pickup_date": "2024-01-15",
            "pickup_time": "14:00",
            "passengers": 2,
            "luggage": 2
        }
    }
}
```

### 2.3 Detalles del traslado
```
POST /api/terrawind/transfer-details
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "transfer_id": "TRANSFER001"
}

Response:
{
    "success": true,
    "data": {
        "id": "TRANSFER001",
        "provider": {
            "id": "PROV001",
            "name": "Transfers Colombia",
            "rating": 4.5,
            "reviews_count": 120,
            "response_time": "15 min",
            "cancellation_policy": "Gratis hasta 2 horas antes"
        },
        "vehicle": {
            "type": "Sedán",
            "category": "Económico",
            "brand": "Toyota",
            "model": "Corolla",
            "year": 2023,
            "color": "Blanco",
            "capacity": 4,
            "luggage_capacity": 2,
            "features": [
                "Aire acondicionado",
                "WiFi gratuito",
                "Conductor profesional",
                "Sistema de navegación GPS",
                "Cargador USB"
            ],
            "images": [
                "https://example.com/sedan1.jpg",
                "https://example.com/sedan2.jpg"
            ]
        },
        "pricing": {
            "base_price": 85000,
            "currency": "COP",
            "price_breakdown": {
                "base_fare": 70000,
                "airport_fee": 10000,
                "toll_fee": 5000
            },
            "cancellation_fee": 0,
            "modification_fee": 15000
        },
        "route": {
            "distance": "25.5 km",
            "duration": "45 min",
            "pickup_location": {
                "name": "Aeropuerto El Dorado",
                "address": "Aeropuerto El Dorado, Bogotá",
                "coordinates": {
                    "latitude": 4.7016,
                    "longitude": -74.1469
                }
            },
            "dropoff_location": {
                "name": "Hotel Tequendama",
                "address": "Carrera 10 # 26-21, Bogotá",
                "coordinates": {
                    "latitude": 4.6097,
                    "longitude": -74.0817
                }
            }
        },
        "terms": {
            "cancellation_policy": "Cancelación gratuita hasta 2 horas antes del servicio",
            "modification_policy": "Modificaciones permitidas hasta 1 hora antes",
            "waiting_time": "15 minutos de espera incluidos",
            "additional_charges": "Tiempo de espera adicional: $5,000 COP por cada 15 minutos"
        }
    }
}
```

### 2.4 Verificar disponibilidad
```
POST /api/terrawind/availability
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "transfer_id": "TRANSFER001",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2,
    "luggage": 2
}

Response:
{
    "success": true,
    "data": {
        "transfer_id": "TRANSFER001",
        "available": true,
        "pickup_date": "2024-01-15",
        "pickup_time": "14:00",
        "vehicles": [
            {
                "id": "VEHICLE001",
                "type": "Sedán",
                "category": "Económico",
                "capacity": 4,
                "luggage_capacity": 2,
                "price": 85000,
                "currency": "COP",
                "available_units": 3,
                "features": ["Aire acondicionado", "WiFi", "Conductor profesional"]
            }
        ],
        "estimated_duration": "45 min",
        "estimated_distance": "25.5 km",
        "price_breakdown": {
            "base_fare": 70000,
            "airport_fee": 10000,
            "toll_fee": 5000,
            "total": 85000
        }
    }
}
```

### 2.5 Crear reserva
```
POST /api/terrawind/book
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "transfer_id": "TRANSFER001",
    "vehicle_id": "VEHICLE001",
    "pickup_date": "2024-01-15",
    "pickup_time": "14:00",
    "passengers": 2,
    "luggage": 2,
    "passenger_info": {
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "3001234567",
        "document": "12345678"
    },
    "special_requests": "Habitación 205, Hotel Tequendama",
    "payment_method": "credit_card",
    "payment_reference": "PAY_123456"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "BOOKING_123456",
        "confirmation_number": "TC001-20240115-123456",
        "status": "confirmed",
        "transfer": {
            "id": "TRANSFER001",
            "provider_name": "Transfers Colombia",
            "vehicle_type": "Sedán",
            "vehicle_category": "Económico"
        },
        "passenger": {
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "3001234567"
        },
        "pickup": {
            "location": "Aeropuerto El Dorado",
            "address": "Aeropuerto El Dorado, Bogotá",
            "date": "2024-01-15",
            "time": "14:00"
        },
        "dropoff": {
            "location": "Hotel Tequendama",
            "address": "Carrera 10 # 26-21, Bogotá"
        },
        "pricing": {
            "base_fare": 70000,
            "airport_fee": 10000,
            "toll_fee": 5000,
            "total": 85000,
            "currency": "COP"
        },
        "driver": {
            "name": "Carlos Rodríguez",
            "phone": "3009876543",
            "vehicle_plate": "ABC123",
            "vehicle_color": "Blanco",
            "vehicle_model": "Toyota Corolla 2023"
        },
        "tracking": {
            "tracking_url": "https://terrawind.com/track/BOOKING_123456",
            "status_updates": true
        },
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.6 Consultar reserva
```
POST /api/reserve/terrawind
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "id": "BOOKING_123456"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "BOOKING_123456",
        "confirmation_number": "TC001-20240115-123456",
        "status": "confirmed",
        "transfer": {
            "id": "TRANSFER001",
            "provider_name": "Transfers Colombia",
            "vehicle_type": "Sedán",
            "vehicle_category": "Económico"
        },
        "passenger": {
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "3001234567"
        },
        "pickup": {
            "location": "Aeropuerto El Dorado",
            "address": "Aeropuerto El Dorado, Bogotá",
            "date": "2024-01-15",
            "time": "14:00"
        },
        "dropoff": {
            "location": "Hotel Tequendama",
            "address": "Carrera 10 # 26-21, Bogotá"
        },
        "pricing": {
            "total": 85000,
            "currency": "COP"
        },
        "driver": {
            "name": "Carlos Rodríguez",
            "phone": "3009876543",
            "vehicle_plate": "ABC123"
        },
        "status_history": [
            {
                "status": "confirmed",
                "timestamp": "2024-01-10T10:30:00Z",
                "description": "Reserva confirmada"
            }
        ],
        "created_at": "2024-01-10T10:30:00Z",
        "updated_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.7 Cancelar reserva
```
POST /api/terrawind/cancel
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "booking_id": "BOOKING_123456",
    "reason": "Change of plans"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "BOOKING_123456",
        "status": "cancelled",
        "cancellation_fee": 0,
        "refund_amount": 85000,
        "refund_currency": "COP",
        "cancelled_at": "2024-01-12T14:30:00Z"
    }
}
```

### 2.8 Modificar reserva
```
POST /api/terrawind/modify
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "booking_id": "BOOKING_123456",
    "new_pickup_date": "2024-01-16",
    "new_pickup_time": "15:00",
    "reason": "Schedule change"
}

Response:
{
    "success": true,
    "data": {
        "booking_id": "BOOKING_123456",
        "new_confirmation_number": "TC001-20240116-123456",
        "status": "modified",
        "old_pickup": {
            "date": "2024-01-15",
            "time": "14:00"
        },
        "new_pickup": {
            "date": "2024-01-16",
            "time": "15:00"
        },
        "modification_fee": 15000,
        "total_amount": 100000,
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
        "code": "TRANSFER_NOT_FOUND",
        "message": "Traslado no encontrado",
        "details": "El ID de traslado especificado no existe"
    }
}

{
    "success": false,
    "error": {
        "code": "NO_AVAILABILITY",
        "message": "No hay disponibilidad",
        "details": "No hay vehículos disponibles para la fecha y hora seleccionadas"
    }
}

{
    "success": false,
    "error": {
        "code": "INVALID_PASSENGERS",
        "message": "Número de pasajeros inválido",
        "details": "El número de pasajeros excede la capacidad del vehículo"
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

{
    "success": false,
    "error": {
        "code": "CANCELLATION_NOT_ALLOWED",
        "message": "Cancelación no permitida",
        "details": "La reserva no puede ser cancelada en este momento"
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
    $signature = hash_hmac('sha256', $timestamp . $nonce, env('TERRAWIND_API_KEY'));
    
    $response = Http::post(env('TERRAWIND_API_URL') . '/auth/token', [
        'api_key' => env('TERRAWIND_API_KEY'),
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
    ])->post(env('TERRAWIND_API_URL') . $endpoint, $data);
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
    $webhookUrl = env('APP_URL') . '/api/terrawind/webhook';
    
    return Http::post(env('TERRAWIND_API_URL') . '/webhooks', [
        'url' => $webhookUrl,
        'events' => [
            'booking.confirmed',
            'booking.cancelled',
            'booking.modified',
            'driver.assigned',
            'driver.en_route',
            'driver.arrived',
            'transfer.completed'
        ]
    ]);
}
```

### Procesar webhook:
```php
public function processWebhook(Request $request)
{
    $payload = $request->all();
    $signature = $request->header('X-Terrawind-Signature');
    
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
        case 'driver.assigned':
            $this->handleDriverAssigned($data);
            break;
        case 'transfer.completed':
            $this->handleTransferCompleted($data);
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

class TerrawindApiTest extends TestCase
{
    public function test_search_transfers()
    {
        $response = $this->postJson('/api/terrawind/transfers', [
            'pickup_location' => 'BOG',
            'dropoff_location' => 'Hotel Tequendama',
            'pickup_date' => '2024-01-15',
            'pickup_time' => '14:00',
            'passengers' => 2,
            'luggage' => 2
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'transfers' => [
                            '*' => [
                                'id',
                                'vehicle_type',
                                'price',
                                'capacity'
                            ]
                        ]
                    ]
                ]);
    }

    public function test_create_booking()
    {
        $response = $this->postJson('/api/terrawind/book', [
            'transfer_id' => 'TRANSFER001',
            'vehicle_id' => 'VEHICLE001',
            'pickup_date' => '2024-01-15',
            'pickup_time' => '14:00',
            'passengers' => 2,
            'luggage' => 2,
            'passenger_info' => [
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
    'terrawind' => [
        'driver' => 'daily',
        'path' => storage_path('logs/terrawind.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

### Logging de requests:
```php
public function logApiRequest($endpoint, $data, $response)
{
    \Log::channel('terrawind')->info('Terrawind API Request', [
        'endpoint' => $endpoint,
        'request_data' => $data,
        'response_status' => $response->status(),
        'response_data' => $response->json(),
        'timestamp' => now()
    ]);
}
```

Esta documentación completa de la API Terrawind te permitirá integrar completamente el sistema de traslados con todas las funcionalidades necesarias para búsqueda, reserva y gestión de traslados.
