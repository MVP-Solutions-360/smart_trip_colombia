# 🚀 PROMPT COMPLETO PARA IMPLEMENTACIÓN - SISTEMA CRM WELLEZY

## CONTEXTO DEL PROYECTO

Necesito implementar un sistema CRM completo para una agencia de viajes que maneja:
- **Vuelos** (integración con Amadeus GDS)
- **Hoteles** (integración con Restel API)
- **Traslados** (integración con Terrawind API)
- **Asistencia Médica** (integración con Medical API)
- **Sistema de Pagos** (Paymentez, PSE, Efectivo, Transferencias)

## TECNOLOGÍAS REQUERIDAS

- **Laravel 9.19** (PHP 8.0+)
- **Livewire 2.10** para componentes reactivos
- **AdminLTE 3.8** para interfaz administrativa
- **Laravel Jetstream + Fortify** para autenticación
- **Laravel Sanctum** para API
- **MySQL** como base de datos
- **Tailwind CSS** para estilos
- **Alpine.js** para interactividad

## ESTRUCTURA DE ARCHIVOS A CREAR

### 1. MODELOS (app/Models/)
```
Reserve.php - Modelo principal de reservas
Ticket.php - Modelo polimórfico de tiquetes
AmadeusReserve.php - Reservas de vuelos
RestelReserve.php - Reservas de hoteles
TerrawindReserve.php - Reservas de traslados
MedicalReserve.php - Reservas médicas
TransferReserve.php - Reservas de traslados
Payment.php - Pagos
TimeMark.php - Marcas de tiempo
User.php - Usuarios
Office.php - Oficinas
Contact.php - Contactos
Deal.php - Negocios
Team.php - Equipos
Merchant.php - Comerciantes
```

### 2. COMPONENTES LIVEWIRE (app/Http/Livewire/)
```
SearchShow.php - Búsqueda principal
SearchResults.php - Resultados de búsqueda
BookingForm.php - Formulario de reserva
ReserveConfirmation.php - Confirmación de reserva
ReserveList.php - Lista de reservas
PaymentForm.php - Formulario de pago
Dashboard.php - Dashboard principal
ContactForm.php - Formulario de contactos
DealForm.php - Formulario de negocios
UserManagement.php - Gestión de usuarios
```

### 3. CONTROLADORES API (app/Http/Controllers/Api/)
```
FlightController.php - Controlador de vuelos
HotelController.php - Controlador de hoteles
TransferController.php - Controlador de traslados
MedicalController.php - Controlador de asistencia médica
PaymentController.php - Controlador de pagos
AuthController.php - Autenticación API
```

### 4. VISTAS BLADE (resources/views/)
```
layouts/app.blade.php - Layout principal
livewire/search-show.blade.php - Búsqueda
livewire/search-results.blade.php - Resultados
livewire/booking-form.blade.php - Formulario de reserva
livewire/reserve-confirmation.blade.php - Confirmación
livewire/reserve-list.blade.php - Lista de reservas
livewire/payment-form.blade.php - Formulario de pago
livewire/dashboard.blade.php - Dashboard
livewire/contact-form.blade.php - Formulario de contactos
livewire/deal-form.blade.php - Formulario de negocios
livewire/user-management.blade.php - Gestión de usuarios
```

### 5. MIGRACIONES (database/migrations/)
```
create_reserves_table.php
create_tickets_table.php
create_amadeus_reserves_table.php
create_restel_reserves_table.php
create_terrawind_reserves_table.php
create_medical_reserves_table.php
create_transfer_reserves_table.php
create_payments_table.php
create_time_marks_table.php
create_offices_table.php
create_contacts_table.php
create_deals_table.php
create_teams_table.php
create_merchants_table.php
```

### 6. RUTAS (routes/)
```
web.php - Rutas web principales
api.php - Rutas API
web/sales.php - Rutas de ventas
web/travel.php - Rutas de viajes
```

## CONFIGURACIÓN INICIAL

### 1. Variables de Entorno (.env)
```env
APP_TRAVEL=https://api.travel.com
APP_CARD_LOGIN=card_login
APP_CARD_PASSWORD=card_password
APP_CARD_URL=https://card.api.com
AMADEUS_API_KEY=amadeus_key
RESTEL_API_KEY=restel_key
TERRAWIND_API_KEY=terrawind_key
PAYMENTEZ_API_KEY=paymentez_key
```

### 2. Configuración de Servicios (config/services.php)
```php
'amadeus' => [
    'api_key' => env('AMADEUS_API_KEY'),
    'base_url' => 'https://api.amadeus.com',
],
'restel' => [
    'api_key' => env('RESTEL_API_KEY'),
    'base_url' => 'https://api.restel.com',
],
'terrawind' => [
    'api_key' => env('TERRAWIND_API_KEY'),
    'base_url' => 'https://api.terrawind.com',
],
'paymentez' => [
    'api_key' => env('PAYMENTEZ_API_KEY'),
    'base_url' => 'https://api.paymentez.com',
],
```

## FUNCIONALIDADES PRINCIPALES

### 1. SISTEMA DE BÚSQUEDA
- Búsqueda unificada para vuelos, hoteles, traslados y asistencia médica
- Autocompletado de ubicaciones
- Filtros por precio, fecha, tipo de servicio
- Integración con APIs externas

### 2. SISTEMA DE RESERVAS
- Formulario de reserva con información de contacto y pasajeros
- Validaciones completas
- Creación automática de reservas específicas según el tipo
- Confirmación por email

### 3. SISTEMA DE PAGOS
- Múltiples métodos de pago (Tarjeta, PSE, Efectivo, Transferencia)
- Integración con Paymentez
- Procesamiento seguro de pagos
- Confirmación automática

### 4. GESTIÓN DE USUARIOS
- Roles y permisos (Super Admin, Admin, Supervisor, Asesor)
- Gestión por oficinas
- Autenticación segura

### 5. DASHBOARD
- Estadísticas en tiempo real
- Reservas recientes
- Contactos recientes
- Negocios en progreso

## FLUJO DE TRABAJO

### 1. BÚSQUEDA Y SELECCIÓN
1. Usuario selecciona tipo de servicio
2. Completa formulario de búsqueda
3. Sistema consulta API correspondiente
4. Muestra resultados con filtros
5. Usuario selecciona opción

### 2. RESERVA
1. Usuario completa información de contacto
2. Agrega información de pasajeros
3. Sistema valida datos
4. Crea reserva en base de datos
5. Envía confirmación

### 3. PAGO
1. Usuario selecciona método de pago
2. Completa información de pago
3. Sistema procesa pago
4. Confirma reserva
5. Emite tiquetes/comprobantes

## VALIDACIONES REQUERIDAS

### 1. FORMULARIOS
- Validación de campos obligatorios
- Validación de formatos (email, teléfono, documento)
- Validación de fechas
- Validación de pasajeros

### 2. APIS
- Validación de respuestas de APIs externas
- Manejo de errores
- Timeouts y reintentos
- Logs de errores

### 3. PAGOS
- Validación de datos de tarjeta
- Verificación de montos
- Validación de métodos de pago
- Confirmación de transacciones

## SEGURIDAD

### 1. AUTENTICACIÓN
- Laravel Fortify para autenticación
- Laravel Sanctum para API
- Roles y permisos con Spatie

### 2. VALIDACIÓN
- Validación de entrada de datos
- Sanitización de datos
- Protección CSRF
- Validación de archivos

### 3. PAGOS
- Encriptación de datos sensibles
- Cumplimiento PCI DSS
- Tokens seguros
- Auditoría de transacciones

## TESTING

### 1. UNITARIOS
- Tests para modelos
- Tests para controladores
- Tests para servicios

### 2. INTEGRACIÓN
- Tests para APIs externas
- Tests para flujos completos
- Tests para pagos

### 3. FUNCIONALES
- Tests para interfaz de usuario
- Tests para formularios
- Tests para navegación

## DEPLOYMENT

### 1. SERVIDOR
- PHP 8.0+
- MySQL 8.0+
- Composer
- Node.js y NPM

### 2. CONFIGURACIÓN
- Variables de entorno
- Configuración de base de datos
- Configuración de APIs
- Configuración de pagos

### 3. MONITOREO
- Logs de aplicación
- Logs de errores
- Monitoreo de APIs
- Monitoreo de pagos

## INSTRUCCIONES ESPECÍFICAS

### 1. IMPLEMENTAR EN ORDEN
1. Crear modelos y migraciones
2. Configurar APIs externas
3. Crear controladores
4. Crear componentes Livewire
5. Crear vistas Blade
6. Configurar rutas
7. Implementar autenticación
8. Implementar pagos
9. Testing
10. Deployment

### 2. CONSIDERACIONES
- Usar traits para lógica reutilizable
- Implementar cache para APIs
- Manejar errores graciosamente
- Logs detallados
- Documentación de código

### 3. OPTIMIZACIONES
- Lazy loading para relaciones
- Cache de consultas frecuentes
- Optimización de imágenes
- Compresión de assets

## ARCHIVOS DE DOCUMENTACIÓN

La documentación completa está en:
- `documentacion/MODELOS_COMPLETOS.md` - Todos los modelos
- `documentacion/COMPONENTES_LIVEWIRE_COMPLETOS.md` - Componentes Livewire
- `documentacion/VISTAS_BLADE_COMPLETAS.md` - Vistas Blade
- `documentacion/tiquetes/` - Documentación de tiquetes
- `documentacion/hoteles/` - Documentación de hoteles
- `documentacion/pagos/` - Documentación de pagos
- `documentacion/traslados/` - Documentación de traslados
- `documentacion/asistencias/` - Documentación de asistencias médicas

## RESULTADO ESPERADO

Un sistema CRM completo y funcional que permita:
- Buscar y reservar vuelos, hoteles, traslados y asistencia médica
- Gestionar contactos y negocios
- Procesar pagos de forma segura
- Administrar usuarios y permisos
- Generar reportes y estadísticas
- Integrar con APIs externas
- Mantener auditoría completa

¿Estás listo para implementar este sistema completo?
