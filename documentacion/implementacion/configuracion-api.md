# Configuración de API para Flutter

## 🔧 **Configuración de Laravel**

### **1. Instalación de Dependencias**

```bash
# Instalar Sanctum para autenticación API
composer require laravel/sanctum

# Instalar CORS para permitir requests desde Flutter
composer require fruitcake/laravel-cors

# Instalar Query Builder para filtros avanzados
composer require spatie/laravel-query-builder

# Instalar Rate Limiting para control de tráfico
composer require spatie/laravel-rate-limiter
```

### **2. Configuración de Sanctum**

#### **Publish Sanctum**
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### **Configurar Middleware**
```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

#### **Configurar CORS**
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',  // Flutter web
        'http://127.0.0.1:3000',
        'capacitor://localhost',  // Flutter mobile
        'ionic://localhost',
        'http://localhost',
        'http://localhost:8080',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### **3. Estructura de Rutas API**

```php
// routes/api.php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\AnalyticsController;

// Rutas públicas
Route::prefix('v1')->group(function () {
    // Autenticación
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
});

// Rutas protegidas
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Clientes
    Route::apiResource('clients', ClientController::class);
    Route::get('/clients/search/{query}', [ClientController::class, 'search']);
    
    // Solicitudes/Cotizaciones
    Route::apiResource('requests', RequestController::class);
    Route::get('/requests/my', [RequestController::class, 'myRequests']);
    Route::get('/requests/agency', [RequestController::class, 'agencyRequests']);
    Route::post('/requests/{id}/status', [RequestController::class, 'updateStatus']);
    
    // Ventas
    Route::apiResource('sales', SaleController::class);
    Route::get('/sales/my', [SaleController::class, 'mySales']);
    Route::get('/sales/analytics', [AnalyticsController::class, 'getAnalytics']);
    Route::get('/sales/analytics/chart', [AnalyticsController::class, 'getChartData']);
    
    // Analytics generales
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboard']);
    Route::get('/analytics/performance', [AnalyticsController::class, 'getPerformance']);
});
```

### **4. Controlador de Autenticación**

```php
// app/Http/Controllers/Api/AuthController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ]);
            }

            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user),
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
                'message' => 'Inicio de sesión exitoso',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Los datos proporcionados no son válidos',
                    'details' => $e->errors(),
                ],
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'LOGIN_ERROR',
                    'message' => 'Error al iniciar sesión: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'LOGOUT_ERROR',
                    'message' => 'Error al cerrar sesión: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new UserResource($request->user()),
                'message' => 'Usuario obtenido exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'USER_ERROR',
                    'message' => 'Error al obtener usuario: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function refresh(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();
            $token = $request->user()->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
                'message' => 'Token renovado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'REFRESH_ERROR',
                    'message' => 'Error al renovar token: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }
}
```

### **5. Resource para Usuarios**

```php
// app/Http/Resources/Api/UserResource.php
<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'agency' => [
                'id' => $this->agency_id,
                'name' => $this->agency->name ?? null,
                'slug' => $this->agency->slug ?? null,
            ],
            'roles' => $this->roles->pluck('name'),
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

## 📱 **Configuración de Flutter**

### **1. Dependencias en pubspec.yaml**

```yaml
name: crm_mobile
description: Aplicación móvil para el sistema CRM

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # HTTP y Networking
  http: ^1.1.0
  dio: ^5.3.2
  
  # Estado y Gestión de Datos
  flutter_bloc: ^8.1.3
  provider: ^6.1.1
  
  # Almacenamiento Local
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # UI y Utilidades
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  intl: ^0.19.0
  flutter_localizations:
    sdk: flutter
  
  # Navegación
  go_router: ^12.1.1
  
  # Formularios y Validación
  formz: ^0.7.0
  
  # Utilidades
  equatable: ^2.0.5
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  
  # Generación de código
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
  
  fonts:
    - family: Roboto
      fonts:
        - asset: fonts/Roboto-Regular.ttf
        - asset: fonts/Roboto-Bold.ttf
          weight: 700
```

### **2. Configuración de Variables de Entorno**

```dart
// lib/core/config/app_config.dart
class AppConfig {
  static const String baseUrl = 'http://localhost:8000/api/v1';
  static const String apiVersion = 'v1';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Configuración para diferentes entornos
  static const Map<String, String> environments = {
    'development': 'http://localhost:8000/api/v1',
    'staging': 'https://staging-api.tudominio.com/api/v1',
    'production': 'https://api.tudominio.com/api/v1',
  };
  
  static String getBaseUrl() {
    const String environment = String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');
    return environments[environment] ?? environments['development']!;
  }
}
```

### **3. Configuración de Hive para Almacenamiento Local**

```dart
// lib/core/storage/hive_service.dart
import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  static late Box _box;
  
  static Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox('crm_app');
  }
  
  static Future<void> saveToken(String token) async {
    await _box.put('auth_token', token);
  }
  
  static String? getToken() {
    return _box.get('auth_token');
  }
  
  static Future<void> removeToken() async {
    await _box.delete('auth_token');
  }
  
  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _box.put('current_user', user);
  }
  
  static Map<String, dynamic>? getUser() {
    return _box.get('current_user');
  }
  
  static Future<void> clearAll() async {
    await _box.clear();
  }
}
```

### **4. Interceptor para Manejo de Errores**

```dart
// lib/core/api/api_interceptor.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../storage/hive_service.dart';

class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Agregar token de autenticación
    final token = HiveService.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    // Agregar headers comunes
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expirado o inválido
      await HiveService.clearAll();
      // Redirigir a pantalla de login
      // Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
    
    handler.next(err);
  }
}
```

## 🔒 **Configuración de Seguridad**

### **1. Rate Limiting en Laravel**

```php
// app/Http/Middleware/ApiRateLimit.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ApiRateLimit
{
    public function handle(Request $request, Closure $next)
    {
        $key = 'api:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 100)) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
                ],
            ], 429);
        }
        
        RateLimiter::hit($key, 60); // 100 requests per minute
        
        return $next($request);
    }
}
```

### **2. Validación de Requests**

```php
// app/Http/Requests/Api/ClientRequest.php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['email'] = 'required|email|unique:clients,email,' . $this->route('client');
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El email es obligatorio',
            'email.email' => 'El email debe tener un formato válido',
            'email.unique' => 'Este email ya está registrado',
        ];
    }
}
```

## 📊 **Configuración de Logging**

### **1. Logging en Laravel**

```php
// config/logging.php
'channels' => [
    'api' => [
        'driver' => 'daily',
        'path' => storage_path('logs/api.log'),
        'level' => 'info',
        'days' => 14,
    ],
],
```

### **2. Logging en Flutter**

```dart
// lib/core/utils/logger.dart
import 'dart:developer' as developer;

class Logger {
  static void info(String message, {String? tag}) {
    developer.log(message, name: tag ?? 'INFO');
  }
  
  static void error(String message, {String? tag, dynamic error, StackTrace? stackTrace}) {
    developer.log(
      message,
      name: tag ?? 'ERROR',
      error: error,
      stackTrace: stackTrace,
    );
  }
  
  static void debug(String message, {String? tag}) {
    developer.log(message, name: tag ?? 'DEBUG');
  }
}
```

---

**Fecha de creación:** 15 de Enero, 2024  
**Versión:** 1.0  
**Autor:** Sistema CRM - MVP Solutions 360  
**Estado:** En revisión
