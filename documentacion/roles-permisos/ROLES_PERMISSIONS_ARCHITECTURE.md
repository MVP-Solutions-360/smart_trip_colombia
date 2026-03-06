# Arquitectura del Sistema de Roles y Permisos

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE ROLES Y PERMISOS                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AGENCIAS      │    │   USUARIOS      │    │   OFICINAS      │
│                 │    │                 │    │                 │
│ - ID            │    │ - ID            │    │ - ID            │
│ - Nombre        │    │ - Nombre        │    │ - Nombre        │
│ - Slug          │    │ - Email         │    │ - Slug          │
│ - Descripción   │    │ - Agency ID     │    │ - Agency ID     │
└─────────────────┘    │ - Office ID     │    └─────────────────┘
         │              └─────────────────┘             │
         │                       │                      │
         │              ┌─────────────────┐             │
         │              │   PERSONNEL     │             │
         │              │                 │             │
         │              │ - ID            │             │
         │              │ - User ID       │             │
         │              │ - Office ID     │             │
         │              │ - Agency ID     │             │
         │              └─────────────────┘             │
         │                       │                      │
         └───────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      ROLES      │
                    │                 │
                    │ - ID            │
                    │ - Name          │
                    │ - Agency ID     │
                    │ - Description   │
                    │ - Color         │
                    │ - Is System     │
                    │ - Is Active     │
                    │ - Sort Order    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PERMISSIONS   │
                    │                 │
                    │ - ID            │
                    │ - Name          │
                    │ - Category ID   │
                    │ - Description   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   CATEGORIES    │
                    │                 │
                    │ - ID            │
                    │ - Name          │
                    │ - Description   │
                    │ - Sort Order    │
                    └─────────────────┘
```

## Flujo de Datos

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USUARIO   │───▶│   AGENCIA   │───▶│    ROLES    │
│             │    │             │    │             │
│ - Login     │    │ - Filtro    │    │ - Asignados │
│ - Auth      │    │ - Scope     │    │ - Activos   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   ▼
       │                   │          ┌─────────────┐
       │                   │          │ PERMISSIONS │
       │                   │          │             │
       │                   │          │ - Por Rol   │
       │                   │          │ - Por Cat.  │
       │                   │          └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│   ACCESO    │    │  INTERFAZ   │
│             │    │             │
│ - Permitido │    │ - Livewire  │
│ - Denegado  │    │ - Modales   │
└─────────────┘    │ - Forms     │
                   └─────────────┘
```

## Relaciones de Base de Datos

```
AGENCIES (1) ──────── (N) ROLES
    │                      │
    │                      │
    ▼                      ▼
USUARIOS (N) ──────── (N) ROLES (Many-to-Many)
    │                      │
    │                      │
    ▼                      ▼
PERSONNEL (1)         PERMISSIONS (N) ──── (1) CATEGORIES
    │                      │
    │                      │
    ▼                      ▼
OFFICES (1)           MODEL_HAS_ROLES (Pivot Table)
```

## Jerarquía de Permisos

```
┌─────────────────────────────────────────────────────────────┐
│                    CATEGORÍAS DE PERMISOS                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  AGENCIAS   │  │  OFICINAS   │  │  PERSONAL   │  │  USUARIOS   │
│             │  │             │  │             │  │             │
│ - Crear     │  │ - Crear     │  │ - Crear     │  │ - Crear     │
│ - Leer      │  │ - Leer      │  │ - Leer      │  │ - Leer      │
│ - Actualizar│  │ - Actualizar│  │ - Actualizar│  │ - Actualizar│
│ - Eliminar  │  │ - Eliminar  │  │ - Eliminar  │  │ - Eliminar  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ROLES Y     │  │CONFIGURACIÓN│  │  CLIENTES   │  │ COTIZACIONES│
│ PERMISOS    │  │             │  │             │  │             │
│             │  │ - Sistema   │  │ - Crear     │  │ - Crear     │
│ - Crear     │  │ - Ajustes   │  │ - Leer      │  │ - Leer      │
│ - Leer      │  │ - Reportes  │  │ - Actualizar│  │ - Actualizar│
│ - Actualizar│  │ - Backup    │  │ - Eliminar  │  │ - Eliminar  │
│ - Eliminar  │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   VENTAS    │  │   PAGOS     │  │  SERVICIOS  │  │  PAQUETES   │
│             │  │             │  │             │  │             │
│ - Crear     │  │ - Crear     │  │ - Crear     │  │ - Crear     │
│ - Leer      │  │ - Leer      │  │ - Leer      │  │ - Leer      │
│ - Actualizar│  │ - Actualizar│  │ - Actualizar│  │ - Actualizar│
│ - Eliminar  │  │ - Eliminar  │  │ - Eliminar  │  │ - Eliminar  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Tipos de Roles

```
┌─────────────────────────────────────────────────────────────┐
│                      ROLES DEL SISTEMA                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ADMINISTRADOR│  │   GERENTE   │  │ SUPERVISOR  │  │  VENDEDOR   │
│             │  │             │  │             │  │             │
│ - Acceso    │  │ - Gestión   │  │ - Supervisión│  │ - Ventas    │
│   completo  │  │   equipos   │  │   operaciones│  │ - Clientes  │
│ - Configura │  │ - Reportes  │  │ - Control   │  │ - Cotizac.  │
│   sistema   │  │ - Análisis  │  │   calidad   │  │ - Seguim.   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐
│  ASISTENTE  │
│             │
│ - Tareas    │
│   apoyo     │
│ - Admin.    │
│   básica    │
└─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ROLES PERSONALIZADOS                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   CREADOS   │  │   POR LA    │  │   AGENCIA   │  │ SEGÚN SUS   │
│             │  │             │  │             │  │             │
│ - Nombres   │  │ - Necesidades│  │ - Estructura│  │ - Procesos  │
│   únicos    │  │   específicas│  │   organizac.│  │   internos  │
│ - Colores   │  │ - Permisos  │  │ - Jerarquía │  │ - Flujos    │
│   personal. │  │   custom    │  │   personal  │  │   trabajo   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Flujo de Autenticación y Autorización

```
┌─────────────┐
│   USUARIO   │
│   LOGIN     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AUTENTICAR │
│   USUARIO   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OBTENER    │
│   AGENCIA   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  FILTRAR    │
│   ROLES     │
│  POR AGENCIA│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OBTENER    │
│ PERMISOS    │
│  DEL ROL    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VERIFICAR  │
│  PERMISO    │
│  ESPECÍFICO │
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│   PERMITIR  │    │   DENEGAR   │
│   ACCESO    │    │   ACCESO    │
└─────────────┘    └─────────────┘
```

## Componentes de la Interfaz

```
┌─────────────────────────────────────────────────────────────┐
│                INTERFAZ DE GESTIÓN DE ROLES                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        HEADER                               │
│  - Título: "Gestión de Roles - {Agencia}"                  │
│  - Descripción: "Administra los roles y permisos..."       │
│  - Botón: "Crear Rol"                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BREADCRUMBS                            │
│  Dashboard > {Agencia} > Gestión de Roles                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ROLES DEL SISTEMA                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Administrador│  │   Gerente   │  │ Supervisor  │         │
│  │ [Editar]     │  │ [Editar]    │  │ [Editar]    │         │
│  │ [Permisos]   │  │ [Permisos]  │  │ [Permisos]  │         │
│  │ [Usuarios]   │  │ [Usuarios]  │  │ [Usuarios]  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   ROLES PERSONALIZADOS                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Vendedor Sr │  │ Coordinador │  │ Asistente   │         │
│  │ [Editar]    │  │ [Editar]    │  │ [Editar]    │         │
│  │ [Permisos]  │  │ [Permisos]  │  │ [Permisos]  │         │
│  │ [Usuarios]  │  │ [Usuarios]  │  │ [Usuarios]  │         │
│  │ [Eliminar]  │  │ [Eliminar]  │  │ [Eliminar]  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Modales del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    MODAL CREAR/EDITAR ROL                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Nombre del Rol: [________________]                         │
│  Descripción:    [________________]                         │
│                  [________________]                         │
│  Color:          [■] #3B82F6                               │
│  Estado:         ☑ Rol activo                              │
│                                                             │
│                    [Cancelar]  [Crear Rol]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MODAL GESTIONAR PERMISOS                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [Seleccionar Todos]  [Limpiar Todos]                      │
│                                                             │
│  ┌─ AGENCIAS ─────────────────────────────────────────────┐ │
│  │ ☑ Crear agencias    ☑ Leer agencias                   │ │
│  │ ☑ Actualizar agenc. ☑ Eliminar agencias               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ OFICINAS ─────────────────────────────────────────────┐ │
│  │ ☑ Crear oficinas    ☑ Leer oficinas                   │ │
│  │ ☑ Actualizar ofic.  ☑ Eliminar oficinas               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Cancelar]  [Actualizar Permisos]       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MODAL VER USUARIOS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 Juan Pérez          juan@agencia.com                │ │
│  │    Oficina Central                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 👤 María García        maria@agencia.com                │ │
│  │    Oficina Norte                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                            [Cerrar]                        │
└─────────────────────────────────────────────────────────────┘
```

## Estados y Transiciones

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREAR     │───▶│   ACTIVO    │───▶│  INACTIVO   │
│   ROL       │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EDITAR    │    │  ASIGNAR    │    │  REACTIVAR  │
│   ROL       │    │ PERMISOS    │    │    ROL      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  ELIMINAR   │    │  VER USUARIOS│   │   ACTIVO    │
│   ROL       │    │   ASIGNADOS │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

**Nota**: Este diagrama representa la arquitectura actual del sistema de roles y permisos dinámicos implementado en el CRM.
