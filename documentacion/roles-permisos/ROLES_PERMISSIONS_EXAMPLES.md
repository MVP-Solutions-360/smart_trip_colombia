# Ejemplos de Uso - Sistema de Roles y Permisos

## 🎯 Casos de Uso Comunes

### 1. Agencia de Viajes Pequeña (5-10 empleados)

#### Estructura de Roles Sugerida
```
┌─────────────────────────────────────────────────────────────┐
│                    ROLES RECOMENDADOS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ADMINISTRADOR│  │  VENDEDOR   │  │  ASISTENTE  │
│             │  │             │  │             │
│ - Acceso    │  │ - Crear     │  │ - Leer      │
│   completo  │  │   cotizac.  │  │   clientes  │
│ - Configura │  │ - Gestionar │  │ - Crear     │
│   sistema   │  │   clientes  │  │   tareas    │
│ - Reportes  │  │ - Seguim.   │  │ - Admin.    │
│             │  │   ventas    │  │   básica    │
└─────────────┘  └─────────────┘  └─────────────┘
```

#### Permisos por Rol

**Administrador**
- ✅ Todas las categorías de permisos
- ✅ Configuración del sistema
- ✅ Gestión de usuarios y roles
- ✅ Reportes y análisis

**Vendedor**
- ✅ Clientes: Crear, Leer, Actualizar
- ✅ Cotizaciones: Crear, Leer, Actualizar
- ✅ Ventas: Crear, Leer
- ❌ Configuración del sistema
- ❌ Gestión de usuarios

**Asistente**
- ✅ Clientes: Leer
- ✅ Tareas: Crear, Leer, Actualizar
- ✅ Cotizaciones: Leer
- ❌ Eliminar registros
- ❌ Configuración

### 2. Agencia de Viajes Mediana (20-50 empleados)

#### Estructura de Roles Sugerida
```
┌─────────────────────────────────────────────────────────────┐
│                    ROLES RECOMENDADOS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   DIRECTOR  │  │   GERENTE   │  │ SUPERVISOR  │  │  VENDEDOR   │
│             │  │             │  │             │  │             │
│ - Acceso    │  │ - Gestión   │  │ - Supervisión│  │ - Ventas    │
│   completo  │  │   equipos   │  │   operaciones│  │ - Clientes  │
│ - Estrategia│  │ - Reportes  │  │ - Control   │  │ - Cotizac.  │
│ - Decisiones│  │ - Análisis  │  │   calidad   │  │ - Seguim.   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ COORDINADOR │  │  ASISTENTE  │  │  RECEPCION  │
│             │  │             │  │             │
│ - Coordin.  │  │ - Admin.    │  │ - Atención  │
│   servicios │  │   básica    │  │   clientes  │
│ - Logística │  │ - Tareas    │  │ - Información│
│ - Proveed.  │  │   apoyo     │  │ - Agenda    │
└─────────────┘  └─────────────┘  └─────────────┘
```

#### Permisos Detallados

**Director**
- ✅ Acceso completo a todas las funcionalidades
- ✅ Configuración estratégica
- ✅ Reportes ejecutivos
- ✅ Gestión de roles y permisos

**Gerente**
- ✅ Gestión de personal
- ✅ Reportes de ventas y operaciones
- ✅ Configuración operativa
- ✅ Supervisión de equipos
- ❌ Configuración del sistema

**Supervisor**
- ✅ Supervisión de operaciones
- ✅ Control de calidad
- ✅ Reportes de equipo
- ✅ Gestión de tareas
- ❌ Configuración de roles

**Vendedor**
- ✅ Clientes: CRUD completo
- ✅ Cotizaciones: CRUD completo
- ✅ Ventas: Crear, Leer, Actualizar
- ✅ Seguimiento de clientes
- ❌ Eliminar registros importantes

**Coordinador**
- ✅ Servicios: CRUD completo
- ✅ Proveedores: CRUD completo
- ✅ Logística: Gestión completa
- ✅ Paquetes: CRUD completo
- ❌ Gestión de usuarios

**Asistente**
- ✅ Tareas: CRUD completo
- ✅ Clientes: Leer, Actualizar
- ✅ Cotizaciones: Leer
- ✅ Documentos: Gestión básica
- ❌ Operaciones críticas

**Recepcion**
- ✅ Clientes: Leer, Crear
- ✅ Tareas: Leer, Crear
- ✅ Agenda: Gestión completa
- ✅ Información: Consulta
- ❌ Operaciones de venta

### 3. Agencia de Viajes Corporativa (50+ empleados)

#### Estructura de Roles Sugerida
```
┌─────────────────────────────────────────────────────────────┐
│                    ROLES RECOMENDADOS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│     CEO     │  │     CFO     │  │   DIRECTOR  │  │   MANAGER   │
│             │  │             │  │ OPERACIONES │  │   CUENTAS   │
│ - Estrategia│  │ - Finanzas  │  │ - Operaciones│  │ - Clientes  │
│ - Visión    │  │ - Reportes  │  │ - Procesos  │  │   corporat. │
│ - Decisiones│  │ - Análisis  │  │ - Eficiencia│  │ - Relaciones│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ SUPERVISOR  │  │ VENDEDOR SR │  │ VENDEDOR JR │  │ COORDINADOR │
│   VENTAS    │  │             │  │             │  │             │
│ - Equipo    │  │ - Ventas    │  │ - Ventas    │  │ - Servicios │
│   ventas    │  │   complejas │  │   básicas   │  │ - Logística │
│ - Metas     │  │ - Corporat. │  │ - Individual│  │ - Proveed.  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   ANALISTA  │  │  ASISTENTE  │  │   RECEPCION │
│             │  │             │  │             │
│ - Reportes  │  │ - Admin.    │  │ - Atención  │
│ - Datos     │  │   ejecutiva │  │   clientes  │
│ - Análisis  │  │ - Tareas    │  │ - Información│
└─────────────┘  └─────────────┘  └─────────────┘
```

## 🛠️ Configuraciones Específicas por Industria

### Agencia de Viajes de Lujo

#### Rol: "Concierge de Lujo"
```
Permisos Específicos:
- Clientes VIP: Acceso completo
- Servicios Premium: Gestión completa
- Reservas Especiales: Crear, modificar
- Atención Personalizada: Herramientas avanzadas
- Reportes de Satisfacción: Acceso completo
```

#### Rol: "Especialista en Destinos"
```
Permisos Específicos:
- Paquetes: CRUD completo
- Destinos: Gestión completa
- Tours: Crear, modificar
- Información Turística: Actualizar
- Precios Especiales: Configurar
```

### Agencia de Viajes Corporativos

#### Rol: "Manager de Cuentas Corporativas"
```
Permisos Específicos:
- Clientes Corporativos: Acceso completo
- Contratos: Gestión completa
- Viajes de Negocios: Coordinación
- Reportes Ejecutivos: Generar
- Presupuestos: Aprobar
```

#### Rol: "Coordinador de Viajes"
```
Permisos Específicos:
- Reservas Corporativas: Gestión completa
- Logística: Coordinación
- Proveedores: Negociación
- Seguimiento: Monitoreo completo
- Documentación: Gestión
```

### Agencia de Viajes de Aventura

#### Rol: "Guía de Aventura"
```
Permisos Específicos:
- Tours de Aventura: Gestión completa
- Equipamiento: Control de inventario
- Seguridad: Protocolos
- Clientes Aventureros: Atención especializada
- Experiencias: Crear, modificar
```

## 📋 Ejemplos de Configuración Paso a Paso

### Ejemplo 1: Crear Rol "Vendedor Senior"

#### Paso 1: Acceder a Gestión de Roles
1. Ir a Sidebar → Administración → Gestión de Roles
2. Hacer clic en "Crear Rol"

#### Paso 2: Configurar Información Básica
```
Nombre del Rol: Vendedor Senior
Descripción: Vendedor con experiencia que maneja clientes importantes y ventas complejas
Color: #10B981 (Verde)
Estado: ☑ Activo
```

#### Paso 3: Asignar Permisos
```
Categoría: Clientes
☑ Crear clientes
☑ Leer clientes
☑ Actualizar clientes
☑ Eliminar clientes

Categoría: Cotizaciones
☑ Crear cotizaciones
☑ Leer cotizaciones
☑ Actualizar cotizaciones
☑ Eliminar cotizaciones

Categoría: Ventas
☑ Crear ventas
☑ Leer ventas
☑ Actualizar ventas
☑ Reportes de ventas

Categoría: Servicios
☑ Crear servicios
☑ Leer servicios
☑ Actualizar servicios
☑ Gestionar proveedores
```

#### Paso 4: Guardar Rol
- Hacer clic en "Crear Rol"
- El sistema valida y crea el rol
- Aparece en la sección "Roles Personalizados"

### Ejemplo 2: Crear Rol "Coordinador de Eventos"

#### Paso 1: Información Básica
```
Nombre del Rol: Coordinador de Eventos
Descripción: Especialista en organización de eventos corporativos y grupales
Color: #8B5CF6 (Púrpura)
Estado: ☑ Activo
```

#### Paso 2: Permisos Específicos
```
Categoría: Servicios
☑ Crear servicios
☑ Leer servicios
☑ Actualizar servicios
☑ Gestionar proveedores
☑ Coordinar eventos

Categoría: Clientes
☑ Crear clientes
☑ Leer clientes
☑ Actualizar clientes
☑ Clientes corporativos

Categoría: Paquetes
☑ Crear paquetes
☑ Leer paquetes
☑ Actualizar paquetes
☑ Paquetes grupales

Categoría: Pagos
☑ Leer pagos
☑ Reportes de pagos
☑ Seguimiento de pagos
```

## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Nuevo Empleado
```
1. Administrador crea usuario
2. Asigna rol según posición
3. Usuario recibe permisos automáticamente
4. Puede acceder a funciones permitidas
5. Supervisor puede modificar permisos si es necesario
```

### Flujo 2: Promoción de Empleado
```
1. Administrador identifica cambio de rol
2. Edita usuario existente
3. Cambia rol a nueva posición
4. Sistema actualiza permisos automáticamente
5. Usuario tiene acceso a nuevas funciones
```

### Flujo 3: Cambio Temporal de Permisos
```
1. Supervisor necesita acceso temporal
2. Administrador edita rol existente
3. Agrega permisos específicos
4. Usuario puede realizar tareas adicionales
5. Al finalizar, se revierten los permisos
```

## 📊 Métricas y Reportes Útiles

### Reporte 1: Distribución de Roles
```
┌─────────────────────────────────────────────────────────────┐
│                DISTRIBUCIÓN DE ROLES POR AGENCIA            │
└─────────────────────────────────────────────────────────────┘

Agencia: Viajes del Caribe
┌─────────────┬─────────────┬─────────────┬─────────────┐
│    ROL      │   USUARIOS  │   ACTIVOS   │  INACTIVOS  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│Administrador│      2      │      2      │      0      │
│Gerente      │      3      │      3      │      0      │
│Vendedor     │      8      │      7      │      1      │
│Asistente    │      4      │      4      │      0      │
│Recepcion    │      2      │      2      │      0      │
└─────────────┴─────────────┴─────────────┴─────────────┘
Total: 19 usuarios
```

### Reporte 2: Uso de Permisos
```
┌─────────────────────────────────────────────────────────────┐
│                   PERMISOS MÁS UTILIZADOS                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│  PERMISO    │   CATEGORÍA │   USUARIOS  │   FRECUENCIA│
├─────────────┼─────────────┼─────────────┼─────────────┤
│Leer clientes│  Clientes   │     15      │    Alta     │
│Crear cotiz. │Cotizaciones │     12      │    Alta     │
│Leer ventas  │   Ventas    │     10      │   Media     │
│Gestionar    │  Servicios  │      8      │   Media     │
│proveedores  │             │             │             │
│Configurar   │Configuración│      3      │    Baja     │
│sistema      │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 🚨 Casos de Uso Especiales

### Caso 1: Empleado con Múltiples Roles
```
Situación: Un empleado es vendedor y también coordina eventos
Solución: Crear rol híbrido "Vendedor-Coordinador"
Permisos: Combinación de ambos roles
Beneficio: Un solo rol con todos los permisos necesarios
```

### Caso 2: Acceso Temporal
```
Situación: Supervisor necesita acceso a reportes por 1 mes
Solución: Editar rol temporalmente
Proceso: Agregar permisos → Usar → Remover permisos
Registro: Documentar cambio y fecha de reversión
```

### Caso 3: Rol por Proyecto
```
Situación: Proyecto especial requiere permisos específicos
Solución: Crear rol temporal "Proyecto Especial"
Permisos: Solo los necesarios para el proyecto
Duración: Definida con fecha de expiración
```

## 🔧 Mantenimiento y Mejores Prácticas

### Revisión Periódica de Roles
```
Frecuencia: Trimestral
Proceso:
1. Revisar roles inactivos
2. Verificar permisos no utilizados
3. Actualizar descripciones
4. Limpiar roles obsoletos
5. Documentar cambios
```

### Auditoría de Seguridad
```
Frecuencia: Mensual
Verificaciones:
1. Usuarios con permisos excesivos
2. Roles sin usuarios asignados
3. Permisos críticos mal asignados
4. Accesos temporales no revocados
5. Cambios no autorizados
```

### Backup de Configuraciones
```
Frecuencia: Semanal
Incluir:
1. Configuración de roles
2. Asignaciones de permisos
3. Usuarios y sus roles
4. Historial de cambios
5. Documentación actualizada
```

---

**Nota**: Estos ejemplos son guías generales. Cada agencia debe adaptar los roles y permisos según sus necesidades específicas y estructura organizacional.
