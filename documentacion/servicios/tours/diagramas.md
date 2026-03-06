# Diagramas de Arquitectura - Servicio de Tours

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
│      Tour       │    │   Observation   │    │   TourImage     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ agency_id       │◄───┤ client_id       │    │ tour_id         │
│ name            │    │ title           │    │ image_path      │
│ start_date      │    │ body            │    │ is_main         │
│ start_time      │    │ type            │    │ order           │
│ end_date        │    │ priority        │    │ description     │
│ end_time        │    │ is_private      │    │ created_at      │
│ description     │    │ agency_id       │    │ updated_at      │
│ additional_details│   │ created_at      │    └─────────────────┘
│ adult           │    │ updated_at      │             │
│ children        │    └─────────────────┘             │
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

## Flujo de Creación de Tours

```
┌─────────────────┐
│   Usuario       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│CreateTourReserve│
│ Component       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Validación    │
│   - Nombre      │
│   - Fechas      │
│   - Participantes│
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
│ Crear Tour en   │
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
│ Crear Tarea     │
│ Automática      │
│ (Opcional)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Emitir Evento   │
│ tourCreated     │
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
│ a ShowTour      │
└─────────────────┘
```

## Arquitectura de Componentes Livewire

```
┌─────────────────────────────────────────────────────────────┐
│                    Tours Module                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │IndexTourReserve │  │CreateTourReserve│                  │
│  │                 │  │                 │                  │
│  │ - Listar tours  │  │ - Crear tour    │                  │
│  │ - Filtrar       │  │ - Validar datos │                  │
│  │ - Buscar        │  │ - Calcular tarif│                  │
│  │ - Paginar       │  │ - Generar slug  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                       │                        │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ShowTourReserve  │  │EditTourReserve  │                  │
│  │                 │  │                 │                  │
│  │ - Mostrar tour  │  │ - Editar tour   │                  │
│  │ - Carrusel img  │  │ - Actualizar    │                  │
│  │ - Modal imágenes│  │ - Preservar ctx │                  │
│  │ - Info completa │  │ - Validar cambios│                 │
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
│  │   Observations  │  │   TourImages    │                  │
│  │                 │  │                 │                  │
│  │ - Automáticas   │  │ - Imágenes      │                  │
│  │ - Cliente       │  │ - Carrusel      │                  │
│  │ - Seguimiento   │  │ - Almacenamiento│                  │
│  │ - Historial     │  │ - Organización  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Estados de Tours

```
┌─────────────────┐
│   Cotizado      │
│   (Estado       │
│   Inicial)      │
└─────────┬───────┘
          │
          │ Cliente acepta
          │ el tour
          ▼
┌─────────────────┐
│    Vendido      │
│   (Tour         │
│   Confirmado)   │
└─────────┬───────┘
          │
          │ Cliente rechaza
          │ o cancela
          ▼
┌─────────────────┐
│   Descartado    │
│   (Tour         │
│   Cancelado)    │
└─────────────────┘
```

## Flujo de Gestión de Imágenes

```
┌─────────────────┐
│   Imagen        │
│   (Archivo)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Upload File     │
│ (Livewire)      │
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
│ (tour_images)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Carrusel        │
│ (Frontend)      │
└─────────────────┘
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

## Estructura de Archivos

```
app/
├── Livewire/Services/Tours/
│   ├── CreateTourReserve.php      # Crear tours
│   ├── EditTourReserve.php        # Editar tours
│   ├── ShowTourReserve.php        # Mostrar tours
│   └── IndexTourReserve.php       # Listar tours
├── Models/
│   ├── Tour.php                   # Modelo de tours
│   ├── TourImage.php              # Modelo de imágenes
│   ├── Client.php                 # Modelo de clientes
│   ├── Request.php                # Modelo de requests
│   └── Agency.php                 # Modelo de agencias
└── ...

resources/views/livewire/services/tours/
├── create-tour-reserve.blade.php  # Vista crear tour
├── edit-tour-reserve.blade.php    # Vista editar tour
├── show-tour-reserve.blade.php    # Vista mostrar tour
└── index-tour-reserve.blade.php   # Vista listar tours

database/migrations/
└── 2025_08_23_171529_create_tours_table.php

routes/modules/services/
└── tours.php                      # Rutas de tours
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
│ - Carrusel      │    │ - Lógica de     │    │ - Base de Datos │
│ - Modales       │    │   negocio       │    │ - Relaciones    │
│ - Navegación    │    │ - Estado        │    │ - Validaciones  │
└─────────────────┘    │ - Eventos       │    └─────────────────┘
                       └─────────────────┘
                                │
                                │ dispatch()
                                │ emit()
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JavaScript    │    │   Observaciones │    │   TourImages    │
│   (Alpine.js)   │    │   Automáticas   │    │   (Carrusel)    │
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
- Diferentes estados de tour
- Diferentes tipos de imagen
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
- Fechas de inicio y fin válidas
- Fechas de fin posteriores a inicio
- Validación de rangos de fechas

### 5. Gestión de Archivos
- Validación de tipos de archivo
- Límites de tamaño
- Almacenamiento seguro

## Optimizaciones de Rendimiento

### 1. Eager Loading
```php
$tours = Tour::with(['images', 'client', 'agency'])->get();
```

### 2. Caché de Consultas
```php
$tours = Cache::remember('tours.active', 3600, function () {
    return Tour::where('status', 'vendido')->get();
});
```

### 3. Paginación
```php
$tours = Tour::paginate(15);
```

### 4. Índices de Base de Datos
- Índices en campos de búsqueda frecuente
- Índices únicos para slugs
- Índices en fechas de inicio y fin

### 5. Scopes Optimizados
```php
// Scopes para consultas eficientes
public function scopeUpcoming($query)
{
    return $query->where('start_date', '>=', now());
}

public function scopeByStatus($query, $status)
{
    return $query->where('status', $status);
}
```

---

*Diagramas de arquitectura actualizados: Septiembre 2025*
