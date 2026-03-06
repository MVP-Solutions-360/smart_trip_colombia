# 🏥 DOCUMENTACIÓN COMPLETA - SISTEMA DE ASISTENCIAS MÉDICAS

## 1. ARQUITECTURA GENERAL

**Integración API:** Sistema de asistencias médicas personalizado  
**Frontend:** Livewire 2.10 + AdminLTE 3.8  
**Base de datos:** MySQL  
**Autenticación:** Laravel Sanctum + Jetstream  
**Proveedores:** Múltiples clínicas y hospitales

## 2. CONFIGURACIÓN INICIAL

### Variables de entorno requeridas:
```env
APP_TRAVEL=https://tu-api-asistencias.com
MEDICAL_API_URL=https://api.medical-assistance.com
MEDICAL_API_KEY=tu_api_key_medical
MEDICAL_ENVIRONMENT=staging
MEDICAL_WEBHOOK_SECRET=tu_webhook_secret
```

### Dependencias Composer:
```json
{
    "laravel/framework": "^9.19",
    "livewire/livewire": "^2.10",
    "guzzlehttp/guzzle": "^7.5"
}
```

## 3. ESTRUCTURA DE BASE DE DATOS

### Tabla principal: `medical_assistances`
```sql
CREATE TABLE medical_assistances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserve_id BIGINT UNSIGNED NOT NULL,
    assistance_type ENUM('emergency', 'consultation', 'specialist', 'checkup', 'vaccination') NOT NULL,
    medical_center_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NULL,
    specialty_id BIGINT UNSIGNED NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_document VARCHAR(50) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_age INT NOT NULL,
    patient_gender ENUM('M', 'F') NOT NULL,
    emergency_contact_name VARCHAR(255) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    appointment_date DATETIME NOT NULL,
    symptoms TEXT NULL,
    medical_history TEXT NULL,
    current_medications TEXT NULL,
    allergies TEXT NULL,
    insurance_policy VARCHAR(255) NULL,
    insurance_company VARCHAR(255) NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    confirmation_number VARCHAR(255) NULL,
    medical_record_number VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (reserve_id) REFERENCES reserves(id) ON DELETE CASCADE,
    FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (specialty_id) REFERENCES medical_specialties(id) ON DELETE SET NULL
);
```

### Tabla: `medical_centers`
```sql
CREATE TABLE medical_centers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('hospital', 'clinic', 'emergency_center', 'specialty_center') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    emergency_services BOOLEAN DEFAULT FALSE,
    specialties JSON NULL,
    facilities JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Tabla: `doctors`
```sql
CREATE TABLE doctors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    medical_center_id BIGINT UNSIGNED NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty_id BIGINT UNSIGNED NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    experience_years INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    languages JSON NULL,
    education JSON NULL,
    certifications JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (medical_center_id) REFERENCES medical_centers(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES medical_specialties(id) ON DELETE CASCADE
);
```

## 4. MODELOS PRINCIPALES

### MedicalAssistance.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalAssistance extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function medicalCenter()
    {
        return $this->belongsTo(MedicalCenter::class);
    }
    
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
    
    public function specialty()
    {
        return $this->belongsTo(MedicalSpecialty::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('assistance_type', $type);
    }
    
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
```

### MedicalCenter.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalCenter extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }
    
    public function assistances()
    {
        return $this->hasMany(MedicalAssistance::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
```

## 5. TRAIT DE ASISTENCIAS MÉDICAS

### MedicalAssistanceTrait.php
```php
<?php

namespace App\Traits\Medical;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait MedicalAssistanceTrait
{
    public function searchMedicalCenters($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/centers", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["centers"]
        ];
    }
    
    public function searchDoctors($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/doctors", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["doctors"]
        ];
    }
    
    public function checkAvailability($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/availability", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["availability"]
        ];
    }
    
    public function createAppointment($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/appointment", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["appointment"]
        ];
    }
    
    public function cancelAppointment($appointmentId)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/cancel", [
            'appointment_id' => $appointmentId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["cancellation"]
        ];
    }
    
    public function getAppointmentStatus($appointmentId)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/medical/status", [
            'appointment_id' => $appointmentId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["appointment"]
        ];
    }
}
```

## 6. ENDPOINTS DE API MÉDICA

### Búsqueda de centros médicos
```
POST /api/medical/centers
Body: {
    "city": "Bogotá",
    "specialty": "Cardiología",
    "assistance_type": "consultation",
    "emergency": false
}
```

### Búsqueda de doctores
```
POST /api/medical/doctors
Body: {
    "medical_center_id": 1,
    "specialty_id": 5,
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}
```

### Verificar disponibilidad
```
POST /api/medical/availability
Body: {
    "medical_center_id": 1,
    "doctor_id": 10,
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00"
}
```

### Crear cita médica
```
POST /api/medical/appointment
Body: {
    "medical_center_id": 1,
    "doctor_id": 10,
    "assistance_type": "consultation",
    "patient_info": {
        "name": "Juan Pérez",
        "document": "12345678",
        "phone": "3001234567",
        "email": "juan@example.com",
        "age": 35,
        "gender": "M"
    },
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00",
    "symptoms": "Dolor de cabeza persistente",
    "medical_history": "Hipertensión"
}
```

## 7. RUTAS PRINCIPALES

### routes/web/medical.php
```php
<?php

use App\Http\Livewire\Medical\SearchMedicalShow;
use App\Http\Livewire\Medical\MedicalShowResponse;
use App\Http\Livewire\Medical\Doctor\ShowDoctor;
use App\Http\Livewire\Medical\Doctor\FormDoctor;
use App\Http\Livewire\Reserve\Medical\IndexMedicalReserve;
use App\Http\Livewire\Reserve\Medical\ShowReserve;
use Illuminate\Support\Facades\Route;

// Búsqueda y reserva de asistencias médicas
Route::get('medical/assistance/', SearchMedicalShow::class)->middleware('can:index')->name("medical");
Route::get('medical-show/assistance', MedicalShowResponse::class)->middleware('can:index')->name("medical-show");
Route::get('medical-show/doctor/assistance', ShowDoctor::class)->middleware('can:index')->name("medical-doctor");
Route::get('medical/assistance/assistance', FormDoctor::class)->middleware('can:index')->name("medical-assistance");

// Consulta de reservas médicas
Route::get('medical/{medical}', IndexMedicalReserve::class)->middleware('can:index')->name("medical.index");
Route::get('medical-consult/{reserve}', ShowReserve::class)->middleware('can:index')->name("medical.consult");
```

## 8. CONTROLADORES DE API

### MedicalController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalAssistance;
use App\Models\MedicalCenter;
use App\Models\Doctor;
use Illuminate\Http\Request;

class MedicalController extends Controller
{
    public function store(Request $request)
    {
        $assistance = MedicalAssistance::create([
            "reserve_id" => $request->reserve_id,
            "assistance_type" => $request->assistance_type,
            "medical_center_id" => $request->medical_center_id,
            "doctor_id" => $request->doctor_id,
            "specialty_id" => $request->specialty_id,
            "patient_name" => $request->patient_name,
            "patient_document" => $request->patient_document,
            "patient_phone" => $request->patient_phone,
            "patient_email" => $request->patient_email,
            "patient_age" => $request->patient_age,
            "patient_gender" => $request->patient_gender,
            "emergency_contact_name" => $request->emergency_contact_name,
            "emergency_contact_phone" => $request->emergency_contact_phone,
            "appointment_date" => $request->appointment_date,
            "symptoms" => $request->symptoms,
            "medical_history" => $request->medical_history,
            "current_medications" => $request->current_medications,
            "allergies" => $request->allergies,
            "insurance_policy" => $request->insurance_policy,
            "insurance_company" => $request->insurance_company,
            "total_amount" => $request->total_amount,
            "status" => $request->status,
            "confirmation_number" => $request->confirmation_number,
            "medical_record_number" => $request->medical_record_number,
            "notes" => $request->notes
        ]);

        return $assistance;
    }
    
    public function getCenters()
    {
        $centers = MedicalCenter::active()
            ->with(['doctors', 'specialties'])
            ->get();
            
        return response()->json([
            'success' => true,
            'centers' => $centers
        ]);
    }
    
    public function getDoctors(Request $request)
    {
        $doctors = Doctor::where('medical_center_id', $request->medical_center_id)
            ->where('specialty_id', $request->specialty_id)
            ->where('is_active', true)
            ->get();
            
        return response()->json([
            'success' => true,
            'doctors' => $doctors
        ]);
    }
}
```

## 9. COMPONENTES LIVEWIRE PRINCIPALES

### SearchMedicalShow.php - Búsqueda de asistencias médicas
```php
<?php

namespace App\Http\Livewire\Medical;

use Livewire\Component;
use App\Traits\Medical\MedicalAssistanceTrait;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SearchMedicalShow extends Component
{
    use MedicalAssistanceTrait;
    
    public $assistanceType = 'consultation';
    public $city = '';
    public $specialty = '';
    public $emergency = false;
    public $appointmentDate = '';
    public $appointmentTime = '';
    public $searchCity = '';
    public $searchSpecialty = '';
    public $openCity = false;
    public $openSpecialty = false;
    public $field = [];

    protected $queryString = [
        'assistanceType', 'city', 'specialty', 'emergency', 
        'appointmentDate', 'appointmentTime'
    ];

    public function updatedSearchCity()
    {
        $this->openCity = true;
        $this->fetchCities($this->searchCity);
    }

    public function updatedSearchSpecialty()
    {
        $this->openSpecialty = true;
        $this->fetchSpecialties($this->searchSpecialty);
    }

    public function selectCity($code, $name)
    {
        $this->searchCity = $name;
        $this->city = $code;
        $this->openCity = false;
    }

    public function selectSpecialty($code, $name)
    {
        $this->searchSpecialty = $name;
        $this->specialty = $code;
        $this->openSpecialty = false;
    }

    private function fetchCities($query)
    {
        if (strlen($query) >= 3) {
            $response = Http::post(env('APP_TRAVEL')."/api/medical/cities", [
                'query' => $query
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    private function fetchSpecialties($query)
    {
        if (strlen($query) >= 3) {
            $response = Http::post(env('APP_TRAVEL')."/api/medical/specialties", [
                'query' => $query
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    protected $rules = [
        'assistanceType' => 'required|in:emergency,consultation,specialist,checkup,vaccination',
        'city' => 'required|string',
        'specialty' => 'required|string',
        'appointmentDate' => 'required|date|after:today',
        'appointmentTime' => 'required',
    ];

    public function search()
    {
        $this->validate();

        $searchData = [
            'city' => $this->city,
            'specialty' => $this->specialty,
            'assistance_type' => $this->assistanceType,
            'emergency' => $this->emergency,
            'appointment_date' => $this->appointmentDate,
            'appointment_time' => $this->appointmentTime
        ];

        $result = $this->searchMedicalCenters($searchData);
        
        if ($result['success']) {
            Cache::put('medicalSearch', [
                'search' => $searchData,
                'results' => $result['data']
            ]);
            redirect()->route('medical-show');
        } else {
            session()->flash('error', $result['message']);
        }
    }

    public function render()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $maxDate = now()->addMonth()->format('Y-m-d');
        
        return view('livewire.medical.search-medical-show', compact('tomorrow', 'maxDate'));
    }
}
```

### MedicalShowResponse.php - Mostrar resultados
```php
<?php

namespace App\Http\Livewire\Medical;

use Livewire\Component;
use App\Traits\Medical\MedicalAssistanceTrait;
use Illuminate\Support\Facades\Cache;

class MedicalShowResponse extends Component
{
    use MedicalAssistanceTrait;
    
    public $centers = [];
    public $search = [];
    public $selectedCenter = null;
    public $centerDetails = null;
    public $availability = null;

    public function mount()
    {
        $cache = Cache::get('medicalSearch');
        $this->search = $cache['search'];
        $this->centers = $cache['results'];
    }

    public function selectCenter($centerId)
    {
        $this->selectedCenter = $centerId;
        $result = $this->getCenterDetails($centerId);
        
        if ($result['success']) {
            $this->centerDetails = $result['data'];
        }
    }

    public function checkAvailability($centerId)
    {
        $availabilityData = array_merge($this->search, ['medical_center_id' => $centerId]);
        $result = $this->checkAvailability($availabilityData);
        
        if ($result['success']) {
            $this->availability = $result['data'];
            Cache::put('medicalAvailability', [
                'center' => $centerId,
                'search' => $this->search,
                'availability' => $this->availability
            ]);
            redirect()->route('medical-doctor');
        }
    }

    public function render()
    {
        return view('livewire.medical.medical-show-response');
    }
}
```

## 10. FLUJO COMPLETO DE ASISTENCIA MÉDICA

### 1. Búsqueda (SearchMedicalShow)
- Usuario selecciona tipo de asistencia
- Especifica ciudad y especialidad
- Selecciona fecha y hora de cita
- Envía búsqueda a API médica

### 2. Resultados (MedicalShowResponse)
- Muestra centros médicos disponibles
- Permite ver detalles del centro
- Verifica disponibilidad específica

### 3. Selección de Doctor (ShowDoctor)
- Muestra doctores disponibles
- Permite seleccionar especialista
- Muestra horarios disponibles

### 4. Formulario de Cita (FormDoctor)
- Captura datos del paciente
- Confirma selección de doctor
- Crea cita médica en API

### 5. Confirmación
- Muestra confirmación de cita
- Genera número de confirmación
- Envía email de confirmación

## 11. VALIDACIONES PRINCIPALES

```php
protected $rules = [
    'assistanceType' => 'required|in:emergency,consultation,specialist,checkup,vaccination',
    'city' => 'required|string',
    'specialty' => 'required|string',
    'appointmentDate' => 'required|date|after:today',
    'appointmentTime' => 'required',
    'patientInfo.name' => 'required|string|max:255',
    'patientInfo.document' => 'required|string',
    'patientInfo.phone' => 'required|string',
    'patientInfo.email' => 'required|email',
    'patientInfo.age' => 'required|integer|min:0|max:120',
    'patientInfo.gender' => 'required|in:M,F',
    'selectedDoctor' => 'required|string',
];
```

## 12. CACHE Y SESIONES

```php
// Almacenamiento de búsqueda
Cache::put('medicalSearch', [
    'search' => $searchData,
    'results' => $result['data']
]);

// Almacenamiento de disponibilidad
Cache::put('medicalAvailability', [
    'center' => $centerId,
    'search' => $this->search,
    'availability' => $this->availability
]);
```

Esta documentación completa del sistema de asistencias médicas te permitirá implementar toda la funcionalidad de búsqueda, selección y reserva de servicios médicos con integración de centros médicos y doctores.
