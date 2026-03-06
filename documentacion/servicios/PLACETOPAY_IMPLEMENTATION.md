# Implementación del Servicio PlaceToPay

## 📋 Resumen

Este documento describe la implementación completa del servicio de pagos PlaceToPay en el sistema CRM, incluyendo la instalación de dependencias, creación del servicio y configuración necesaria.

## 🎯 Objetivos

- Integrar PlaceToPay como método de pago en el sistema CRM
- Crear un servicio reutilizable para manejar transacciones
- Implementar validaciones y manejo de errores robusto
- Proporcionar funcionalidad de consulta de transacciones

## 🔧 Proceso de Implementación

### 1. Preparación del Entorno

#### Creación del Branch
```bash
git checkout -b place-to-pay
```

#### Instalación de Dependencias
```bash
composer require dnetix/redirection
```

**Dependencia instalada:**
- `dnetix/redirection` v2.1.2
- SDK oficial de PlaceToPay para PHP

### 2. Estructura de Archivos

```
app/Services/Payment/
└── PlaceToPayService.php
```

### 3. Configuración del Servicio

## 📁 Archivo: `PlaceToPayService.php`

### Ubicación
`app/Services/Payment/PlaceToPayService.php`

### Namespace
```php
namespace App\Services\Payment;
```

### Dependencias
```php
use Dnetix\Redirection\PlacetoPay;
use Dnetix\Redirection\Message\RedirectRequest;
use Dnetix\Redirection\Message\RedirectResponse;
use Exception;
```

## 🔨 Funcionalidades Implementadas

### Constructor
```php
public function __construct(string $login, string $tranKey, string $endpoint)
```

**Parámetros:**
- `$login`: Login de PlaceToPay
- `$tranKey`: Clave de transacción
- `$endpoint`: URL del endpoint de PlaceToPay

### Método Principal: `createSession()`

```php
public function createSession(array $data): array
```

**Parámetros de entrada:**
```php
$data = [
    'reference' => 'REF-001',           // Referencia única de la transacción
    'total' => 100000,                  // Valor total en centavos
    'description' => 'Pago de servicios', // Descripción del pago
    'buyer_email' => 'cliente@ejemplo.com', // Email del comprador
    'return_url' => 'https://mi-sitio.com/return' // URL de retorno
];
```

**Respuesta exitosa:**
```php
[
    'success' => true,
    'request_id' => '12345',
    'process_url' => 'https://checkout.placetopay.com/...',
    'status' => 'OK',
    'message' => 'Sesión de pago creada exitosamente'
]
```

**Respuesta con error:**
```php
[
    'success' => false,
    'error' => 'Mensaje de error específico',
    'status' => 'ERROR'
]
```

### Método de Consulta: `queryTransaction()`

```php
public function queryTransaction(string $requestId): array
```

**Funcionalidad:**
- Consulta el estado actual de una transacción
- Devuelve información detallada del pago
- Útil para verificar pagos después del retorno

## 🛡️ Validaciones Implementadas

### Validación de Datos Requeridos
- ✅ Referencia (obligatoria)
- ✅ Total (obligatorio y numérico)
- ✅ Descripción (obligatoria)
- ✅ Email del comprador (obligatorio y válido)
- ✅ URL de retorno (obligatoria)

### Validaciones Específicas
- **Total:** Debe ser numérico y mayor a 0
- **Email:** Validación de formato con `FILTER_VALIDATE_EMAIL`
- **Moneda:** Configurada automáticamente como COP (pesos colombianos)

## ⚙️ Configuración Técnica

### Timeouts
```php
'rest' => [
    'timeout' => 45,           // Timeout general: 45 segundos
    'connect_timeout' => 30,   // Timeout de conexión: 30 segundos
]
```

### Expiración de Sesiones
- **Tiempo de expiración:** 1 hora desde la creación
- **Formato:** ISO 8601 (`date('c', strtotime('+1 hour'))`)

### Información del Comprador
- **IP Address:** Obtenida automáticamente de la request
- **User Agent:** Obtenido automáticamente de la request

## 📖 Ejemplos de Uso

### Uso Básico

```php
use App\Services\Payment\PlaceToPayService;

// Inicializar el servicio
$placeToPay = new PlaceToPayService(
    config('services.placetopay.login'),
    config('services.placetopay.tran_key'),
    config('services.placetopay.endpoint')
);

// Crear sesión de pago
$result = $placeToPay->createSession([
    'reference' => 'PAGO-' . time(),
    'total' => 150000, // $150,000 COP
    'description' => 'Pago de servicios de agencia',
    'buyer_email' => 'cliente@agencia.com',
    'return_url' => route('payment.return')
]);

if ($result['success']) {
    // Redirigir al usuario a PlaceToPay
    return redirect($result['process_url']);
} else {
    // Manejar error
    return back()->with('error', $result['error']);
}
```

### Consulta de Transacción

```php
// Después del retorno del usuario
$status = $placeToPay->queryTransaction($requestId);

if ($status['success']) {
    switch ($status['status']) {
        case 'APPROVED':
            // Pago aprobado
            break;
        case 'PENDING':
            // Pago pendiente
            break;
        case 'REJECTED':
            // Pago rechazado
            break;
    }
}
```

## 🔧 Configuración en Laravel

### Archivo de Configuración
Crear `config/services.php`:

```php
'placetopay' => [
    'login' => env('PLACETOPAY_LOGIN'),
    'tran_key' => env('PLACETOPAY_TRAN_KEY'),
    'endpoint' => env('PLACETOPAY_ENDPOINT'),
],
```

### Variables de Entorno
Agregar al archivo `.env`:

```env
# PlaceToPay Configuration
PLACETOPAY_LOGIN=your_login_here
PLACETOPAY_TRAN_KEY=your_tran_key_here
PLACETOPAY_ENDPOINT=https://checkout-test.placetopay.com/redirection
```

## 🚀 Próximos Pasos

### 1. Configuración de Rutas
```php
// routes/web.php
Route::post('/payment/create', [PaymentController::class, 'create'])->name('payment.create');
Route::get('/payment/return', [PaymentController::class, 'return'])->name('payment.return');
```

### 2. Controlador de Pagos
Crear `PaymentController` para manejar:
- Creación de sesiones
- Procesamiento de retornos
- Consulta de estados

### 3. Migraciones de Base de Datos
Crear tablas para almacenar:
- Transacciones de pago
- Estados de pago
- Referencias de PlaceToPay

### 4. Notificaciones
Implementar notificaciones para:
- Pago exitoso
- Pago fallido
- Pago pendiente

## 📊 Estados de Transacción

| Estado | Descripción |
|--------|-------------|
| `OK` | Transacción creada exitosamente |
| `APPROVED` | Pago aprobado |
| `PENDING` | Pago pendiente |
| `REJECTED` | Pago rechazado |
| `ERROR` | Error en la transacción |

## 🔍 Monitoreo y Logs

### Logs Recomendados
- Creación de sesiones
- Respuestas de PlaceToPay
- Errores de validación
- Consultas de estado

### Métricas Importantes
- Tasa de éxito de pagos
- Tiempo de respuesta
- Errores por tipo

## 🛠️ Troubleshooting

### Errores Comunes

1. **"El campo 'X' es requerido"**
   - Verificar que todos los campos obligatorios estén presentes

2. **"El total debe ser un número positivo"**
   - Asegurar que el total sea numérico y mayor a 0

3. **"El email del comprador no es válido"**
   - Verificar formato de email

4. **Timeouts de conexión**
   - Verificar conectividad con PlaceToPay
   - Revisar configuración de firewall

## 📝 Notas de Desarrollo

### Commit Realizado
```
feat: Add PlaceToPay payment service

- Install dnetix/redirection dependency
- Create PlaceToPayService with constructor and createSession method
- Add transaction query functionality
- Include proper validation and error handling
```

### Archivos Modificados
- `composer.json` - Dependencia agregada
- `composer.lock` - Lock file actualizado
- `app/Services/Payment/PlaceToPayService.php` - Servicio creado

## 🔗 Enlaces Útiles

- [Documentación oficial PlaceToPay](https://dev.placetopay.com/)
- [SDK PHP en GitHub](https://github.com/placetopay/redirection-php)
- [Documentación de la API](https://dev.placetopay.com/webcheckout/v2.1/)

---

**Fecha de implementación:** 27 de septiembre de 2025  
**Versión:** 1.0.0  
**Desarrollador:** Sistema CRM  
**Branch:** `place-to-pay`
