# 📋 Documentación de Roles y Permisos del Sistema CRM

## 📖 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Roles Globales del Sistema](#roles-globales-del-sistema)
4. [Categorías de Permisos](#categorías-de-permisos)
5. [Permisos Funcionales](#permisos-funcionales)
6. [Permisos de Menú](#permisos-de-menú)
7. [Gestión de Roles Personalizados](#gestión-de-roles-personalizados)
8. [Implementación Técnica](#implementación-técnica)
9. [Guía de Uso](#guía-de-uso)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

El sistema CRM implementa un sistema robusto de roles y permisos basado en el paquete **Spatie Permission** de Laravel. Este sistema permite controlar granularmente el acceso a funcionalidades y vistas del sistema, tanto a nivel global como por agencia.

### Características Principales
- ✅ **Roles Globales**: 5 roles predefinidos del sistema
- ✅ **Roles Personalizados**: Creación de roles específicos por agencia
- ✅ **Permisos Granulares**: Control detallado de funcionalidades
- ✅ **Categorización**: Organización lógica de permisos por módulos
- ✅ **Cache Inteligente**: Optimización de rendimiento
- ✅ **UI Integrada**: Gestión visual de roles y permisos

---

## 🏗️ Arquitectura del Sistema

### Tipos de Roles

#### 1. **Roles Globales del Sistema**
- Creados automáticamente por el seeder
- Aplicables a cualquier agencia
- No pueden ser eliminados
- Base para la funcionalidad del sistema

#### 2. **Roles Personalizados por Agencia**
- Creados por administradores de agencia
- Específicos para una agencia
- Pueden ser eliminados y modificados
- Permiten personalización granular

### Estructura de Permisos

```
Permisos
├── Funcionales (CRUD + Acciones específicas)
│   ├── Agencias
│   ├── Oficinas
│   ├── Personal
│   ├── Usuarios
│   ├── Clientes
│   ├── Paquetes
│   ├── Cotizaciones
│   ├── Ventas
│   ├── Tareas
│   ├── Reportes
│   ├── Configuración
│   └── Roles y Permisos
└── Menú (Control de visibilidad)
    ├── Dashboard
    ├── Administración
    ├── Clientes
    ├── Contabilidad
    └── Productos
```

---

## 👑 Roles Globales del Sistema

### 1. 👑 **ADMINISTRADOR**
**Color:** 🔴 Rojo (#DC2626)  
**Descripción:** Acceso completo a la agencia

#### ✅ **Permisos Incluidos:**
- **TODOS** los permisos funcionales
- **TODOS** los permisos de menú
- Gestión completa de agencia, roles, oficinas
- Acceso total a contabilidad y productos

#### 🚫 **Restricciones:**
- Ninguna

---

### 2. 🎯 **SUPERVISOR**
**Color:** 🟢 Verde (#10B981)  
**Descripción:** Acceso casi completo excepto gestión de agencia

#### ✅ **Permisos Incluidos:**
- Casi todos los permisos del administrador
- Gestión de personal, clientes, ventas
- Acceso a contabilidad y productos
- Gestión de roles y permisos

#### 🚫 **Restricciones:**
- ❌ Mi Agencia (`menu_mi_agencia`)
- ❌ Gestión de Roles (`menu_gestion_roles`)
- ❌ Oficinas (`menu_oficinas`)

---

### 3. 💼 **VENDEDOR**
**Color:** 🔵 Azul (#3B82F6)  
**Descripción:** Acceso a ventas y clientes (SIN contabilidad ni productos)

#### ✅ **Permisos Incluidos:**
- Gestión completa de clientes
- Cotizaciones y ventas
- Tareas básicas
- Reportes de ventas
- Paquetes, hoteles, tours

#### 🚫 **Restricciones:**
- ❌ Contabilidad (`menu_contabilidad`, `menu_solicitudes_pago`)
- ❌ Productos (`menu_productos`)
- ❌ Administración avanzada

---

### 4. 📊 **CONTABILIDAD**
**Color:** 🟠 Naranja (#F59E0B)  
**Descripción:** Acceso completo a módulos financieros y solo lectura de clientes

#### ✅ **Permisos Incluidos:**
- **Solo lectura** de clientes (`ver clientes`)
- Acceso completo a contabilidad
- Solicitudes de pago
- Reportes financieros
- Paquetes, hoteles, tours

#### 🚫 **Restricciones:**
- ❌ Editar/eliminar clientes
- ❌ Gestión de personal
- ❌ Administración avanzada

---

### 5. 👥 **RECURSOS HUMANOS**
**Color:** 🟣 Púrpura (#8B5CF6)  
**Descripción:** Acceso a administración excepto proveedores

#### ✅ **Permisos Incluidos:**
- Gestión de oficinas
- Gestión completa de personal
- Gestión de usuarios
- Gestión de clientes
- Gestión de tareas
- Reportes de personal
- Gestión de roles

#### 🚫 **Restricciones:**
- ❌ Proveedores (`menu_proveedores`)
- ❌ Contabilidad
- ❌ Ventas y cotizaciones

---

## 📂 Categorías de Permisos

### 1. 🏢 **Agencias** (`agencies`)
**Color:** 🔵 Azul (#3B82F6)  
**Icono:** `building-office`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver agencias` | Ver listado de agencias | `eye` |
| `crear agencias` | Crear nuevas agencias | `plus` |
| `editar agencias` | Editar información de agencias | `pencil` |
| `eliminar agencias` | Eliminar agencias | `trash` |

### 2. 🏢 **Oficinas** (`offices`)
**Color:** 🟢 Verde (#10B981)  
**Icono:** `building-office-2`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver oficinas` | Ver listado de oficinas | `eye` |
| `crear oficinas` | Crear nuevas oficinas | `plus` |
| `editar oficinas` | Editar información de oficinas | `pencil` |
| `eliminar oficinas` | Eliminar oficinas | `trash` |
| `configurar colores oficinas` | Configurar colores corporativos | `paint-brush` |

### 3. 👥 **Personal** (`personnel`)
**Color:** 🟠 Naranja (#F59E0B)  
**Icono:** `users`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver personal` | Ver listado del personal | `eye` |
| `crear personal` | Crear nuevo personal | `plus` |
| `editar personal` | Editar información del personal | `pencil` |
| `eliminar personal` | Eliminar personal | `trash` |
| `asignar comisiones` | Asignar comisiones al personal | `currency-dollar` |

### 4. 👤 **Usuarios** (`users`)
**Color:** 🟣 Púrpura (#8B5CF6)  
**Icono:** `user-group`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver usuarios` | Ver listado de usuarios | `eye` |
| `crear usuarios` | Crear nuevos usuarios | `plus` |
| `editar usuarios` | Editar información de usuarios | `pencil` |
| `eliminar usuarios` | Eliminar usuarios | `trash` |
| `asignar roles usuarios` | Asignar roles a usuarios | `user-group` |

### 5. 👤 **Clientes** (`clients`)
**Color:** 🔵 Cian (#06B6D4)  
**Icono:** `user`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver clientes` | Ver listado de clientes | `eye` |
| `crear clientes` | Crear nuevos clientes | `plus` |
| `editar clientes` | Editar información de clientes | `pencil` |
| `eliminar clientes` | Eliminar clientes | `trash` |
| `ver historial clientes` | Ver historial de clientes | `clock` |

### 6. 🧳 **Paquetes** (`packages`)
**Color:** 🔴 Rojo (#EF4444)  
**Icono:** `suitcase`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver paquetes` | Ver listado de paquetes | `eye` |
| `crear paquetes` | Crear nuevos paquetes | `plus` |
| `editar paquetes` | Editar información de paquetes | `pencil` |
| `eliminar paquetes` | Eliminar paquetes | `trash` |
| `gestionar precios paquetes` | Gestionar precios de paquetes | `currency-dollar` |
| `gestionar disponibilidad paquetes` | Gestionar disponibilidad | `calendar` |

### 7. 📄 **Cotizaciones** (`quotations`)
**Color:** 🟢 Verde (#84CC16)  
**Icono:** `document-text`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver cotizaciones` | Ver listado de cotizaciones | `eye` |
| `crear cotizaciones` | Crear nuevas cotizaciones | `plus` |
| `editar cotizaciones` | Editar cotizaciones | `pencil` |
| `eliminar cotizaciones` | Eliminar cotizaciones | `trash` |
| `aprobar cotizaciones` | Aprobar cotizaciones | `check` |
| `enviar cotizaciones` | Enviar cotizaciones a clientes | `paper-airplane` |

### 8. 💰 **Ventas** (`sales`)
**Color:** 🟠 Naranja (#F97316)  
**Icono:** `currency-dollar`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver ventas` | Ver listado de ventas | `eye` |
| `crear ventas` | Registrar nuevas ventas | `plus` |
| `editar ventas` | Editar información de ventas | `pencil` |
| `eliminar ventas` | Eliminar ventas | `trash` |
| `gestionar pagos` | Gestionar pagos de ventas | `credit-card` |
| `procesar reembolsos` | Procesar reembolsos | `arrow-uturn-left` |

### 9. ✅ **Tareas** (`tasks`)
**Color:** 🟣 Rosa (#EC4899)  
**Icono:** `clipboard-document-list`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver tareas` | Ver listado de tareas | `eye` |
| `crear tareas` | Crear nuevas tareas | `plus` |
| `editar tareas` | Editar tareas | `pencil` |
| `eliminar tareas` | Eliminar tareas | `trash` |
| `asignar tareas` | Asignar tareas a usuarios | `user-plus` |
| `completar tareas` | Marcar tareas como completadas | `check` |

### 10. 📊 **Reportes** (`reports`)
**Color:** 🔵 Índigo (#6366F1)  
**Icono:** `chart-bar`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver reportes ventas` | Ver reportes de ventas | `chart-bar` |
| `ver reportes clientes` | Ver reportes de clientes | `users` |
| `ver reportes personal` | Ver reportes del personal | `user-group` |
| `exportar reportes` | Exportar reportes a Excel/PDF | `arrow-down-tray` |
| `ver dashboard` | Acceder al dashboard principal | `squares-2x2` |

### 11. ⚙️ **Configuración** (`settings`)
**Color:** 🔘 Gris (#6B7280)  
**Icono:** `cog-6-tooth`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver configuración` | Ver configuración del sistema | `eye` |
| `editar configuración` | Editar configuración del sistema | `pencil` |
| `gestionar backup` | Gestionar respaldos del sistema | `server` |
| `ver logs sistema` | Ver logs del sistema | `document-text` |

### 12. 🛡️ **Roles y Permisos** (`roles-permissions`)
**Color:** 🔴 Rojo (#DC2626)  
**Icono:** `shield-check`

| Permiso | Descripción | Icono |
|---------|-------------|-------|
| `ver roles` | Ver listado de roles | `eye` |
| `crear roles` | Crear nuevos roles | `plus` |
| `editar roles` | Editar roles existentes | `pencil` |
| `eliminar roles` | Eliminar roles | `trash` |
| `asignar permisos roles` | Asignar permisos a roles | `shield-check` |
| `ver permisos` | Ver listado de permisos | `eye` |

---

## 🍽️ Permisos de Menú

### **Menú del Sistema** (`menu-sistema`)
**Descripción:** Control de visibilidad del menú del sistema

| Permiso | Descripción |
|---------|-------------|
| `menu_dashboard` | Ver Dashboard |
| `menu_mis_tareas` | Ver Mis Tareas |
| `menu_administracion` | Ver sección Administración |
| `menu_agencias` | Ver Lista de Agencias |
| `menu_mi_agencia` | Ver Mi Agencia |
| `menu_gestion_roles` | Ver Gestión de Roles |
| `menu_oficinas` | Ver Oficinas |
| `menu_colaboradores` | Ver Colaboradores |
| `menu_proveedores` | Ver Proveedores |
| `menu_clientes` | Ver sección Clientes |
| `menu_lista_clientes` | Ver Lista de Clientes |
| `menu_mis_cotizaciones` | Ver Mis Cotizaciones |
| `menu_mis_ventas` | Ver Mis Ventas |
| `menu_contabilidad` | Ver sección Contabilidad |
| `menu_solicitudes_pago` | Ver Solicitudes de Pago |
| `menu_pagos_pendientes` | Ver Pagos Pendientes |
| `menu_historico_pagos` | Ver Histórico de Pagos |
| `menu_productos` | Ver sección Productos |
| `menu_paquetes` | Ver Paquetes |
| `menu_hoteles` | Ver Hoteles |
| `menu_tours` | Ver Tours |

---

## 🎨 Gestión de Roles Personalizados

### Creación de Roles Personalizados

Los administradores de agencia pueden crear roles personalizados con permisos específicos:

#### 1. **Acceso a la Gestión**
- Ir a **Administración** → **Mi Agencia** → **Gestión de Roles**
- Hacer clic en **"Crear Rol Personalizado"**

#### 2. **Configuración del Rol**
- **Nombre del Rol**: Identificador único
- **Descripción**: Descripción detallada del rol
- **Permisos**: Selección granular de permisos por categoría

#### 3. **Asignación de Permisos**
- **Seleccionar Todos**: Asignar todos los permisos de una categoría
- **Limpiar Todos**: Remover todos los permisos de una categoría
- **Selección Individual**: Permisos específicos por necesidad

#### 4. **Asignación a Usuarios**
- Los roles personalizados se pueden asignar a usuarios de la agencia
- Un usuario puede tener múltiples roles
- Los permisos se combinan (unión) entre roles

---

## 🔧 Implementación Técnica

### Archivos Principales

#### 1. **Seeders**
```
database/seeders/
├── PermissionCategoriesSeeder.php      # Categorías de permisos
├── DynamicPermissionsSeeder.php        # Permisos funcionales
├── MenuPermissionsSeeder.php          # Permisos de menú
└── GlobalSystemRolesSeeder.php        # Roles globales
```

#### 2. **Modelos**
```
app/Models/
├── Agency.php                         # Gestión de roles personalizados
└── User.php                          # Relaciones con roles
```

#### 3. **Helpers**
```
app/Helpers/
└── SidebarPermissionHelper.php        # Control de visibilidad del menú
```

#### 4. **Livewire Components**
```
app/Livewire/Agency/
└── RoleManagement.php                 # Gestión de roles personalizados
```

### Base de Datos

#### Tablas Principales
- `roles`: Roles del sistema
- `permissions`: Permisos disponibles
- `permission_categories`: Categorías de permisos
- `role_has_permissions`: Relación roles-permisos
- `model_has_roles`: Relación usuarios-roles

#### Campos Importantes
```sql
-- roles
id, name, description, color, is_system_role, agency_id, is_active

-- permissions  
id, name, description, category_id, icon, is_active

-- permission_categories
id, name, slug, description, icon, color, sort_order
```

---

## 📖 Guía de Uso

### Para Administradores de Agencia

#### 1. **Crear un Rol Personalizado**
```php
// Ejemplo: Rol "Asesor Senior"
$role = $agency->createCustomRole(
    'Asesor Senior',
    'Asesor con permisos avanzados de ventas',
    [1, 5, 8, 12, 15] // IDs de permisos específicos
);
```

#### 2. **Asignar Rol a Usuario**
```php
$user->assignRole('Asesor Senior');
```

#### 3. **Verificar Permisos**
```php
if ($user->can('ver ventas')) {
    // Mostrar sección de ventas
}
```

### Para Desarrolladores

#### 1. **Verificar Permisos en Blade**
```blade
@can('ver clientes')
    <a href="/clientes">Ver Clientes</a>
@endcan
```

#### 2. **Verificar Permisos en Controladores**
```php
public function index()
{
    $this->authorize('ver clientes');
    // Lógica del controlador
}
```

#### 3. **Verificar Permisos en Livewire**
```php
public function mount()
{
    if (!auth()->user()->can('ver ventas')) {
        abort(403);
    }
}
```

---

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. **Los permisos no se reflejan inmediatamente**
**Solución:**
```bash
php artisan permission:cache-reset
```

#### 2. **El menú no muestra las opciones correctas**
**Verificar:**
- El usuario tiene el rol asignado
- El rol tiene los permisos de menú necesarios
- El cache de permisos está limpio

#### 3. **Error al crear roles personalizados**
**Verificar:**
- El usuario tiene permisos de gestión de roles
- Los permisos seleccionados existen en la BD
- No hay conflictos de nombres

#### 4. **Los roles globales no tienen permisos**
**Solución:**
```bash
php artisan db:seed --class=GlobalSystemRolesSeeder
```

### Comandos Útiles

```bash
# Limpiar cache de permisos
php artisan permission:cache-reset

# Ejecutar seeders específicos
php artisan db:seed --class=GlobalSystemRolesSeeder
php artisan db:seed --class=DynamicPermissionsSeeder

# Ver roles y permisos en tinker
php artisan tinker
>>> \Spatie\Permission\Models\Role::with('permissions')->get();
```

---

## 📊 Resumen de Roles

| Rol | Color | Permisos | Restricciones |
|-----|-------|----------|---------------|
| **Administrador** | 🔴 Rojo | Todos | Ninguna |
| **Supervisor** | 🟢 Verde | Casi todos | Mi Agencia, Gestión Roles, Oficinas |
| **Vendedor** | 🔵 Azul | Ventas + Clientes | Contabilidad, Productos |
| **Contabilidad** | 🟠 Naranja | Financiero + Clientes (lectura) | Editar clientes |
| **Recursos Humanos** | 🟣 Púrpura | Administración | Proveedores |

---

## 🎯 Mejores Prácticas

### 1. **Principio de Menor Privilegio**
- Asignar solo los permisos necesarios
- Revisar regularmente los permisos asignados

### 2. **Nomenclatura Consistente**
- Usar nombres descriptivos para roles personalizados
- Seguir convenciones de nomenclatura

### 3. **Documentación**
- Documentar roles personalizados creados
- Mantener registro de cambios

### 4. **Testing**
- Probar permisos después de cambios
- Verificar que las restricciones funcionen

---

**📝 Documentación generada automáticamente**  
**🕒 Última actualización:** {{ date('Y-m-d H:i:s') }}  
**👨‍💻 Sistema CRM - Versión 1.0**
