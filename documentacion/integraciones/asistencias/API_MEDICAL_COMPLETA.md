# 🌐 API MÉDICA COMPLETA - INTEGRACIÓN DE ASISTENCIAS MÉDICAS

## 1. CONFIGURACIÓN INICIAL

### Variables de entorno:
```env
APP_TRAVEL=https://tu-api-medical.com
MEDICAL_API_URL=https://api.medical-assistance.com
MEDICAL_API_KEY=tu_api_key_medical
MEDICAL_ENVIRONMENT=staging
MEDICAL_WEBHOOK_SECRET=tu_webhook_secret
```

### Configuración en config/services.php:
```php
<?php

return [
    'medical' => [
        'api_url' => env('MEDICAL_API_URL'),
        'api_key' => env('MEDICAL_API_KEY'),
        'environment' => env('MEDICAL_ENVIRONMENT'),
        'webhook_secret' => env('MEDICAL_WEBHOOK_SECRET'),
    ],
];
```

## 2. ENDPOINTS PRINCIPALES

### 2.1 Búsqueda de ciudades
```
POST /api/medical/cities
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "query": "Bogotá"
}

Response:
{
    "success": true,
    "data": [
        {
            "code": "BOG",
            "name": "Bogotá",
            "country": "Colombia",
            "state": "Cundinamarca"
        },
        {
            "code": "MED",
            "name": "Medellín",
            "country": "Colombia",
            "state": "Antioquia"
        }
    ]
}
```

### 2.2 Búsqueda de especialidades
```
POST /api/medical/specialties
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "query": "Cardiología"
}

Response:
{
    "success": true,
    "data": [
        {
            "code": "CARDIO",
            "name": "Cardiología",
            "description": "Especialidad médica que se encarga del corazón y sistema cardiovascular"
        },
        {
            "code": "NEURO",
            "name": "Neurología",
            "description": "Especialidad médica que se encarga del sistema nervioso"
        }
    ]
}
```

### 2.3 Búsqueda de centros médicos
```
POST /api/medical/centers
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "city": "BOG",
    "specialty": "CARDIO",
    "assistance_type": "consultation",
    "emergency": false,
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}

Response:
{
    "success": true,
    "data": {
        "centers": [
            {
                "id": "CENTER001",
                "name": "Clínica del Corazón",
                "type": "specialty_center",
                "address": "Carrera 15 # 93-47, Bogotá",
                "city": "Bogotá",
                "phone": "+57 1 234 5678",
                "email": "info@clinicacorazon.com",
                "rating": 4.7,
                "reviews_count": 156,
                "emergency_services": true,
                "specialties": ["Cardiología", "Cirugía Cardiovascular"],
                "facilities": ["Ambulatorio", "Urgencias", "Laboratorio", "Imágenes"],
                "image": "https://example.com/clinic-heart.jpg",
                "coordinates": {
                    "latitude": 4.6756,
                    "longitude": -74.0484
                }
            },
            {
                "id": "CENTER002",
                "name": "Hospital San Rafael",
                "type": "hospital",
                "address": "Calle 134 # 11-20, Bogotá",
                "city": "Bogotá",
                "phone": "+57 1 876 5432",
                "email": "info@hospitalsanrafael.com",
                "rating": 4.5,
                "reviews_count": 89,
                "emergency_services": true,
                "specialties": ["Cardiología", "Medicina Interna", "Pediatría"],
                "facilities": ["Ambulatorio", "Urgencias", "Laboratorio", "Imágenes", "Farmacia"],
                "image": "https://example.com/hospital-sanrafael.jpg",
                "coordinates": {
                    "latitude": 4.7016,
                    "longitude": -74.1469
                }
            }
        ],
        "total": 2,
        "search_criteria": {
            "city": "BOG",
            "specialty": "CARDIO",
            "assistance_type": "consultation",
            "emergency": false
        }
    }
}
```

### 2.4 Detalles del centro médico
```
POST /api/medical/center-details
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "center_id": "CENTER001"
}

Response:
{
    "success": true,
    "data": {
        "id": "CENTER001",
        "name": "Clínica del Corazón",
        "type": "specialty_center",
        "address": "Carrera 15 # 93-47, Bogotá",
        "city": "Bogotá",
        "phone": "+57 1 234 5678",
        "email": "info@clinicacorazon.com",
        "website": "https://clinicacorazon.com",
        "rating": 4.7,
        "reviews_count": 156,
        "emergency_services": true,
        "specialties": [
            {
                "id": "SPEC001",
                "name": "Cardiología",
                "description": "Especialidad médica del corazón"
            }
        ],
        "facilities": [
            "Ambulatorio",
            "Urgencias 24/7",
            "Laboratorio Clínico",
            "Imágenes Diagnósticas",
            "Farmacia",
            "Estacionamiento"
        ],
        "doctors": [
            {
                "id": "DOC001",
                "first_name": "Carlos",
                "last_name": "Rodríguez",
                "specialty": "Cardiología",
                "license_number": "12345",
                "experience_years": 15,
                "rating": 4.8,
                "reviews_count": 45,
                "languages": ["Español", "Inglés"],
                "education": [
                    "Universidad Nacional de Colombia",
                    "Especialización en Cardiología"
                ]
            }
        ],
        "pricing": {
            "consultation_fee": 150000,
            "emergency_fee": 200000,
            "currency": "COP"
        },
        "schedule": {
            "monday": "08:00-18:00",
            "tuesday": "08:00-18:00",
            "wednesday": "08:00-18:00",
            "thursday": "08:00-18:00",
            "friday": "08:00-18:00",
            "saturday": "08:00-14:00",
            "sunday": "Cerrado"
        },
        "coordinates": {
            "latitude": 4.6756,
            "longitude": -74.0484
        }
    }
}
```

### 2.5 Búsqueda de doctores
```
POST /api/medical/doctors
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "medical_center_id": "CENTER001",
    "specialty_id": "SPEC001",
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}

Response:
{
    "success": true,
    "data": {
        "doctors": [
            {
                "id": "DOC001",
                "first_name": "Carlos",
                "last_name": "Rodríguez",
                "specialty": "Cardiología",
                "license_number": "12345",
                "phone": "+57 300 123 4567",
                "email": "carlos.rodriguez@clinicacorazon.com",
                "experience_years": 15,
                "rating": 4.8,
                "reviews_count": 45,
                "consultation_fee": 150000,
                "currency": "COP",
                "languages": ["Español", "Inglés"],
                "education": [
                    "Universidad Nacional de Colombia",
                    "Especialización en Cardiología"
                ],
                "certifications": [
                    "Certificación en Ecocardiografía",
                    "Certificación en Cateterismo"
                ],
                "availability": [
                    {
                        "date": "2024-01-15",
                        "time_slots": [
                            "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
                        ]
                    }
                ]
            }
        ],
        "total": 1
    }
}
```

### 2.6 Verificar disponibilidad
```
POST /api/medical/availability
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "medical_center_id": "CENTER001",
    "doctor_id": "DOC001",
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}

Response:
{
    "success": true,
    "data": {
        "available": true,
        "medical_center_id": "CENTER001",
        "doctor_id": "DOC001",
        "appointment_date": "2024-01-15",
        "appointment_time": "14:00",
        "available_slots": [
            "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
        ],
        "estimated_duration": "30 min",
        "consultation_fee": 150000,
        "currency": "COP"
    }
}
```

### 2.7 Crear cita médica
```
POST /api/medical/appointment
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "medical_center_id": "CENTER001",
    "doctor_id": "DOC001",
    "assistance_type": "consultation",
    "patient_info": {
        "name": "Juan Pérez",
        "document": "12345678",
        "phone": "3001234567",
        "email": "juan@example.com",
        "age": 35,
        "gender": "M",
        "emergency_contact_name": "María Pérez",
        "emergency_contact_phone": "3009876543"
    },
    "medical_info": {
        "symptoms": "Dolor en el pecho y falta de aire",
        "medical_history": "Hipertensión arterial",
        "current_medications": "Losartán 50mg",
        "allergies": "Penicilina",
        "insurance_policy": "POL123456",
        "insurance_company": "Sura"
    },
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}

Response:
{
    "success": true,
    "data": {
        "appointment_id": "APT_123456",
        "confirmation_number": "MC001-20240115-123456",
        "medical_record_number": "MR001-20240115-123456",
        "status": "confirmed",
        "medical_center": {
            "id": "CENTER001",
            "name": "Clínica del Corazón",
            "address": "Carrera 15 # 93-47, Bogotá",
            "phone": "+57 1 234 5678"
        },
        "doctor": {
            "id": "DOC001",
            "name": "Dr. Carlos Rodríguez",
            "specialty": "Cardiología",
            "phone": "+57 300 123 4567"
        },
        "patient": {
            "name": "Juan Pérez",
            "document": "12345678",
            "phone": "3001234567",
            "email": "juan@example.com"
        },
        "appointment": {
            "date": "2024-01-15",
            "time": "14:00",
            "duration": "30 min"
        },
        "pricing": {
            "consultation_fee": 150000,
            "total": 150000,
            "currency": "COP"
        },
        "instructions": [
            "Llegar 15 minutos antes de la cita",
            "Traer documento de identidad",
            "Traer tarjeta de seguro médico si aplica",
            "Ayuno de 8 horas si se requiere exámenes"
        ],
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.8 Consultar cita médica
```
POST /api/reserve/medical
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "id": "APT_123456"
}

Response:
{
    "success": true,
    "data": {
        "appointment_id": "APT_123456",
        "confirmation_number": "MC001-20240115-123456",
        "medical_record_number": "MR001-20240115-123456",
        "status": "confirmed",
        "medical_center": {
            "id": "CENTER001",
            "name": "Clínica del Corazón",
            "address": "Carrera 15 # 93-47, Bogotá",
            "phone": "+57 1 234 5678"
        },
        "doctor": {
            "id": "DOC001",
            "name": "Dr. Carlos Rodríguez",
            "specialty": "Cardiología",
            "phone": "+57 300 123 4567"
        },
        "patient": {
            "name": "Juan Pérez",
            "document": "12345678",
            "phone": "3001234567",
            "email": "juan@example.com"
        },
        "appointment": {
            "date": "2024-01-15",
            "time": "14:00",
            "duration": "30 min"
        },
        "pricing": {
            "total": 150000,
            "currency": "COP"
        },
        "status_history": [
            {
                "status": "confirmed",
                "timestamp": "2024-01-10T10:30:00Z",
                "description": "Cita confirmada"
            }
        ],
        "created_at": "2024-01-10T10:30:00Z",
        "updated_at": "2024-01-10T10:30:00Z"
    }
}
```

### 2.9 Cancelar cita médica
```
POST /api/medical/cancel
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "appointment_id": "APT_123456",
    "reason": "Change of plans"
}

Response:
{
    "success": true,
    "data": {
        "appointment_id": "APT_123456",
        "status": "cancelled",
        "cancellation_fee": 0,
        "refund_amount": 150000,
        "refund_currency": "COP",
        "cancelled_at": "2024-01-12T14:30:00Z"
    }
}
```

### 2.10 Modificar cita médica
```
POST /api/medical/modify
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
    "appointment_id": "APT_123456",
    "new_appointment_date": "2024-01-16",
    "new_appointment_time": "15:00",
    "reason": "Schedule change"
}

Response:
{
    "success": true,
    "data": {
        "appointment_id": "APT_123456",
        "new_confirmation_number": "MC001-20240116-123456",
        "status": "modified",
        "old_appointment": {
            "date": "2024-01-15",
            "time": "14:00"
        },
        "new_appointment": {
            "date": "2024-01-16",
            "time": "15:00"
        },
        "modification_fee": 25000,
        "total_amount": 175000,
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
        "code": "CENTER_NOT_FOUND",
        "message": "Centro médico no encontrado",
        "details": "El ID de centro médico especificado no existe"
    }
}

{
    "success": false,
    "error": {
        "code": "NO_AVAILABILITY",
        "message": "No hay disponibilidad",
        "details": "No hay horarios disponibles para la fecha seleccionada"
    }
}

{
    "success": false,
    "error": {
        "code": "DOCTOR_NOT_AVAILABLE",
        "message": "Doctor no disponible",
        "details": "El doctor seleccionado no está disponible en ese horario"
    }
}

{
    "success": false,
    "error": {
        "code": "APPOINTMENT_NOT_FOUND",
        "message": "Cita médica no encontrada",
        "details": "El ID de cita médica especificado no existe"
    }
}

{
    "success": false,
    "error": {
        "code": "CANCELLATION_NOT_ALLOWED",
        "message": "Cancelación no permitida",
        "details": "La cita médica no puede ser cancelada en este momento"
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
    $signature = hash_hmac('sha256', $timestamp . $nonce, env('MEDICAL_API_KEY'));
    
    $response = Http::post(env('MEDICAL_API_URL') . '/auth/token', [
        'api_key' => env('MEDICAL_API_KEY'),
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
    ])->post(env('MEDICAL_API_URL') . $endpoint, $data);
}
```

## 5. RATE LIMITING

### Límites de API:
- **Búsquedas**: 100 requests por minuto
- **Citas**: 20 requests por minuto
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
    $webhookUrl = env('APP_URL') . '/api/medical/webhook';
    
    return Http::post(env('MEDICAL_API_URL') . '/webhooks', [
        'url' => $webhookUrl,
        'events' => [
            'appointment.confirmed',
            'appointment.cancelled',
            'appointment.modified',
            'appointment.reminder',
            'appointment.completed'
        ]
    ]);
}
```

### Procesar webhook:
```php
public function processWebhook(Request $request)
{
    $payload = $request->all();
    $signature = $request->header('X-Medical-Signature');
    
    if (!$this->verifyWebhookSignature($payload, $signature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }
    
    $event = $payload['event'];
    $data = $payload['data'];
    
    switch ($event) {
        case 'appointment.confirmed':
            $this->handleAppointmentConfirmed($data);
            break;
        case 'appointment.cancelled':
            $this->handleAppointmentCancelled($data);
            break;
        case 'appointment.reminder':
            $this->handleAppointmentReminder($data);
            break;
        case 'appointment.completed':
            $this->handleAppointmentCompleted($data);
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

class MedicalApiTest extends TestCase
{
    public function test_search_medical_centers()
    {
        $response = $this->postJson('/api/medical/centers', [
            'city' => 'BOG',
            'specialty' => 'CARDIO',
            'assistance_type' => 'consultation',
            'emergency' => false
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'centers' => [
                            '*' => [
                                'id',
                                'name',
                                'type',
                                'rating'
                            ]
                        ]
                    ]
                ]);
    }

    public function test_create_appointment()
    {
        $response = $this->postJson('/api/medical/appointment', [
            'medical_center_id' => 'CENTER001',
            'doctor_id' => 'DOC001',
            'assistance_type' => 'consultation',
            'patient_info' => [
                'name' => 'Juan Pérez',
                'document' => '12345678',
                'phone' => '3001234567',
                'email' => 'juan@example.com',
                'age' => 35,
                'gender' => 'M'
            ],
            'appointment_date' => '2024-01-15',
            'appointment_time' => '14:00'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'appointment_id',
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
    'medical' => [
        'driver' => 'daily',
        'path' => storage_path('logs/medical.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

### Logging de requests:
```php
public function logApiRequest($endpoint, $data, $response)
{
    \Log::channel('medical')->info('Medical API Request', [
        'endpoint' => $endpoint,
        'request_data' => $data,
        'response_status' => $response->status(),
        'response_data' => $response->json(),
        'timestamp' => now()
    ]);
}
```

Esta documentación completa de la API médica te permitirá integrar completamente el sistema de asistencias médicas con todas las funcionalidades necesarias para búsqueda, reserva y gestión de citas médicas.
