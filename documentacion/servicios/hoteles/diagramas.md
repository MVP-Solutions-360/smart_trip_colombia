# Diagramas de Arquitectura - Servicio de Hoteles

## Diagrama de Entidades y Relaciones

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Agency      │    │     Client      │    │     Request     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ name            │    │ name            │    │ adult           │
│ slug            │    │ slug            │    │ children        │
│ created_at      │    │ created_at      │    │ infant          │
│ updated_at      │    │ updated_at      │    │ departure_date  │
└─────────────────┘    └─────────────────┘    │ return_date     │
         │                       │             │ created_at      │
         │                       │             │ updated_at      │
         │                       │             └─────────────────┘
         │                       │                      │
         │                       │                      │
         ▼                       ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ HotelReserve    │    │   Observation   │    │ TransferReserve │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ agency_id       │◄───┤ client_id       │    │ provider_id     │
│ provider_id     │    │ title           │    │ agency_id       │
│ arrival_date    │    │ body            │    │ client_id       │
│ departure_date  │    │ type            │    │ request_id      │
│ name            │    │ priority        │    │ service_type    │
│ reservation_code│    │ is_private      │    │ travel_type     │
│ room_type       │    │ agency_id       │    │ origin          │
│ type_food       │    │ created_at      │    │ destination     │
│ total_rooms     │    │ updated_at      │    │ fare            │
│ adult           │    └─────────────────┘    │ status          │
│ children        │                           │ created_at      │
│ infant          │                           │ updated_at      │
│ fare            │                           └─────────────────┘
│ profit_percent  │                                    │
│ total_fare      │                                    │
│ description     │                                    │
│ observations    │                                    │
│ status          │                                    │
│ client_id       │                                    │
│ request_id      │                                    │
│ created_at      │                                    │
│ updated_at      │                                    │
└─────────────────┘                                    │
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│    Provider     │                           │   MediaFiles    │
├─────────────────┤                           ├─────────────────┤
│ id              │                           │ id              │
│ name            │                           │ model_type      │
│ contact_info    │                           │ model_id        │
│ services        │                           │ file_path       │
│ created_at      │                           │ file_type       │
│ updated_at      │                           │ description     │
└─────────────────┘                           │ created_at      │
                                              │ updated_at      │
                                              └─────────────────┘
```

## Flujo de Creación de Reservas de Hotel

```
┌─────────────────┐
│   Usuario       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│CreateHotelReserves│
│ Component       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Validación    │
│   - Proveedor   │
│   - Fechas      │
│   - Habitación  │
│   - Tarifas     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Generar Slug    │
│ Único           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Crear Reserva en│
│ Base de Datos   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Crear Observación│
│ Automática      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Crear Traslado  │
│ Relacionado     │
│ (Opcional)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Emitir Evento   │
│ hotelReserveCreated│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Mostrar Modal   │
│ de Confirmación │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Redireccionar   │
│ a ShowHotel     │
└─────────────────┘
```

## Arquitectura de Componentes Livewire

```
┌─────────────────────────────────────────────────────────────┐
│                    Hoteles Module                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │IndexHotelReserves│  │CreateHotelReserves│               │
│  │                 │  │                 │                  │
│  │ - Listar reservas│  │ - Crear reserva │                  │
│  │ - Filtrar       │  │ - Validar datos │                  │
│  │ - Buscar        │  │ - Calcular tarif│                  │
│  │ - Paginar       │  │ - Generar slug  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                       │                        │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ShowHotelReserves│  │EditHotelReserves│                  │
│  │                 │  │                 │                  │
│  │ - Mostrar reserva│  │ - Editar reserva│                  │
│  │ - Modal edición │  │ - Actualizar    │                  │
│  │ - Info completa │  │ - Preservar ctx │                  │
│  │ - Traslados     │  │ - Validar cambios│                 │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Componentes Adicionales                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Observations  │  │   MediaFiles    │                  │
│  │                 │  │                 │                  │
│  │ - Automáticas   │  │ - Imágenes      │                  │
│  │ - Cliente       │  │ - Documentos    │                  │
│  │ - Seguimiento   │  │ - Almacenamiento│                  │
│  │ - Historial     │  │ - Organización  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Estados de Reservas de Hotel

```
┌─────────────────┐
│   Cotizado      │
│   (Estado       │
│   Inicial)      │
└─────────┬───────┘
          │
          │ Cliente acepta
          │ la cotización
          ▼
┌─────────────────┐
│    Vendido      │
│   (Reserva      │
│   Confirmada)   │
└─────────┬───────┘
          │
          │ Cliente rechaza
          │ o cancela
          ▼
┌─────────────────┐
│   Descartado    │
│   (Reserva      │
│   Cancelada)    │
└─────────────────┘
```

## Tipos de Habitación y Alimentación

```
┌─────────────────────────────────────────────────────────────┐
│                    Tipos de Habitación                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Sencilla   │  │   Doble     │  │   Triple    │        │
│  │             │  │             │  │             │        │
│  │ - 1 persona │  │ - 2 personas│  │ - 3 personas│        │
│  │ - Cama simple│  │ - Cama doble│  │ - Cama + sofa│       │
│  │ - Baño priv │  │ - Baño priv │  │ - Baño priv │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ Cuádruple   │  │  Múltiple   │                          │
│  │             │  │             │                          │
│  │ - 4 personas│  │ - 5+ personas│                         │
│  │ - 2 camas   │  │ - Múltiples │                          │
│  │ - Baño priv │  │   camas     │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Tipos de Alimentación                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ No incluye  │  │Solo desayuno│  │Desayuno y   │        │
│  │             │  │             │  │cena         │        │
│  │ - Sin comida│  │ - Desayuno  │  │ - Media     │        │
│  │ - Solo aloj │  │   incluido  │  │   pensión   │        │
│  │ - Restaurante│  │ - Resto pago│  │ - 2 comidas │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │Desayuno,    │  │Todo incluido│                          │
│  │almuerzo,    │  │             │                          │
│  │cena         │  │ - Todas las │                          │
│  │             │  │   comidas   │                          │
│  │ - Pensión   │  │ - Bebidas   │                          │
│  │   completa  │  │ - Actividades│                         │
│  │ - 3 comidas │  │ - Servicios │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Cálculo de Tarifas

```
┌─────────────────┐
│   Tarifa Neta   │
│   (fare)        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ % de Utilidad   │
│ (profit_percent)│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Cálculo       │
│   total_fare =  │
│   fare +        │
│   (fare *       │
│   profit/100)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Tarifa Total   │
│  (total_fare)   │
└─────────────────┘
```

## Flujo de Gestión de Archivos Multimedia

```
┌─────────────────┐
│   Archivo       │
│   (Imagen/Doc)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ HasMediaFiles   │
│ Trait           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ uploadFile()    │
│ Método          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Storage         │
│ (Laravel)       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Base de Datos   │
│ (media_files)   │
└─────────────────┘
```

## Estructura de Archivos

```
app/
├── Livewire/Services/Hotels/
│   ├── CreateHotelReserves.php      # Crear reservas
│   ├── EditHotelReserves.php        # Editar reservas
│   ├── ShowHotelReserves.php        # Mostrar reservas
│   ├── IndexHotelReserves.php       # Listar reservas
│   └── Component/
│       ├── EditHotelReserves.php    # Componente edición
│       └── IndexHotelReserves.php   # Componente listado
├── Models/
│   ├── HotelReserve.php             # Modelo de reservas
│   ├── Provider.php                 # Modelo de proveedores
│   ├── Client.php                   # Modelo de clientes
│   ├── Request.php                  # Modelo de requests
│   └── TransferReserve.php          # Modelo de traslados
└── ...

resources/views/livewire/services/hotels/
├── create-hotel-reserves.blade.php  # Vista crear reserva
├── edit-hotel-reserves.blade.php    # Vista editar reserva
├── show-hotel-reserves.blade.php    # Vista mostrar reserva
├── index-hotel-reserves.blade.php   # Vista listar reservas
└── component/
    ├── edit-hotel-reserves.blade.php # Vista componente edición
    └── index-hotel-reserves.blade.php # Vista componente listado

database/migrations/
└── 2025_07_16_194423_create_hotel_reserves_table.php

routes/modules/services/
└── hotels.php                       # Rutas de hoteles
```

## Flujo de Datos en la Aplicación

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Livewire      │    │   Backend       │
│   (Blade)       │    │   Component     │    │   (Laravel)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ wire:model           │                      │
          │ wire:click           │                      │
          │ @entangle            │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ - Formularios   │    │ - Validación    │    │ - Modelos       │
│ - Eventos JS    │    │ - Lógica de     │    │ - Base de Datos │
│ - Interfaz      │    │   negocio       │    │ - Relaciones    │
│ - Navegación    │    │ - Estado        │    │ - Validaciones  │
└─────────────────┘    │ - Eventos       │    └─────────────────┘
                       └─────────────────┘
                                │
                                │ dispatch()
                                │ emit()
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JavaScript    │    │   Observaciones │    │   MediaFiles    │
│   (Alpine.js)   │    │   Automáticas   │    │   (HasMediaFiles)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Patrones de Diseño Utilizados

### 1. Repository Pattern (Implícito)
- Los modelos actúan como repositorios
- Encapsulan la lógica de acceso a datos
- Proporcionan métodos de consulta específicos

### 2. Observer Pattern
- Eventos de Livewire para comunicación
- Observaciones automáticas en modelos
- Listeners para eventos del sistema

### 3. Factory Pattern
- Factories para testing
- Creación de datos de prueba
- Generación de slugs únicos

### 4. Strategy Pattern
- Diferentes tipos de habitación
- Diferentes tipos de alimentación
- Diferentes estados de reserva

### 5. Template Method Pattern
- Estructura común en componentes Livewire
- Métodos mount(), save(), render() estandarizados
- Validaciones y reglas comunes

### 6. Trait Pattern
- HasMediaFiles para gestión de archivos
- HasObservations para observaciones
- Reutilización de funcionalidad

## Consideraciones de Seguridad

### 1. Validación de Entrada
- Validación en frontend (Livewire)
- Validación en backend (Laravel)
- Sanitización de datos

### 2. Autorización
- Middleware de autenticación
- Verificación de permisos
- Acceso basado en agencia

### 3. Protección CSRF
- Tokens CSRF en formularios
- Verificación automática
- Protección contra ataques

### 4. Validación de Fechas
- Fechas de llegada y salida válidas
- Fechas de salida posteriores a llegada
- Validación de rangos de fechas

### 5. Gestión de Archivos
- Validación de tipos de archivo
- Límites de tamaño
- Almacenamiento seguro

## Optimizaciones de Rendimiento

### 1. Eager Loading
```php
$hotels = HotelReserve::with(['provider', 'client', 'agency', 'transfers'])->get();
```

### 2. Caché de Consultas
```php
$hotels = Cache::remember('hotels.active', 3600, function () {
    return HotelReserve::where('status', 'vendido')->get();
});
```

### 3. Paginación
```php
$hotels = HotelReserve::paginate(15);
```

### 4. Índices de Base de Datos
- Índices en campos de búsqueda frecuente
- Índices únicos para slugs
- Índices en fechas de llegada y salida

### 5. Scopes Optimizados
```php
// Scopes para consultas eficientes
public function scopeUpcoming($query)
{
    return $query->where('arrival_date', '>=', now());
}

public function scopeCurrent($query)
{
    return $query->where('arrival_date', '<=', now())
                 ->where('departure_date', '>=', now());
}
```

---

*Diagramas de arquitectura actualizados: Septiembre 2025*
