# Sistema de Roles y Permisos Dinámicos - Documentación Completa

## 📚 Índice de Documentación

Esta documentación completa del sistema de roles y permisos dinámicos está organizada en varios archivos especializados:

### 📖 Documentación Principal
- **[ROLES_PERMISSIONS_SYSTEM.md](./ROLES_PERMISSIONS_SYSTEM.md)** - Documentación técnica completa del sistema
- **[ROLES_PERMISSIONS_ARCHITECTURE.md](./ROLES_PERMISSIONS_ARCHITECTURE.md)** - Arquitectura y diagramas del sistema
- **[ROLES_PERMISSIONS_EXAMPLES.md](./ROLES_PERMISSIONS_EXAMPLES.md)** - Ejemplos de uso y casos prácticos
- **[ROLES_PERMISSIONS_API.md](./ROLES_PERMISSIONS_API.md)** - Documentación de la API REST
- **[ROLES_PERMISSIONS_TROUBLESHOOTING.md](./ROLES_PERMISSIONS_TROUBLESHOOTING.md)** - Solución de problemas comunes

## 🚀 Inicio Rápido

### ¿Qué es el Sistema de Roles y Permisos Dinámicos?

Es un sistema flexible que permite a cada agencia crear y gestionar sus propios roles personalizados, asignando permisos específicos según sus necesidades organizacionales. Esto proporciona total flexibilidad para adaptar el sistema a diferentes estructuras de negocio.

### Características Principales

✅ **Roles Personalizados**: Cada agencia puede crear roles únicos  
✅ **Permisos Organizados**: Más de 60 permisos categorizados  
✅ **Roles del Sistema**: Roles predefinidos protegidos  
✅ **Interfaz Moderna**: Diseño responsive con modo oscuro/claro  
✅ **API Completa**: Endpoints REST para integración  
✅ **Seguridad**: Validaciones y políticas de autorización  

## 🎯 Casos de Uso Comunes

### Agencia Pequeña (5-10 empleados)
- **Administrador**: Acceso completo
- **Vendedor**: Gestión de clientes y cotizaciones
- **Asistente**: Tareas administrativas básicas

### Agencia Mediana (20-50 empleados)
- **Director**: Estrategia y decisiones
- **Gerente**: Gestión de equipos
- **Supervisor**: Supervisión operativa
- **Vendedor**: Operaciones de venta
- **Coordinador**: Logística y servicios
- **Asistente**: Apoyo administrativo

### Agencia Corporativa (50+ empleados)
- **CEO**: Visión estratégica
- **CFO**: Gestión financiera
- **Director de Operaciones**: Eficiencia operativa
- **Manager de Cuentas**: Clientes corporativos
- **Especialistas**: Roles específicos por área

## 🛠️ Instalación y Configuración

### Requisitos Previos
- Laravel 10+
- PHP 8.1+
- Base de datos MySQL/PostgreSQL
- Spatie Laravel Permission

### Pasos de Instalación

1. **Ejecutar Migraciones**
```bash
php artisan migrate
```

2. **Ejecutar Seeders**
```bash
php artisan db:seed --class=PermissionCategoriesSeeder
php artisan db:seed --class=DynamicPermissionsSeeder
php artisan db:seed --class=AgencySystemRolesSeeder
```

3. **Compilar Estilos**
```bash
npm run build
```

4. **Limpiar Cache**
```bash
php artisan optimize:clear
```

## 🎨 Interfaz de Usuario

### Acceso al Sistema
- **Sidebar**: Administración → Gestión de Roles
- **Vista de Agencia**: Botón "Gestionar Roles"
- **URL Directa**: `/agency/{slug}/roles`

### Funcionalidades de la Interfaz
- **Crear Roles**: Formulario con validación en tiempo real
- **Editar Roles**: Modificación de roles existentes
- **Gestionar Permisos**: Asignación por categorías organizadas
- **Ver Usuarios**: Lista de usuarios asignados a cada rol
- **Eliminar Roles**: Solo roles personalizados sin usuarios

## 🔧 API REST

### Endpoints Principales
```http
GET    /api/v1/agency/{agency}/roles              # Listar roles
POST   /api/v1/agency/{agency}/roles              # Crear rol
GET    /api/v1/agency/{agency}/roles/{role}       # Obtener rol
PUT    /api/v1/agency/{agency}/roles/{role}       # Actualizar rol
DELETE /api/v1/agency/{agency}/roles/{role}       # Eliminar rol
GET    /api/v1/agency/{agency}/roles/permissions  # Listar permisos
POST   /api/v1/agency/{agency}/roles/{role}/permissions # Asignar permisos
```

### Autenticación
```http
Authorization: Bearer {token}
```

## 📊 Estructura de Datos

### Roles
```json
{
    "id": 1,
    "name": "Vendedor Senior",
    "description": "Vendedor con experiencia para clientes importantes",
    "color": "#10B981",
    "is_system_role": false,
    "is_active": true,
    "permissions_count": 24,
    "users_count": 3
}
```

### Permisos por Categoría
- **Agencias**: CRUD completo
- **Oficinas**: Gestión de sucursales
- **Personal**: Gestión de empleados
- **Usuarios**: Administración de usuarios
- **Roles y Permisos**: Gestión del sistema
- **Configuración**: Ajustes del sistema
- **Clientes**: Gestión de clientes
- **Cotizaciones**: Proceso de ventas
- **Ventas**: Operaciones comerciales
- **Pagos**: Gestión financiera
- **Servicios**: Catálogo de servicios
- **Paquetes**: Productos turísticos

## 🔒 Seguridad

### Validaciones
- Nombres únicos por agencia
- Protección de roles del sistema
- Verificación de usuarios asignados
- Validación de permisos existentes

### Políticas de Autorización
- Acceso restringido por agencia
- Verificación de permisos específicos
- Logs de auditoría para cambios críticos

## 🚨 Solución de Problemas

### Problemas Comunes
1. **Error de Livewire**: Múltiples elementos raíz
2. **Layout no encontrado**: Ruta incorrecta
3. **Permisos no aplican**: Cache no actualizado
4. **Roles no aparecen**: Consulta incorrecta
5. **Estilos no cargan**: CSS no compilado

### Comandos de Diagnóstico
```bash
# Verificar migraciones
php artisan migrate:status

# Limpiar cache
php artisan optimize:clear

# Verificar rutas
php artisan route:list --name=agency.roles

# Verificar permisos
php artisan permission:show
```

## 📈 Monitoreo y Métricas

### Datos Disponibles
- Número de roles por agencia
- Distribución de usuarios por rol
- Permisos más utilizados
- Roles inactivos

### Reportes Sugeridos
- Uso de permisos por categoría
- Usuarios sin roles asignados
- Cambios en roles y permisos
- Auditoría de accesos

## 🔄 Mantenimiento

### Tareas Periódicas
- **Semanal**: Backup de configuraciones
- **Mensual**: Auditoría de seguridad
- **Trimestral**: Revisión de roles inactivos

### Actualizaciones
- Agregar nuevos permisos según necesidades
- Crear roles específicos por proyecto
- Optimizar consultas de base de datos
- Mejorar interfaz de usuario

## 🎯 Roadmap Futuro

### Mejoras Planificadas
- [ ] Herencia de roles
- [ ] Roles temporales con expiración
- [ ] Importación/exportación de configuraciones
- [ ] Roles basados en ubicación geográfica
- [ ] Dashboard de métricas avanzadas
- [ ] Notificaciones de cambios en roles

### Integraciones
- [ ] Sistema de auditoría avanzado
- [ ] Integración con LDAP/Active Directory
- [ ] API para sistemas externos
- [ ] Webhooks para cambios en roles

## 📞 Soporte

### Recursos de Ayuda
- **Documentación Técnica**: [ROLES_PERMISSIONS_SYSTEM.md](./ROLES_PERMISSIONS_SYSTEM.md)
- **Ejemplos de Uso**: [ROLES_PERMISSIONS_EXAMPLES.md](./ROLES_PERMISSIONS_EXAMPLES.md)
- **Solución de Problemas**: [ROLES_PERMISSIONS_TROUBLESHOOTING.md](./ROLES_PERMISSIONS_TROUBLESHOOTING.md)
- **API Reference**: [ROLES_PERMISSIONS_API.md](./ROLES_PERMISSIONS_API.md)

### Contacto
Para soporte técnico o consultas sobre el sistema:
1. Revisar la documentación correspondiente
2. Verificar la sección de troubleshooting
3. Consultar logs del sistema
4. Contactar al equipo de desarrollo

## 📝 Changelog

### Versión 1.0 (Diciembre 2024)
- ✅ Sistema base de roles y permisos dinámicos
- ✅ Interfaz de usuario moderna
- ✅ API REST completa
- ✅ Documentación técnica
- ✅ Seeders y migraciones
- ✅ Validaciones y seguridad
- ✅ Soporte para modo oscuro/claro

---

**Sistema de Roles y Permisos Dinámicos v1.0**  
**Desarrollado para CRM de Agencias de Viajes**  
**Última actualización**: Diciembre 2024
