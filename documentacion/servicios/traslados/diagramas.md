# Diagramas de Arquitectura - Servicio de Traslados

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
│TransferReserve  │    │   Observation   │    │   Provider      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ provider_id     │◄───┤ client_id       │    │ name            │
│ agency_id       │    │ title           │    │ contact_info    │
│ service_type    │    │ body            │    │ services        │
│ travel_type     │    │ type            │    │ created_at      │
│ origin          │    │ priority        │    │ updated_at      │
│ destination     │    │ is_private      │    └─────────────────┘
│ arrival_date    │    │ agency_id       │             │
│ arrival_time    │    │ created_at      │             │
│ departure_date  │    │ updated_at      │             │
│ departure_time  │    └─────────────────┘             │
│ adult           │                                    │
│ children        │                                    │
│ infant          │                                    │
│ fare            │                                    │
│ profit_percent  │                                    │
│ total_fare      │                                    │
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
│   MediaFiles    │                           │   Task          │
├─────────────────┤                           ├─────────────────┤
│ id              │                           │ id              │
│ model_type      │                           │ title           │
│ model_id        │                           │ description     │
│ file_path       │                           │ due_date        │
│ file_type       │                           │ status          │
│ description     │                           │ priority        │
│ created_at      │                           │ assigned_to     │
│ updated_at      │                           │ created_at      │
└─────────────────┘                           │ updated_at      │
                                              └─────────────────┘
```

## Flujo de Creación de Traslados

```
┌─────────────────┐
│   Usuario       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│CreateTransferReserve│
│ Component       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Validación    │
│   - Proveedor   │
│   - Tipo Servicio│
│   - Fechas      │
│   - Pasajeros   │
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
│ Crear Traslado  │
│ en Base de Datos│
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
│ Crear Tarea     │
│ Automática      │
│ (Opcional)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Emitir Evento   │
│ transferCreated │
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
│ a ShowTransfer  │
└─────────────────┘
```

## Arquitectura de Componentes Livewire

```
┌─────────────────────────────────────────────────────────────┐
│                  Traslados Module                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │IndexTransferReserve│CreateTransferReserve│              │
│  │                 │  │                 │                  │
│  │ - Listar traslados│  │ - Crear traslado│                  │
│  │ - Filtrar       │  │ - Validar datos │                  │
│  │ - Buscar        │  │ - Calcular tarif│                  │
│  │ - Paginar       │  │ - Generar slug  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                       │                        │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ShowTransferReserve│EditTransferReserve│                │
│  │                 │  │                 │                  │
│  │ - Mostrar traslado│  │ - Editar traslado│                  │
│  │ - Info completa │  │ - Actualizar    │                  │
│  │ - Estado        │  │ - Preservar ctx │                  │
│  │ - Detalles      │  │ - Validar cambios│                 │
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
│  │   Observations  │  │   Providers     │                  │
│  │                 │  │                 │                  │
│  │ - Automáticas   │  │ - Proveedores   │                  │
│  │ - Cliente       │  │ - Servicios     │                  │
│  │ - Seguimiento   │  │ - Contacto      │                  │
│  │ - Historial     │  │ - Información   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Estados de Traslados

```
┌─────────────────┐
│   Cotizado      │
│   (Estado       │
│   Inicial)      │
└─────────┬───────┘
          │
          │ Cliente acepta
          │ el traslado
          ▼
┌─────────────────┐
│    Vendido      │
│   (Traslado     │
│   Confirmado)   │
└─────────┬───────┘
          │
          │ Cliente rechaza
          │ o cancela
          ▼
┌─────────────────┐
│   Descartado    │
│   (Traslado     │
│   Cancelado)    │
└─────────────────┘
```

## Tipos de Servicio y Viaje

```
┌─────────────────────────────────────────────────────────────┐
│                    Tipos de Servicio                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Aeroportuario│  │  Hotelero   │  │Personalizado│        │
│  │             │  │             │  │             │        │
│  │ - Aeropuerto│  │ - Hotel     │  │ - Origen    │        │
│  │ - Terminal  │  │ - Resort    │  │   específico│        │
│  │ - Vuelos    │  │ - Alojamiento│  │ - Destino   │        │
│  │ - Llegadas  │  │ - Check-in  │  │   específico│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Tipos de Viaje                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Ida      │  │Ida y Vuelta │  │  Múltiple   │        │
│  │             │  │             │  │             │        │
│  │ - Solo ida  │  │ - Ida       │  │ - Múltiples │        │
│  │ - Un destino│  │ - Vuelta    │  │   destinos  │        │
│  │ - Una fecha │  │ - Dos fechas│  │ - Múltiples │        │
│  │ - Una hora  │  │ - Dos horas │  │   fechas    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
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

## Flujo de Validación de Fechas

```
┌─────────────────┐
│   Tipo de Viaje │
│   (travel_type) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   ¿Es Ida y     │
│   Vuelta?       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Sí            │
│   ┌─────────────┐│
│   │ Validar     ││
│   │ departure_date│
│   │ > arrival_date│
│   └─────────────┘│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   No            │
│   ┌─────────────┐│
│   │ Solo validar││
│   │ arrival_date│
│   └─────────────┘│
└─────────────────┘
```

## Estructura de Archivos

```
app/
├── Livewire/Services/Transfer/
│   ├── CreateTransferReserve.php      # Crear traslados
│   ├── EditTransferReserve.php        # Editar traslados
│   ├── ShowTransferReserve.php        # Mostrar traslados
│   └── IndexTransferReserve.php       # Listar traslados
├── Models/
│   ├── TransferReserve.php            # Modelo de traslados
│   ├── Provider.php                   # Modelo de proveedores
│   ├── Client.php                     # Modelo de clientes
│   ├── Request.php                    # Modelo de requests
│   └── Agency.php                     # Modelo de agencias
└── ...

resources/views/livewire/services/transfer/
├── create-transfer-reserve.blade.php  # Vista crear traslado
├── edit-transfer-reserve.blade.php    # Vista editar traslado
├── show-transfer-reserve.blade.php    # Vista mostrar traslado
└── index-transfer-reserve.blade.php   # Vista listar traslados

database/migrations/
└── 2025_07_16_194423_create_transfer_reserves_table.php

routes/modules/services/
└── transfers.php                      # Rutas de traslados
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
│ - Selectores    │    │ - Lógica de     │    │ - Base de Datos │
│ - Validaciones  │    │   negocio       │    │ - Relaciones    │
│ - Navegación    │    │ - Estado        │    │ - Validaciones  │
└─────────────────┘    │ - Eventos       │    └─────────────────┘
                       └─────────────────┘
                                │
                                │ dispatch()
                                │ emit()
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JavaScript    │    │   Observaciones │    │   Providers     │
│   (Alpine.js)   │    │   Automáticas   │    │   (Proveedores) │
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
- Diferentes tipos de servicio
- Diferentes tipos de viaje
- Diferentes validaciones

### 5. Template Method Pattern
- Estructura común en componentes Livewire
- Métodos mount(), save(), render() estandarizados
- Validaciones y reglas comunes

### 6. Trait Pattern
- HasObservations para observaciones
- Reutilización de funcionalidad
- Comportamientos compartidos

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

### 5. Validación de Pasajeros
- Límites de pasajeros por traslado
- Validación de tipos de pasajero
- Verificación de capacidad

## Optimizaciones de Rendimiento

### 1. Eager Loading
```php
$transfers = TransferReserve::with(['provider', 'client', 'agency'])->get();
```

### 2. Caché de Consultas
```php
$transfers = Cache::remember('transfers.active', 3600, function () {
    return TransferReserve::where('status', 'vendido')->get();
});
```

### 3. Paginación
```php
$transfers = TransferReserve::paginate(15);
```

### 4. Índices de Base de Datos
- Índices en campos de búsqueda frecuente
- Índices únicos para slugs
- Índices en fechas de llegada y salida

### 5. Scopes Optimizados
```php
// Scopes para consultas eficientes
public function scopeByServiceType($query, $serviceType)
{
    return $query->where('service_type', $serviceType);
}

public function scopeByTravelType($query, $travelType)
{
    return $query->where('travel_type', $travelType);
}

public function scopeUpcoming($query)
{
    return $query->where('arrival_date', '>=', now());
}
```

---

*Diagramas de arquitectura actualizados: Septiembre 2025*
