# Índice de Documentación - Módulo de Renta de Autos

## 📚 Documentación Completa

Esta carpeta contiene toda la documentación técnica del módulo de renta de autos integrado en el CRM. La documentación está organizada por temas específicos para facilitar la navegación y consulta.

## 📋 Archivos de Documentación

### 🏠 [README.md](./README.md)
**Documentación principal del módulo**
- Introducción y características
- Arquitectura del sistema
- Configuración básica
- Guía de instalación
- Troubleshooting común

### 🔌 [API_REFERENCE.md](./API_REFERENCE.md)
**Referencia completa de la API**
- BookingCarsService API
- Livewire Components API
- Modelos de datos
- Rutas y endpoints
- Ejemplos de uso

### 🗄️ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
**Esquema de base de datos**
- Estructura de tablas
- Relaciones entre entidades
- Índices y optimizaciones
- Migraciones y seeders
- Diagrama ER

### 🎨 [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
**Guía de desarrollo frontend**
- Componentes Livewire
- Vistas Blade
- Estilos y UI
- Interactividad
- Responsive design
- Dark mode

### 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
**Guía de testing**
- Estructura de tests
- Tests de Feature
- Tests de Unit
- Mocking y stubbing
- Configuración
- Ejecución de tests

### 🚀 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
**Guía de despliegue**
- Requisitos del sistema
- Configuración de producción
- Variables de entorno
- Optimizaciones
- Monitoreo
- Backup y recuperación

### 📝 [CHANGELOG.md](./CHANGELOG.md)
**Registro de cambios**
- Historial de versiones
- Nuevas características
- Correcciones de bugs
- Mejoras de rendimiento
- Notas de migración

## 🎯 Guías Rápidas

### Para Desarrolladores
1. **Configuración inicial**: [README.md](./README.md#configuración)
2. **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
3. **Frontend Guide**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
4. **Testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Para Administradores
1. **Instalación**: [README.md](./README.md#despliegue)
2. **Configuración**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#configuración-de-producción)
3. **Base de datos**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
4. **Monitoreo**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#monitoreo)

### Para DevOps
1. **Despliegue**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Configuración de servidor**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#configuración-de-producción)
3. **Backup**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#backup-y-recuperación)
4. **Troubleshooting**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)

## 🔍 Búsqueda Rápida

### Por Funcionalidad
- **Búsqueda de autos**: [API_REFERENCE.md](./API_REFERENCE.md#searchcarrental)
- **Reservas**: [API_REFERENCE.md](./API_REFERENCE.md#confirmcarreservation)
- **Gestión de reservas**: [API_REFERENCE.md](./API_REFERENCE.md#mycarreservations)
- **Autocomplete**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md#autocomplete-en-tiempo-real)

### Por Tecnología
- **Livewire**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md#componentes-livewire)
- **Base de datos**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **API externa**: [API_REFERENCE.md](./API_REFERENCE.md#bookingcarsservice-api)
- **Testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Por Problema
- **Errores comunes**: [README.md](./README.md#troubleshooting)
- **Problemas de despliegue**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)
- **Problemas de testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md#troubleshooting)
- **Problemas de frontend**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md#ejemplos-de-uso)

## 📊 Estructura del Módulo

```
📁 Módulo de Renta de Autos
├── 🔧 Backend
│   ├── Models (CarRental, CarLocation, CarRate, CarReservation)
│   ├── Services (BookingCarsService)
│   ├── Livewire Components (Search, List, Confirm, MyReservations)
│   └── Controllers (TestController)
├── 🎨 Frontend
│   ├── Blade Views (4 componentes principales)
│   ├── TailwindCSS (Estilos)
│   ├── Flux UI (Componentes)
│   └── Responsive Design
├── 🗄️ Base de Datos
│   ├── Migrations (4 tablas)
│   ├── Seeders (Datos de prueba)
│   ├── Relationships (FK y relaciones)
│   └── Indexes (Optimización)
├── 🧪 Testing
│   ├── Feature Tests (8 archivos)
│   ├── Unit Tests (1 archivo)
│   ├── Integration Tests
│   └── Mocking (API externa)
└── 📚 Documentación
    ├── README (Principal)
    ├── API Reference
    ├── Database Schema
    ├── Frontend Guide
    ├── Testing Guide
    ├── Deployment Guide
    └── Changelog
```

## 🚀 Inicio Rápido

### 1. Instalación
```bash
# Clonar repositorio
git clone https://github.com/MVP-Solutions-360/crm.git

# Instalar dependencias
composer install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed --class=CarRentalSeeder
```

### 2. Configuración
```env
# En .env
BOOKINGCARS_BASE_URL=https://api.bookingcars.com
BOOKINGCARS_API_KEY=tu_api_key_aqui
```

### 3. Ejecutar Tests
```bash
# Todos los tests del módulo
php artisan test --filter=CarRental

# Tests específicos
php artisan test tests/Feature/CarRentalTest.php
```

### 4. Acceder al Módulo
- **URL**: `/car-rentals/search`
- **Navegación**: Sidebar > Buscadores > Renta de Autos

## 📞 Soporte

### Contacto
- **Email**: soporte@mvpsolutions365.com
- **GitHub**: [MVP-Solutions-360/crm](https://github.com/MVP-Solutions-360/crm)
- **Documentación**: Esta carpeta

### Recursos Adicionales
- **Laravel Docs**: [laravel.com/docs](https://laravel.com/docs)
- **Livewire Docs**: [livewire.laravel.com](https://livewire.laravel.com)
- **TailwindCSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Flux UI Docs**: [flux.laravel.com](https://flux.laravel.com)

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  
**Mantenido por**: MVP Solutions 365
