# BookingCars Environment Configuration

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# BookingCars API Configuration
BOOKINGCARS_BASE_URL=https://api.bookingcars.com
BOOKINGCARS_API_KEY=your_api_key_here
```

## Configuración

1. **BOOKINGCARS_BASE_URL**: URL base de la API de BookingCars
   - Valor por defecto: `https://api.bookingcars.com`
   - Formato: URL completa sin barra final

2. **BOOKINGCARS_API_KEY**: Clave de API de BookingCars
   - **Requerido**: No puede estar vacío
   - Obtén esta clave desde tu dashboard de BookingCars
   - Formato: String alfanumérico

## Validación

El servicio `BookingCarsService` validará automáticamente que ambas variables estén configuradas al instanciarse. Si alguna está vacía o es `null`, lanzará una excepción:

```
BookingCars API key or base URL is not configured properly.
```

## Ejemplo de Uso

```php
use App\Services\BookingCarsService;

try {
    $service = new BookingCarsService();
    $result = $service->getRentals();
} catch (Exception $e) {
    // Manejar error de configuración
    Log::error('BookingCars configuration error: ' . $e->getMessage());
}
```
