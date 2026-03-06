# Servicio de Tours

## 📋 Descripción General

El servicio de Tours es un módulo integral del CRM que permite a las agencias de viajes gestionar experiencias turísticas para sus clientes. Proporciona una solución completa para la creación, edición, visualización y gestión de tours con características avanzadas.

## 🎯 Características Principales

- ✅ **Gestión completa de tours** con información detallada
- ✅ **Estados de tour** (cotizado, vendido, descartado)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Observaciones automáticas** para clientes
- ✅ **Gestión de imágenes** con carrusel
- ✅ **Editor rico** para descripciones
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

## 📁 Archivos de Documentación

### 📖 [Documentación Principal](servicio-tours.md)
**Archivo**: `servicio-tours.md`

**Contenido**:
- Introducción al sistema de tours
- Arquitectura del sistema
- Modelo de datos Tour
- Componentes Livewire para tours
- Base de datos y relaciones
- API y rutas
- Funcionalidades avanzadas (observaciones, imágenes)
- Guías de uso paso a paso
- Troubleshooting y solución de problemas

### 💻 [Ejemplos de Código](ejemplos-codigo.md)
**Archivo**: `ejemplos-codigo.md`

**Contenido**:
- Ejemplos de uso de componentes de tours
- Consultas de base de datos específicas
- Eventos y listeners para tours
- Validaciones personalizadas (fechas, participantes)
- Scopes del modelo Tour
- Mutators y accessors (duración, participantes)
- Jobs y queues para procesamiento
- API Resources para tours
- Testing completo
- Middleware personalizado
- Comandos Artisan para mantenimiento

### 🏗️ [Diagramas de Arquitectura](diagramas.md)
**Archivo**: `diagramas.md`

**Contenido**:
- Diagrama de entidades y relaciones específicas
- Flujo de creación de tours
- Arquitectura de componentes Livewire
- Flujo de estados de tours
- Flujo de gestión de imágenes
- Flujo de cálculo de tarifas
- Estructura de archivos
- Patrones de diseño utilizados

## 🚀 Inicio Rápido

### 1. Crear un Tour
```php
use App\Models\Tour;

$tour = Tour::create([
    'name' => 'Tour por la Ciudad de Bogotá',
    'start_date' => '2025-10-15',
    'start_time' => '08:00:00',
    'end_date' => '2025-10-15',
    'end_time' => '18:00:00',
    'adult' => 2,
    'children' => 1,
    'fare' => 150000,
    'profit_percentage' => 20,
    'status' => 'cotizado',
    'client_id' => 1,
    'request_id' => 1,
]);
```

### 2. Obtener Tours con Relaciones
```php
$tours = Tour::with(['images', 'client', 'agency'])
    ->where('status', 'vendido')
    ->orderBy('start_date', 'asc')
    ->get();
```

### 3. Usar Scopes
```php
// Tours próximos
$upcomingTours = Tour::upcoming()->get();

// Tours con niños
$toursWithChildren = Tour::withChildren()->get();

// Tours por estado
$cotizedTours = Tour::cotizado()->get();
```

## 🔧 Componentes Principales

### CreateTourReserve
- Creación de nuevos tours
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos

### EditTourReserve
- Edición de tours existentes
- Carga de datos actuales
- Actualización de información

### ShowTourReserve
- Visualización detallada del tour
- Gestión de imágenes con carrusel
- Modal para agregar imágenes

### IndexTourReserve
- Listado de tours
- Filtros y búsqueda
- Acciones masivas

## 📊 Estadísticas del Servicio

- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (Tour)
- **1 modelo de imágenes** (TourImage)
- **3 estados** (cotizado, vendido, descartado)
- **Funcionalidades**: 15+ características principales

## 🔗 Enlaces Útiles

- [Documentación Principal](servicio-tours.md)
- [Ejemplos de Código](ejemplos-codigo.md)
- [Diagramas de Arquitectura](diagramas.md)
- [Documentación General](../../README.md)

## 📝 Notas de Desarrollo

### Validaciones Importantes
- Fechas de fin deben ser posteriores a fechas de inicio
- Mínimo 1 adulto por tour
- Máximo 20 participantes por tour
- Tarifas deben ser positivas

### Características Técnicas
- Slugs únicos automáticos con código aleatorio
- Observaciones automáticas en clientes
- Gestión de imágenes con carrusel
- Cálculo automático de tarifas con JavaScript

---

*Documentación del servicio de Tours - Septiembre 2025*
