# 🎨 VISTAS BLADE COMPLETAS - SISTEMA DE ASISTENCIAS MÉDICAS

## 1. BÚSQUEDA DE ASISTENCIAS MÉDICAS

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

## 2. RESULTADOS DE CENTROS MÉDICOS

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

## 3. SELECCIÓN DE DOCTORES

### show-doctor.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Seleccionar Doctor</h2>
        <p class="text-gray-600">Elija el doctor para su cita médica</p>
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

    <!-- Doctores disponibles -->
    <div class="space-y-4">
        @foreach($doctors as $doctor)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Información del doctor -->
                    <div class="md:w-2/3">
                        <h4 class="text-lg font-semibold mb-2">Dr. {{ $doctor['first_name'] }} {{ $doctor['last_name'] }}</h4>
                        <p class="text-gray-600 mb-2">{{ $doctor['specialty'] }}</p>
                        
                        <!-- Detalles del doctor -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Experiencia</p>
                                <p class="font-semibold">{{ $doctor['experience_years'] }} años</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Calificación</p>
                                <p class="font-semibold">{{ $doctor['rating'] }}/5 ({{ $doctor['reviews_count'] }} reseñas)</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Idiomas</p>
                                <p class="font-semibold">{{ implode(', ', $doctor['languages']) }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Licencia</p>
                                <p class="font-semibold">{{ $doctor['license_number'] }}</p>
                            </div>
                        </div>
                        
                        <!-- Educación y certificaciones -->
                        <div class="mb-4">
                            <h5 class="font-medium text-gray-700 mb-2">Educación</h5>
                            <ul class="text-sm text-gray-600 space-y-1">
                                @foreach($doctor['education'] as $education)
                                    <li>• {{ $education }}</li>
                                @endforeach
                            </ul>
                        </div>
                        
                        <div class="mb-4">
                            <h5 class="font-medium text-gray-700 mb-2">Certificaciones</h5>
                            <ul class="text-sm text-gray-600 space-y-1">
                                @foreach($doctor['certifications'] as $certification)
                                    <li>• {{ $certification }}</li>
                                @endforeach
                            </ul>
                        </div>
                        
                        <!-- Precio y selección -->
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-2xl font-bold text-blue-600">
                                    ${{ number_format($doctor['consultation_fee'], 0, ',', '.') }}
                                </span>
                                <span class="text-gray-500">por consulta</span>
                            </div>
                            
                            <button wire:click="selectDoctor('{{ $doctor['id'] }}')"
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Seleccionar Doctor
                            </button>
                        </div>
                    </div>
                    
                    <!-- Imagen del doctor -->
                    <div class="md:w-1/3">
                        <img src="{{ $doctor['image'] ?? '/images/doctor-placeholder.jpg' }}" 
                             alt="Dr. {{ $doctor['first_name'] }} {{ $doctor['last_name'] }}" 
                             class="w-full h-48 object-cover rounded-lg">
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Resumen de selección -->
    @if($selectedDoctor)
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 class="text-lg font-semibold mb-4">Resumen de Selección</h3>
            <div class="space-y-2">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span class="font-medium">Doctor seleccionado</span>
                        <p class="text-sm text-gray-500">{{ $selectedDoctor['name'] }}</p>
                    </div>
                    <div class="text-right">
                        <span class="font-semibold">${{ number_format($totalAmount, 0, ',', '.') }}</span>
                    </div>
                </div>
                <div class="border-t pt-2">
                    <div class="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${{ number_format($totalAmount, 0, ',', '.') }}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <button wire:click="proceedToBooking" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                    Continuar con la Cita
                </button>
            </div>
        </div>
    @endif
</div>
```

## 4. FORMULARIO DE CITA MÉDICA

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

## 5. CONFIRMACIÓN DE CITA MÉDICA

### medical-confirmation.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-green-600">¡Cita Médica Confirmada!</h2>
        <p class="text-gray-600">Su cita médica ha sido reservada exitosamente</p>
    </div>

    <!-- Información de la cita -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold">Número de Confirmación</h3>
                <p class="text-2xl font-bold text-blue-600">{{ $confirmationNumber }}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Fecha de reserva</p>
                <p class="font-medium">{{ now()->format('d/m/Y H:i') }}</p>
            </div>
        </div>
    </div>

    <!-- Detalles de la cita -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Detalles de la Cita</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Centro Médico</p>
                <p class="font-semibold">{{ $medicalCenter['name'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Doctor</p>
                <p class="font-semibold">{{ $doctor['name'] }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Especialidad</p>
                <p class="font-semibold">{{ $specialty }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Fecha y Hora</p>
                <p class="font-semibold">{{ \Carbon\Carbon::parse($appointmentDate)->format('d/m/Y') }} {{ $appointmentTime }}</p>
            </div>
        </div>
    </div>

    <!-- Información del paciente -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Información del Paciente</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-gray-500">Nombre</p>
                <p class="font-semibold">{{ $patientName }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Documento</p>
                <p class="font-semibold">{{ $patientDocument }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Teléfono</p>
                <p class="font-semibold">{{ $patientPhone }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-semibold">{{ $patientEmail }}</p>
            </div>
        </div>
    </div>

    <!-- Instrucciones -->
    <div class="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold mb-2">Instrucciones para la Cita</h3>
        <ul class="text-sm text-blue-700 space-y-1">
            <li>• Llegar 15 minutos antes de la cita</li>
            <li>• Traer documento de identidad</li>
            <li>• Traer tarjeta de seguro médico si aplica</li>
            <li>• Ayuno de 8 horas si se requiere exámenes</li>
            <li>• Traer lista de medicamentos actuales</li>
        </ul>
    </div>

    <!-- Resumen de precios -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Resumen de Precios</h3>
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

    <!-- Botones de acción -->
    <div class="flex space-x-4">
        <button onclick="window.print()" 
                class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium">
            Imprimir Cita
        </button>
        <a href="{{ route('medical') }}" 
           class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
            Nueva Búsqueda
        </a>
    </div>
</div>
```

## 6. CONSULTA DE CITAS MÉDICAS

### medical-reserve-index.blade.php
```html
<div class="container mx-auto p-4">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Citas Médicas</h2>
        <p class="text-gray-600">Gestiona tus citas médicas</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select wire:model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Completada</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                <input type="date" wire:model="dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                <input type="date" wire:model="dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div class="flex items-end">
                <button wire:click="applyFilters" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Filtrar
                </button>
            </div>
        </div>
    </div>

    <!-- Lista de citas -->
    <div class="space-y-4">
        @foreach($appointments as $appointment)
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">{{ $appointment['doctor_name'] }}</h3>
                        <p class="text-gray-600">{{ $appointment['medical_center_name'] }}</p>
                        <p class="text-sm text-gray-500">
                            {{ \Carbon\Carbon::parse($appointment['appointment_date'])->format('d/m/Y') }} {{ $appointment['appointment_time'] }}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
                            @if($appointment['status'] == 'confirmed') bg-green-100 text-green-800
                            @elseif($appointment['status'] == 'pending') bg-yellow-100 text-yellow-800
                            @elseif($appointment['status'] == 'cancelled') bg-red-100 text-red-800
                            @else bg-blue-100 text-blue-800 @endif">
                            {{ ucfirst($appointment['status']) }}
                        </span>
                        <p class="text-2xl font-bold text-blue-600 mt-2">
                            ${{ number_format($appointment['total_amount'], 0, ',', '.') }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-500">Número de confirmación</p>
                        <p class="font-semibold">{{ $appointment['confirmation_number'] }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Especialidad</p>
                        <p class="font-semibold">{{ $appointment['specialty'] }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Tipo de asistencia</p>
                        <p class="font-semibold">{{ ucfirst($appointment['assistance_type']) }}</p>
                    </div>
                </div>

                <div class="flex space-x-4">
                    <a href="{{ route('medical.consult', $appointment['id']) }}" 
                       class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Ver Detalles
                    </a>
                    @if($appointment['status'] == 'confirmed')
                        <button wire:click="cancelAppointment({{ $appointment['id'] }})" 
                                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            Cancelar
                        </button>
                    @endif
                </div>
            </div>
        @endforeach
    </div>

    @if(empty($appointments))
        <div class="text-center py-12">
            <div class="text-gray-500 text-lg">No se encontraron citas médicas</div>
            <a href="{{ route('medical') }}" 
               class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Nueva Búsqueda
            </a>
        </div>
    @endif
</div>
```

Esta documentación completa de las vistas Blade para el sistema de asistencias médicas te permitirá implementar toda la interfaz de usuario necesaria para la búsqueda, selección y reserva de citas médicas con integración de centros médicos y doctores.
