# Diseño y UI/UX

## 📋 Descripción General

Esta sección contiene toda la documentación relacionada con el diseño, colores corporativos y elementos de interfaz de usuario del sistema CRM. Incluye guías de estilo, componentes de diseño y ejemplos visuales.

## 🎯 Contenido de la Sección

- ✅ **Colores corporativos** y paleta de colores
- ✅ **Componentes de diseño** y UI
- ✅ **Guías de estilo** y branding
- ✅ **Ejemplos visuales** y demos
- ✅ **Elementos de interfaz** de usuario
- ✅ **Consistencia visual** del sistema

## 📁 Archivos de Documentación

### 🎨 [Colores Corporativos](CORPORATE_COLORS_README.md)
**Archivo**: `CORPORATE_COLORS_README.md`

**Contenido**:
- Paleta de colores corporativos
- Guías de uso de colores
- Combinaciones recomendadas
- Accesibilidad y contraste

### 🖼️ [Demo de Colores](CORPORATE_COLORS_DEMO.md)
**Archivo**: `CORPORATE_COLORS_DEMO.md`

**Contenido**:
- Ejemplos visuales de colores
- Demostraciones de uso
- Casos de aplicación
- Comparaciones visuales

## 🚀 Inicio Rápido

### 1. Colores Principales
```css
/* Colores primarios */
--primary-color: #3B82F6;
--secondary-color: #10B981;
--accent-color: #F59E0B;

/* Colores neutros */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-900: #111827;
```

### 2. Uso en Componentes
```html
<!-- Botón primario -->
<button class="bg-primary-500 text-white px-4 py-2 rounded">
    Botón Primario
</button>

<!-- Botón secundario -->
<button class="bg-secondary-500 text-white px-4 py-2 rounded">
    Botón Secundario
</button>
```

### 3. Aplicación en Tailwind
```css
/* Configuración de colores personalizados */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          900: '#1E3A8A',
        },
        secondary: {
          50: '#ECFDF5',
          500: '#10B981',
          900: '#064E3B',
        }
      }
    }
  }
}
```

## 🎨 Paleta de Colores

### Colores Primarios
- **Azul Principal**: #3B82F6
- **Verde Secundario**: #10B981
- **Amarillo Acento**: #F59E0B

### Colores Neutros
- **Gris Claro**: #F9FAFB
- **Gris Medio**: #6B7280
- **Gris Oscuro**: #111827

### Colores de Estado
- **Éxito**: #10B981
- **Advertencia**: #F59E0B
- **Error**: #EF4444
- **Información**: #3B82F6

## 🔧 Componentes de Diseño

### Botones
- **Primario**: Fondo azul, texto blanco
- **Secundario**: Fondo verde, texto blanco
- **Acento**: Fondo amarillo, texto oscuro
- **Neutro**: Fondo gris, texto oscuro

### Formularios
- **Inputs**: Bordes grises, focus azul
- **Labels**: Texto gris oscuro
- **Validación**: Verde para éxito, rojo para error

### Navegación
- **Sidebar**: Fondo gris oscuro
- **Links**: Texto gris claro, hover blanco
- **Activo**: Fondo azul, texto blanco

## 📊 Estadísticas del Diseño

- **3 colores principales** definidos
- **10+ tonos** por color
- **4 estados** de color
- **Componentes** consistentes
- **Guías** de uso documentadas

## 🔗 Enlaces Útiles

- [Colores Corporativos](CORPORATE_COLORS_README.md)
- [Demo de Colores](CORPORATE_COLORS_DEMO.md)
- [Documentación General](../README.md)

## 📝 Notas de Diseño

### Principios de Diseño
- **Consistencia**: Uso uniforme de colores y componentes
- **Accesibilidad**: Contraste adecuado y legibilidad
- **Usabilidad**: Interfaz intuitiva y fácil de usar
- **Escalabilidad**: Diseño que crece con el sistema

### Mejores Prácticas
- Usar colores corporativos consistentemente
- Mantener contraste adecuado para accesibilidad
- Aplicar principios de diseño responsivo
- Documentar cambios en el sistema de diseño

---

*Documentación de Diseño y UI/UX - Septiembre 2025*
