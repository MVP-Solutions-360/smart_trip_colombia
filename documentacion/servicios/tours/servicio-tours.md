# Documentación del Servicio de Tours

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [Componentes Livewire](#componentes-livewire)
5. [Base de Datos](#base-de-datos)
6. [API y Rutas](#api-y-rutas)
7. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
8. [Guías de Uso](#guías-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

El servicio de Tours es un módulo integral del CRM que permite a las agencias de viajes gestionar experiencias turísticas para sus clientes. El sistema está construido con Laravel y Livewire, proporcionando una experiencia de usuario moderna y reactiva para la gestión completa de tours.

### Características Principales
- ✅ **Gestión completa de tours** con información detallada
- ✅ **Estados de tour** (cotizado, vendido, descartado)
- ✅ **Cálculo automático de tarifas** con utilidad
- ✅ **Observaciones automáticas** para clientes
- ✅ **Gestión de imágenes** con carrusel
- ✅ **Editor rico** para descripciones
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con requests y clientes

---

## Arquitectura del Sistema

### Estructura de Directorios
```
app/
├── Livewire/Services/Tours/
│   ├── CreateTourReserve.php
│   ├── EditTourReserve.php
│   ├── ShowTourReserve.php
│   └── IndexTourReserve.php
├── Models/
│   ├── Tour.php
│   ├── TourImage.php
│   ├── Client.php
│   ├── Request.php
│   └── ...
└── ...

resources/views/livewire/services/tours/
├── create-tour-reserve.blade.php
├── edit-tour-reserve.blade.php
├── show-tour-reserve.blade.php
└── index-tour-reserve.blade.php

database/migrations/
└── 2025_08_23_171529_create_tours_table.php

routes/modules/services/
└── tours.php
```

---

## Modelo de Datos

### Modelo Tour

#### Estructura de la Tabla `tours`
```sql
CREATE TABLE tours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agency_id BIGINT NULL,
    slug VARCHAR(255) UNIQUE NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_date DATE NOT NULL,
    end_time TIME NOT NULL,
    description TEXT NULL,
    additional_details TEXT NULL,
    adult TINYINT UNSIGNED NOT NULL,
    children TINYINT UNSIGNED DEFAULT 0,
    infant TINYINT UNSIGNED DEFAULT 0,
    fare DECIMAL(15,2) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    total_fare DECIMAL(15,2) NOT NULL,
    status ENUM('cotizado', 'vendido', 'descartado') DEFAULT 'cotizado',
    client_id BIGINT NOT NULL,
    request_id BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

#### Campos Principales
- **`name`**: Nombre del tour
- **`start_date/start_time`**: Fecha y hora de inicio
- **`end_date/end_time`**: Fecha y hora de finalización
- **`description`**: Descripción del tour
- **`additional_details`**: Detalles adicionales
- **`adult/children/infant`**: Cantidad de participantes por tipo
- **`fare`**: Tarifa base del tour
- **`profit_percentage`**: Porcentaje de utilidad
- **`total_fare`**: Tarifa total calculada
- **`status`**: Estado del tour

### Estados de Tour
- **`cotizado`**: Tour en proceso de cotización
- **`vendido`**: Tour confirmado y vendido
- **`descartado`**: Tour descartado por el cliente

---

## Componentes Livewire

### 1. CreateTourReserve
**Ubicación**: `app/Livewire/Services/Tours/CreateTourReserve.php`

**Funcionalidades**:
- Creación de nuevos tours
- Validación en tiempo real
- Cálculo automático de tarifas
- Generación de slugs únicos
- Observaciones automáticas
- Logs detallados para debugging

### 2. EditTourReserve
**Ubicación**: `app/Livewire/Services/Tours/EditTourReserve.php`

**Funcionalidades**:
- Edición de tours existentes
- Carga de datos actuales
- Actualización de información
- Preservación de contexto

### 3. ShowTourReserve
**Ubicación**: `app/Livewire/Services/Tours/ShowTourReserve.php`

**Funcionalidades**:
- Visualización detallada del tour
- Gestión de imágenes con carrusel
- Modal para agregar imágenes
- Información completa del tour

### 4. IndexTourReserve
**Ubicación**: `app/Livewire/Services/Tours/IndexTourReserve.php`

**Funcionalidades**:
- Listado de tours
- Filtros y búsqueda
- Acciones masivas
- Navegación entre tours

---

## Base de Datos

### Relaciones Principales

#### Tour
```php
// Tour pertenece a una agencia
public function agency()
{
    return $this->belongsTo(Agency::class);
}

// Tour pertenece a un cliente
public function client()
{
    return $this->belongsTo(Client::class);
}

// Tour pertenece a un request
public function request()
{
    return $this->belongsTo(Request::class);
}

// Tour tiene imágenes
public function images()
{
    return $this->hasMany(TourImage::class);
}
```

### Traits Utilizados

#### HasObservations
```php
use App\Traits\HasObservations;

class Tour extends Model
{
    use HasObservations;
    
    // Permite gestión de observaciones
    // - Observaciones automáticas
    // - Historial de cambios
    // - Seguimiento de estado
}
```

---

## API y Rutas

### Rutas de Tours
```php
Route::prefix('agency/{agency:slug}/clients/{client:slug}/request/{request:slug}')
    ->middleware(['auth', 'verified'])
    ->name('requests.')
    ->group(function () {
        Route::get('/tours', IndexTourReserve::class)->name('tours.index');
        Route::get('/tours/create', CreateTourReserve::class)->name('tours.create');
        Route::get('/tours/{tour}/edit', EditTourReserve::class)->name('tours.edit');
        Route::get('/tours/{tour}', ShowTourReserve::class)->name('tours.show');
    });
```

---

## Funcionalidades Avanzadas

### Sistema de Observaciones Automáticas

#### Creación Automática
```php
private function createAutomaticObservation($tour)
{
    $user = auth()->user();
    
    $observationText = "Se ha creado un tour: {$this->name}. ";
    $observationText .= "Fecha de inicio: {$this->start_date}. ";
    $observationText .= "Fecha de fin: {$this->end_date}. ";
    $observationText .= "Estado: {$this->status}. ";
    
    if ($this->fare > 0) {
        $observationText .= "Tarifa: $" . number_format($this->fare, 2) . ". ";
        $observationText .= "Total: $" . number_format($this->total_fare, 2) . ". ";
    }
    
    $this->client->observations()->create([
        'title' => 'Nuevo tour creado',
        'body' => $observationText,
        'user_id' => $user->id,
        'type' => 'operational',
        'priority' => 'medium',
        'is_private' => false,
        'agency_id' => $this->agency->id,
    ]);
}
```

### Gestión de Imágenes

#### Relación con TourImage
```php
// Un tour puede tener múltiples imágenes
public function images()
{
    return $this->hasMany(TourImage::class);
}

// Imagen principal
public function mainImage()
{
    return $this->hasOne(TourImage::class)->where('is_main', true);
}

// Imágenes de galería
public function galleryImages()
{
    return $this->hasMany(TourImage::class)->where('is_main', false);
}
```

---

## Guías de Uso

### Crear un Tour

#### 1. Acceso al Formulario
```
URL: /agency/{agency}/clients/{client}/request/{request}/tours/create
```

#### 2. Llenar Información Básica
- **Nombre del Tour**: Nombre descriptivo del tour
- **Fecha de Inicio**: Fecha y hora de inicio
- **Fecha de Fin**: Fecha y hora de finalización
- **Descripción**: Descripción detallada del tour

#### 3. Configurar Participantes
- **Adultos**: Cantidad de adultos (mínimo 1)
- **Niños**: Cantidad de niños (opcional)
- **Infantes**: Cantidad de infantes (opcional)

#### 4. Establecer Tarifas
- **Tarifa Neta**: Costo base del tour
- **% de Utilidad**: Porcentaje de ganancia
- **Total**: Se calcula automáticamente

#### 5. Configurar Estado y Descripción
- **Estado**: Cotizado, vendido, descartado
- **Descripción**: Detalles del tour
- **Detalles Adicionales**: Información complementaria

#### 6. Guardar
- Hacer clic en "Crear Tour"
- El sistema generará un slug único
- Se creará una observación automática
- Redirección al detalle del tour

---

## Troubleshooting

### Problemas Comunes

#### 1. Error de Validación de Fechas
**Síntoma**: `The end date must be a date after or equal to start date`

**Solución**: Verificar que la fecha de fin sea posterior o igual a la fecha de inicio.

#### 2. Error de Slug Duplicado
**Síntoma**: `SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry`

**Solución**: El sistema genera automáticamente slugs únicos con código aleatorio.

#### 3. Error de Cálculo de Tarifas
**Síntoma**: El total no se calcula automáticamente

**Solución**: Verificar JavaScript y validaciones en el componente.

#### 4. Error de Imágenes
**Síntoma**: No se pueden subir o visualizar imágenes

**Solución**: Verificar configuración de Storage y permisos.

---

## Conclusión

El servicio de Tours proporciona una solución completa para la gestión de experiencias turísticas. Con características avanzadas como cálculo automático de tarifas, observaciones automáticas, gestión de imágenes y una interfaz moderna, el sistema está diseñado para mejorar la eficiencia y la experiencia del usuario en las agencias de viajes.

### Características Destacadas
- ✅ **Interfaz moderna** con Livewire
- ✅ **Validación robusta** en tiempo real
- ✅ **Cálculo automático** de tarifas
- ✅ **Observaciones automáticas** para clientes
- ✅ **Gestión de imágenes** con carrusel
- ✅ **Estados de seguimiento** completos
- ✅ **Slugs únicos** automáticos
- ✅ **Integración completa** con el sistema CRM

---

*Documentación actualizada: Septiembre 2025*
*Versión del sistema: 1.0.0*