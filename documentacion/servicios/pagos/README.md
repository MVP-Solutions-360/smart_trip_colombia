# 💰 Sistema de Pagos del CRM

## 📋 Descripción General

El sistema de pagos del CRM es un módulo integral que permite gestionar el flujo completo de dinero en una agencia de viajes. Está diseñado para manejar tanto los pagos que recibe de los clientes como los pagos que se realizan a los proveedores de servicios.

## 🎯 Características Principales

- ✅ **Pagos de Clientes** con OCR automático
- ✅ **Pagos a Proveedores** con distribución inteligente
- ✅ **Solicitudes de Pago** con aprobación por roles
- ✅ **Distribución de Pagos** automática
- ✅ **Auditoría Completa** de transacciones
- ✅ **Integración con Tesseract OCR**
- ✅ **Validación de Duplicados**
- ✅ **Selección Inteligente de Abonos** por asesor
- ✅ **Creación Automática de Tareas** para contabilidad
- ✅ **Validación Cruzada OCR** con alertas visuales
- ✅ **Comprobantes Obligatorios** para aprobación
- ✅ **Alertas SweetAlert** para situaciones críticas

## 📁 Archivos de Documentación

### 📖 [Documentación Principal](SISTEMA_PAGOS_DOCUMENTACION.md)
**Archivo**: `SISTEMA_PAGOS_DOCUMENTACION.md`

**Contenido**:
- Introducción al sistema de pagos
- Arquitectura del sistema
- Flujo de pagos de clientes con OCR
- Flujo de pagos a proveedores
- Sistema de solicitudes de pago
- Modelos de datos
- Componentes Livewire
- API y rutas
- Guías de uso paso a paso
- Troubleshooting y solución de problemas

### 🔧 [Implementación OCR](../implementacion/TESSERACT_README.md)
**Archivo**: `../implementacion/TESSERACT_README.md`

**Contenido**:
- Instalación de Tesseract OCR
- Configuración del servicio OCR
- Procesamiento de imágenes
- Extracción de datos
- Validación de duplicados
- Manejo de errores

## 🚀 Inicio Rápido

### 1. **Registrar Pago de Cliente**
```bash
# Acceder a la venta
/agency/{agency}/client/{client}/request/{request}/sale/{sale}

# Hacer clic en "Agregar pago"
# Completar formulario y subir comprobante
# El OCR procesará automáticamente
```

### 2. **Crear Solicitud de Pago**
```bash
# Desde la vista de venta
# Hacer clic en "Solicitar pago" en el servicio
# Seleccionar pagos de clientes
# Crear solicitud
```

### 3. **Gestionar Solicitudes**
```bash
# Ver listado de solicitudes
# Filtrar por estado o tipo
# Aprobar o rechazar solicitudes
```

## 🏗️ Arquitectura

### Modelos Principales
- **`ClientPayment`** - Pagos recibidos de clientes
- **`ProviderPayment`** - Pagos realizados a proveedores
- **`PaymentRequest`** - Solicitudes de pago a proveedores
- **`PaymentDistribution`** - Distribución de pagos

### Componentes Livewire
- **`CreatePayReserve`** - Crear pagos de clientes
- **`CreatePaymentRequest`** - Crear solicitudes de pago
- **`CreatePayProvider`** - Crear pagos a proveedores
- **`AdvisorPaymentRequests`** - Gestionar solicitudes

## 🔍 Funcionalidades Avanzadas

### OCR Automático
- **Extracción de datos** de comprobantes
- **Validación de duplicados** por imagen y comprobante
- **Aplicación automática** de datos al formulario
- **Nivel de confianza** del procesamiento

### Distribución Inteligente
- **Cálculo automático** de pagos disponibles
- **Validación de montos** suficientes
- **Trazabilidad completa** de distribuciones
- **Prevención de doble uso** de pagos

### Auditoría Completa
- **Logs de todas las operaciones**
- **Trazabilidad de cambios**
- **Validación de roles** y permisos
- **Historial de transacciones**

## 🏢 Flujo Corporativo de Pagos

### Proceso Formal de Aprobación

#### 1. **Selección de Abonos por Asesor** 👨‍💼
- **Visualización inteligente** de abonos disponibles
- **Identificación automática** de abonos utilizados
- **Cálculo en tiempo real** de saldos pendientes
- **Selección múltiple** con validación automática

#### 2. **Creación Automática de Tareas** 📋
- **Tareas automáticas** para contabilidad
- **Prioridad alta** con fecha límite de 2 días
- **Metadatos completos** de la solicitud
- **Notificaciones automáticas** al usuario asignado

#### 3. **Validación Cruzada OCR** 🔍
- **Comparación automática** de datos ingresados vs OCR
- **Detección de discrepancias** en montos y fechas
- **Validación de confianza** del procesamiento OCR
- **Alertas visuales** para situaciones críticas

#### 4. **Comprobantes Obligatorios** 📎
- **Validación obligatoria** de comprobantes antes de aprobación
- **Formatos soportados**: JPG, PNG, PDF
- **Tamaño máximo**: 2MB por archivo
- **Calidad mínima** para procesamiento OCR

#### 5. **Alertas SweetAlert** ⚠️
- **Alertas de advertencia** para discrepancias OCR
- **Alertas de error** para comprobantes faltantes
- **Alertas de éxito** para aprobaciones completadas
- **Configuración automática** de temas claro/oscuro

## 📊 Métricas y Reportes

### Métricas Disponibles
- Total de pagos por período
- Solicitudes pendientes/aprobadas/rechazadas
- Eficiencia de OCR
- Duplicados detectados

### Reportes Generados
- Reporte de pagos por cliente
- Reporte de proveedores por agencia
- Reporte de auditoría de transacciones

## 🔧 Troubleshooting

### Problemas Comunes
1. **Error de OCR** - Verificar instalación de Tesseract
2. **Pagos Duplicados** - Sistema valida automáticamente
3. **Distribución Incorrecta** - Verificar montos disponibles
4. **Errores de Validación** - Revisar logs de Laravel

### Logs Importantes
- **OCR**: `Log::info('OCR procesado exitosamente')`
- **Pagos**: `Log::debug('Pago creado correctamente')`
- **Solicitudes**: `Log::info('Solicitud de pago creada')`

## 📞 Soporte

### Contacto
- **Desarrollador**: MVP Solutions 360
- **Email**: soporte@mvpsolutions360.com
- **Documentación**: `/documentacion/servicios/pagos/`

### Recursos Adicionales
- **Logs del sistema**: `storage/logs/laravel.log`
- **Documentación OCR**: `documentacion/implementacion/TESSERACT_README.md`
- **API Documentation**: `documentacion/api/`

---

*Última actualización: Enero 2025*
*Versión del sistema: 1.0.0*
