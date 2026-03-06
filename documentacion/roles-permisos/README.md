# Roles y Permisos

## 📋 Descripción General

Esta sección contiene toda la documentación relacionada con el sistema de roles y permisos del CRM. Incluye la arquitectura del sistema, implementación, ejemplos de uso y troubleshooting.

## 🎯 Contenido de la Sección

- ✅ **Sistema de roles y permisos** completo
- ✅ **Arquitectura del sistema** de autorización
- ✅ **Implementación** y configuración
- ✅ **Ejemplos de uso** y casos prácticos
- ✅ **Troubleshooting** y solución de problemas
- ✅ **Diagramas** del sistema
- ✅ **API** para gestión de roles

## 📁 Archivos de Documentación

### 📖 [Documentación Principal](ROLES_PERMISOS_DOCUMENTACION.md)
**Archivo**: `ROLES_PERMISOS_DOCUMENTACION.md`

**Contenido**:
- Introducción al sistema de roles y permisos
- Arquitectura del sistema
- Implementación y configuración
- Casos de uso y ejemplos
- Troubleshooting y solución de problemas

### 🏗️ [Arquitectura](ROLES_PERMISSIONS_ARCHITECTURE.md)
**Archivo**: `ROLES_PERMISSIONS_ARCHITECTURE.md`

**Contenido**:
- Arquitectura del sistema de roles
- Modelos y relaciones
- Middleware de autorización
- Patrones de diseño utilizados

### 💻 [Ejemplos de Código](ROLES_PERMISSIONS_EXAMPLES.md)
**Archivo**: `ROLES_PERMISSIONS_EXAMPLES.md`

**Contenido**:
- Ejemplos de implementación
- Casos de uso prácticos
- Código de ejemplo
- Mejores prácticas

### 🔗 [API](ROLES_PERMISSIONS_API.md)
**Archivo**: `ROLES_PERMISSIONS_API.md`

**Contenido**:
- Endpoints de la API
- Autenticación y autorización
- Ejemplos de uso
- Documentación de respuestas

### 🏗️ [Diagramas](ROLES_PERMISOS_DIAGRAMA.md)
**Archivo**: `ROLES_PERMISOS_DIAGRAMA.md`

**Contenido**:
- Diagramas de arquitectura
- Flujos de autorización
- Diagramas de base de datos
- Diagramas de componentes

### 🔧 [Sistema](ROLES_PERMISSIONS_SYSTEM.md)
**Archivo**: `ROLES_PERMISSIONS_SYSTEM.md`

**Contenido**:
- Configuración del sistema
- Instalación y setup
- Configuración de permisos
- Mantenimiento del sistema

### 🛠️ [Troubleshooting](ROLES_PERMISSIONS_TROUBLESHOOTING.md)
**Archivo**: `ROLES_PERMISSIONS_TROUBLESHOOTING.md`

**Contenido**:
- Problemas comunes
- Soluciones paso a paso
- Logs y debugging
- Mejores prácticas

### 📊 [Resumen Ejecutivo](RESUMEN_EJECUTIVO_ROLES.md)
**Archivo**: `RESUMEN_EJECUTIVO_ROLES.md`

**Contenido**:
- Resumen ejecutivo del sistema
- Estadísticas y métricas
- Beneficios del sistema
- Recomendaciones

## 🚀 Inicio Rápido

### 1. Configurar Roles
```php
// Crear rol
$role = Role::create([
    'name' => 'admin',
    'display_name' => 'Administrador',
    'description' => 'Acceso completo al sistema'
]);

// Asignar permisos
$role->givePermissionTo(['create-users', 'edit-users', 'delete-users']);
```

### 2. Asignar Roles a Usuarios
```php
// Asignar rol a usuario
$user->assignRole('admin');

// Verificar permisos
if ($user->can('create-users')) {
    // Usuario puede crear usuarios
}
```

### 3. Usar en Middleware
```php
// En rutas
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Rutas solo para administradores
});

// En controladores
public function __construct()
{
    $this->middleware('permission:create-users');
}
```

## 🔧 Características del Sistema

### Roles Principales
- **Super Admin**: Acceso completo al sistema
- **Admin**: Administración de agencia
- **Manager**: Gestión de equipos
- **Agent**: Agente de viajes
- **Client**: Cliente del sistema

### Permisos por Módulo
- **Usuarios**: create, read, update, delete
- **Clientes**: create, read, update, delete
- **Servicios**: create, read, update, delete
- **Reportes**: read, export
- **Configuración**: read, update

## 📊 Estadísticas del Sistema

- **5 roles principales** implementados
- **50+ permisos** específicos
- **4 módulos** con control de acceso
- **Middleware** de autorización
- **API completa** para gestión

## 🔗 Enlaces Útiles

- [Documentación Principal](ROLES_PERMISOS_DOCUMENTACION.md)
- [Arquitectura](ROLES_PERMISSIONS_ARCHITECTURE.md)
- [Ejemplos de Código](ROLES_PERMISSIONS_EXAMPLES.md)
- [API](ROLES_PERMISSIONS_API.md)
- [Diagramas](ROLES_PERMISOS_DIAGRAMA.md)
- [Sistema](ROLES_PERMISSIONS_SYSTEM.md)
- [Troubleshooting](ROLES_PERMISSIONS_TROUBLESHOOTING.md)
- [Resumen Ejecutivo](RESUMEN_EJECUTIVO_ROLES.md)
- [Documentación General](../README.md)

## 📝 Notas de Desarrollo

### Características Técnicas
- **Laravel Spatie**: Paquete de roles y permisos
- **Middleware**: Autorización en rutas
- **Gates**: Autorización en lógica de negocio
- **Policies**: Autorización en modelos

### Mejores Prácticas
- Usar roles para grupos de permisos
- Usar permisos para acciones específicas
- Implementar middleware en rutas
- Verificar permisos en controladores

---

*Documentación de Roles y Permisos - Septiembre 2025*
