# Servicio de Traslados

## 📋 Descripción General

El servicio de Traslados es un módulo integral del CRM que permite a las agencias de viajes gestionar servicios de transporte para sus clientes. Proporciona una solución completa para la creación, edición, visualización y gestión de traslados con múltiples tipos de servicio y viaje.

## 🎯 Características Principales

- ✅ **Gestión completa de traslados** con información detallada
- ✅ **Múltiples tipos de servicio** (aeroportuario, hotelero, personalizado)
- ✅ **Tipos de viaje** (ida, ida y vuelta, múltiple)
- ✅ **Estados de traslado** (cotizado, vendido, descartado)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Observaciones automáticas** para clientes
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

## 📁 Archivos de Documentación

### 📖 [Documentación Principal](servicio-traslados.md)
**Archivo**: `servicio-traslados.md`

**Contenido**:
- Introducción al sistema de traslados
- Arquitectura del sistema
- Modelo de datos TransferReserve
- Componentes Livewire para traslados
- Base de datos y relaciones
- API y rutas
- Funcionalidades avanzadas (observaciones, validaciones)
- Guías de uso paso a paso
- Troubleshooting y solución de problemas

### 💻 [Ejemplos de Código](ejemplos-codigo.md)
**Archivo**: `ejemplos-codigo.md`

**Contenido**:
- Ejemplos de uso de componentes de traslados
- Consultas de base de datos específicas
- Eventos y listeners para traslados
- Validaciones personalizadas (fechas, pasajeros)
- Scopes del modelo TransferReserve
- Mutators y accessors (tipos, estados)
- Jobs y queues para procesamiento
- API Resources para traslados
- Testing completo
- Middleware personalizado
- Comandos Artisan para mantenimiento

### 🏗️ [Diagramas de Arquitectura](diagramas.md)
**Archivo**: `diagramas.md`

**Contenido**:
- Diagrama de entidades y relaciones específicas
- Flujo de creación de traslados
- Arquitectura de componentes Livewire
- Flujo de estados de traslados
- Tipos de servicio y viaje
- Flujo de validación de fechas
- Estructura de archivos
- Patrones de diseño utilizados

## 🚀 Inicio Rápido

### 1. Crear un Traslado
```php
use App\Models\TransferReserve;

$transfer = TransferReserve::create([
    'provider_id' => 1,
    'service_type' => 'aeroportuario',
    'travel_type' => 'ida',
    'origin' => 'Aeropuerto Internacional El Dorado',
    'destination' => 'Hotel Marriott Bogotá',
    'arrival_date' => '2025-10-15',
    'arrival_time' => '14:00:00',
    'adult' => 2,
    'children' => 1,
    'fare' => 80000,
    'profit_percentage' => 20,
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

### 2. Obtener Traslados con Relaciones
```php
$transfers = TransferReserve::with(['provider', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('arrival_date', 'asc')
    ->get();
```

### 3. Usar Scopes
```php
// Traslados aeroportuarios
$airportTransfers = TransferReserve::aeroportuario()->get();

// Traslados ida y vuelta
$roundTripTransfers = TransferReserve::idaYVuelta()->get();

// Traslados con niños
$transfersWithChildren = TransferReserve::withChildren()->get();
```

## 🔧 Componentes Principales

### CreateTransferReserve
- Creación de nuevos traslados
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos

### EditTransferReserve
- Edición de traslados existentes
- Carga de datos actuales
- Actualización de información

### ShowTransferReserve
- Visualización detallada del traslado
- Información completa del servicio
- Estado del traslado

### IndexTransferReserve
- Listado de traslados
- Filtros y búsqueda
- Acciones masivas

## 📊 Estadísticas del Servicio

- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (TransferReserve)
- **3 tipos de servicio** (aeroportuario, hotelero, personalizado)
- **3 tipos de viaje** (ida, ida y vuelta, múltiple)
- **Funcionalidades**: 12+ características principales

## 🔗 Enlaces Útiles

- [Documentación Principal](servicio-traslados.md)
- [Ejemplos de Código](ejemplos-codigo.md)
- [Diagramas de Arquitectura](diagramas.md)
- [Documentación General](../../README.md)

## 📝 Notas de Desarrollo

### Validaciones Importantes
- Fechas de salida deben ser posteriores a fechas de llegada (para ida y vuelta)
- Mínimo 1 adulto por traslado
- Máximo 8 pasajeros por traslado
- Tarifas deben ser positivas

### Características Técnicas
- Slugs únicos automáticos con código aleatorio
- Observaciones automáticas en clientes
- Validaciones específicas por tipo de viaje
- Cálculo automático de tarifas con JavaScript

### Tipos de Servicio
- **Aeroportuario**: Traslados desde/hacia aeropuertos
- **Hotelero**: Traslados entre hoteles
- **Personalizado**: Traslados con origen y destino específicos

### Tipos de Viaje
- **Ida**: Solo ida
- **Ida y Vuelta**: Ida y regreso
- **Múltiple**: Múltiples destinos

---

*Documentación del servicio de Traslados - Septiembre 2025*
