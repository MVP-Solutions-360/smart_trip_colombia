# 🎨 Sistema de Colores Corporativos

## Descripción

El sistema de colores corporativos permite a los usuarios definir los colores de su marca directamente desde la creación de oficinas en el CRM. Estos colores se utilizan para generar automáticamente paletas de colores completas que pueden ser utilizadas en proyectos web.

## Características

- ✅ **Flexibilidad total**: Los usuarios pueden agregar tantos colores como necesiten
- ✅ **Colores predominantes**: Marcado especial para colores que serán la base de la paleta
- ✅ **Generación automática**: Se generan automáticamente variaciones de colores
- ✅ **Múltiples formatos**: CSS, SCSS y JSON para diferentes necesidades
- ✅ **Validación**: Validación de códigos hexadecimales y nombres de colores

## Cómo Funciona

### 1. Definición de Colores

Al crear una oficina, los usuarios pueden:

1. **Agregar colores**: Botón "Agregar Color" para agregar tantos colores como necesiten
2. **Seleccionar color**: Usar el selector de color nativo del navegador
3. **Nombrar colores**: Dar nombres descriptivos a cada color (ej: "Azul corporativo")
4. **Marcar como predominante**: Checkbox para indicar si es un color base importante

### 2. Generación Automática de Paletas

Para cada color marcado como "predominante", el sistema genera automáticamente:

- **Variaciones de luminosidad**: Versiones más claras y oscuras
- **Color complementario**: Color opuesto en el círculo cromático
- **Colores análogos**: Colores adyacentes en el círculo cromático

### 3. Formatos de Salida

El sistema genera tres tipos de archivos:

- **`colors.css`**: Variables CSS para uso directo en proyectos web
- **`_colors.scss`**: Variables SCSS para proyectos que usen preprocesadores
- **`palette.json`**: Estructura JSON completa de la paleta

## Uso del Comando Artisan

### Generar paletas para todas las oficinas

```bash
php artisan colors:generate-palette
```

### Generar paleta para una oficina específica

```bash
php artisan colors:generate-palette "nombre-oficina"
# o
php artisan colors:generate-palette 123
```

### Especificar directorio de salida

```bash
php artisan colors:generate-palette --output=public/css/palettes
```

## Estructura de Datos

Los colores corporativos se almacenan en la base de datos como JSON:

```json
[
  {
    "color": "#FF0000",
    "name": "Rojo corporativo",
    "is_dominant": true
  },
  {
    "color": "#0000FF",
    "name": "Azul secundario",
    "is_dominant": false
  }
]
```

## Ejemplo de Paleta Generada

Para un color rojo corporativo (#FF0000) marcado como predominante:

```css
:root {
  --rojo-corporativo-base: #FF0000;
  --rojo-corporativo-light: #FF6666;
  --rojo-corporativo-lighter: #FFCCCC;
  --rojo-corporativo-dark: #CC0000;
  --rojo-corporativo-darker: #990000;
  --rojo-corporativo-complementary: #00FF00;
  --rojo-corporativo-analogous: #FF8000;
  --rojo-corporativo-analogous: #FF0080;
}
```

## Integración con Proyectos Web

### 1. CSS Directo

```html
<link rel="stylesheet" href="paletas/oficina-nombre/colors.css">
```

### 2. SCSS

```scss
@import "paletas/oficina-nombre/colors";

.button-primary {
  background-color: $rojo-corporativo-base;
  color: white;
  
  &:hover {
    background-color: $rojo-corporativo-dark;
  }
}
```

### 3. JavaScript

```javascript
fetch('paletas/oficina-nombre/palette.json')
  .then(response => response.json())
  .then(palette => {
    console.log('Colores disponibles:', palette);
    // Usar los colores en la aplicación
  });
```

## Beneficios para el Proyecto Web

1. **Consistencia de marca**: Los colores se mantienen sincronizados entre el CRM y el sitio web
2. **Automatización**: No es necesario definir manualmente las paletas de colores
3. **Flexibilidad**: Los usuarios pueden ajustar sus colores sin intervención técnica
4. **Profesionalismo**: Paletas de colores generadas científicamente para mejor armonía visual

## Validaciones

- Los códigos de color deben ser hexadecimales válidos (ej: #FF0000)
- Los nombres de color son obligatorios y deben tener entre 2 y 100 caracteres
- Al menos un color debe estar presente
- Se puede eliminar colores siempre que quede al menos uno

## Próximas Mejoras

- [ ] Vista previa de la paleta generada en tiempo real
- [ ] Exportación a formatos adicionales (Adobe Swatch, Sketch, Figma)
- [ ] Sugerencias de colores basadas en teoría del color
- [ ] Historial de cambios en los colores corporativos
- [ ] Integración con herramientas de diseño populares

## Soporte Técnico

Para cualquier pregunta o problema con el sistema de colores corporativos, contactar al equipo de desarrollo.

---

*Desarrollado para el CRM de agencias de viajes - Sistema de gestión integral*


