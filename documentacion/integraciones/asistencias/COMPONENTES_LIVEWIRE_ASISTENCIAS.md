# 🏥 COMPONENTES LIVEWIRE DETALLADOS - SISTEMA DE ASISTENCIAS MÉDICAS

## 1. SearchMedicalShow.php - Búsqueda de Asistencias Médicas

### Propiedades principales:
```php
public $assistanceType = 'consultation';  // Tipo de asistencia
public $city = '';                        // Ciudad
public $specialty = '';                   // Especialidad médica
public $emergency = false;                // Es emergencia
public $appointmentDate = '';             // Fecha de cita
public $appointmentTime = '';             // Hora de cita
public $searchCity = '';                  // Búsqueda de ciudad
public $searchSpecialty = '';             // Búsqueda de especialidad
public $openCity = false;                 // Estado del dropdown ciudad
public $openSpecialty = false;            // Estado del dropdown especialidad
public $field = [];                       // Resultados de búsqueda
```

### Métodos principales:

#### updatedSearchCity() / updatedSearchSpecialty()
```php
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
```

#### selectCity() / selectSpecialty()
```php
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
```

#### fetchCities() / fetchSpecialties()
```php
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
```

#### search() - Realizar búsqueda
```php
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
```

### Validaciones:
```php
protected $rules = [
    'assistanceType' => 'required|in:emergency,consultation,specialist,checkup,vaccination',
    'city' => 'required|string',
    'specialty' => 'required|string',
    'appointmentDate' => 'required|date|after:today',
    'appointmentTime' => 'required',
];
```

## 2. MedicalShowResponse.php - Mostrar Resultados

### Propiedades principales:
```php
public $centers = [];                     // Lista de centros médicos
public $search = [];                      // Criterios de búsqueda
public $selectedCenter = null;            // Centro seleccionado
public $centerDetails = null;             // Detalles del centro
public $availability = null;              // Disponibilidad del centro
```

### Métodos principales:

#### mount() - Cargar datos de búsqueda
```php
public function mount()
{
    $cache = Cache::get('medicalSearch');
    $this->search = $cache['search'];
    $this->centers = $cache['results'];
}
```

#### selectCenter() - Seleccionar centro
```php
public function selectCenter($centerId)
{
    $this->selectedCenter = $centerId;
    $result = $this->getCenterDetails($centerId);
    
    if ($result['success']) {
        $this->centerDetails = $result['data'];
    }
}
```

#### checkAvailability() - Verificar disponibilidad
```php
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
```

## 3. ShowDoctor.php - Selección de Doctores

### Propiedades principales:
```php
public $center = null;                    // ID del centro médico
public $search = [];                      // Criterios de búsqueda
public $availability = null;              // Disponibilidad
public $doctors = [];                     // Doctores disponibles
public $selectedDoctor = null;            // Doctor seleccionado
public $totalAmount = 0;                  // Monto total
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('medicalAvailability');
    $this->center = $cache['center'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->loadDoctors();
}
```

#### loadDoctors() - Cargar doctores
```php
private function loadDoctors()
{
    $this->doctors = $this->availability['doctors'] ?? [];
}
```

#### selectDoctor() - Seleccionar doctor
```php
public function selectDoctor($doctorId)
{
    $this->selectedDoctor = $doctorId;
    $this->calculateTotal();
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    if ($this->selectedDoctor && $this->doctors) {
        $doctor = collect($this->doctors)->firstWhere('id', $this->selectedDoctor);
        if ($doctor) {
            $this->totalAmount = $doctor['consultation_fee'];
        }
    }
}
```

## 4. FormDoctor.php - Formulario de Cita Médica

### Propiedades principales:
```php
public $center = null;                    // ID del centro médico
public $search = [];                      // Criterios de búsqueda
public $availability = null;              // Disponibilidad
public $patientInfo = [                   // Información del paciente
    'name' => '',
    'document' => '',
    'phone' => '',
    'email' => '',
    'age' => '',
    'gender' => '',
    'emergency_contact_name' => '',
    'emergency_contact_phone' => ''
];
public $medicalInfo = [                   // Información médica
    'symptoms' => '',
    'medical_history' => '',
    'current_medications' => '',
    'allergies' => '',
    'insurance_policy' => '',
    'insurance_company' => ''
];
public $selectedDoctor = null;            // Doctor seleccionado
public $totalAmount = 0;                  // Monto total
public $successMessage = '';              // Mensaje de éxito
public $errorMessage = '';                // Mensaje de error
```

### Métodos principales:

#### mount() - Cargar datos
```php
public function mount()
{
    $cache = Cache::get('medicalAvailability');
    $this->center = $cache['center'];
    $this->search = $cache['search'];
    $this->availability = $cache['availability'];
    
    $this->calculateTotal();
}
```

#### selectDoctor() - Seleccionar doctor
```php
public function selectDoctor($doctorId)
{
    $this->selectedDoctor = $doctorId;
    $this->calculateTotal();
}
```

#### calculateTotal() - Calcular total
```php
private function calculateTotal()
{
    if ($this->selectedDoctor && $this->availability) {
        $doctor = collect($this->availability['doctors'])->firstWhere('id', $this->selectedDoctor);
        if ($doctor) {
            $this->totalAmount = $doctor['consultation_fee'];
        }
    }
}
```

#### createAppointment() - Crear cita médica
```php
public function createAppointment()
{
    $this->validate();

    $appointmentData = [
        'medical_center_id' => $this->center,
        'doctor_id' => $this->selectedDoctor,
        'assistance_type' => $this->search['assistance_type'],
        'patient_info' => $this->patientInfo,
        'medical_info' => $this->medicalInfo,
        'appointment_date' => $this->search['appointment_date'],
        'appointment_time' => $this->search['appointment_time']
    ];

    $result = $this->createAppointment($appointmentData);
    
    if ($result['success']) {
        // Crear asistencia médica en base de datos
        $medicalAssistance = MedicalAssistance::create([
            'reserve_id' => 1, // ID de reserva principal
            'assistance_type' => $this->search['assistance_type'],
            'medical_center_id' => $this->center,
            'doctor_id' => $this->selectedDoctor,
            'specialty_id' => $this->search['specialty_id'],
            'patient_name' => $this->patientInfo['name'],
            'patient_document' => $this->patientInfo['document'],
            'patient_phone' => $this->patientInfo['phone'],
            'patient_email' => $this->patientInfo['email'],
            'patient_age' => $this->patientInfo['age'],
            'patient_gender' => $this->patientInfo['gender'],
            'emergency_contact_name' => $this->patientInfo['emergency_contact_name'],
            'emergency_contact_phone' => $this->patientInfo['emergency_contact_phone'],
            'appointment_date' => $this->search['appointment_date'],
            'symptoms' => $this->medicalInfo['symptoms'],
            'medical_history' => $this->medicalInfo['medical_history'],
            'current_medications' => $this->medicalInfo['current_medications'],
            'allergies' => $this->medicalInfo['allergies'],
            'insurance_policy' => $this->medicalInfo['insurance_policy'],
            'insurance_company' => $this->medicalInfo['insurance_company'],
            'total_amount' => $this->totalAmount,
            'status' => 'confirmed',
            'confirmation_number' => $result['data']['confirmation_number'],
            'medical_record_number' => $result['data']['medical_record_number']
        ]);

        $this->successMessage = 'Cita médica creada exitosamente';
        redirect()->route('medical-confirmation', $medicalAssistance->id);
    } else {
        $this->errorMessage = $result['message'];
    }
}
```

### Validaciones:
```php
protected $rules = [
    'patientInfo.name' => 'required|string|max:255',
    'patientInfo.document' => 'required|string',
    'patientInfo.phone' => 'required|string',
    'patientInfo.email' => 'required|email',
    'patientInfo.age' => 'required|integer|min:0|max:120',
    'patientInfo.gender' => 'required|in:M,F',
    'selectedDoctor' => 'required|string',
];
```

## 5. IndexMedicalReserve.php - Consulta de Reservas Médicas

### Propiedades principales:
```php
public $medical;                          // Datos de reserva médica
public $reserve;                          // Reserva principal
public $centerDetails = null;             // Detalles del centro
public $doctorDetails = null;             // Detalles del doctor
```

### Métodos principales:

#### mount() - Cargar datos de reserva
```php
public function mount($medical)
{
    $this->medical = Http::post(env('APP_TRAVEL')."/api/reserve/medical", [
        'id' => $medical,
    ])->json();
    
    if ($this->medical) {
        $this->loadCenterDetails();
        $this->loadDoctorDetails();
    }
}
```

#### loadCenterDetails() - Cargar detalles del centro
```php
private function loadCenterDetails()
{
    $result = $this->getCenterDetails($this->medical['medical_center_id']);
    
    if ($result['success']) {
        $this->centerDetails = $result['data'];
    }
}
```

#### loadDoctorDetails() - Cargar detalles del doctor
```php
private function loadDoctorDetails()
{
    $result = $this->getDoctorDetails($this->medical['doctor_id']);
    
    if ($result['success']) {
        $this->doctorDetails = $result['data'];
    }
}
```

## 6. ShowReserve.php - Mostrar Reservas Médicas

### Propiedades principales:
```php
public $reserves = [];                    // Lista de reservas
public $office;                           // Oficina del usuario
public $admin;                            // Administrador
public $user;                             // Usuario actual
```

### Métodos principales:

#### mount() - Cargar reservas
```php
public function mount()
{
    $this->user = User::find(auth()->id());
    $roles = $this->user->getRoleNames()->toArray();
    $this->office = $this->user->offices()->where("state", "Activo")->first();
    $this->admin = $this->office->admin;

    $rolesPrioritarios = ['super admin', 'admin', "supervisor", 'adviser'];

    $role = null;
    foreach ($rolesPrioritarios as $rol) {
        if (in_array($rol, $roles)) {
            $role = $rol;
            break;
        }
    }
    
    $this->reserves = $this->dataMedical($role);
}
```

#### dataMedical() - Obtener datos según rol
```php
public function dataMedical($role)
{
    if ($role == "super admin") {
        $user = ["user" => "", "office" => "", "admin" => ""];
    } elseif ($role == "admin") {
        $user["admin"] = $this->admin->id;
    } elseif ($role == "supervisor") {
        $user["office"] = $this->office->id;
    } elseif ($role == "adviser") {
        $user["user"] = $this->user->id;
    }
    
    return Http::get(env('APP_TRAVEL')."/api/data/medical", $user)->json();
}
```

## 7. VISTAS BLADE PRINCIPALES

### search-medical-show.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Búsqueda de Asistencias Médicas</h2>
        <p class="text-gray-600">Encuentra el servicio médico que necesitas</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <form wire:submit.prevent="search">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <!-- Tipo de asistencia -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Asistencia*</label>
                    <select wire:model="assistanceType" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="consultation">Consulta General</option>
                        <option value="specialist">Especialista</option>
                        <option value="emergency">Emergencia</option>
                        <option value="checkup">Chequeo Médico</option>
                        <option value="vaccination">Vacunación</option>
                    </select>
                </div>

                <!-- Ciudad -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad*</label>
                    <input type="text" wire:model.debounce.300ms="searchCity" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar ciudad">
                    <div class="relative" x-data="{ open: @entangle('openCity') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $city)
                                <button type="button" 
                                        wire:click="selectCity('{{ $city['code'] }}', '{{ $city['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $city['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron ciudades</div>
                            @endforelse
                        </div>
                    </div>
                    @error('city') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <!-- Especialidad -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Especialidad*</label>
                    <input type="text" wire:model.debounce.300ms="searchSpecialty" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Buscar especialidad">
                    <div class="relative" x-data="{ open: @entangle('openSpecialty') }">
                        <div x-show="open" @click.away="open = false" 
                             class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            @forelse($field as $specialty)
                                <button type="button" 
                                        wire:click="selectSpecialty('{{ $specialty['code'] }}', '{{ $specialty['name'] }}')"
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100">
                                    {{ $specialty['name'] }}
                                </button>
                            @empty
                                <div class="px-4 py-2 text-gray-500">No se encontraron especialidades</div>
                            @endforelse
                        </div>
                    </div>
                    @error('specialty') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Fecha y hora -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Cita*</label>
                    <input type="date" wire:model="appointmentDate" 
                           min="{{ $tomorrow }}" max="{{ $maxDate }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('appointmentDate') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Cita*</label>
                    <input type="time" wire:model="appointmentTime" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('appointmentTime') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Emergencia -->
            <div class="mb-6">
                <label class="flex items-center">
                    <input type="checkbox" wire:model="emergency" 
                           class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <span class="ml-2 text-sm text-gray-700">Es una emergencia médica</span>
                </label>
            </div>

            <button type="submit" 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Buscar Centros Médicos
            </button>
        </form>
    </div>
</div>
```

### medical-show-response.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Centros Médicos Disponibles</h2>
        <p class="text-gray-600">{{ count($centers) }} centros médicos encontrados</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Tipo</label>
                <select wire:model="typeFilter" class="border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Todos los tipos</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clínica</option>
                    <option value="emergency_center">Centro de Emergencias</option>
                    <option value="specialty_center">Centro Especializado</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Calificación</label>
                <select wire:model="ratingFilter" class="border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Todas las calificaciones</option>
                    <option value="4.5+">4.5+ estrellas</option>
                    <option value="4.0+">4.0+ estrellas</option>
                    <option value="3.5+">3.5+ estrellas</option>
                </select>
            </div>
        </div>
    </div>

    <div class="space-y-6">
        @foreach($centers as $center)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Información del centro -->
                    <div class="md:w-2/3">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-semibold">{{ $center['name'] }}</h3>
                            <div class="flex items-center space-x-2">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                    <span class="text-sm text-gray-600 ml-1">{{ $center['rating'] }}</span>
                                </div>
                                <span class="text-sm text-gray-500">({{ $center['reviews_count'] }} reseñas)</span>
                            </div>
                        </div>
                        
                        <p class="text-gray-600 mb-2">{{ $center['type'] }} • {{ $center['city'] }}</p>
                        <p class="text-sm text-gray-500 mb-4">{{ $center['address'] }}</p>
                        
                        <!-- Especialidades -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($center['specialties'] as $specialty)
                                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {{ $specialty }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Servicios -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($center['facilities'] as $facility)
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {{ $facility }}
                                </span>
                            @endforeach
                        </div>
                        
                        <!-- Información de contacto -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Teléfono</p>
                                <p class="font-semibold">{{ $center['phone'] }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Email</p>
                                <p class="font-semibold">{{ $center['email'] ?? 'No disponible' }}</p>
                            </div>
                        </div>
                        
                        <!-- Botones de acción -->
                        <div class="flex space-x-2">
                            <button wire:click="selectCenter('{{ $center['id'] }}')"
                                    class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                Ver Detalles
                            </button>
                            <button wire:click="checkAvailability('{{ $center['id'] }}')"
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Verificar Disponibilidad
                            </button>
                        </div>
                    </div>
                    
                    <!-- Imagen del centro -->
                    <div class="md:w-1/3">
                        <img src="{{ $center['image'] ?? '/images/medical-center-placeholder.jpg' }}" 
                             alt="{{ $center['name'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    @if(empty($centers))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron centros médicos para los criterios seleccionados</div>
            <button wire:click="$emit('refresh')" 
                    class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </button>
        </div>
    @endif
</div>
```

### form-doctor.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Completar Cita Médica</h2>
        <p class="text-gray-600">Confirme los detalles de su cita médica</p>
    </div>

    <!-- Información del centro médico -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Centro Médico</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Centro</p>
                <p class="font-semibold">{{ $centerDetails['name'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Dirección</p>
                <p class="font-semibold">{{ $centerDetails['address'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Fecha y Hora</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($search['appointment_date'])->format('d/m/Y') }} {{ $search['appointment_time'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Especialidad</p>
                <p class="font-semibold">{{ $search['specialty'] }}</p>
            </div>
        </div>
    </div>

    <!-- Selección de doctor -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Seleccionar Doctor</h3>
        <div class="space-y-4">
            @foreach($availability['doctors'] as $doctor)
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                    {{ $selectedDoctor == $doctor['id'] ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }}">
                    <input type="radio" wire:model="selectedDoctor" value="{{ $doctor['id'] }}" class="mr-4">
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium">Dr. {{ $doctor['first_name'] }} {{ $doctor['last_name'] }}</h4>
                                <p class="text-sm text-gray-600">{{ $doctor['specialty'] }}</p>
                                <div class="flex space-x-4 mt-2">
                                    <span class="text-sm text-gray-500">Experiencia: {{ $doctor['experience_years'] }} años</span>
                                    <span class="text-sm text-gray-500">Calificación: {{ $doctor['rating'] }}/5</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-xl font-bold text-blue-600">
                                    ${{ number_format($doctor['consultation_fee'], 0, ',', '.') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </label>
            @endforeach
        </div>
    </div>

    <!-- Información del paciente -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Paciente</h3>
        <form wire:submit.prevent="createAppointment">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo*</label>
                    <input type="text" wire:model="patientInfo.name" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('patientInfo.name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad*</label>
                    <input type="text" wire:model="patientInfo.document" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('patientInfo.document') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
                    <input type="tel" wire:model="patientInfo.phone" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('patientInfo.phone') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input type="email" wire:model="patientInfo.email" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('patientInfo.email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Edad*</label>
                    <input type="number" wire:model="patientInfo.age" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('patientInfo.age') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Género*</label>
                    <select wire:model="patientInfo.gender" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    @error('patientInfo.gender') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>
            </div>

            <!-- Información médica -->
            <div class="border-t pt-4 mb-4">
                <h4 class="font-medium text-gray-700 mb-4">Información Médica</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
                        <textarea wire:model="medicalInfo.symptoms" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3" placeholder="Describa sus síntomas"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Historial Médico</label>
                        <textarea wire:model="medicalInfo.medical_history" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3" placeholder="Enfermedades previas, cirugías, etc."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Medicamentos Actuales</label>
                        <textarea wire:model="medicalInfo.current_medications" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3" placeholder="Medicamentos que está tomando actualmente"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                        <textarea wire:model="medicalInfo.allergies" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3" placeholder="Alergias conocidas"></textarea>
                    </div>
                </div>
            </div>

            <!-- Información de emergencia -->
            <div class="border-t pt-4 mb-4">
                <h4 class="font-medium text-gray-700 mb-4">Contacto de Emergencia</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
                        <input type="text" wire:model="patientInfo.emergency_contact_name" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono del Contacto</label>
                        <input type="tel" wire:model="patientInfo.emergency_contact_phone" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
            </div>

            <!-- Resumen de precios -->
            <div class="border-t pt-4">
                <h4 class="font-medium text-gray-700 mb-2">Resumen de Precios</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Consulta médica</span>
                        <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                    </div>
                    <div class="border-t pt-2">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <button type="submit" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                    Confirmar Cita Médica
                </button>
            </div>
        </form>
    </div>

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
</div>
```

## 8. EVENTOS Y LISTENERS

### Eventos principales:
```php
// En SearchMedicalShow
$this->emit('medicalSearch', $searchData);

// En MedicalShowResponse
$this->emit('centerSelected', $centerId);

// Listeners en FormDoctor
protected $listeners = ["doctorSelected", "patientInfoUpdated"];
```

## 9. QUERY STRINGS PARA PERSISTENCIA

```php
// En SearchMedicalShow
protected $queryString = [
    'assistanceType', 'city', 'specialty', 'emergency', 
    'appointmentDate', 'appointmentTime'
];

// En MedicalShowResponse
protected $queryString = [
    'selectedCenter', 'centerDetails'
];
```

Esta documentación detallada de los componentes Livewire para asistencias médicas te permitirá implementar toda la funcionalidad de búsqueda, selección y reserva de servicios médicos con integración de centros médicos y doctores.
