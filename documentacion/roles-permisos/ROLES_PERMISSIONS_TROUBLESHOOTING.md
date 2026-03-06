# Troubleshooting - Sistema de Roles y Permisos

## 🚨 Problemas Comunes y Soluciones

### 1. Error: "Livewire only supports one HTML element per component"

#### Síntomas
```
Livewire only supports one HTML element per component. Multiple root elements detected for component: [agency.role-management]
```

#### Causa
El componente Livewire tiene múltiples elementos raíz en lugar de un solo contenedor.

#### Solución
```php
// ❌ Incorrecto - Múltiples elementos raíz
<div>Header</div>
<div>Content</div>
<div>Footer</div>

// ✅ Correcto - Un solo elemento raíz
<div>
    <div>Header</div>
    <div>Content</div>
    <div>Footer</div>
</div>
```

### 2. Error: "Layout view not found"

#### Síntomas
```
Livewire page component layout view not found: [layouts.app]
```

#### Causa
El layout especificado no existe o la ruta es incorrecta.

#### Solución
```php
// ❌ Incorrecto
return view('livewire.agency.role-management')->layout('layouts.app');

// ✅ Correcto - Usar layout por defecto
return view('livewire.agency.role-management');

// ✅ Correcto - Especificar layout existente
return view('livewire.agency.role-management')->layout('components.layouts.app.sidebar');
```

### 3. Error: "Unique constraint violation"

#### Síntomas
```
SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'administrador-web' for key 'roles_name_guard_name_unique'
```

#### Causa
Intento de crear roles con nombres duplicados en la misma agencia.

#### Solución
```php
// Verificar constraint único
Schema::table('roles', function (Blueprint $table) {
    $table->dropUnique(['name', 'guard_name']);
    $table->unique(['agency_id', 'name', 'guard_name']);
});
```

### 4. Error: "Permission denied"

#### Síntomas
```
No tienes permisos para realizar esta acción
```

#### Causa
El usuario no tiene los permisos necesarios para la operación.

#### Solución
1. Verificar que el usuario tenga el rol correcto
2. Verificar que el rol tenga los permisos necesarios
3. Verificar que el usuario pertenezca a la agencia correcta

```php
// Verificar permisos en el controlador
if (!auth()->user()->can('manage-roles')) {
    abort(403, 'No tienes permisos para gestionar roles');
}
```

### 5. Error: "Role not found"

#### Síntomas
```
Rol no encontrado
```

#### Causa
El rol no existe o no pertenece a la agencia del usuario.

#### Solución
```php
// Verificar que el rol pertenezca a la agencia
$role = Role::where('id', $roleId)
    ->where('agency_id', auth()->user()->agency_id)
    ->firstOrFail();
```

### 6. Error: "Cannot delete role with assigned users"

#### Síntomas
```
No se puede eliminar el rol porque tiene 3 usuario(s) asignado(s)
```

#### Causa
Intento de eliminar un rol que tiene usuarios asignados.

#### Solución
1. Reasignar usuarios a otros roles
2. O eliminar usuarios primero
3. O desactivar el rol en lugar de eliminarlo

```php
// Verificar usuarios asignados antes de eliminar
$usersCount = $role->users()->count();
if ($usersCount > 0) {
    return response()->json([
        'message' => "No se puede eliminar el rol porque tiene {$usersCount} usuario(s) asignado(s)"
    ], 422);
}
```

## 🔧 Problemas de Configuración

### 1. Permisos no se aplican correctamente

#### Síntomas
- Usuario tiene rol pero no puede acceder a funciones
- Permisos no se reflejan en la interfaz

#### Causa
Cache de permisos no actualizado o configuración incorrecta.

#### Solución
```bash
# Limpiar cache de permisos
php artisan permission:cache-reset

# Limpiar cache general
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 2. Roles no aparecen en la interfaz

#### Síntomas
- Lista de roles vacía
- Error al cargar roles

#### Causa
Problema con la consulta o filtros incorrectos.

#### Solución
```php
// Verificar consulta en el componente
public function getRoles()
{
    return $this->agency->roles()
        ->with(['permissions', 'users'])
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get(); // Cambiar de paginate() a get() si es necesario
}
```

### 3. Estilos no se aplican

#### Síntomas
- Interfaz sin estilos
- Modales sin diseño

#### Causa
Archivo CSS no compilado o importación incorrecta.

#### Solución
```bash
# Compilar estilos
npm run build

# O para desarrollo
npm run dev
```

Verificar que el archivo CSS esté importado:
```css
/* resources/css/app.css */
@import './roles.css';
```

## 🐛 Problemas de Base de Datos

### 1. Error de migración

#### Síntomas
```
SQLSTATE[42000]: Syntax error or access violation
```

#### Causa
Error en la sintaxis SQL de la migración.

#### Solución
```php
// Verificar sintaxis de migración
Schema::table('roles', function (Blueprint $table) {
    $table->foreignId('agency_id')->nullable()->constrained()->onDelete('cascade');
    // Verificar que todas las columnas estén correctamente definidas
});
```

### 2. Error de foreign key

#### Síntomas
```
SQLSTATE[23000]: Cannot add or update a child row: a foreign key constraint fails
```

#### Causa
Referencia a registro inexistente en tabla relacionada.

#### Solución
```php
// Verificar que la agencia exista antes de crear rol
$agency = Agency::findOrFail($agencyId);
$role = $agency->createCustomRole($name, $description, $permissions);
```

### 3. Error de seeder

#### Síntomas
```
SQLSTATE[23000]: Integrity constraint violation
```

#### Causa
Intento de insertar datos duplicados en seeder.

#### Solución
```php
// Usar updateOrCreate en lugar de create
Role::updateOrCreate(
    ['name' => 'Administrador', 'agency_id' => $agency->id],
    ['description' => 'Acceso completo al sistema']
);
```

## 🔍 Debugging

### 1. Verificar permisos del usuario

```php
// En tinker o controlador
$user = User::find(1);
$user->roles; // Ver roles asignados
$user->permissions; // Ver permisos directos
$user->getAllPermissions(); // Ver todos los permisos (roles + directos)
$user->can('create-clients'); // Verificar permiso específico
```

### 2. Verificar roles de la agencia

```php
// En tinker
$agency = Agency::find(1);
$agency->roles; // Ver todos los roles
$agency->customRoles; // Ver solo roles personalizados
$agency->systemRoles; // Ver solo roles del sistema
```

### 3. Verificar permisos por categoría

```php
// En tinker
$category = PermissionCategory::with('permissions')->find(1);
$category->permissions; // Ver permisos de la categoría
```

### 4. Logs de debugging

```php
// Agregar logs en el componente
Log::info('Creating role', [
    'name' => $this->roleName,
    'agency_id' => $this->agency->id,
    'permissions' => $this->selectedPermissions
]);
```

## 📊 Verificación del Sistema

### 1. Checklist de verificación

```bash
# Verificar migraciones
php artisan migrate:status

# Verificar seeders
php artisan db:seed --class=PermissionCategoriesSeeder
php artisan db:seed --class=DynamicPermissionsSeeder
php artisan db:seed --class=AgencySystemRolesSeeder

# Verificar rutas
php artisan route:list --name=agency.roles

# Verificar permisos
php artisan permission:show
```

### 2. Verificar configuración

```php
// Verificar configuración de Spatie Permission
config('permission.models.role'); // Debe ser App\Models\AgencyRole
config('permission.models.permission'); // Debe ser Spatie\Permission\Models\Permission
```

### 3. Verificar relaciones

```php
// En tinker
$role = Role::first();
$role->permissions; // Debe mostrar permisos
$role->users; // Debe mostrar usuarios
$role->agency; // Debe mostrar agencia
```

## 🚀 Optimización

### 1. Consultas eficientes

```php
// ❌ Ineficiente - N+1 queries
$roles = Role::all();
foreach ($roles as $role) {
    echo $role->permissions->count();
}

// ✅ Eficiente - Eager loading
$roles = Role::with('permissions', 'users')->get();
foreach ($roles as $role) {
    echo $role->permissions->count();
}
```

### 2. Cache de permisos

```php
// Cachear permisos del usuario
$user = auth()->user();
$permissions = Cache::remember("user.{$user->id}.permissions", 3600, function () use ($user) {
    return $user->getAllPermissions()->pluck('name');
});
```

### 3. Índices de base de datos

```php
// Agregar índices para mejorar rendimiento
Schema::table('roles', function (Blueprint $table) {
    $table->index(['agency_id', 'is_active']);
    $table->index(['agency_id', 'is_system_role']);
});
```

## 📞 Soporte

### 1. Información para reportar problemas

Al reportar un problema, incluir:
- Versión de Laravel
- Versión de PHP
- Logs de error completos
- Pasos para reproducir
- Configuración relevante

### 2. Logs importantes

```bash
# Ver logs de Laravel
tail -f storage/logs/laravel.log

# Ver logs de permisos
grep "permission" storage/logs/laravel.log

# Ver logs de roles
grep "role" storage/logs/laravel.log
```

### 3. Comandos útiles

```bash
# Limpiar todo el cache
php artisan optimize:clear

# Verificar estado del sistema
php artisan about

# Verificar configuración
php artisan config:show permission
```

## 🔄 Recuperación de Errores

### 1. Restaurar roles del sistema

```bash
# Ejecutar seeder de roles del sistema
php artisan db:seed --class=AgencySystemRolesSeeder
```

### 2. Restaurar permisos

```bash
# Ejecutar seeders de permisos
php artisan db:seed --class=PermissionCategoriesSeeder
php artisan db:seed --class=DynamicPermissionsSeeder
```

### 3. Limpiar datos corruptos

```php
// En tinker - Limpiar roles huérfanos
Role::whereNull('agency_id')->delete();

// Limpiar permisos sin categoría
Permission::whereNull('permission_category_id')->update(['permission_category_id' => 1]);
```

---

**Nota**: Si el problema persiste después de seguir estas soluciones, contactar al equipo de desarrollo con la información detallada del error.
