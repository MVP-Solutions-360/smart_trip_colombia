# Servicio de Tiquetes Aéreos

## 📋 Descripción General

El servicio de Tiquetes Aéreos es un módulo integral del CRM que permite a las agencias de viajes gestionar reservas de vuelos para sus clientes. Proporciona una solución completa para la creación, edición, visualización y gestión de tiquetes aéreos con características avanzadas de facturación y seguimiento.

## 🎯 Características Principales

- ✅ **Gestión completa de tiquetes** con información detallada
- ✅ **Múltiples tipos de vuelo** (ida, ida y vuelta, multidestino)
- ✅ **Tipos de destino** (nacional, internacional)
- ✅ **Estados de tiquete** (cotizado, vendido, descartado)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Conversión de números a letras** para facturación
- ✅ **Tareas automáticas** de check-in
- ✅ **Gestión de equipaje** e inclusiones
- ✅ **Observaciones automáticas** para clientes
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

## 📁 Archivos de Documentación

### 📖 [Documentación Principal](servicio-tiquetes.md)
**Archivo**: `servicio-tiquetes.md`

**Contenido**:
- Introducción al sistema de tiquetes aéreos
- Arquitectura del sistema
- Modelo de datos AirlineTicket
- Componentes Livewire para tiquetes
- Base de datos y relaciones
- API y rutas
- Funcionalidades avanzadas (conversión a letras, tareas automáticas)
- Guías de uso paso a paso
- Troubleshooting y solución de problemas

### 💻 [Ejemplos de Código](ejemplos-codigo.md)
**Archivo**: `ejemplos-codigo.md`

**Contenido**:
- Ejemplos de uso de componentes de tiquetes
- Consultas de base de datos específicas
- Eventos y listeners para tiquetes
- Validaciones personalizadas (fechas, vuelos)
- Scopes del modelo AirlineTicket
- Mutators y accessors (conversión a letras)
- Jobs y queues para procesamiento
- API Resources para tiquetes
- Testing completo
- Middleware personalizado
- Comandos Artisan para mantenimiento

### 🏗️ [Diagramas de Arquitectura](diagramas.md)
**Archivo**: `diagramas.md`

**Contenido**:
- Diagrama de entidades y relaciones específicas
- Flujo de creación de tiquetes
- Arquitectura de componentes Livewire
- Flujo de estados de tiquetes
- Tipos de vuelo y destino
- Estructura de datos JSON
- Flujo de cálculo de tarifas
- Flujo de conversión a letras
- Estructura de archivos
- Patrones de diseño utilizados

## 🚀 Inicio Rápido

### 1. Crear un Tiquete
```php
use App\Models\AirlineTicket;

$ticket = AirlineTicket::create([
    'service_type' => 'ticket',
    'flight_type' => 'ida y vuelta',
    'destination_type' => 'internacional',
    'airline' => 'Avianca',
    'origin' => 'Bogotá',
    'destination' => 'Madrid',
    'departure_date' => '2025-10-15',
    'return_date' => '2025-10-25',
    'adult' => 2,
    'children' => 1,
    'fare' => 2000000,
    'profit_percentage' => 15,
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

### 2. Obtener Tiquetes con Relaciones
```php
$tickets = AirlineTicket::with(['provider', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('departure_date', 'asc')
    ->get();
```

### 3. Usar Scopes
```php
// Tiquetes internacionales
$internationalTickets = AirlineTicket::internacional()->get();

// Tiquetes ida y vuelta
$roundTripTickets = AirlineTicket::idaYVuelta()->get();

// Tiquetes con niños
$ticketsWithChildren = AirlineTicket::withChildren()->get();
```

## 🔧 Componentes Principales

### CreateAirlineTickets
- Creación de nuevos tiquetes
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos

### EditAirlineTickets
- Edición de tiquetes existentes
- Carga de datos actuales
- Actualización de información

### ShowAirlineTickets
- Visualización detallada del tiquete
- Información completa del vuelo
- Estado del tiquete

### IndexAirlineTickets
- Listado de tiquetes
- Filtros y búsqueda
- Acciones masivas

## 📊 Estadísticas del Servicio

- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (AirlineTicket)
- **3 tipos de vuelo** (ida, ida y vuelta, multidestino)
- **2 tipos de destino** (nacional, internacional)
- **3 estados** (cotizado, vendido, descartado)
- **Funcionalidades**: 18+ características principales

## 🔗 Enlaces Útiles

- [Documentación Principal](servicio-tiquetes.md)
- [Ejemplos de Código](ejemplos-codigo.md)
- [Diagramas de Arquitectura](diagramas.md)
- [Documentación General](../../README.md)

## 📝 Notas de Desarrollo

### Validaciones Importantes
- Fechas de regreso deben ser posteriores a fechas de salida
- Mínimo 1 adulto por tiquete
- Máximo 20 pasajeros por tiquete
- Tarifas deben ser positivas

### Características Técnicas
- Slugs únicos automáticos con código aleatorio
- Observaciones automáticas en clientes
- Conversión de números a letras para facturación
- Tareas automáticas de check-in
- Gestión de equipaje e inclusiones en JSON

### Tipos de Vuelo
- **Ida**: Solo ida
- **Ida y Vuelta**: Ida y regreso
- **Multidestino**: Múltiples destinos

### Tipos de Destino
- **Nacional**: Vuelos dentro del país
- **Internacional**: Vuelos fuera del país

### Funcionalidades Especiales
- **Conversión a Letras**: Para facturación y documentos oficiales
- **Tareas Automáticas**: Check-in y seguimiento
- **Gestión de Equipaje**: Información detallada en JSON
- **Inclusiones**: Servicios incluidos en el tiquete

---

*Documentación del servicio de Tiquetes Aéreos - Septiembre 2025*
