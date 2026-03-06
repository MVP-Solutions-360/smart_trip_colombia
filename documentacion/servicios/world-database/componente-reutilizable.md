# 🌍 Componentes Reutilizables: Country & City Selectors

## 📋 Descripción

Los componentes `country-selector` y `city-search` son selectores reutilizables que se conectan directamente a la base de datos World y proporcionan interfaces de búsqueda en tiempo real optimizadas para manejar grandes volúmenes de datos.

## ✨ Características

### Country Selector
- 🔍 **Búsqueda en tiempo real** - Filtra países mientras escribes
- 📋 **250 países disponibles** - Lista completa de la BD World
- ✨ **Interfaz moderna** - Diseño consistente con Flux UI
- 📱 **Responsive** - Funciona en móviles y desktop
- 🌙 **Modo oscuro** - Soporte completo para tema oscuro
- ⚠️ **Validación robusta** - Solo acepta países válidos
- 🔄 **Valor inicial** - Muestra el valor guardado en BD
- 🎯 **Reutilizable** - Fácil de implementar en cualquier formulario

### City Search
- 🔍 **Búsqueda inteligente** - 150,375+ ciudades disponibles
- ⚡ **Optimización de rendimiento** - Búsqueda solo con 3+ caracteres
- 🎯 **Formato unificado** - "Ciudad (Código País)" (ej: "Medellín (COL)")
- ⏱️ **Debounce inteligente** - 500ms para evitar consultas excesivas
- 🔄 **Indicador de carga** - Feedback visual durante búsquedas
- 📊 **Carga inicial optimizada** - 200 ciudades populares precargadas
- 🎨 **Interfaz moderna** - Diseño consistente con Flux UI
- 📱 **Responsive** - Funciona en móviles y desktop

## 🚀 Uso Básico

### 1. En Componentes Livewire

```php
<?php

namespace App\Livewire\MiComponente;

use Livewire\Component;
use App\Traits\HasWorldCountries;

class MiComponente extends Component
{
    use HasWorldCountries;
    
    public $nationality;
    
    public function mount()
    {
        $this->loadCountries();
    }
    
    public function render()
    {
        return view('livewire.mi-componente');
    }
}
```

### 2. En Vistas Blade

```blade
<x-country-selector 
    wire-model="nationality" 
    label="Nacionalidad" 
    :required="true"
    :countries="$countries"
/>
```

## 📝 Parámetros del Componente

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `wire-model` | string | ✅ | Nombre del campo Livewire |
| `label` | string | ❌ | Etiqueta del campo (default: "Nacionalidad") |
| `required` | boolean | ❌ | Si el campo es requerido (default: false) |
| `placeholder` | string | ❌ | Texto del placeholder (default: "Buscar país...") |
| `countries` | array | ✅ | Array de países desde el trait |

## 🔧 Ejemplos de Uso

### Ejemplo 1: Campo Requerido

```blade
<x-country-selector 
    wire-model="nationality" 
    label="Nacionalidad" 
    :required="true"
    :countries="$countries"
/>
```

### Ejemplo 2: Campo Opcional

```blade
<x-country-selector 
    wire-model="country_of_birth" 
    label="País de Nacimiento" 
    :required="false"
    :countries="$countries"
/>
```

### Ejemplo 3: Con Placeholder Personalizado

```blade
<x-country-selector 
    wire-model="residence_country" 
    label="País de Residencia" 
    placeholder="Selecciona tu país de residencia..."
    :countries="$countries"
/>
```

## 🏙️ City Search Component

### Uso Básico

#### 1. En Componentes Livewire

```php
<?php

namespace App\Livewire\MiComponente;

use Livewire\Component;
use App\Traits\HasCitySearch;

class MiComponente extends Component
{
    use HasCitySearch;
    
    public $origin_city;
    public $destination_city;
    
    public function mount()
    {
        $this->loadInitialCities();
    }
    
    public function render()
    {
        return view('livewire.mi-componente');
    }
}
```

#### 2. En Vistas Blade

```blade
<x-city-search 
    wire-model="origin_city" 
    label="Ciudad de Origen" 
    :required="true"
    :cities="$cities"
    placeholder="Buscar ciudad de origen... (ej: Medellín)"
/>
```

### Parámetros del City Search

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `wire-model` | string | ✅ | Nombre del campo Livewire |
| `label` | string | ❌ | Etiqueta del campo |
| `required` | boolean | ❌ | Si el campo es requerido (default: false) |
| `placeholder` | string | ❌ | Texto del placeholder |
| `cities` | array | ✅ | Array de ciudades desde el trait |

## 🛠️ Traits Disponibles

### HasWorldCountries

#### Métodos Disponibles

##### `loadCountries()`
Carga los países desde la base de datos World con fallback automático.

```php
public function mount()
{
    $this->loadCountries();
}
```

##### `validateCountry($nationality, $fieldName = 'nationality')`
Valida que la nacionalidad sea un país válido.

```php
public function save()
{
    $this->validateCountry($this->nationality);
    // ... resto del código
}
```

#### Propiedades Disponibles

- `$countries` - Array con todos los países cargados

### HasCitySearch

#### Métodos Disponibles

##### `loadInitialCities($limit = 200)`
Carga ciudades iniciales populares para mostrar al usuario.

```php
public function mount()
{
    $this->loadInitialCities();
}
```

##### `searchCities($query = '', $limit = 100)`
Busca ciudades en la base de datos World (solo con 3+ caracteres).

```php
public function searchCitiesDynamic($query)
{
    return $this->searchCities($query);
}
```

##### `parseCityInfo($cityDisplayName)`
Parsea el formato "Ciudad (Código)" en nombre y código de país.

```php
$cityInfo = $this->parseCityInfo("Medellín (COL)");
// Resultado: ['city' => 'Medellín', 'country_code' => 'COL']
```

##### `validateCity($cityDisplayName, $fieldName = 'city')`
Valida que la ciudad sea válida contra la base de datos.

```php
public function save()
{
    $this->validateCity($this->origin_city, 'origin_city');
    // ... resto del código
}
```

#### Propiedades Disponibles

- `$cities` - Array con ciudades iniciales cargadas

## 🎨 Personalización

### Estilos CSS

El componente usa clases de Tailwind CSS que se pueden personalizar:

```blade
<!-- Personalizar estilos -->
<x-country-selector 
    wire-model="nationality" 
    :countries="$countries"
    class="mi-clase-personalizada"
/>
```

### Modo Oscuro

El componente detecta automáticamente el modo oscuro y aplica los estilos correspondientes.

## 🔍 Funcionalidades Avanzadas

### Búsqueda Inteligente

- Filtra países en tiempo real
- Búsqueda case-insensitive
- Muestra resultados mientras escribes

### Validación Automática

- Valida países contra la lista cargada
- Muestra errores de validación
- Previene envío de países inválidos

### Fallback Robusto

- Si falla la conexión a BD World, usa lista básica
- Logs de errores para debugging
- Funcionalidad garantizada

## 📊 Rendimiento

### Country Selector
- **Carga inicial**: ~250 países en <100ms
- **Búsqueda**: Filtrado instantáneo
- **Memoria**: Mínimo impacto
- **Caché**: Se puede implementar fácilmente

### City Search
- **Carga inicial**: 200 ciudades populares en <200ms
- **Búsqueda local**: Filtrado instantáneo (1-2 caracteres)
- **Búsqueda en BD**: Solo con 3+ caracteres, debounce 500ms
- **Base de datos**: 150,375+ ciudades disponibles
- **Memoria**: Optimizada con carga inicial limitada
- **Rendimiento**: Consultas limitadas a 100 resultados máximo

## 🚨 Consideraciones

### Requisitos

- Laravel 10+
- Livewire 3+
- Alpine.js
- Tailwind CSS
- Conexión a BD World

### Limitaciones

- Requiere conexión a base de datos World
- Dependiente de Alpine.js para funcionalidad
- No incluye caché por defecto

## 🔧 Implementación en Otros Formularios

### Paso 1: Agregar Trait

```php
use App\Traits\HasWorldCountries;

class MiFormulario extends Component
{
    use HasWorldCountries;
    
    // ... resto del código
}
```

### Paso 2: Cargar Países

```php
public function mount()
{
    $this->loadCountries();
}
```

### Paso 3: Usar Componente

```blade
<x-country-selector 
    wire-model="mi_campo" 
    :countries="$countries"
/>
```

### Paso 4: Validar (Opcional)

```php
public function save()
{
    $this->validateCountry($this->mi_campo, 'mi_campo');
    // ... resto del código
}
```

## 📈 Próximas Mejoras

- [x] ~~Crear componente para ciudades~~ ✅ **Completado**
- [x] ~~Optimizar búsqueda de ciudades~~ ✅ **Completado**
- [x] ~~Implementar debounce inteligente~~ ✅ **Completado**
- [x] ~~Agregar indicadores de carga~~ ✅ **Completado**
- [ ] Implementar caché de países y ciudades
- [ ] Agregar soporte para múltiples idiomas
- [ ] Agregar filtros por región
- [ ] Implementar lazy loading para ciudades
- [ ] Agregar geolocalización automática
- [ ] Crear componente para estados/provincias

## 🐛 Troubleshooting

### Country Selector

#### Problema: Campo se limpia al abrir
**Solución**: Asegúrate de que el componente esté usando la versión actualizada con `init()`.

#### Problema: Países no cargan
**Solución**: Verifica la conexión a BD World y revisa los logs.

#### Problema: Validación falla
**Solución**: Asegúrate de que el campo tenga un valor válido de la lista de países.

### City Search

#### Problema: Búsqueda no funciona con menos de 3 caracteres
**Solución**: Es el comportamiento esperado. La búsqueda en BD solo se activa con 3+ caracteres para optimizar rendimiento.

#### Problema: No aparecen todas las ciudades
**Solución**: Escribe al menos 3 caracteres para activar la búsqueda en base de datos.

#### Problema: Búsqueda muy lenta
**Solución**: Verifica que el debounce esté funcionando (500ms) y que la conexión a BD World sea estable.

#### Problema: Formato de ciudad incorrecto
**Solución**: Asegúrate de que el formato sea "Ciudad (Código)" (ej: "Medellín (COL)").

#### Problema: Indicador de carga no aparece
**Solución**: Verifica que Alpine.js esté cargado correctamente y que el componente use la versión actualizada.

## 📞 Soporte

Para problemas o preguntas sobre el componente, revisa:

1. Logs de Laravel (`storage/logs/laravel.log`)
2. Documentación de BD World
3. Tests de integración
4. Issues del proyecto

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Compatibilidad**: Laravel 10+, Livewire 3+
