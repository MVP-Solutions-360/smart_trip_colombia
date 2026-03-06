# Diagramas de Arquitectura - Servicio de Tiquetes Aéreos

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
│ AirlineTicket   │    │   Observation   │    │      Task       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ agency_id       │◄───┤ client_id       │    │ agency_id       │
│ provider_id     │    │ title           │    │ client_id       │
│ service_type    │    │ body            │    │ request_id      │
│ flight_type     │    │ type            │    │ airline_ticket_id│
│ destination_type│    │ priority        │    │ title           │
│ airline         │    │ is_private      │    │ type_task       │
│ reservation_code│    │ agency_id       │    │ description     │
│ origin          │    │ created_at      │    │ state           │
│ destination     │    │ updated_at      │    │ due_date        │
│ departure_date  │    └─────────────────┘    │ end_date        │
│ return_date     │                           │ created_at      │
│ adult           │                           │ updated_at      │
│ children        │                           └─────────────────┘
│ infant          │                                    │
│ baggage         │                                    │
│ include         │                                    │
│ fare            │                                    │
│ profit_percent  │                                    │
│ total_fare      │                                    │
│ status          │                                    │
│ observations    │                                    │
│ client_id       │                                    │
│ request_id      │                                    │
│ created_at      │                                    │
│ updated_at      │                                    │
└─────────────────┘                                    │
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│    Provider     │                           │   Personnel     │
├─────────────────┤                           ├─────────────────┤
│ id              │                           │ id              │
│ name            │                           │ name            │
│ contact_info    │                           │ email           │
│ services        │                           │ phone           │
│ created_at      │                           │ created_at      │
│ updated_at      │                           │ updated_at      │
└─────────────────┘                           └─────────────────┘
```

## Flujo de Creación de Tiquetes

```
┌─────────────────┐
│   Usuario       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│CreateAirlineTickets│
│ Component       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Validación    │
│   - Proveedor   │
│   - Aerolínea   │
│   - Fechas      │
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
│ Crear Tiquete en│
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
│ Crear Tarea de  │
│ Check-in        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Emitir Evento   │
│ ticketCreated   │
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
│ a ShowTicket    │
└─────────────────┘
```

## Arquitectura de Componentes Livewire

```
┌─────────────────────────────────────────────────────────────┐
│                    Tiquetes Module                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │IndexAirlineTickets│  │CreateAirlineTickets│              │
│  │                 │  │                 │                  │
│  │ - Listar tiquetes│  │ - Crear tiquete │                  │
│  │ - Filtrar       │  │ - Validar datos │                  │
│  │ - Buscar        │  │ - Calcular tarif│                  │
│  │ - Paginar       │  │ - Generar slug  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                       │                        │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ShowAirlineTickets│  │EditAirlineTickets│                │
│  │                 │  │                 │                  │
│  │ - Mostrar tiquete│  │ - Editar tiquete│                  │
│  │ - Conversión    │  │ - Actualizar    │                  │
│  │   a letras      │  │ - Preservar ctx │                  │
│  │ - Modal edición │  │ - Validar cambios│                 │
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
│  │   Observations  │  │      Tasks      │                  │
│  │                 │  │                 │                  │
│  │ - Automáticas   │  │ - Check-in      │                  │
│  │ - Cliente       │  │ - Asignación    │                  │
│  │ - Seguimiento   │  │ - Fechas límite │                  │
│  │ - Historial     │  │ - Estados       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Estados de Tiquetes

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
│   (Tiquete      │
│   Confirmado)   │
└─────────┬───────┘
          │
          │ Cliente rechaza
          │ o cancela
          ▼
┌─────────────────┐
│   Descartado    │
│   (Tiquete      │
│   Cancelado)    │
└─────────────────┘
```

## Tipos de Vuelo y Destino

```
┌─────────────────────────────────────────────────────────────┐
│                    Tipos de Vuelo                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐│
│  │   Solo Ida      │  │ Ida y Vuelta    │  │ Multidestino  ││
│  │   (oneway)      │  │ (roundtrip)     │  │ (multidestino)││
│  │                 │  │                 │  │               ││
│  │ - Un solo vuelo │  │ - Vuelo de ida  │  │ - Múltiples   ││
│  │ - Sin regreso   │  │ - Vuelo de vuelta│  │   destinos    ││
│  │ - Fecha salida  │  │ - Fechas ida/   │  │ - Itinerario  ││
│  │   únicamente    │  │   vuelta        │  │   complejo    ││
│  └─────────────────┘  └─────────────────┘  └───────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Tipos de Destino                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │    Nacional     │              │  Internacional  │      │
│  │                 │              │                 │      │
│  │ - Vuelos dentro │              │ - Vuelos fuera  │      │
│  │   del país      │              │   del país      │      │
│  │ - Documentación │              │ - Pasaporte     │      │
│  │   nacional      │              │ - Visa (si req) │      │
│  │ - Menor costo   │              │ - Mayor costo   │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Datos JSON

### Equipaje (baggage)
```json
{
  "baggage": [
    "Artículo personal",
    "Equipaje de cabina",
    "Equipaje facturado",
    "Equipaje extra"
  ]
}
```

### Inclusiones (include)
```json
{
  "include": [
    "Artículo personal",
    "Comida",
    "Bebidas",
    "Entretenimiento",
    "WiFi",
    "Asiento preferencial"
  ]
}
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

## Flujo de Conversión a Letras

```
┌─────────────────┐
│   Número        │
│   (total_fare)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ NumberToWords   │
│ Library         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Transformer     │
│ (Spanish)       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Texto en       │
│  Letras         │
│  + "pesos"      │
└─────────────────┘
```

## Estructura de Archivos

```
app/
├── Livewire/Services/AirlineTickets/
│   ├── CreateAirlineTickets.php      # Crear tiquetes
│   ├── EditAirlineTickets.php        # Editar tiquetes
│   ├── ShowAirlineTickets.php        # Mostrar tiquetes
│   ├── IndexAirlineTickets.php       # Listar tiquetes
│   └── Component/
│       ├── EditAirlineTickets.php    # Componente edición
│       └── IndexAirlineTickets.php   # Componente listado
├── Models/
│   ├── AirlineTicket.php             # Modelo de tiquetes
│   ├── Provider.php                  # Modelo de proveedores
│   ├── Client.php                    # Modelo de clientes
│   ├── Request.php                   # Modelo de requests
│   └── Task.php                      # Modelo de tareas
└── ...

resources/views/livewire/services/airline-tickets/
├── create-airline-tickets.blade.php  # Vista crear tiquete
├── edit-airline-tickets.blade.php    # Vista editar tiquete
├── show-airline-tickets.blade.php    # Vista mostrar tiquete
├── index-airline-tickets.blade.php   # Vista listar tiquetes
└── component/
    ├── edit-airline-tickets.blade.php # Vista componente edición
    └── index-airline-tickets.blade.php # Vista componente listado

database/migrations/
└── 2025_07_16_192959_create_airline_tickets_table.php

routes/modules/services/
└── tickets.php                       # Rutas de tiquetes
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
│   JavaScript    │    │   Observaciones │    │      Tasks      │
│   (Alpine.js)   │    │   Automáticas   │    │   (Check-in)    │
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
- Diferentes tipos de vuelo (ida, ida y vuelta, multidestino)
- Diferentes tipos de destino (nacional, internacional)
- Diferentes estados de tiquete

### 5. Template Method Pattern
- Estructura común en componentes Livewire
- Métodos mount(), save(), render() estandarizados
- Validaciones y reglas comunes

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
- Fechas de vuelo válidas
- Fechas de regreso posteriores a salida
- Validación de rangos de fechas

## Optimizaciones de Rendimiento

### 1. Eager Loading
```php
$tickets = AirlineTicket::with(['provider', 'client', 'agency'])->get();
```

### 2. Caché de Consultas
```php
$tickets = Cache::remember('tickets.active', 3600, function () {
    return AirlineTicket::where('status', 'vendido')->get();
});
```

### 3. Paginación
```php
$tickets = AirlineTicket::paginate(15);
```

### 4. Índices de Base de Datos
- Índices en campos de búsqueda frecuente
- Índices únicos para slugs
- Índices en fechas de vuelo

---

*Diagramas de arquitectura actualizados: Septiembre 2025*
