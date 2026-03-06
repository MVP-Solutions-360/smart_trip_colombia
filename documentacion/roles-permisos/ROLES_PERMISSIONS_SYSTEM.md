# Sistema de Roles y Permisos Dinámicos

## 📋 Descripción General

El sistema de roles y permisos dinámicos permite que cada agencia cree y gestione sus propios roles personalizados, asignando permisos específicos según sus necesidades organizacionales. Esto proporciona flexibilidad total para adaptar el sistema a diferentes estructuras de negocio.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Roles del Sistema**: Roles predefinidos que no se pueden eliminar
2. **Roles Personalizados**: Roles creados por cada agencia
3. **Categorías de Permisos**: Organización lógica de permisos
4. **Permisos**: Acciones específicas que se pueden realizar

### Modelos de Base de Datos

#### `roles` (Extendido de Spatie)
```sql
- id (Primary Key)
- name (Nombre del rol)
- guard_name (web/api)
- agency_id (Foreign Key a agencies)
- description (Descripción del rol)
- color (Color hexadecimal para identificación)
- is_system_role (Boolean - Rol del sistema)
- is_active (Boolean - Estado del rol)
- sort_order (Orden de visualización)
- created_at, updated_at
```

#### `permission_categories`
```sql
- id (Primary Key)
- name (Nombre de la categoría)
- description (Descripción)
- sort_order (Orden de visualización)
- created_at, updated_at
```

#### `permissions` (Extendido de Spatie)
```sql
- id (Primary Key)
- name (Nombre del permiso)
- guard_name (web/api)
- permission_category_id (Foreign Key a permission_categories)
- description (Descripción del permiso)
- created_at, updated_at
```

## 🎯 Funcionalidades Implementadas

### 1. Gestión de Roles

#### Crear Rol Personalizado
- **Endpoint**: `POST /agency/{agency}/roles`
- **Validaciones**:
  - Nombre único por agencia
  - Descripción opcional (máximo 1000 caracteres)
  - Color hexadecimal válido
  - Estado activo/inactivo

#### Editar Rol
- **Endpoint**: `PUT /agency/{agency}/roles/{role}`
- **Restricciones**:
  - Solo roles personalizados pueden ser editados
  - Roles del sistema son de solo lectura

#### Eliminar Rol
- **Endpoint**: `DELETE /agency/{agency}/roles/{role}`
- **Validaciones**:
  - Solo roles personalizados
  - No puede tener usuarios asignados
  - No puede ser rol del sistema

### 2. Gestión de Permisos

#### Asignar Permisos
- **Modal**: Gestión de permisos por categorías
- **Funciones**:
  - Seleccionar todos los permisos
  - Limpiar selección
  - Asignación por categorías organizadas

#### Categorías de Permisos
- Agencias
- Oficinas
- Personal
- Usuarios
- Roles y Permisos
- Configuración
- Clientes
- Cotizaciones
- Ventas
- Pagos
- Servicios
- Paquetes

### 3. Vista de Usuarios
- **Modal**: Lista de usuarios asignados a cada rol
- **Información mostrada**:
  - Nombre del usuario
  - Email
  - Oficina asignada

## 🔧 Componentes Técnicos

### Livewire Component: `RoleManagement`

#### Propiedades Principales
```php
public Agency $agency;
public $showCreateModal = false;
public $showEditModal = false;
public $showPermissionsModal = false;
public $showUsersModal = false;
public $selectedRole = null;
public $roleName = '';
public $roleDescription = '';
public $roleColor = '#3B82F6';
public $selectedPermissions = [];
public $isActive = true;
```

#### Métodos Principales
- `openCreateModal()`: Abre modal de creación
- `openEditModal($roleId)`: Abre modal de edición
- `openPermissionsModal($roleId)`: Abre modal de permisos
- `openUsersModal($roleId)`: Abre modal de usuarios
- `createRole()`: Crea nuevo rol
- `updateRole()`: Actualiza rol existente
- `updatePermissions()`: Actualiza permisos
- `deleteRole($roleId)`: Elimina rol
- `closeModals()`: Cierra todos los modales

### Modelos Personalizados

#### `AgencyRole` (Extiende Spatie Role)
```php
protected $fillable = [
    'name', 'guard_name', 'agency_id', 'description',
    'color', 'is_system_role', 'is_active', 'sort_order'
];
```

#### `PermissionCategory`
```php
protected $fillable = [
    'name', 'description', 'sort_order', 'is_active'
];

// Scopes
public function scopeActive($query)
public function scopeOrdered($query)
```

### Trait Personalizado: `HasAgencyRoles`

Reemplaza el trait `HasRoles` de Spatie para filtrar roles por agencia:

```php
public function getRoleClass()
{
    return AgencyRole::class;
}

public function roles()
{
    return $this->morphToMany(
        $this->getRoleClass(),
        'model',
        config('permission.table_names.model_has_roles'),
        config('permission.column_names.model_morph_key'),
        config('permission.column_names.role_pivot_key')
    )->where('agency_id', auth()->user()->agency_id);
}
```

## 🎨 Interfaz de Usuario

### Vista Principal: `role-management.blade.php`

#### Secciones
1. **Header**: Título, descripción y botón crear
2. **Breadcrumbs**: Navegación contextual
3. **Mensajes**: Flash messages para feedback
4. **Roles del Sistema**: Sección para roles predefinidos
5. **Roles Personalizados**: Sección para roles creados por la agencia

#### Características de Diseño
- **Soporte modo oscuro/claro**: Estilos adaptativos
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Iconos**: Heroicons para mejor UX
- **Colores personalizados**: Cada rol tiene su color identificativo
- **Estados visuales**: Indicadores de activo/inactivo

### Modales

#### Modal de Creación/Edición
- Formulario con validación en tiempo real
- Selector de color para el rol
- Checkbox para estado activo
- Validación de nombres únicos

#### Modal de Permisos
- Organización por categorías
- Botones de selección masiva
- Checkboxes individuales por permiso
- Descripción de cada permiso

#### Modal de Usuarios
- Lista de usuarios asignados
- Información de contacto y oficina
- Avatar con iniciales

## 🛡️ Seguridad y Validaciones

### Validaciones de Negocio
- **Nombres únicos**: Por agencia, no globalmente
- **Protección de roles del sistema**: No editables ni eliminables
- **Verificación de usuarios**: No eliminar roles con usuarios asignados
- **Transacciones**: Operaciones atómicas en base de datos

### Políticas de Autorización
- **AgencyRolePolicy**: Controla acceso a operaciones CRUD
- **Verificación de agencia**: Solo usuarios de la misma agencia
- **Permisos específicos**: Control granular de acciones

## 📊 Seeders y Datos Iniciales

### `PermissionCategoriesSeeder`
Crea las categorías base de permisos:
- Agencias, Oficinas, Personal, Usuarios
- Roles y Permisos, Configuración
- Clientes, Cotizaciones, Ventas
- Pagos, Servicios, Paquetes

### `DynamicPermissionsSeeder`
Crea más de 60 permisos organizados por categorías:
- CRUD básico para cada entidad
- Permisos específicos de negocio
- Permisos de configuración y administración

### `AgencySystemRolesSeeder`
Crea roles del sistema para cada agencia:
- **Administrador**: Acceso completo
- **Gerente**: Gestión de equipos
- **Supervisor**: Supervisión de operaciones
- **Vendedor**: Operaciones de venta
- **Asistente**: Tareas de apoyo

## 🚀 Rutas y Acceso

### Rutas Web
```php
Route::prefix('agency')->middleware(['auth'])->name('agency.')->group(function () {
    Route::get('/{agency:slug}/roles', RoleManagement::class)->name('roles');
});
```

### Rutas API
```php
Route::prefix('{agency}/roles')->group(function () {
    Route::get('/', [AgencyRoleController::class, 'index']);
    Route::post('/', [AgencyRoleController::class, 'store']);
    Route::get('/permissions', [AgencyRoleController::class, 'permissions']);
    Route::get('/{role}', [AgencyRoleController::class, 'show']);
    Route::put('/{role}', [AgencyRoleController::class, 'update']);
    Route::delete('/{role}', [AgencyRoleController::class, 'destroy']);
    Route::get('/{role}/permissions', [AgencyRoleController::class, 'rolePermissions']);
    Route::post('/{role}/permissions', [AgencyRoleController::class, 'assignPermissions']);
    Route::get('/{role}/users', [AgencyRoleController::class, 'roleUsers']);
});
```

### Navegación
- **Sidebar**: Administración → Gestión de Roles
- **Vista de Agencia**: Botón "Gestionar Roles"
- **URL Directa**: `/agency/{slug}/roles`

## 🔄 Flujo de Trabajo

### Crear Nuevo Rol
1. Usuario accede a gestión de roles
2. Hace clic en "Crear Rol"
3. Completa formulario (nombre, descripción, color)
4. Selecciona permisos por categorías
5. Guarda el rol
6. Sistema valida y crea el rol

### Asignar Usuario a Rol
1. Usuario accede a gestión de personal
2. Edita usuario existente
3. Selecciona rol de la lista (filtrada por agencia)
4. Guarda cambios
5. Sistema actualiza permisos del usuario

### Gestionar Permisos
1. Usuario accede a gestión de roles
2. Hace clic en "Asignar permisos" en un rol
3. Selecciona/deselecciona permisos por categorías
4. Guarda cambios
5. Sistema actualiza permisos del rol

## 🎯 Casos de Uso

### Agencia de Viajes Pequeña
- **Administrador**: Acceso completo
- **Vendedor**: Crear cotizaciones, gestionar clientes
- **Asistente**: Tareas administrativas básicas

### Agencia de Viajes Grande
- **Director**: Acceso completo
- **Gerente Regional**: Gestión de oficinas específicas
- **Supervisor de Ventas**: Supervisión de vendedores
- **Vendedor Senior**: Ventas y seguimiento
- **Vendedor Junior**: Solo creación de cotizaciones
- **Asistente**: Tareas de apoyo

### Agencia Corporativa
- **CEO**: Acceso completo
- **CFO**: Acceso a finanzas y reportes
- **Director de Operaciones**: Gestión operativa
- **Manager de Cuentas**: Gestión de clientes corporativos
- **Coordinador**: Coordinación de servicios

## 🔧 Mantenimiento

### Agregar Nuevo Permiso
1. Crear migración para agregar permiso
2. Agregar a `DynamicPermissionsSeeder`
3. Ejecutar seeder
4. Actualizar políticas si es necesario

### Agregar Nueva Categoría
1. Crear migración para nueva categoría
2. Agregar a `PermissionCategoriesSeeder`
3. Ejecutar seeder
4. Actualizar interfaz si es necesario

### Modificar Rol del Sistema
1. Editar `AgencySystemRolesSeeder`
2. Ejecutar seeder para actualizar roles existentes
3. Verificar que no afecte funcionalidad

## 📈 Métricas y Monitoreo

### Datos Disponibles
- Número de roles por agencia
- Número de usuarios por rol
- Permisos más utilizados
- Roles más comunes

### Reportes Sugeridos
- Distribución de roles por agencia
- Uso de permisos por categoría
- Usuarios sin roles asignados
- Roles inactivos

## 🚨 Consideraciones Importantes

### Limitaciones
- Los roles son específicos por agencia
- No se pueden eliminar roles del sistema
- Los permisos son globales (compartidos entre agencias)
- No hay herencia de roles

### Mejoras Futuras Sugeridas
- Herencia de roles
- Roles temporales con expiración
- Auditoría de cambios en roles
- Importación/exportación de configuraciones de roles
- Roles basados en ubicación geográfica

## 📞 Soporte

Para dudas o problemas con el sistema de roles y permisos:
1. Revisar logs de Laravel
2. Verificar permisos de base de datos
3. Comprobar configuración de Spatie Permission
4. Validar que las migraciones estén ejecutadas

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2024  
**Autor**: Sistema CRM  
**Estado**: Producción
