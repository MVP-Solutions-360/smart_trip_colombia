# 🧠 Implementación de Tesseract OCR en Sistema de Pagos

## 📋 Descripción

Esta implementación agrega funcionalidad de OCR (Reconocimiento Óptico de Caracteres) al módulo de pagos de clientes utilizando **Tesseract OCR**. El sistema puede extraer automáticamente información de comprobantes de pago como:

- 💰 **Monto del pago**
- 📅 **Fecha del pago**
- 🔢 **Número de comprobante**
- 🏦 **Nombre del banco**
- 💳 **Número de cuenta**
- 📊 **Nivel de confianza del OCR**

## 🎯 Beneficios

- **Prevención de fraudes**: Detecta comprobantes duplicados
- **Autocompletado**: Rellena automáticamente campos del formulario
- **Validación cruzada**: Compara datos extraídos vs. ingresados manualmente
- **Auditoría completa**: Traza todos los comprobantes procesados
- **Eficiencia**: Reduce tiempo de ingreso manual

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
composer require thiagoalessio/tesseract_ocr intervention/image
```

### 2. Ejecutar Migración

```bash
php artisan migrate
```

### 3. Instalar Tesseract OCR

#### Windows
```bash
# Opción 1: Descargar instalador
# Visita: https://github.com/UB-Mannheim/tesseract/wiki
# Descarga e instala el ejecutable

# Opción 2: Usar Chocolatey
choco install tesseract
```

#### macOS
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Tesseract
brew install tesseract
brew install tesseract-lang
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-spa
```

#### Linux (CentOS/RHEL/Fedora)
```bash
sudo yum install tesseract tesseract-langpack-spa
# o
sudo dnf install tesseract tesseract-langpack-spa
```

### 4. Verificar Instalación

```bash
php artisan tesseract:install --check
```

## 🔧 Configuración

### Providers
El provider de Intervention Image se configura automáticamente en `bootstrap/providers.php`.

### Configuración de Imágenes
Puedes personalizar la configuración en `config/image.php`:

```php
return [
    'driver' => env('IMAGE_DRIVER', 'gd'),
    'aliases' => [
        'Image' => Intervention\Image\Facades\Image::class,
    ],
];
```

## 📱 Uso

### 1. Cargar Comprobante
- Ve al módulo de pagos de clientes
- Haz clic en "Agregar pago"
- Selecciona "Soporte de pago"
- Sube la imagen del comprobante

### 2. Procesamiento Automático
- El sistema procesa automáticamente la imagen con OCR
- Se extraen los datos relevantes
- Se muestran en un panel azul con opciones para:
  - ✅ **Aplicar datos**: Rellena automáticamente el formulario
  - 🗑️ **Limpiar**: Elimina los datos extraídos

### 3. Validación
- El sistema verifica duplicados de imagen y comprobante
- Muestra advertencias si encuentra discrepancias
- Permite revisar el texto extraído completo

## 🏗️ Arquitectura

### Servicios
- **`OcrService`**: Maneja todo el procesamiento de OCR
- **`ImageManager`**: Preprocesa imágenes para mejorar OCR

### Modelos
- **`ClientPayment`**: Extendido con campos de OCR
- **Campos nuevos**:
  - `extracted_amount`: Monto extraído
  - `extracted_date`: Fecha extraída
  - `receipt_number`: Número de comprobante
  - `bank_name`: Nombre del banco
  - `account_number`: Número de cuenta
  - `ocr_confidence`: Nivel de confianza
  - `ocr_raw_text`: Texto extraído completo
  - `image_hash`: Hash único de la imagen
  - `ocr_processed`: Estado de procesamiento

### Componentes Livewire
- **`CreatePayReserve`**: Integrado con OCR
- **Funcionalidades**:
  - Procesamiento automático de imágenes
  - Validación de duplicados
  - Autocompletado de formularios
  - Manejo de errores

## 🔍 Funcionalidades del OCR

### Preprocesamiento de Imágenes
- Conversión a escala de grises
- Mejora de contraste
- Redimensionamiento automático
- Optimización para OCR

### Extracción de Datos
- **Montos**: Patrones de moneda colombiana
- **Fechas**: Múltiples formatos (DD/MM/YYYY, DD-MM-YYYY)
- **Comprobantes**: Números de referencia
- **Bancos**: Nombres de bancos colombianos
- **Cuentas**: Números de cuenta bancaria

### Validación Inteligente
- Detección de imágenes duplicadas
- Verificación de comprobantes duplicados
- Cálculo de nivel de confianza
- Manejo de errores de OCR

## 🧪 Testing

### Comando de Verificación
```bash
# Verificar instalación
php artisan tesseract:install --check

# Verificar funcionalidad
php artisan test --filter=OcrTest
```

### Casos de Prueba
- Imágenes de comprobantes bancarios
- Diferentes formatos de fecha
- Varios tipos de montos
- Imágenes con baja calidad
- Comprobantes duplicados

## 🚨 Solución de Problemas

### Error: "Tesseract no encontrado"
```bash
# Verificar instalación
tesseract --version

# Si no funciona, agregar al PATH
# Windows: Reiniciar terminal después de instalar
# Linux/macOS: Verificar que esté en /usr/local/bin
```

### Error: "Imagen no se puede procesar"
- Verificar formato de imagen (JPG, PNG, TIFF)
- Asegurar que la imagen no esté corrupta
- Verificar permisos de archivo

### Baja precisión del OCR
- Mejorar calidad de imagen
- Asegurar buena iluminación
- Verificar que el texto esté legible
- Usar imágenes con resolución mínima de 300 DPI

## 📊 Monitoreo y Logs

### Logs del Sistema
- Procesamiento de OCR exitoso
- Errores de procesamiento
- Detección de duplicados
- Niveles de confianza

### Métricas Recomendadas
- Tasa de éxito del OCR
- Tiempo promedio de procesamiento
- Frecuencia de duplicados detectados
- Calidad promedio de extracción

## 🔒 Seguridad

### Protección contra Fraudes
- Hash único de cada imagen
- Verificación de duplicados
- Validación cruzada de datos
- Auditoría completa de transacciones

### Privacidad de Datos
- Los datos extraídos se almacenan localmente
- No se envían a servicios externos
- Cumplimiento con regulaciones de privacidad

## 🚀 Mejoras Futuras

### Funcionalidades Planificadas
- [ ] Soporte para más idiomas
- [ ] Reconocimiento de firmas
- [ ] Validación de cheques
- [ ] Integración con APIs bancarias
- [ ] Machine Learning para mejorar precisión

### Optimizaciones Técnicas
- [ ] Procesamiento asíncrono
- [ ] Cache de resultados OCR
- [ ] Compresión inteligente de imágenes
- [ ] Soporte para documentos PDF

## 📞 Soporte

### Comandos Útiles
```bash
# Verificar estado del sistema
php artisan tesseract:install --check

# Limpiar cache
php artisan cache:clear
php artisan config:clear

# Ver logs de OCR
tail -f storage/logs/laravel.log | grep OCR
```

### Recursos Adicionales
- [Documentación de Tesseract](https://tesseract-ocr.github.io/)
- [Intervention Image](https://image.intervention.io/)
- [Laravel Livewire](https://laravel-livewire.com/)

## 📝 Changelog

### v1.0.0 (2025-08-29)
- ✅ Implementación inicial de OCR
- ✅ Servicio de procesamiento de imágenes
- ✅ Integración con formularios de pago
- ✅ Detección de duplicados
- ✅ Validación automática de datos
- ✅ Comando de instalación
- ✅ Documentación completa

---

**¡La implementación de Tesseract OCR está lista para usar! 🎉**

Para comenzar, ejecuta:
```bash
php artisan tesseract:install
```
