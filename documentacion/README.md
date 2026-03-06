# Documentación del Sistema CRM

## 📋 Descripción General

Esta documentación proporciona una guía completa del sistema CRM implementado con Laravel y Livewire. La documentación está organizada por categorías y servicios para facilitar la navegación y el mantenimiento.

## 🎯 Características del Sistema

- ✅ **4 servicios principales** (Tours, Traslados, Tiquetes Aéreos, Hoteles)
- ✅ **Arquitectura moderna** con Laravel 10.x y Livewire 3.x
- ✅ **Interfaz reactiva** con Alpine.js y Flux UI
- ✅ **Base de datos robusta** con MySQL 8.0
- ✅ **API completa** con autenticación JWT
- ✅ **Documentación exhaustiva** con ejemplos y diagramas

---

## 📚 Índice de Documentación

### 🏗️ Arquitectura del Sistema
- [Arquitectura General](arquitectura/README.md)
- [Diagramas Generales](arquitectura/diagramas-generales.md)
- [Patrones de Diseño](arquitectura/patrones-diseno.md)
- [Flujos del Sistema](arquitectura/flujos-sistema.md)

### 🚀 Servicios del Sistema

#### 🏖️ Tours
- [Servicio de Tours](servicios/tours/README.md)
- [Documentación Principal](servicios/tours/servicio-tours.md)
- [Ejemplos de Código](servicios/tours/ejemplos-codigo.md)
- [Diagramas de Arquitectura](servicios/tours/diagramas.md)

#### 🚗 Traslados
- [Servicio de Traslados](servicios/traslados/README.md)
- [Documentación Principal](servicios/traslados/servicio-traslados.md)
- [Ejemplos de Código](servicios/traslados/ejemplos-codigo.md)
- [Diagramas de Arquitectura](servicios/traslados/diagramas.md)

#### ✈️ Tiquetes Aéreos
- [Servicio de Tiquetes](servicios/tiquetes/README.md)
- [Documentación Principal](servicios/tiquetes/servicio-tiquetes.md)
- [Ejemplos de Código](servicios/tiquetes/ejemplos-codigo.md)
- [Diagramas de Arquitectura](servicios/tiquetes/diagramas.md)

#### 🏨 Hoteles
- [Servicio de Hoteles](servicios/hoteles/README.md)
- [Documentación Principal](servicios/hoteles/servicio-hoteles.md)
- [Ejemplos de Código](servicios/hoteles/ejemplos-codigo.md)
- [Diagramas de Arquitectura](servicios/hoteles/diagramas.md)

#### 🌍 Base de Datos World
- [Base de Datos World](servicios/world-database/README.md)
- [Configuración](servicios/world-database/configuracion.md)
- [API Reference](servicios/world-database/api-reference.md)
- [Ejemplos de Uso](servicios/world-database/ejemplos-uso.md)
- [Arquitectura](servicios/world-database/arquitectura.md)

### 🔗 API y Desarrollo
- [Documentación de API](api/README.md)
- [Documentación de Agencias](api/AGENCY_API_DOCUMENTATION.md)
- [Documentación General de API](api/API_DOCUMENTATION.md)
- [Mapeo de Campos](api/API_FIELD_MAPPING.md)
- [Ejemplos de Paquetes](api/PACKAGE_API_EXAMPLES.md)

### 🔐 Roles y Permisos
- [Sistema de Roles y Permisos](roles-permisos/README.md)
- [Documentación Principal](roles-permisos/ROLES_PERMISOS_DOCUMENTACION.md)
- [Arquitectura](roles-permisos/ROLES_PERMISSIONS_ARCHITECTURE.md)
- [Ejemplos de Código](roles-permisos/ROLES_PERMISSIONS_EXAMPLES.md)
- [API](roles-permisos/ROLES_PERMISSIONS_API.md)
- [Diagramas](roles-permisos/ROLES_PERMISOS_DIAGRAMA.md)
- [Sistema](roles-permisos/ROLES_PERMISSIONS_SYSTEM.md)
- [Troubleshooting](roles-permisos/ROLES_PERMISSIONS_TROUBLESHOOTING.md)
- [Resumen Ejecutivo](roles-permisos/RESUMEN_EJECUTIVO_ROLES.md)

### 🎨 Diseño y UI/UX
- [Diseño y UI/UX](diseno/README.md)
- [Colores Corporativos](diseno/CORPORATE_COLORS_README.md)
- [Demo de Colores](diseno/CORPORATE_COLORS_DEMO.md)

### 🚀 Implementación
- [Implementación y Configuración](implementacion/README.md)
- [Implementación Completada](implementacion/IMPLEMENTACION_COMPLETADA.md)
- [Sistema de Notificaciones](implementacion/NOTIFICATIONS_README.md)
- [Tesseract OCR](implementacion/TESSERACT_README.md)

### 📖 Guías de Usuario
- [Guías de Usuario](guias/README.md)
- [Instalación](guias/instalacion.md)
- [Configuración](guias/configuracion.md)
- [Troubleshooting](guias/troubleshooting.md)
- [Mejores Prácticas](guias/mejores-practicas.md)

---

## 🚀 Inicio Rápido

### 1. Instalación
```bash
# Clonar repositorio
git clone https://github.com/your-repo/crm.git

# Instalar dependencias
composer install
npm install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar base de datos
php artisan migrate:fresh --seed
```

### 2. Configuración
```bash
# Configurar permisos
chmod -R 755 storage bootstrap/cache

# Configurar almacenamiento
php artisan storage:link

# Configurar caché
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Verificación
```bash
# Verificar instalación
php artisan serve

# Verificar base de datos
php artisan migrate:status

# Verificar logs
tail -f storage/logs/laravel.log
```

---

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Backend**: Laravel 10.x
- **Frontend**: Livewire 3.x + Alpine.js
- **Base de Datos**: MySQL 8.0
- **UI Framework**: Flux UI + Tailwind CSS
- **JavaScript**: Alpine.js + Vanilla JS
- **Almacenamiento**: Laravel Storage

### Componentes Principales
- **Tours**: Gestión completa de experiencias turísticas
- **Traslados**: Servicios de transporte y movilidad
- **Tiquetes Aéreos**: Gestión completa de reservas de vuelos
- **Hoteles**: Gestión completa de reservas de alojamiento
- **Imágenes**: Sistema de gestión de archivos multimedia
- **Observaciones**: Sistema automático de seguimiento
- **Tareas**: Sistema automático de check-in y seguimiento
- **Estados**: Control de flujo de servicios

---

## 📊 Estadísticas del Sistema

### Tours
- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (Tour)
- **1 modelo de imágenes** (TourImage)
- **3 estados** (cotizado, vendido, descartado)
- **Funcionalidades**: 15+ características principales

### Traslados
- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (TransferReserve)
- **3 tipos de servicio** (aeroportuario, hotelero, personalizado)
- **3 tipos de viaje** (ida, ida y vuelta, múltiple)
- **Funcionalidades**: 12+ características principales

### Tiquetes Aéreos
- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (AirlineTicket)
- **3 tipos de vuelo** (ida, ida y vuelta, multidestino)
- **2 tipos de destino** (nacional, internacional)
- **3 estados** (cotizado, vendido, descartado)
- **Funcionalidades**: 18+ características principales

### Hoteles
- **4 componentes Livewire** (Create, Edit, Show, Index)
- **1 modelo principal** (HotelReserve)
- **5 tipos de habitación** (sencilla, doble, triple, cuádruple, múltiple)
- **5 tipos de alimentación** (no incluye, desayuno, media pensión, pensión completa, todo incluido)
- **3 estados** (cotizado, vendido, descartado)
- **Funcionalidades**: 20+ características principales

---

## 🔧 Funcionalidades Implementadas

### ✅ Completadas
- [x] **Creación de tours** con formulario completo
- [x] **Edición de tours** existentes
- [x] **Vista espectacular** para mostrar tours
- [x] **Gestión de imágenes** con carrusel
- [x] **Estados de tour** (cotizado, vendido, descartado)
- [x] **Cálculo automático** de tarifas
- [x] **Observaciones automáticas** para clientes
- [x] **Slugs únicos** automáticos
- [x] **Validación en tiempo real**
- [x] **Editor rico** para descripciones
- [x] **Sistema de traslados** completo
- [x] **Sistema de tiquetes aéreos** completo
- [x] **Sistema de hoteles** completo
- [x] **Conversión de números a letras** para facturación
- [x] **Tareas automáticas** de check-in
- [x] **Múltiples tipos de vuelo** (ida, ida y vuelta, multidestino)
- [x] **Gestión de equipaje** e inclusiones
- [x] **Múltiples tipos de habitación** (sencilla, doble, triple, etc.)
- [x] **Tipos de alimentación** (desayuno, media pensión, todo incluido)
- [x] **Gestión de archivos multimedia** con HasMediaFiles
- [x] **Integración con traslados** relacionados
- [x] **Integración con requests** y clientes
- [x] **Logs detallados** para debugging
- [x] **Redirección funcional** entre vistas

### 🔄 En Progreso
- [ ] **Resolución de visualización** de imágenes en carrusel
- [ ] **Optimizaciones de rendimiento**
- [ ] **Mejoras en la interfaz de usuario**

### 📋 Próximas Funcionalidades
- [ ] **Sistema de reportes** avanzados
- [ ] **Integración con APIs** externas
- [ ] **Notificaciones push** para cambios de estado
- [ ] **Sistema de calificaciones** de servicios
- [ ] **Exportación de datos** en múltiples formatos

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Laravel 10.x**: Framework PHP
- **MySQL 8.0**: Base de datos
- **Composer**: Gestión de dependencias
- **Artisan**: Comandos de consola

### Frontend
- **Livewire 3.x**: Componentes reactivos
- **Alpine.js**: JavaScript reactivo
- **Flux UI**: Componentes de interfaz
- **Tailwind CSS**: Framework CSS
- **Vite**: Build tool

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **PHPUnit**: Testing
- **Laravel Telescope**: Debugging
- **Laravel Horizon**: Queue management

### Infraestructura
- **Base de Datos**: MySQL
- **Almacenamiento**: Laravel Storage
- **UI**: Flux UI + Tailwind CSS
- **JavaScript**: Alpine.js + Vanilla JS

---

## 📝 Historial de Cambios

### Versión 1.0.0 (Septiembre 2025)
- ✅ **Implementación inicial** del sistema de tours
- ✅ **Sistema de traslados** completo
- ✅ **Sistema de tiquetes aéreos** completo
- ✅ **Sistema de hoteles** completo
- ✅ **Gestión de imágenes** con carrusel
- ✅ **Estados de servicio** implementados
- ✅ **Observaciones automáticas** funcionando
- ✅ **Tareas automáticas** de check-in
- ✅ **Conversión a letras** para facturación
- ✅ **Gestión de archivos multimedia** con HasMediaFiles
- ✅ **Validaciones completas** en tiempo real
- ✅ **Documentación completa** creada

### Próximas Versiones
- **v1.1.0**: Mejoras en la interfaz de usuario
- **v1.2.0**: Optimizaciones de rendimiento
- **v2.0.0**: Nuevas funcionalidades y reportes

---

## 🤝 Contribución

### Cómo Contribuir
1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Estándares de Código
- Seguir PSR-12 para PHP
- Usar convenciones de Laravel
- Documentar código complejo
- Escribir tests para nuevas funcionalidades

---

## 📞 Soporte

### Documentación
- [Guías de Usuario](guias/README.md)
- [Troubleshooting](guias/troubleshooting.md)
- [Mejores Prácticas](guias/mejores-practicas.md)

### Contacto
- **Email**: soporte@crm.com
- **Issues**: [GitHub Issues](https://github.com/your-repo/crm/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/your-repo/crm/wiki)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

*Documentación del Sistema CRM - Septiembre 2025*
*Versión del sistema: 1.0.0*