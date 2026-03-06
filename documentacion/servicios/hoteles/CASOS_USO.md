# Casos de Uso - Sistema de Imágenes para Hoteles en Cotización

## 📋 Escenarios de Uso

### 1. 🏨 Agregar Imágenes a un Hotel Nuevo

**Contexto**: Un usuario necesita agregar imágenes a un hotel que acaba de crear en una cotización.

**Flujo**:
1. Usuario navega a la vista del hotel en cotización
2. Hace clic en "Gestionar Imágenes del Hotel"
3. Arrastra 5 imágenes al área de drop
4. El sistema valida y procesa las imágenes
5. La primera imagen se establece automáticamente como principal
6. Usuario ve la galería con thumbnails

**Resultado esperado**: Hotel con 5 imágenes, una principal y 4 complementarias.

### 2. 🖼️ Establecer Imagen Principal

**Contexto**: Usuario quiere cambiar cuál imagen es la principal del hotel.

**Flujo**:
1. Usuario abre el modal de gestión de imágenes
2. Ve la galería con indicador "Principal" en una imagen
3. Hace clic en el botón de estrella de otra imagen
4. El sistema actualiza la base de datos
5. La nueva imagen se marca como principal
6. La anterior se convierte en complementaria

**Resultado esperado**: Nueva imagen principal establecida correctamente.

### 3. 📱 Visualizar Imágenes en Pantalla Completa

**Contexto**: Usuario quiere ver una imagen en detalle.

**Flujo**:
1. Usuario hace clic en cualquier imagen de la galería
2. Se abre el lightbox con la imagen en pantalla completa
3. Usuario puede navegar con las flechas del teclado
4. Presiona Escape para cerrar
5. Regresa a la galería

**Resultado esperado**: Visualización clara de la imagen seleccionada.

### 4. 🗑️ Eliminar Imagen No Deseada

**Contexto**: Usuario quiere eliminar una imagen que no le gusta.

**Flujo**:
1. Usuario abre el modal de gestión
2. Pasa el mouse sobre la imagen a eliminar
3. Hace clic en el botón de basura
4. El sistema elimina el archivo del storage
5. El sistema elimina el registro de la base de datos
6. La galería se actualiza automáticamente

**Resultado esperado**: Imagen eliminada completamente del sistema.

### 5. 📋 Reordenar Imágenes

**Contexto**: Usuario quiere cambiar el orden de las imágenes.

**Flujo**:
1. Usuario abre el modal de gestión
2. Arrastra una imagen a una nueva posición
3. El sistema actualiza el `sort_order` en la base de datos
4. La galería se reorganiza automáticamente
5. El nuevo orden se mantiene en futuras visualizaciones

**Resultado esperado**: Imágenes reordenadas según preferencia del usuario.

### 6. ⚠️ Manejo de Errores - Archivo Muy Grande

**Contexto**: Usuario intenta subir una imagen de 8MB.

**Flujo**:
1. Usuario selecciona archivo de 8MB
2. El sistema valida el archivo
3. Muestra error: "El archivo debe ser menor a 5MB"
4. El archivo no se sube
5. Usuario debe seleccionar otro archivo

**Resultado esperado**: Error claro y archivo rechazado.

### 7. ⚠️ Manejo de Errores - Demasiadas Imágenes

**Contexto**: Usuario intenta subir más de 10 imágenes.

**Flujo**:
1. Usuario ya tiene 8 imágenes
2. Intenta subir 5 imágenes más
3. El sistema procesa solo 2 imágenes (hasta el límite de 10)
4. Muestra mensaje: "Solo se pueden subir 10 imágenes máximo"
5. Las 3 imágenes restantes se descartan

**Resultado esperado**: Límite respetado con feedback claro.

### 8. 🔄 Recuperación de Imagen Principal

**Contexto**: Usuario elimina la imagen principal y necesita establecer otra.

**Flujo**:
1. Usuario elimina la imagen principal
2. El sistema detecta que no hay imagen principal
3. Usuario selecciona otra imagen como principal
4. El sistema actualiza la base de datos
5. La nueva imagen se marca como principal

**Resultado esperado**: Nueva imagen principal establecida automáticamente.

## 🎯 Casos de Uso Técnicos

### 1. 🔧 Migración de Datos

**Contexto**: Migrar imágenes existentes al nuevo sistema.

**Flujo**:
1. Ejecutar migración de base de datos
2. Crear directorios de storage necesarios
3. Migrar archivos existentes a nueva estructura
4. Actualizar registros en base de datos
5. Verificar integridad de datos

**Resultado esperado**: Migración exitosa sin pérdida de datos.

### 2. 🗂️ Limpieza de Archivos Huérfanos

**Contexto**: Limpiar archivos que no tienen registro en la base de datos.

**Flujo**:
1. Escanear directorio de imágenes
2. Comparar con registros de base de datos
3. Identificar archivos huérfanos
4. Eliminar archivos no referenciados
5. Limpiar thumbnails correspondientes

**Resultado esperado**: Storage limpio y optimizado.

### 3. 📊 Generación de Reportes

**Contexto**: Generar reporte de uso de imágenes.

**Flujo**:
1. Consultar base de datos de imágenes
2. Agrupar por hotel
3. Calcular estadísticas (total, tamaño, formatos)
4. Generar reporte en PDF/Excel
5. Enviar por email o descargar

**Resultado esperado**: Reporte detallado de uso de imágenes.

## 🚀 Casos de Uso Avanzados

### 1. 🤖 Automatización de Thumbnails

**Contexto**: Regenerar thumbnails para imágenes existentes.

**Flujo**:
1. Identificar imágenes sin thumbnail
2. Procesar cada imagen con Intervention Image
3. Generar thumbnail de 300x300px
4. Guardar en directorio correspondiente
5. Actualizar base de datos si es necesario

**Resultado esperado**: Thumbnails generados para todas las imágenes.

### 2. 🔄 Sincronización con CDN

**Contexto**: Sincronizar imágenes con CDN para mejor rendimiento.

**Flujo**:
1. Detectar imágenes nuevas o modificadas
2. Subir a CDN (AWS S3, Cloudinary, etc.)
3. Actualizar URLs en base de datos
4. Configurar redirecciones
5. Monitorear sincronización

**Resultado esperado**: Imágenes servidas desde CDN.

### 3. 📱 Optimización para Móviles

**Contexto**: Generar versiones optimizadas para dispositivos móviles.

**Flujo**:
1. Detectar dispositivo del usuario
2. Generar versiones de diferentes tamaños
3. Servir imagen apropiada según dispositivo
4. Implementar lazy loading
5. Optimizar carga de imágenes

**Resultado esperado**: Mejor rendimiento en dispositivos móviles.

## 🧪 Casos de Prueba

### 1. ✅ Prueba de Carga Múltiple

**Datos de prueba**:
- 10 imágenes JPG de 2MB cada una
- Tiempo esperado: < 30 segundos
- Memoria máxima: < 200MB

**Resultado esperado**: Todas las imágenes se cargan correctamente.

### 2. ✅ Prueba de Validación

**Datos de prueba**:
- Archivo de 6MB (excede límite)
- Archivo .txt (formato no válido)
- 15 archivos (excede cantidad)

**Resultado esperado**: Errores apropiados para cada caso.

### 3. ✅ Prueba de Rendimiento

**Datos de prueba**:
- 100 hoteles con 10 imágenes cada uno
- Consulta de galería completa
- Tiempo esperado: < 5 segundos

**Resultado esperado**: Consulta rápida y eficiente.

## 📈 Métricas de Éxito

### 1. 🎯 Métricas de Usuario
- **Tasa de adopción**: > 80% de hoteles con imágenes
- **Tiempo de carga**: < 2 segundos promedio
- **Satisfacción**: > 4.5/5 en encuestas

### 2. 📊 Métricas Técnicas
- **Disponibilidad**: > 99.9%
- **Tiempo de respuesta**: < 500ms
- **Uso de storage**: < 1GB por 1000 hoteles

### 3. 🔧 Métricas de Mantenimiento
- **Tiempo de resolución**: < 2 horas
- **Errores críticos**: < 0.1%
- **Uptime**: > 99.5%

---

**Documento**: Casos de Uso  
**Versión**: 1.0.0  
**Fecha**: 22 de Septiembre de 2025  
**Estado**: ✅ Completado
