# 🗄️ MIGRACIONES DE BASE DE DATOS - SISTEMA DE ASISTENCIAS MÉDICAS

## 1. MIGRACIÓN PRINCIPAL: medical_assistances

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_assistances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->enum('assistance_type', ['emergency', 'consultation', 'specialist', 'checkup', 'vaccination'])->default('consultation');
            $table->unsignedBigInteger('medical_center_id');
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->unsignedBigInteger('specialty_id')->nullable();
            $table->string('patient_name', 255);
            $table->string('patient_document', 50);
            $table->string('patient_phone', 20);
            $table->string('patient_email', 255);
            $table->integer('patient_age');
            $table->enum('patient_gender', ['M', 'F']);
            $table->string('emergency_contact_name', 255)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->datetime('appointment_date');
            $table->text('symptoms')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('allergies')->nullable();
            $table->string('insurance_policy', 255)->nullable();
            $table->string('insurance_company', 255)->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('COP');
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->string('confirmation_number', 255)->nullable();
            $table->string('medical_record_number', 255)->nullable();
            $table->text('notes')->nullable();
            $table->json('patient_info')->nullable();
            $table->json('medical_info')->nullable();
            $table->json('doctor_info')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->foreign('medical_center_id')->references('id')->on('medical_centers')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');
            $table->foreign('specialty_id')->references('id')->on('medical_specialties')->onDelete('set null');
            $table->index(['assistance_type', 'status', 'appointment_date']);
            $table->index('confirmation_number');
            $table->index('medical_record_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_assistances');
    }
};
```

## 2. MIGRACIÓN: medical_centers

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_centers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->enum('type', ['hospital', 'clinic', 'emergency_center', 'specialty_center'])->default('clinic');
            $table->text('address');
            $table->string('city', 100);
            $table->string('country', 100);
            $table->string('phone', 20);
            $table->string('email', 255)->nullable();
            $table->string('website', 255)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->boolean('emergency_services')->default(false);
            $table->json('specialties')->nullable();
            $table->json('facilities')->nullable();
            $table->json('schedule')->nullable();
            $table->json('pricing')->nullable();
            $table->text('description')->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->timestamps();

            $table->index('is_active');
            $table->index('type');
            $table->index('city');
            $table->index('rating');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_centers');
    }
};
```

## 3. MIGRACIÓN: doctors

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_center_id');
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->unsignedBigInteger('specialty_id');
            $table->string('license_number', 50);
            $table->string('phone', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->integer('experience_years')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('languages')->nullable();
            $table->json('education')->nullable();
            $table->json('certifications')->nullable();
            $table->json('schedule')->nullable();
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->string('currency', 3)->default('COP');
            $table->timestamps();

            $table->foreign('medical_center_id')->references('id')->on('medical_centers')->onDelete('cascade');
            $table->foreign('specialty_id')->references('id')->on('medical_specialties')->onDelete('cascade');
            $table->index(['medical_center_id', 'specialty_id']);
            $table->index(['is_active', 'rating']);
            $table->index('license_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('doctors');
    }
};
```

## 4. MIGRACIÓN: medical_specialties

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_specialties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('requirements')->nullable();
            $table->timestamps();

            $table->index('is_active');
            $table->index('category');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_specialties');
    }
};
```

## 5. MIGRACIÓN: medical_reserves

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_reserves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reserve_id');
            $table->string('medical_appointment_id', 255);
            $table->string('medical_center_id', 255);
            $table->string('doctor_id', 255)->nullable();
            $table->string('status', 50);
            $table->string('confirmation_number', 255)->nullable();
            $table->string('medical_record_number', 255)->nullable();
            $table->json('medical_response')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('COP');
            $table->timestamp('appointment_date')->nullable();
            $table->timestamp('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->foreign('reserve_id')->references('id')->on('reserves')->onDelete('cascade');
            $table->unique('medical_appointment_id');
            $table->index('medical_center_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_reserves');
    }
};
```

## 6. MIGRACIÓN: medical_appointments

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_assistance_id');
            $table->string('appointment_id', 255)->unique();
            $table->string('confirmation_number', 255);
            $table->string('medical_record_number', 255)->nullable();
            $table->datetime('appointment_date');
            $table->time('appointment_time');
            $table->integer('duration')->default(30); // en minutos
            $table->enum('status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->json('instructions')->nullable();
            $table->json('follow_up')->nullable();
            $table->timestamps();

            $table->foreign('medical_assistance_id')->references('id')->on('medical_assistances')->onDelete('cascade');
            $table->index(['appointment_date', 'status']);
            $table->index('confirmation_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_appointments');
    }
};
```

## 7. MIGRACIÓN: medical_insurance

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_insurance', function (Blueprint $table) {
            $table->id();
            $table->string('company_name', 255);
            $table->string('policy_number', 255);
            $table->string('patient_name', 255);
            $table->string('patient_document', 50);
            $table->date('policy_start_date');
            $table->date('policy_end_date');
            $table->decimal('coverage_percentage', 5, 2)->default(100);
            $table->decimal('copay_amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('COP');
            $table->boolean('is_active')->default(true);
            $table->json('covered_services')->nullable();
            $table->json('exclusions')->nullable();
            $table->timestamps();

            $table->index(['policy_number', 'is_active']);
            $table->index('patient_document');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_insurance');
    }
};
```

## 8. MIGRACIÓN: medical_prescriptions

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_assistance_id');
            $table->string('prescription_number', 255)->unique();
            $table->text('diagnosis');
            $table->text('treatment_plan');
            $table->json('medications')->nullable();
            $table->json('instructions')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('medical_assistance_id')->references('id')->on('medical_assistances')->onDelete('cascade');
            $table->index('prescription_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_prescriptions');
    }
};
```

## 9. MIGRACIÓN: medical_reviews

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_assistance_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('rating', 3, 2);
            $table->text('review')->nullable();
            $table->json('rating_breakdown')->nullable(); // doctor, facility, service
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            $table->foreign('medical_assistance_id')->references('id')->on('medical_assistances')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['medical_assistance_id', 'rating']);
            $table->index('is_approved');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_reviews');
    }
};
```

## 10. MIGRACIÓN: medical_emergencies

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_emergencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_assistance_id');
            $table->enum('emergency_type', ['cardiac', 'trauma', 'respiratory', 'neurological', 'other'])->default('other');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('symptoms');
            $table->text('vital_signs')->nullable();
            $table->text('initial_assessment')->nullable();
            $table->text('treatment_given')->nullable();
            $table->string('ambulance_required', 10)->default('no');
            $table->string('ambulance_number', 50)->nullable();
            $table->timestamp('arrival_time')->nullable();
            $table->timestamp('departure_time')->nullable();
            $table->timestamps();

            $table->foreign('medical_assistance_id')->references('id')->on('medical_assistances')->onDelete('cascade');
            $table->index(['emergency_type', 'severity']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_emergencies');
    }
};
```

## 11. MIGRACIÓN: medical_search_logs

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_search_logs', function (Blueprint $table) {
            $table->id();
            $table->string('city', 100);
            $table->string('specialty', 100);
            $table->string('assistance_type', 50);
            $table->boolean('emergency')->default(false);
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->json('filters')->nullable();
            $table->integer('results_count')->default(0);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['city', 'specialty', 'appointment_date']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_search_logs');
    }
};
```

## 12. MIGRACIÓN: medical_modifications

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_modifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medical_assistance_id');
            $table->string('modification_type', 50); // date_change, time_change, doctor_change
            $table->json('old_data');
            $table->json('new_data');
            $table->decimal('modification_fee', 10, 2)->default(0);
            $table->text('reason')->nullable();
            $table->string('status', 50)->default('pending');
            $table->unsignedBigInteger('modified_by')->nullable();
            $table->timestamps();

            $table->foreign('medical_assistance_id')->references('id')->on('medical_assistances')->onDelete('cascade');
            $table->foreign('modified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['medical_assistance_id', 'modification_type']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_modifications');
    }
};
```

## 13. SEEDERS PARA DATOS INICIALES

### Seeder para especialidades médicas:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalSpecialty;

class MedicalSpecialtySeeder extends Seeder
{
    public function run()
    {
        $specialties = [
            [
                'code' => 'CARDIO',
                'name' => 'Cardiología',
                'description' => 'Especialidad médica que se encarga del corazón y sistema cardiovascular',
                'category' => 'Internal Medicine',
                'is_active' => true
            ],
            [
                'code' => 'NEURO',
                'name' => 'Neurología',
                'description' => 'Especialidad médica que se encarga del sistema nervioso',
                'category' => 'Internal Medicine',
                'is_active' => true
            ],
            [
                'code' => 'DERMA',
                'name' => 'Dermatología',
                'description' => 'Especialidad médica que se encarga de la piel',
                'category' => 'Internal Medicine',
                'is_active' => true
            ],
            [
                'code' => 'ORTHO',
                'name' => 'Ortopedia',
                'description' => 'Especialidad médica que se encarga del sistema musculoesquelético',
                'category' => 'Surgery',
                'is_active' => true
            ],
            [
                'code' => 'PEDIA',
                'name' => 'Pediatría',
                'description' => 'Especialidad médica que se encarga de la salud infantil',
                'category' => 'Internal Medicine',
                'is_active' => true
            ]
        ];

        foreach ($specialties as $specialty) {
            MedicalSpecialty::create($specialty);
        }
    }
}
```

### Seeder para centros médicos:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalCenter;

class MedicalCenterSeeder extends Seeder
{
    public function run()
    {
        $centers = [
            [
                'name' => 'Clínica del Corazón',
                'type' => 'specialty_center',
                'address' => 'Carrera 15 # 93-47, Bogotá',
                'city' => 'Bogotá',
                'country' => 'Colombia',
                'phone' => '+57 1 234 5678',
                'email' => 'info@clinicacorazon.com',
                'website' => 'https://clinicacorazon.com',
                'latitude' => 4.6756,
                'longitude' => -74.0484,
                'is_active' => true,
                'rating' => 4.7,
                'reviews_count' => 156,
                'emergency_services' => true,
                'specialties' => ['Cardiología', 'Cirugía Cardiovascular'],
                'facilities' => ['Ambulatorio', 'Urgencias', 'Laboratorio', 'Imágenes'],
                'schedule' => [
                    'monday' => '08:00-18:00',
                    'tuesday' => '08:00-18:00',
                    'wednesday' => '08:00-18:00',
                    'thursday' => '08:00-18:00',
                    'friday' => '08:00-18:00',
                    'saturday' => '08:00-14:00',
                    'sunday' => 'Cerrado'
                ],
                'pricing' => [
                    'consultation_fee' => 150000,
                    'emergency_fee' => 200000,
                    'currency' => 'COP'
                ],
                'description' => 'Centro especializado en cardiología con tecnología de vanguardia'
            ],
            [
                'name' => 'Hospital San Rafael',
                'type' => 'hospital',
                'address' => 'Calle 134 # 11-20, Bogotá',
                'city' => 'Bogotá',
                'country' => 'Colombia',
                'phone' => '+57 1 876 5432',
                'email' => 'info@hospitalsanrafael.com',
                'website' => 'https://hospitalsanrafael.com',
                'latitude' => 4.7016,
                'longitude' => -74.1469,
                'is_active' => true,
                'rating' => 4.5,
                'reviews_count' => 89,
                'emergency_services' => true,
                'specialties' => ['Cardiología', 'Medicina Interna', 'Pediatría'],
                'facilities' => ['Ambulatorio', 'Urgencias', 'Laboratorio', 'Imágenes', 'Farmacia'],
                'schedule' => [
                    'monday' => '24/7',
                    'tuesday' => '24/7',
                    'wednesday' => '24/7',
                    'thursday' => '24/7',
                    'friday' => '24/7',
                    'saturday' => '24/7',
                    'sunday' => '24/7'
                ],
                'pricing' => [
                    'consultation_fee' => 120000,
                    'emergency_fee' => 180000,
                    'currency' => 'COP'
                ],
                'description' => 'Hospital general con servicios de emergencia 24/7'
            ]
        ];

        foreach ($centers as $center) {
            MedicalCenter::create($center);
        }
    }
}
```

### Seeder para doctores:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\MedicalCenter;
use App\Models\MedicalSpecialty;

class DoctorSeeder extends Seeder
{
    public function run()
    {
        $centers = MedicalCenter::all();
        $specialties = MedicalSpecialty::all();
        
        foreach ($centers as $center) {
            foreach ($specialties as $specialty) {
                $doctors = [
                    [
                        'medical_center_id' => $center->id,
                        'first_name' => 'Carlos',
                        'last_name' => 'Rodríguez',
                        'specialty_id' => $specialty->id,
                        'license_number' => '12345',
                        'phone' => '+57 300 123 4567',
                        'email' => 'carlos.rodriguez@' . strtolower(str_replace(' ', '', $center->name)) . '.com',
                        'experience_years' => 15,
                        'rating' => 4.8,
                        'reviews_count' => 45,
                        'is_active' => true,
                        'languages' => ['Español', 'Inglés'],
                        'education' => [
                            'Universidad Nacional de Colombia',
                            'Especialización en ' . $specialty->name
                        ],
                        'certifications' => [
                            'Certificación en ' . $specialty->name,
                            'Certificación en Ecografía'
                        ],
                        'consultation_fee' => 150000,
                        'currency' => 'COP'
                    ],
                    [
                        'medical_center_id' => $center->id,
                        'first_name' => 'María',
                        'last_name' => 'González',
                        'specialty_id' => $specialty->id,
                        'license_number' => '67890',
                        'phone' => '+57 300 987 6543',
                        'email' => 'maria.gonzalez@' . strtolower(str_replace(' ', '', $center->name)) . '.com',
                        'experience_years' => 12,
                        'rating' => 4.6,
                        'reviews_count' => 32,
                        'is_active' => true,
                        'languages' => ['Español', 'Francés'],
                        'education' => [
                            'Universidad de los Andes',
                            'Especialización en ' . $specialty->name
                        ],
                        'certifications' => [
                            'Certificación en ' . $specialty->name,
                            'Certificación en Cirugía Mínimamente Invasiva'
                        ],
                        'consultation_fee' => 140000,
                        'currency' => 'COP'
                    ]
                ];

                foreach ($doctors as $doctor) {
                    Doctor::create($doctor);
                }
            }
        }
    }
}
```

## 14. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN

```php
// En la migración de medical_assistances
$table->index(['appointment_date', 'status', 'assistance_type']);
$table->index(['medical_center_id', 'status', 'created_at']);
$table->index(['doctor_id', 'status', 'appointment_date']);

// En la migración de medical_centers
$table->index(['is_active', 'type', 'city']);
$table->index(['rating', 'is_active']);

// En la migración de doctors
$table->index(['specialty_id', 'is_active', 'rating']);
$table->index(['medical_center_id', 'is_active']);

// En la migración de medical_appointments
$table->index(['appointment_date', 'appointment_time', 'status']);
$table->index(['status', 'created_at']);
```

## 15. COMANDO PARA EJECUTAR MIGRACIONES

```bash
# Ejecutar todas las migraciones
php artisan migrate

# Ejecutar migraciones específicas
php artisan migrate --path=database/migrations/2024_01_01_000001_create_medical_assistances_table.php

# Rollback de migraciones
php artisan migrate:rollback

# Ejecutar seeders
php artisan db:seed --class=MedicalSpecialtySeeder
php artisan db:seed --class=MedicalCenterSeeder
php artisan db:seed --class=DoctorSeeder
```

## 16. POLÍTICAS DE SEGURIDAD

### Encriptación de datos sensibles:
```php
// En el modelo MedicalAssistance
protected $casts = [
    'patient_info' => 'encrypted:json',
    'medical_info' => 'encrypted:json',
    'doctor_info' => 'encrypted:json'
];

// En el modelo Doctor
protected $casts = [
    'license_number' => 'encrypted',
    'phone' => 'encrypted',
    'email' => 'encrypted'
];
```

### Soft deletes para auditoría:
```php
// Agregar a las migraciones principales
$table->softDeletes();

// En los modelos
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalAssistance extends Model
{
    use SoftDeletes;
    // ...
}
```

Esta documentación completa de migraciones para el sistema de asistencias médicas te permitirá crear toda la estructura de base de datos necesaria para manejar citas médicas de forma eficiente y escalable.
