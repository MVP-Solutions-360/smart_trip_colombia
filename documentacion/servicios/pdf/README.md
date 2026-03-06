# SISTEMA DE PDFs DE COTIZACIONES WELLEZY

## 🎯 OBJETIVO

Crear un sistema de generación de PDFs de cotizaciones que replique exactamente el diseño y estilo de las cotizaciones de "wellezy", con un diseño pulido, visualmente atractivo y organizado que sirva como benchmark de calidad.

## 📋 CARACTERÍSTICAS PRINCIPALES

### ✨ Diseño Profesional
- **Header impactante** con imagen de fondo y logo corporativo
- **Paleta de colores** consistente con la marca Wellezy
- **Tipografía** moderna y legible
- **Layout responsivo** que se adapta a diferentes contenidos

### 🏗️ Arquitectura Modular
- **6 tipos de cotización** soportados (Hotel, Vuelo, Paquete, Traslado, Alquiler de Autos, Tour)
- **Componentes reutilizables** para tablas, listas de servicios y precios
- **Sistema de plantillas** flexible y personalizable
- **Framework CSS** específico para PDFs

### ⚡ Rendimiento Optimizado
- **Sistema de caché** integrado (24 horas TTL)
- **Optimización de imágenes** automática
- **Configuración DomPDF** optimizada para alta calidad
- **Generación asíncrona** (preparado para implementar)

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### 1. Archivos Incluidos
```
✅ Controlador: app/Http/Controllers/QuotePdfController.php
✅ Servicio: app/Services/QuotePdfService.php
✅ CSS Framework: resources/css/pdf-quotes.css
✅ Templates: resources/views/pdf/quotes/
✅ Configuración: config/pdf-quotes.php
✅ Rutas: routes/modules/pdf-quotes.php
✅ Comando: app/Console/Commands/GenerateTestQuote.php
```

### 2. Configuración Inicial
```bash
# 1. Limpiar caché de configuración
php artisan config:clear

# 2. Crear directorio de archivos temporales
mkdir -p storage/app/temp/pdf

# 3. Probar generación de PDF
php artisan pdf:test-quote hotel --save
```

### 3. Integración con Rutas
```php
// En routes/web.php
Route::group(['prefix' => 'pdf'], function () {
    require __DIR__.'/modules/pdf-quotes.php';
});
```

## 📖 GUÍA DE USO

### Generación Básica
```php
use App\Services\QuotePdfService;

$pdfService = new QuotePdfService();

$pdf = $pdfService->generateQuote('hotel', [
    'hotel_description' => 'Occidental Caribe es un hotel todo incluido...',
    'total_price' => 4770130,
    'included_services' => ['2 piscinas', 'Área infantil', 'WiFi'],
    'not_included_services' => ['Impuestos', 'Propinas'],
    'background_image' => 'path/to/image.jpg',
    'location' => 'Medellín',
    'date' => '11 de mayo de 2023'
]);
```

### Generación con Caché
```php
// Para evitar regenerar PDFs idénticos
$pdf = $pdfService->generateCachedQuote('hotel', $data, 'unique_key');
```

### Comandos de Prueba
```bash
# Generar PDF de prueba para hotel
php artisan pdf:test-quote hotel

# Guardar PDF en storage
php artisan pdf:test-quote hotel --save

# Mostrar en navegador
php artisan pdf:test-quote hotel --preview

# Probar todos los tipos
php artisan pdf:test-quote flight
php artisan pdf:test-quote package
php artisan pdf:test-quote transfer
php artisan pdf:test-quote car-rental
php artisan pdf:test-quote tour
```

## 🎨 PERSONALIZACIÓN

### Colores Corporativos
```php
// En config/pdf-quotes.php
'colors' => [
    'primary' => '#4A90E2',      // Azul principal
    'light_blue' => '#87CEEB',   // Azul claro
    'dark_blue' => '#2E5BBA',    // Azul oscuro
    // ... más colores
],
```

### Tipografía
```php
'typography' => [
    'font_family' => 'Inter, Segoe UI, Arial, sans-serif',
    'font_sizes' => [
        'h1' => 32,
        'h2' => 24,
        'body' => 14,
        // ... más tamaños
    ],
],
```

### Variables CSS
```css
:root {
    --primary-blue: #4A90E2;
    --light-blue: #87CEEB;
    --dark-blue: #2E5BBA;
    /* Personalizar fácilmente */
}
```

## 📊 TIPOS DE COTIZACIÓN

### 🏨 Hotel
- **Características**: Imagen inset del hotel, descripción detallada, servicios incluidos/no incluidos
- **Datos requeridos**: `hotel_description`, `total_price`
- **Template**: `hotel-quote.blade.php`

### ✈️ Vuelo
- **Características**: Tabla de itinerario aéreo, condiciones de vuelo
- **Datos requeridos**: `flight_itinerary`, `total_price`
- **Template**: `flight-quote.blade.php`

### 📦 Paquete
- **Características**: Itinerario detallado, fechas de salida, información completa
- **Datos requeridos**: `package_description`, `total_price`
- **Template**: `package-quote.blade.php`

### 🚌 Traslado
- **Características**: Información de operador, horarios, lugares
- **Datos requeridos**: `transfer_info`, `total_price`
- **Template**: `transfer-quote.blade.php`

### 🚗 Alquiler de Autos
- **Características**: Imagen del vehículo, información de alquiler
- **Datos requeridos**: `service_description`, `total_price`
- **Template**: `car-rental-quote.blade.php`

### 🗺️ Tour
- **Características**: Descripción del tour, información turística
- **Datos requeridos**: `tour_description`, `total_price`
- **Template**: `tour-quote.blade.php`

## 🔧 CONFIGURACIÓN AVANZADA

### Optimización de Rendimiento
```php
// Configurar límites de memoria
'security' => [
    'memory_limit' => '256M',
    'max_execution_time' => 30,
],

// Configurar caché
'cache' => [
    'enabled' => true,
    'ttl' => 1440, // 24 horas
],
```

### Validación de Datos
```php
// Campos requeridos por tipo
'validation' => [
    'required_fields' => [
        'hotel' => ['hotel_description', 'total_price'],
        'flight' => ['flight_itinerary', 'total_price'],
        // ... más tipos
    ],
],
```

### Logging y Monitoreo
```php
// Habilitar logs
'logging' => [
    'enabled' => true,
    'level' => 'info',
    'channel' => 'pdf_quotes',
],
```

## 🐛 TROUBLESHOOTING

### Problemas Comunes

#### ❌ "No se encontró plantilla"
**Solución**: Verificar que el tipo existe en `config/pdf-quotes.php`

#### ❌ "Campo requerido faltante"
**Solución**: Verificar datos de entrada con `validateData()`

#### ❌ "Imagen no encontrada"
**Solución**: Verificar rutas y permisos de archivos

#### ❌ "Memoria insuficiente"
**Solución**: Aumentar `memory_limit` o reducir tamaño de imágenes

### Logs de Depuración
```php
// Ver logs en storage/logs/laravel.log
Log::debug('Generando PDF', ['data' => $data]);
```

## 📈 MÉTRICAS Y MONITOREO

### Estadísticas de Generación
```php
$stats = $pdfService->getStats();
// Retorna: total_generated, by_type, by_date, errors
```

### Logs de Rendimiento
```php
// Los logs incluyen:
// - Tipo de cotización
// - Tiempo de generación
// - Usuario que generó
// - IP y User Agent
```

## 🔮 ROADMAP FUTURO

### Funcionalidades Planificadas
- [ ] **Editor visual** de plantillas
- [ ] **Generación masiva** de PDFs
- [ ] **Plantillas personalizadas** por agencia
- [ ] **Integración con servicios** de almacenamiento en la nube
- [ ] **Firma digital** en PDFs
- [ ] **Códigos QR** para verificación

### Mejoras de Rendimiento
- [ ] **Generación asíncrona** de PDFs
- [ ] **Compresión avanzada** de imágenes
- [ ] **CDN** para imágenes
- [ ] **Caché distribuido**

## 📚 DOCUMENTACIÓN ADICIONAL

- **[Especificaciones de Diseño](ESPECIFICACIONES_DISENO_PDF_COTIZACIONES.md)** - Detalles completos del diseño
- **[Implementación Técnica](IMPLEMENTACION_TECNICA.md)** - Guía técnica de implementación
- **[API Reference](API_REFERENCE.md)** - Documentación de la API (próximamente)

## 🤝 SOPORTE

Para soporte técnico o preguntas sobre el sistema:

1. **Revisar logs** en `storage/logs/laravel.log`
2. **Probar con comando** `php artisan pdf:test-quote`
3. **Verificar configuración** en `config/pdf-quotes.php`
4. **Consultar documentación** técnica

## 📄 LICENCIA

Este sistema está desarrollado para uso interno de Wellezy S.A.S y está protegido por las leyes de propiedad intelectual.

---

**Desarrollado con ❤️ para Wellezy S.A.S**

*Última actualización: {{ date('Y-m-d') }}*
