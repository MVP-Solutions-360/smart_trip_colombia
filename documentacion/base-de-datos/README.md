# 📊 Documentación de Base de Datos - CRM AMS365

## 🎯 Resumen Ejecutivo

Esta documentación proporciona una visión completa de la estructura de base de datos del CRM AMS365, un sistema multitenant para la gestión de agencias de viajes y servicios turísticos.

## 📁 Archivos de Documentación

### 📋 [ESTRUCTURA_BASE_DATOS_CRM.md](./ESTRUCTURA_BASE_DATOS_CRM.md)
Documentación completa y detallada que incluye:
- **47 tablas principales** con estructura completa
- **Campos y tipos de datos** para cada tabla
- **Restricciones y claves** (primarias, foráneas, únicas)
- **Relaciones entre tablas** (1:1, 1:N, N:N)
- **Modelos Eloquent** con mapeo de relaciones
- **Consideraciones técnicas** y mejores prácticas

### 📊 [DIAGRAMAS_RELACIONES.md](./DIAGRAMAS_RELACIONES.md)
Diagramas visuales que incluyen:
- **Diagrama principal de entidades** con todos los campos
- **Relaciones principales** entre tablas
- **Arquitectura multitenant** de separación de datos
- **Flujo de ventas** completo
- **Servicios turísticos** y sus relaciones
- **Sistema de permisos** con Spatie Permission
- **Estados de solicitudes** y flujos de trabajo
- **Flujo de notificaciones** del sistema

## 🏗️ Arquitectura del Sistema

### Principios de Diseño
- ✅ **Multitenancy**: Separación completa de datos por tenant
- ✅ **Soft Deletes**: Eliminación lógica para preservar integridad
- ✅ **Auditoría**: Trazabilidad completa de cambios
- ✅ **Escalabilidad**: Diseño modular y extensible
- ✅ **Seguridad**: Sistema robusto de roles y permisos

### Tecnologías Utilizadas
- **Laravel 11**: Framework PHP moderno
- **MySQL/MariaDB**: Motor de base de datos relacional
- **Eloquent ORM**: Mapeo objeto-relacional
- **Spatie Permission**: Gestión avanzada de permisos
- **Laravel Sanctum**: Autenticación API segura

## 📊 Estadísticas del Sistema

| Métrica | Valor |
|---------|-------|
| **Total de Tablas** | 47 |
| **Total de Migraciones** | 54 |
| **Total de Modelos** | 47 |
| **Total de Seeders** | 11 |
| **Total de Factories** | 12 |
| **Tablas con Soft Delete** | 3 |
| **Tablas con JSON Fields** | 8 |
| **Relaciones Many-to-Many** | 6 |

## 🔗 Entidades Principales

### 1. **Gestión Multitenant**
- `tenants` - Organizaciones principales
- `agencies` - Agencias de viajes
- `offices` - Oficinas de agencias

### 2. **Usuarios y Permisos**
- `users` - Usuarios del sistema
- `personnels` - Personal de agencias
- `roles` - Roles del sistema
- `permissions` - Permisos granulares

### 3. **Clientes y Ventas**
- `clients` - Clientes de las agencias
- `requests` - Solicitudes de servicios
- `sales` - Ventas realizadas

### 4. **Sistema de Pagos**
- `client_payments` - Pagos de clientes
- `provider_payments` - Pagos a proveedores
- `payment_requests` - Solicitudes de pago

### 5. **Servicios Turísticos**
- `packages` - Paquetes turísticos
- `tours` - Tours y excursiones
- `hotels` - Hoteles y alojamientos
- `airline_tickets` - Tiquetes aéreos
- `hotel_reserves` - Reservas de hoteles
- `transfer_reserves` - Reservas de traslados
- `medical_assist_reserves` - Reservas de asistencia médica

### 6. **Gestión Operativa**
- `tasks` - Tareas y seguimiento
- `observations` - Observaciones del sistema
- `notifications` - Notificaciones
- `documents` - Documentos adjuntos

## 🔄 Flujos Principales

### Flujo de Ventas
1. **Cliente** crea una **Solicitud**
2. **Asesor** genera **Cotización**
3. **Cliente** aprueba y se crea **Venta**
4. Se procesan **Pagos de Cliente**
5. Se realizan **Pagos a Proveedores**
6. Se calculan **Comisiones**

### Flujo de Servicios
1. **Agencia** crea **Paquetes/Tours/Hoteles**
2. **Cliente** solicita servicios específicos
3. Se generan **Reservas** correspondientes
4. Se procesan **Pagos** y **Comisiones**

## 🛠️ Uso de la Documentación

### Para Desarrolladores
- Consultar estructura de tablas antes de crear nuevas funcionalidades
- Entender relaciones para optimizar consultas
- Revisar modelos Eloquent para implementar correctamente

### Para Administradores
- Comprender la arquitectura multitenant
- Entender el flujo de datos y procesos
- Planificar backups y mantenimiento

### Para Analistas
- Analizar métricas y reportes
- Entender el flujo de ventas
- Optimizar procesos de negocio

## 🔧 Mantenimiento

### Backup Recomendado
- **Frecuencia**: Diaria
- **Retención**: 30 días mínimo
- **Verificación**: Tests de integridad semanales

### Monitoreo
- **Performance**: Queries lentas
- **Espacio**: Crecimiento de tablas
- **Integridad**: Verificación de foreign keys

## 📞 Soporte

Para consultas sobre la estructura de base de datos:
- Revisar esta documentación completa
- Consultar los diagramas de relaciones
- Verificar las migraciones en `database/migrations/`
- Revisar los modelos en `app/Models/`

---

*Documentación generada automáticamente*
*Sistema: CRM AMS365*
*Versión: Laravel 11.x*
*Última actualización: {{ date('Y-m-d H:i:s') }}*
