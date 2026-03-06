# Sistema de Cotizaciones Públicas - Documentación Técnica

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Controladores](#controladores)
5. [Rutas](#rutas)
6. [Vistas](#vistas)
7. [Componentes Livewire](#componentes-livewire)
8. [Estilos CSS](#estilos-css)
9. [JavaScript](#javascript)
10. [Integración con Módulo de Formas de Pago](#integracion-con-modulo-de-formas-de-pago)
11. [Seguridad](#seguridad)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## 🎯 Resumen Ejecutivo

El sistema de cotizaciones públicas permite a las agencias de viajes generar enlaces compartibles para sus cotizaciones, mostrando información detallada del viaje, servicios incluidos, precios, formas de pago y datos de contacto, sin requerir autenticación del cliente.

### Características Principales
- ✅ Enlaces públicos únicos con token de seguridad
- ✅ Vista moderna y responsive con modo oscuro
- ✅ Carousel de imágenes del destino
- ✅ Información detallada de servicios incluidos
- ✅ Formas de pago expandibles con datos bancarios
- ✅ Formulario de contacto integrado
- ✅ Botones de compartir en redes sociales
- ✅ Información del asesor y datos empresariales

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales
```
┌─────────────────────────────────────────────────────────────┐
│                    COTIZACIÓN PÚBLICA                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Header    │  │    Hero     │  │   Details   │        │
│  │  (Logo +    │  │ (Carousel + │  │ (Services + │        │
│  │   Toggle)   │  │   Overlay)  │  │   Pricing)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Share    │  │   Contact   │  │   Payment   │        │
│  │  (Social +  │  │   (Form +   │  │  (Methods + │        │
│  │   Copy)     │  │  Livewire)  │  │   Details)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Advisor   │  │  Business   │  │   Footer    │        │
│  │ (User Info) │  │   (Agency   │  │ (Additional │        │
│  │             │  │    Info)    │  │    Info)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### Tabla: `requests` (Modificada)

#### Nuevos Campos Agregados
```sql
-- Campos para cotizaciones públicas
public_token VARCHAR(255) UNIQUE NULL
is_public BOOLEAN DEFAULT FALSE
public_expires_at TIMESTAMP NULL
public_description TEXT NULL
public_images JSON NULL
```

#### Migración
```php
// database/migrations/2025_09_18_162513_add_public_fields_to_requests_table.php
Schema::table('requests', function (Blueprint $table) {
    $table->string('public_token')->unique()->nullable()->after('description');
    $table->boolean('is_public')->default(false)->after('public_token');
    $table->timestamp('public_expires_at')->nullable()->after('is_public');
    $table->text('public_description')->nullable()->after('public_expires_at');
    $table->json('public_images')->nullable()->after('public_description');
});
```

#### Modelo Request (Actualizado)
```php
// app/Models/Request.php
protected $casts = [
    'departure_date' => 'datetime',
    'return_date' => 'datetime',
    'request_date' => 'date',
    'services' => 'array',
    'public_images' => 'array',        // ✅ Nuevo
    'is_public' => 'boolean',          // ✅ Nuevo
    'public_expires_at' => 'datetime'  // ✅ Nuevo
];
```

---

## 🎮 Controladores

### QuotePublicController

#### Ubicación
`app/Http/Controllers/QuotePublicController.php`

#### Métodos Principales

##### 1. show() - Mostrar Cotización Pública
```php
public function show(Request $request, string $token)
{
    // Validaciones de seguridad
    if ($request->public_token !== $token) {
        abort(404, 'Cotización no encontrada');
    }
    
    if (!$request->is_public) {
        abort(404, 'Cotización no disponible públicamente');
    }
    
    if ($request->public_expires_at && $request->public_expires_at->isPast()) {
        abort(410, 'Esta cotización ha expirado');
    }
    
    // Cargar relaciones necesarias
    $request->load([
        'client',
        'agency',
        'tickets',
        'hotels', 
        'transfers',
        'medicalAssists',
        'user' // Usuario que creó la cotización
    ]);
    
    // Calcular totales
    $totalQuoted = $request->totalQuotedServices();
    $totalTravelers = $request->getTotalTravelersAttribute();
    $pricePerPerson = $totalTravelers > 0 ? round($totalQuoted / $totalTravelers) : 0;
    
    // Preparar datos para la vista
    $quoteData = [
        'request' => $request,
        'totalQuoted' => $totalQuoted,
        'totalTravelers' => $totalTravelers,
        'pricePerPerson' => $pricePerPerson,
        'hasServices' => $request->tickets->count() > 0 || 
                       $request->hotels->count() > 0 || 
                       $request->transfers->count() > 0 || 
                       $request->medicalAssists->count() > 0,
        'shareUrl' => route('quotes.public.show', ['request' => $request->slug, 'token' => $token]),
        'shareMessage' => "¡Mira esta increíble propuesta de viaje! {$request->destination} - {$request->departure_date->format('d/m/Y')}",
    ];
    
    // Log de acceso para analytics
    Log::info('Public quote accessed', [
        'request_id' => $request->id,
        'client_id' => $request->client_id,
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent()
    ]);
    
    return view('quotes.shared', $quoteData);
}
```

##### 2. generatePublicToken() - Generar Token Público
```php
public function generatePublicToken(HttpRequest $httpRequest, Request $request)
{
    $request->update([
        'public_token' => Str::uuid(),
        'is_public' => true,
        'public_expires_at' => now()->addDays(30), // Válido por 30 días
    ]);
    
    return back()->with('success', 'Enlace público generado exitosamente.');
}
```

##### 3. disablePublic() - Deshabilitar Acceso Público
```php
public function disablePublic(HttpRequest $httpRequest, Request $request)
{
    $request->update([
        'is_public' => false,
        'public_token' => null,
        'public_expires_at' => null,
    ]);
    
    return back()->with('success', 'Acceso público deshabilitado.');
}
```

---

## 🛣️ Rutas

### Rutas Públicas
```php
// routes/web.php

// Ruta pública para cotizaciones compartibles
Route::get('/quote/shared/{request:slug}/{token}', [App\Http\Controllers\QuotePublicController::class, 'show'])
    ->name('quotes.public.show');
```

### Rutas Protegidas
```php
// Rutas protegidas para gestión de tokens públicos
Route::middleware(['auth'])->group(function () {
    Route::post('/quote/{request}/generate-public-token', [App\Http\Controllers\QuotePublicController::class, 'generatePublicToken'])
        ->name('quotes.generate-public-token');
    Route::post('/quote/{request}/disable-public', [App\Http\Controllers\QuotePublicController::class, 'disablePublic'])
        ->name('quotes.disable-public');
});
```

---

## 🎨 Vistas

### Vista Principal: quotes/shared.blade.php

#### Estructura de la Vista
```html
<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
    <!-- Meta tags, CSS, Font Awesome, Swiper.js -->
</head>
<body class="h-full bg-gray-50 dark:bg-gray-900">
    <div class="min-h-full">
        <!-- Header con logo y modo oscuro -->
        <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <!-- Logo de agencia, nombre, fecha de validez, toggle modo oscuro -->
        </header>
        
        <!-- Hero Section con carousel -->
        <main class="relative">
            <div class="hero-gradient">
                <!-- Swiper carousel con imágenes públicas -->
            </div>
            <!-- Overlay con información del viaje -->
        </main>
        
        <!-- Contenido principal -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Descripción del viaje -->
            <!-- Servicios incluidos -->
            <!-- Resumen de precios -->
            <!-- Botones de compartir -->
            <!-- Formulario de contacto -->
        </div>
        
        <!-- Footer con información del asesor y empresa -->
        <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <!-- Formas de pago (ancho completo) -->
            <!-- Asesor y empresa (2 columnas) -->
        </footer>
    </div>
    
    <!-- Scripts: Swiper.js, JavaScript personalizado -->
</body>
</html>
```

#### Secciones Principales

##### 1. Header
- Logo de la agencia (con fallback)
- Nombre de la agencia
- Fecha de validez de la cotización
- Toggle de modo oscuro

##### 2. Hero Section
- Carousel de imágenes (`public_images`)
- Overlay con información del destino
- Fechas de viaje
- Número de viajeros

##### 3. Contenido Principal
- Descripción pública del viaje
- Servicios incluidos (tickets, hoteles, transfers, asistencia médica)
- Resumen de precios (total y por persona)
- Botones de compartir (WhatsApp, Facebook, Copiar enlace)

##### 4. Formulario de Contacto
- Componente Livewire integrado
- Campos: nombre, email, teléfono, mensaje
- Validación y envío de email

##### 5. Footer
- **Formas de pago** (ancho completo, expandibles)
- **Información del asesor** (izquierda)
- **Datos empresariales** (derecha)

---

## ⚡ Componentes Livewire

### ContactForm Component

#### Ubicación
`app/Livewire/Quotes/ContactForm.php`

#### Propiedades
```php
public Request $quote;        // La cotización asociada
public $name;                 // Nombre del cliente
public $email;                // Email del cliente
public $phone;                // Teléfono del cliente
public $message;              // Mensaje del cliente
public $isSubmitted = false;  // Estado del formulario
```

#### Métodos Principales

##### submitForm()
```php
public function submitForm()
{
    $this->validate();
    
    try {
        // Enviar correo a la agencia
        Mail::to($this->quote->agency->email ?? config('mail.from.address'))
            ->send(new QuoteContactMail(
                $this->name,
                $this->email,
                $this->phone,
                $this->message,
                $this->quote
            ));
        
        $this->isSubmitted = true;
        $this->reset(['name', 'email', 'phone', 'message']);
        
        Log::info('Contact form submitted for public quote', [
            'quote_id' => $this->quote->id,
            'client_name' => $this->name,
            'client_email' => $this->email,
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error submitting contact form for public quote', [
            'quote_id' => $this->quote->id,
            'error' => $e->getMessage(),
        ]);
        session()->flash('error', 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
    }
}
```

#### Vista del Componente
`resources/views/livewire/quotes/contact-form.blade.php`

---

## 🎨 Estilos CSS

### Archivo Principal
`resources/css/quotes-public.css`

#### Estructura de Estilos

##### 1. Variables y Base
```css
/* Variables CSS personalizadas */
:root {
    --hero-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Reset y base */
* {
    box-sizing: border-box;
}
```

##### 2. Modo Oscuro
```css
/* Dark mode base */
.dark {
    color-scheme: dark;
}

/* Dark mode overrides para componentes específicos */
.dark .hero-gradient {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}
```

##### 3. Hero Section
```css
.hero-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 60vh;
    position: relative;
}

.hero-overlay {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(1px);
}
```

##### 4. Formas de Pago
```css
/* Payment methods grid layout */
.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

/* Payment method cards */
.payment-method-card {
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    overflow: hidden;
}

.payment-method-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Payment details expandibles */
.payment-details {
    transition: all 0.3s ease;
    max-height: 0;
    overflow: hidden;
}

.payment-details:not(.hidden) {
    max-height: 200px;
}
```

##### 5. Responsive Design
```css
/* Mobile first approach */
@media (max-width: 640px) {
    .hero-gradient {
        min-height: 50vh;
    }
    
    .payment-methods-grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 768px) {
    .payment-methods-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .payment-methods-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

---

## 📱 JavaScript

### Funcionalidades Principales

#### 1. Modo Oscuro
```javascript
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const html = document.documentElement;
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        html.classList.add('dark');
        darkModeIcon.className = 'fas fa-sun w-4 h-4';
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        
        if (html.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            darkModeIcon.className = 'fas fa-sun w-4 h-4';
        } else {
            localStorage.setItem('theme', 'light');
            darkModeIcon.className = 'fas fa-moon w-4 h-4';
        }
    });
}
```

#### 2. Swiper Carousel
```javascript
function initSwiper() {
    const swiper = new Swiper('.hero-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}
```

#### 3. Formas de Pago Expandibles
```javascript
function togglePaymentDetails(paymentId) {
    const details = document.getElementById(paymentId + '-details');
    const arrow = document.getElementById(paymentId + '-arrow');
    
    if (details.classList.contains('hidden')) {
        // Expandir
        details.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
    } else {
        // Contraer
        details.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
    }
}
```

#### 4. Funciones de Compartir
```javascript
function shareWhatsApp() {
    const message = `{{ $shareMessage }}`;
    const url = `{{ $shareUrl }}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

function shareFacebook() {
    const url = `{{ $shareUrl }}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

function copyLink() {
    const url = `{{ $shareUrl }}`;
    navigator.clipboard.writeText(url).then(() => {
        // Mostrar notificación de éxito
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check w-5 h-5 mr-2"></i>¡Copiado!';
        button.classList.add('bg-green-600', 'hover:bg-green-700');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-green-600', 'hover:bg-green-700');
        }, 2000);
    });
}
```

---

## 🔗 Integración con Módulo de Formas de Pago

### Estructura de Datos Esperada

#### Tabla: `agency_payment_methods`
```sql
CREATE TABLE agency_payment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agency_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('bank_transfer', 'mobile_payment', 'digital_wallet', 'online_payment', 'cash', 'credit_card', 'international') NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);
```

#### Tabla: `agency_payment_details`
```sql
CREATE TABLE agency_payment_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    field_type ENUM('text', 'number', 'email', 'phone', 'url') DEFAULT 'text',
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (payment_method_id) REFERENCES agency_payment_methods(id) ON DELETE CASCADE
);
```

### Integración en la Vista

#### Reemplazar Datos Hardcodeados
```php
// En QuotePublicController@show()
$paymentMethods = $request->agency->paymentMethods()
    ->where('is_active', true)
    ->with('details')
    ->orderBy('sort_order')
    ->get();

$quoteData['paymentMethods'] = $paymentMethods;
```

#### Actualizar Vista
```html
<!-- Reemplazar sección hardcodeada -->
<div class="payment-methods-grid">
    @foreach($paymentMethods as $method)
        <div class="payment-method-card" onclick="togglePaymentDetails('{{ $method->id }}')">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg payment-method-item cursor-pointer">
                <div class="w-8 h-8 bg-{{ $method->color }}-100 dark:bg-{{ $method->color }}-900/30 rounded-full flex items-center justify-center">
                    <i class="{{ $method->icon }} text-{{ $method->color }}-600 dark:text-{{ $method->color }}-400 text-sm payment-icon"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ $method->name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ ucfirst(str_replace('_', ' ', $method->type)) }}</p>
                </div>
                <div class="text-right">
                    @if($method->details->where('is_public', true)->first())
                        <p class="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {{ Str::mask($method->details->where('is_public', true)->first()->field_value, '*', 4) }}
                        </p>
                    @endif
                    <p class="text-xs text-gray-500 dark:text-gray-500">Disponible</p>
                </div>
                <div class="ml-2">
                    <i class="fas fa-chevron-down text-gray-400 text-xs transition-transform duration-200" id="{{ $method->id }}-arrow"></i>
                </div>
            </div>
            
            <!-- Detalles expandibles -->
            <div class="payment-details hidden" id="{{ $method->id }}-details">
                <div class="px-3 pb-3 pt-1 bg-gray-100 dark:bg-gray-700 rounded-b-lg">
                    <div class="space-y-2 text-xs">
                        @foreach($method->details->where('is_public', true) as $detail)
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">{{ ucfirst(str_replace('_', ' ', $detail->field_name)) }}:</span>
                                <span class="text-gray-900 dark:text-white {{ $detail->field_type === 'number' ? 'font-mono' : '' }}">{{ $detail->field_value }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    @endforeach
</div>
```

### Modelos Necesarios

#### AgencyPaymentMethod
```php
// app/Models/AgencyPaymentMethod.php
class AgencyPaymentMethod extends Model
{
    protected $fillable = [
        'agency_id',
        'name',
        'type',
        'icon',
        'color',
        'is_active',
        'sort_order'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];
    
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
    
    public function details()
    {
        return $this->hasMany(AgencyPaymentDetail::class);
    }
}
```

#### AgencyPaymentDetail
```php
// app/Models/AgencyPaymentDetail.php
class AgencyPaymentDetail extends Model
{
    protected $fillable = [
        'payment_method_id',
        'field_name',
        'field_value',
        'field_type',
        'is_public',
        'sort_order'
    ];
    
    protected $casts = [
        'is_public' => 'boolean',
        'sort_order' => 'integer'
    ];
    
    public function paymentMethod()
    {
        return $this->belongsTo(AgencyPaymentMethod::class);
    }
}
```

---

## 🔒 Seguridad

### Validaciones de Seguridad

#### 1. Token Validation
```php
// En QuotePublicController@show()
if ($request->public_token !== $token) {
    abort(404, 'Cotización no encontrada');
}
```

#### 2. Public Access Control
```php
if (!$request->is_public) {
    abort(404, 'Cotización no disponible públicamente');
}
```

#### 3. Expiration Check
```php
if ($request->public_expires_at && $request->public_expires_at->isPast()) {
    abort(410, 'Esta cotización ha expirado');
}
```

#### 4. Rate Limiting
```php
// En routes/web.php
Route::get('/quote/shared/{request:slug}/{token}', [QuotePublicController::class, 'show'])
    ->name('quotes.public.show')
    ->middleware('throttle:60,1'); // 60 requests per minute
```

### Protección de Datos Sensibles

#### 1. No Mostrar IDs Internos
- No exponer `agency_id`, `user_id`, `client_id`
- Usar solo datos necesarios para la vista pública

#### 2. Enmascarar Datos Bancarios
```php
// En la vista
{{ Str::mask($accountNumber, '*', 4) }}
```

#### 3. Logging de Accesos
```php
Log::info('Public quote accessed', [
    'request_id' => $request->id,
    'client_id' => $request->client_id,
    'ip' => request()->ip(),
    'user_agent' => request()->userAgent()
]);
```

---

## 🧪 Testing

### Tests Unitarios

#### QuotePublicControllerTest
```php
// tests/Feature/QuotePublicControllerTest.php
class QuotePublicControllerTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_public_quote_show_success()
    {
        $request = Request::factory()->create([
            'is_public' => true,
            'public_token' => 'test-token',
            'public_expires_at' => now()->addDays(30)
        ]);
        
        $response = $this->get("/quote/shared/{$request->slug}/test-token");
        
        $response->assertStatus(200);
        $response->assertViewIs('quotes.shared');
    }
    
    public function test_public_quote_show_invalid_token()
    {
        $request = Request::factory()->create([
            'is_public' => true,
            'public_token' => 'valid-token'
        ]);
        
        $response = $this->get("/quote/shared/{$request->slug}/invalid-token");
        
        $response->assertStatus(404);
    }
    
    public function test_public_quote_show_expired()
    {
        $request = Request::factory()->create([
            'is_public' => true,
            'public_token' => 'test-token',
            'public_expires_at' => now()->subDays(1)
        ]);
        
        $response = $this->get("/quote/shared/{$request->slug}/test-token");
        
        $response->assertStatus(410);
    }
}
```

### Tests de Integración

#### ContactFormTest
```php
// tests/Feature/ContactFormTest.php
class ContactFormTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_contact_form_submission()
    {
        $request = Request::factory()->create();
        
        Livewire::test(ContactForm::class, ['quote' => $request])
            ->set('name', 'John Doe')
            ->set('email', 'john@example.com')
            ->set('phone', '1234567890')
            ->set('message', 'Test message')
            ->call('submitForm')
            ->assertSet('isSubmitted', true);
    }
}
```

---

## 🚀 Deployment

### Checklist de Deployment

#### 1. Base de Datos
- [ ] Ejecutar migración de campos públicos
- [ ] Verificar índices en `public_token`
- [ ] Configurar backup de datos

#### 2. Archivos
- [ ] Compilar assets CSS/JS
- [ ] Verificar permisos de storage
- [ ] Configurar CDN para assets estáticos

#### 3. Configuración
- [ ] Configurar variables de entorno
- [ ] Verificar configuración de email
- [ ] Configurar rate limiting

#### 4. Monitoreo
- [ ] Configurar logging de accesos
- [ ] Monitorear performance
- [ ] Configurar alertas de errores

### Comandos de Deployment

```bash
# 1. Ejecutar migraciones
php artisan migrate

# 2. Compilar assets
npm run build

# 3. Limpiar cache
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 4. Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📊 Monitoreo y Analytics

### Métricas Importantes

#### 1. Accesos a Cotizaciones
- Número de accesos por cotización
- IPs de acceso
- User agents
- Tiempo de permanencia

#### 2. Formularios de Contacto
- Número de envíos
- Tasa de conversión
- Errores de envío

#### 3. Formas de Pago
- Métodos más consultados
- Tiempo de interacción
- Clicks en detalles

### Logging
```php
// En QuotePublicController@show()
Log::info('Public quote accessed', [
    'request_id' => $request->id,
    'client_id' => $request->client_id,
    'ip' => request()->ip(),
    'user_agent' => request()->userAgent(),
    'timestamp' => now()
]);
```

---

## 🔧 Mantenimiento

### Tareas Regulares

#### 1. Limpieza de Tokens Expirados
```php
// Comando Artisan
php artisan quotes:cleanup-expired-tokens
```

#### 2. Rotación de Tokens
```php
// Comando para regenerar tokens
php artisan quotes:regenerate-tokens
```

#### 3. Backup de Datos
- Backup diario de la tabla `requests`
- Backup de logs de acceso
- Backup de formularios de contacto

### Troubleshooting

#### Problemas Comunes

1. **Token no válido**
   - Verificar que el token coincida exactamente
   - Verificar que la cotización esté marcada como pública

2. **Imágenes no cargan**
   - Verificar permisos de storage
   - Verificar configuración de `public_images`

3. **Formulario no envía**
   - Verificar configuración de email
   - Verificar logs de Laravel

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- [Laravel Documentation](https://laravel.com/docs)
- [Livewire Documentation](https://livewire.laravel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Swiper.js Documentation](https://swiperjs.com/get-started)

### Archivos de Configuración
- `config/mail.php` - Configuración de email
- `config/filesystems.php` - Configuración de storage
- `resources/css/quotes-public.css` - Estilos personalizados
- `resources/js/quotes-public.js` - JavaScript personalizado

### Comandos Artisan Útiles
```bash
# Crear cotización de prueba
php artisan quotes:create-test

# Limpiar tokens expirados
php artisan quotes:cleanup

# Regenerar tokens
php artisan quotes:regenerate

# Debug de servicios
php artisan quotes:debug-services
```

---

*Documentación generada el {{ now()->format('d/m/Y H:i') }}*
*Versión: 1.0.0*
