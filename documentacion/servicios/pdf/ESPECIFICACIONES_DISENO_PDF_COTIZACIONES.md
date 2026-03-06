# ESPECIFICACIONES DE DISEÑO PARA PDF DE COTIZACIONES WELLEZY

## ANÁLISIS DE IMÁGENES DE REFERENCIA

### Imágenes Analizadas:
1. **Cotización de Servicios Aéreos** - Vuelo Medellín a Punta Cana
2. **Cotización de Hotel** - Occidental Caribe, Punta Cana
3. **Cotización de Paquetes** - Información general de paquetes
4. **Nota de Pago** - Información bancaria y contacto
5. **Cotización de Tours** - Tour a Guatapé, Piedra del Peñol
6. **Cotización de Traslados** - Servicios de transfer
7. **Cotización de Alquiler de Autos** - Servicios de renta de vehículos

---

## 1. ESTRUCTURA GENERAL DEL DOCUMENTO

### 1.1 Dimensiones y Orientación
- **Formato**: A4 (210mm x 297mm)
- **Orientación**: Portrait (vertical)
- **Márgenes**: 20mm en todos los lados
- **Área de contenido**: 170mm x 257mm

### 1.2 Estructura de Layout
```
┌─────────────────────────────────────┐
│           HEADER SECTION            │ ← 60mm altura
│  (Imagen de fondo + Logo + Título)  │
├─────────────────────────────────────┤
│                                     │
│         CONTENT SECTION             │ ← Contenido principal
│   (Descripción, Tablas, Servicios)  │
│                                     │
├─────────────────────────────────────┤
│           FOOTER SECTION            │ ← 20mm altura
│    (Información legal + Contacto)   │
└─────────────────────────────────────┘
```

---

## 2. PALETA DE COLORES CORPORATIVA

### 2.1 Colores Primarios
- **Azul Principal**: `#4A90E2` (RGB: 74, 144, 226)
- **Azul Claro**: `#87CEEB` (RGB: 135, 206, 235)
- **Azul Oscuro**: `#2E5BBA` (RGB: 46, 91, 186)

### 2.2 Colores Secundarios
- **Blanco**: `#FFFFFF` (RGB: 255, 255, 255)
- **Gris Claro**: `#F8F9FA` (RGB: 248, 249, 250)
- **Gris Medio**: `#6C757D` (RGB: 108, 117, 125)
- **Gris Oscuro**: `#343A40` (RGB: 52, 58, 64)
- **Negro**: `#000000` (RGB: 0, 0, 0)

### 2.3 Colores de Acento
- **Verde Éxito**: `#28A745` (RGB: 40, 167, 69)
- **Rojo Error**: `#DC3545` (RGB: 220, 53, 69)
- **Amarillo Advertencia**: `#FFC107` (RGB: 255, 193, 7)

---

## 3. TIPOGRAFÍA

### 3.1 Fuentes Principales
- **Títulos**: 'Inter', 'Segoe UI', 'Arial', sans-serif
- **Cuerpo**: 'Inter', 'Segoe UI', 'Arial', sans-serif
- **Monospace**: 'JetBrains Mono', 'Consolas', monospace

### 3.2 Jerarquía Tipográfica
- **H1 (Título Principal)**: 32px, font-weight: 700, color: #FFFFFF
- **H2 (Secciones)**: 24px, font-weight: 600, color: #4A90E2
- **H3 (Subsecciones)**: 20px, font-weight: 600, color: #2E5BBA
- **H4 (Subtítulos)**: 16px, font-weight: 500, color: #343A40
- **Body (Texto)**: 14px, font-weight: 400, color: #343A40
- **Small (Pie de página)**: 12px, font-weight: 400, color: #6C757D

---

## 4. HEADER SECTION (60mm altura)

### 4.1 Estructura del Header
```
┌─────────────────────────────────────┐
│ [LOGO] wellezy    [TÍTULO] HOTEL   │
│                                     │
│        IMAGEN DE FONDO              │
│     (con overlay degradado)         │
│                                     │
│ Medellín, 11 de mayo de 2023       │
└─────────────────────────────────────┘
```

### 4.2 Especificaciones del Logo
- **Posición**: Esquina superior izquierda
- **Tamaño**: 40mm x 15mm
- **Color**: Blanco (#FFFFFF)
- **Fuente**: Sans-serif, font-weight: 600
- **Elementos**: Texto "wellezy" + ícono de avión + línea punteada

### 4.3 Imagen de Fondo
- **Cobertura**: 100% del header
- **Altura**: 60mm
- **Overlay**: Gradiente negro con opacidad 0.3
- **Efecto**: Desvanecimiento en esquina inferior derecha
- **Bordes**: Redondeados en esquina inferior izquierda (radio: 8px)

### 4.4 Título Principal
- **Posición**: Esquina superior derecha
- **Tamaño**: 28px
- **Color**: Blanco (#FFFFFF)
- **Font-weight**: 700
- **Text-shadow**: 2px 2px 4px rgba(0,0,0,0.5)

### 4.5 Fecha y Ubicación
- **Posición**: Esquina inferior izquierda
- **Formato**: "Medellín, 11 de mayo de 2023"
- **Tamaño**: 14px
- **Color**: Blanco (#FFFFFF)
- **Fondo**: Rectángulo blanco con opacidad 0.9

---

## 5. CONTENT SECTION

### 5.1 Sección de Descripción
- **Título**: "DESCRIPCIÓN" en azul (#4A90E2)
- **Fondo**: Blanco (#FFFFFF)
- **Padding**: 20mm
- **Bordes**: Ninguno
- **Texto**: Justificado, 14px, color #343A40

### 5.2 Tablas de Información
- **Fondo del header**: Azul claro (#87CEEB)
- **Fondo de filas**: Blanco (#FFFFFF)
- **Bordes**: 1px solid #E9ECEF
- **Padding celdas**: 8mm vertical, 12mm horizontal
- **Altura mínima fila**: 12mm

#### 5.2.1 Tabla de Vuelos
```
┌─────────────┬──────────┬─────────────────┬─────────────┬─────────────┐
│ AEROLÍNEA   │ FECHA    │ ITINERARIO      │ H. SALIDA   │ H. LLEGADA  │
├─────────────┼──────────┼─────────────────┼─────────────┼─────────────┤
│ WINGO       │13/07/2023│Medellín-Punta   │    18:38    │    10:13    │
│             │          │Cana             │             │             │
└─────────────┴──────────┴─────────────────┴─────────────┴─────────────┘
```

#### 5.2.2 Tabla de Traslados
```
┌─────────────┬──────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ OPERADOR    │ FECHA    │ L. SALIDA   │ L. LLEGADA  │ H. SALIDA   │ H. LLEGADA  │
├─────────────┼──────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Wellezy     │13/07/2023│   Miami     │     NY      │    18:38    │    13:32    │
└─────────────┴──────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### 5.3 Sección de Servicios

#### 5.3.1 Servicios Incluidos
- **Título**: "SERVICIOS INCLUIDOS" en azul (#4A90E2)
- **Layout**: 3 columnas
- **Fondo**: Blanco (#FFFFFF)
- **Lista**: Viñetas redondas azules
- **Texto**: 14px, color #343A40

#### 5.3.2 Servicios No Incluidos
- **Título**: "NO INCLUYE" en azul (#4A90E2)
- **Layout**: 1 columna
- **Fondo**: Blanco (#FFFFFF)
- **Lista**: Viñetas redondas rojas
- **Texto**: 14px, color #343A40

### 5.4 Sección de Precios
- **Título**: "VALOR" en azul (#4A90E2)
- **Precio principal**: 32px, font-weight: 700, color #000000
- **Descripción**: "Valor a pagar por 2 adultos, 1 menor de 1 año, corresponde a la suma de:"
- **Formato de precio**: $4,770.130 (con separadores de miles)

---

## 6. FOOTER SECTION (20mm altura)

### 6.1 Información Legal
- **Texto**: "WELLEZY S.A.S se acoge a la ley 679 del 2001 y ley 1336 de 2009..."
- **Tamaño**: 10px
- **Color**: #6C757D
- **Alineación**: Centrado
- **Posición**: Fijo en la parte inferior

---

## 7. MANEJO DE IMÁGENES

### 7.1 Imágenes de Hotel
- **Tamaño**: 60mm x 40mm
- **Bordes**: Redondeados (radio: 8px)
- **Efecto**: Desvanecimiento en esquina inferior derecha
- **Posición**: Inset en esquina inferior izquierda del header
- **Overlay**: Gradiente negro con opacidad 0.2

### 7.2 Imágenes de Fondo
- **Resolución mínima**: 300 DPI
- **Formato**: JPG o PNG
- **Compresión**: Optimizada para web
- **Tamaño máximo**: 2MB por imagen

### 7.3 Efectos Visuales
- **Gradientes**: Linear-gradient(135deg, #4A90E2 0%, #2E5BBA 100%)
- **Sombras**: box-shadow: 0 4px 8px rgba(0,0,0,0.1)
- **Bordes redondeados**: border-radius: 8px
- **Transiciones**: transition: all 0.3s ease

---

## 8. ESPECIFICACIONES TÉCNICAS

### 8.1 Librería de PDF
- **Librería**: DomPDF (ya instalada)
- **Versión**: ^3.1
- **Configuración**: Optimizada para imágenes y fuentes

### 8.2 Configuración DomPDF
```php
$pdf->setOptions([
    'isHtml5ParserEnabled' => true,
    'isRemoteEnabled' => true,
    'isFontSubsettingEnabled' => false,
    'defaultFont' => 'Arial',
    'dpi' => 300, // Alta resolución
    'defaultMediaType' => 'screen',
    'isPhpEnabled' => false,
    'isJavascriptEnabled' => false,
    'chroot' => base_path('public'),
    'tempDir' => storage_path('app/temp'),
    'enableCssFloat' => true,
    'enableFontSubsetting' => false,
    'pdfBackend' => 'CPDF'
]);
```

### 8.3 Estructura de Archivos
```
resources/views/pdf/
├── quotes/
│   ├── hotel-quote.blade.php
│   ├── flight-quote.blade.php
│   ├── package-quote.blade.php
│   ├── transfer-quote.blade.php
│   ├── car-rental-quote.blade.php
│   └── tour-quote.blade.php
├── partials/
│   ├── header.blade.php
│   ├── footer.blade.php
│   └── styles.blade.php
└── layouts/
    └── quote-layout.blade.php
```

---

## 9. COMPONENTES REUTILIZABLES

### 9.1 Header Component
```php
@component('pdf.partials.header', [
    'logo' => $agency->logo,
    'title' => $quoteType,
    'backgroundImage' => $backgroundImage,
    'date' => $quoteDate,
    'location' => $location
])
@endcomponent
```

### 9.2 Table Component
```php
@component('pdf.partials.table', [
    'headers' => $headers,
    'data' => $data,
    'type' => 'flight' // flight, transfer, hotel, etc.
])
@endcomponent
```

### 9.3 Services List Component
```php
@component('pdf.partials.services-list', [
    'included' => $includedServices,
    'notIncluded' => $notIncludedServices,
    'columns' => 3
])
@endcomponent
```

---

## 10. RESPONSIVE DESIGN

### 10.1 Breakpoints
- **Desktop**: > 1200px
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### 10.2 Adaptaciones
- **Imágenes**: Escalado proporcional
- **Tablas**: Scroll horizontal en móviles
- **Texto**: Tamaños adaptativos
- **Espaciado**: Márgenes reducidos en móviles

---

## 11. ACCESIBILIDAD

### 11.1 Contraste
- **Mínimo**: 4.5:1 para texto normal
- **Mínimo**: 3:1 para texto grande
- **Verificación**: Herramientas automáticas

### 11.2 Navegación
- **Estructura semántica**: H1, H2, H3, etc.
- **Alt text**: Para todas las imágenes
- **Focus**: Orden lógico de elementos

---

## 12. OPTIMIZACIÓN

### 12.1 Rendimiento
- **Compresión de imágenes**: 80% calidad
- **Minificación CSS**: Automática
- **Caché**: 24 horas para PDFs generados
- **CDN**: Para imágenes estáticas

### 12.2 SEO
- **Meta tags**: Título y descripción
- **Structured data**: Para información de viajes
- **Sitemap**: Incluir PDFs generados

---

## 13. TESTING

### 13.1 Pruebas Visuales
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Cross-device**: Desktop, tablet, mobile
- **Print preview**: Verificación de impresión

### 13.2 Pruebas Funcionales
- **Generación de PDF**: Todos los tipos de cotización
- **Imágenes**: Carga y renderizado
- **Fuentes**: Fallback y carga
- **Responsive**: Adaptación a diferentes tamaños

---

## 14. MANTENIMIENTO

### 14.1 Actualizaciones
- **Fuentes**: Verificación de licencias
- **Imágenes**: Optimización periódica
- **Código**: Refactoring y optimización
- **Dependencias**: Actualización de librerías

### 14.2 Monitoreo
- **Rendimiento**: Tiempo de generación
- **Errores**: Logs de fallos
- **Uso**: Estadísticas de generación
- **Calidad**: Feedback de usuarios

---

## 15. IMPLEMENTACIÓN PASO A PASO

### Fase 1: Preparación
1. Crear estructura de archivos
2. Configurar estilos base
3. Implementar componentes básicos

### Fase 2: Desarrollo
1. Crear templates para cada tipo de cotización
2. Implementar manejo de imágenes
3. Desarrollar componentes reutilizables

### Fase 3: Testing
1. Pruebas unitarias
2. Pruebas de integración
3. Pruebas de usuario

### Fase 4: Despliegue
1. Configuración de producción
2. Optimización de rendimiento
3. Monitoreo y mantenimiento

---

*Documento creado el: {{ date('Y-m-d H:i:s') }}*
*Versión: 1.0*
*Autor: Sistema de Documentación CRM*
