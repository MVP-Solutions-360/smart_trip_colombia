# Ejemplos de Uso - Base de Datos World

## 📋 Introducción

Esta documentación proporciona ejemplos prácticos de cómo utilizar la base de datos World en diferentes contextos del sistema CRM.

## 🚀 Componentes Optimizados

### City Search con Optimización de Rendimiento

#### Implementación en CreateTravelRequest
```php
<?php

namespace App\Livewire\Request;

use Livewire\Component;
use App\Traits\HasCitySearch;

class CreateTravelRequest extends Component
{
    use HasCitySearch;
    
    public $origin_city;
    public $destination_city;
    public $destination_type;
    
    public function mount()
    {
        // Cargar solo 200 ciudades populares inicialmente
        $this->loadInitialCities(200);
    }
    
    public function searchCitiesDynamic($query)
    {
        // Búsqueda optimizada: solo con 3+ caracteres
        return $this->searchCities($query, 100);
    }
    
    public function updatedOriginCity()
    {
        $this->calculateDestinationType();
    }
    
    public function updatedDestinationCity()
    {
        $this->calculateDestinationType();
    }
    
    private function calculateDestinationType()
    {
        if ($this->origin_city && $this->destination_city) {
            $originInfo = $this->parseCityInfo($this->origin_city);
            $destInfo = $this->parseCityInfo($this->destination_city);
            
            if ($originInfo && $destInfo) {
                $this->destination_type = $originInfo['country_code'] === $destInfo['country_code'] 
                    ? 'Nacional' 
                    : 'Internacional';
            }
        }
    }
    
    public function save()
    {
        $this->validate([
            'origin_city' => 'required|string',
            'destination_city' => 'required|string',
        ]);
        
        // Validar ciudades contra la BD
        $this->validateCity($this->origin_city, 'origin_city');
        $this->validateCity($this->destination_city, 'destination_city');
        
        // Parsear información de ciudades
        $originInfo = $this->parseCityInfo($this->origin_city);
        $destInfo = $this->parseCityInfo($this->destination_city);
        
        // Guardar en BD con campos separados
        Request::create([
            'origin_city' => $originInfo['city'],
            'origin_country' => $originInfo['country_code'],
            'destination_city' => $destInfo['city'],
            'destination_country' => $destInfo['country_code'],
            'destination_type' => $this->destination_type,
            // ... otros campos
        ]);
    }
}
```

#### Vista Blade Optimizada
```blade
<!-- Ciudad de Origen -->
<x-city-search
    wire-model="origin_city"
    label="Ciudad de Origen"
    :required="true"
    :cities="$cities"
    placeholder="Buscar ciudad de origen... (ej: Medellín)"
/>

<!-- Ciudad de Destino -->
<x-city-search
    wire-model="destination_city"
    label="Ciudad de Destino"
    :required="true"
    :cities="$cities"
    placeholder="Buscar ciudad de destino... (ej: Madrid)"
/>

<!-- Tipo de destino calculado automáticamente -->
<div class="col-span-1" x-data="{
    destination_type: @entangle('destination_type'),
    origin_city: @entangle('origin_city'),
    destination_city: @entangle('destination_city'),
    get calculatedType() {
        if (this.origin_city && this.destination_city) {
            const originMatch = this.origin_city.match(/\(([A-Z]{2})\)$/);
            const destMatch = this.destination_city.match(/\(([A-Z]{2})\)$/);
            if (originMatch && destMatch) {
                return originMatch[1] === destMatch[1] ? 'Nacional' : 'Internacional';
            }
        }
        return 'Se calculará automáticamente';
    }
}">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tipo de Destino
    </label>
    <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
        <span class="text-sm font-medium text-gray-900 dark:text-gray-100" x-text="calculatedType"></span>
    </div>
</div>
```

### Optimizaciones de Rendimiento Implementadas

#### 1. Búsqueda por Caracteres Mínimos
```php
// En HasCitySearch trait
public function searchCities($query = '', $limit = 100)
{
    // Solo buscar en BD con 3+ caracteres
    if (strlen($query) < 3) {
        return [];
    }
    
    // ... resto de la búsqueda
}
```

#### 2. Debounce en Frontend
```javascript
// En city-search.blade.php
searchInDatabase() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        this.isSearching = true;
        this.filteredCities = [];
        
        @this.call('searchCitiesDynamic', this.search).then((results) => {
            this.isSearching = false;
            this.filteredCities = results.slice(0, 100);
        });
    }, 500); // 500ms de debounce
}
```

#### 3. Carga Inicial Optimizada
```php
// Cargar solo ciudades populares inicialmente
public function loadInitialCities($limit = 200)
{
    $popularCountries = ['CO', 'US', 'MX', 'ES', 'AR', 'BR', 'CL', 'PE', 'VE', 'EC'];
    
    $cities = DB::connection('world')
        ->table('cities')
        ->join('countries', 'cities.country_id', '=', 'countries.id')
        ->whereIn('countries.iso2', $popularCountries)
        ->select('cities.id', 'cities.name', 'countries.iso2')
        ->limit($limit)
        ->get()
        ->map(function ($city) {
            return [
                'id' => $city->id,
                'name' => $city->name,
                'display_name' => $city->name . ' (' . $city->iso2 . ')',
                'country_code' => $city->iso2
            ];
        });
    
    $this->cities = $cities->toArray();
}
```

## 🔧 Consultas Básicas

### 1. Consultas con DB Facade

#### Obtener Todos los Países
```php
use Illuminate\Support\Facades\DB;

// Obtener países con códigos ISO
$countries = DB::connection('world')
    ->table('countries')
    ->select('id', 'name', 'iso2', 'iso3')
    ->orderBy('name')
    ->get();

foreach ($countries as $country) {
    echo "{$country->name} ({$country->iso2})\n";
}
```

#### Buscar Ciudades por País
```php
// Obtener ciudades de Colombia (ID: 48)
$cities = DB::connection('world')
    ->table('cities')
    ->join('countries', 'cities.country_id', '=', 'countries.id')
    ->where('countries.id', 48)
    ->select('cities.name', 'countries.name as country_name')
    ->orderBy('cities.name')
    ->get();
```

#### Búsqueda de Ciudades (Optimizada)
```php
// Buscar ciudades que contengan "Bogotá" con formato optimizado
$cities = DB::connection('world')
    ->table('cities')
    ->join('countries', 'cities.country_id', '=', 'countries.id')
    ->where('cities.name', 'LIKE', '%Bogotá%')
    ->select('cities.id', 'cities.name', 'countries.iso2', 'countries.name as country_name')
    ->limit(100) // Límite para optimizar rendimiento
    ->get()
    ->map(function ($city) {
        return [
            'id' => $city->id,
            'name' => $city->name,
            'display_name' => $city->name . ' (' . $city->iso2 . ')',
            'country_name' => $city->country_name,
            'country_code' => $city->iso2
        ];
    });
```

### 2. Consultas con Eloquent (Modelos Personalizados)

#### Crear Modelo Country
```php
// app/Models/World/Country.php
<?php

namespace App\Models\World;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $connection = 'world';
    protected $table = 'countries';
    
    public $timestamps = false;
    
    protected $fillable = ['name', 'iso2', 'iso3', 'capital'];
    
    public function cities()
    {
        return $this->hasMany(City::class, 'country_id');
    }
    
    public function states()
    {
        return $this->hasMany(State::class, 'country_id');
    }
}
```

#### Crear Modelo City
```php
// app/Models/World/City.php
<?php

namespace App\Models\World;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $connection = 'world';
    protected $table = 'cities';
    
    public $timestamps = false;
    
    protected $fillable = ['name', 'country_id', 'latitude', 'longitude'];
    
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id');
    }
}
```

#### Usar Modelos Eloquent
```php
use App\Models\World\Country;
use App\Models\World\City;

// Obtener países con Eloquent
$countries = Country::select('id', 'name', 'iso2')
    ->orderBy('name')
    ->get();

// Obtener ciudades de un país
$colombia = Country::find(48);
$cities = $colombia->cities()->select('name')->get();

// Buscar ciudades
$cities = City::where('name', 'LIKE', '%Madrid%')
    ->with('country')
    ->get();
```

## 🎯 Integración en Componentes Livewire

### 1. Selector de Países
```php
// app/Livewire/Components/CountrySelector.php
<?php

namespace App\Livewire\Components;

use Livewire\Component;
use Illuminate\Support\Facades\DB;

class CountrySelector extends Component
{
    public $countries = [];
    public $selectedCountry = '';
    public $cities = [];
    public $selectedCity = '';

    public function mount()
    {
        $this->loadCountries();
    }

    public function loadCountries()
    {
        $this->countries = DB::connection('world')
            ->table('countries')
            ->select('id', 'name', 'iso2')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function updatedSelectedCountry()
    {
        if ($this->selectedCountry) {
            $this->cities = DB::connection('world')
                ->table('cities')
                ->where('country_id', $this->selectedCountry)
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
                ->toArray();
        } else {
            $this->cities = [];
        }
        
        $this->selectedCity = '';
    }

    public function render()
    {
        return view('livewire.components.country-selector');
    }
}
```

### 2. Vista del Componente
```blade
{{-- resources/views/livewire/components/country-selector.blade.php --}}
<div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium mb-2">País</label>
            <select wire:model.live="selectedCountry" class="w-full p-2 border rounded">
                <option value="">Seleccione un país</option>
                @foreach($countries as $country)
                    <option value="{{ $country['id'] }}">{{ $country['name'] }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium mb-2">Ciudad</label>
            <select wire:model="selectedCity" class="w-full p-2 border rounded" 
                    {{ empty($cities) ? 'disabled' : '' }}>
                <option value="">Seleccione una ciudad</option>
                @foreach($cities as $city)
                    <option value="{{ $city['id'] }}">{{ $city['name'] }}</option>
                @endforeach
            </select>
        </div>
    </div>

    @if($selectedCountry && $selectedCity)
        <div class="mt-4 p-4 bg-green-100 rounded">
            <p>País seleccionado: {{ $selectedCountry }}</p>
            <p>Ciudad seleccionada: {{ $selectedCity }}</p>
        </div>
    @endif
</div>
```

## 🎨 Integración en Formularios

### 1. Formulario de Cliente con Ubicación
```php
// app/Livewire/Client/CreateClient.php
<?php

namespace App\Livewire\Client;

use Livewire\Component;
use Illuminate\Support\Facades\DB;

class CreateClient extends Component
{
    public $name = '';
    public $email = '';
    public $country_id = '';
    public $city_id = '';
    public $countries = [];
    public $cities = [];

    public function mount()
    {
        $this->loadCountries();
    }

    public function loadCountries()
    {
        $this->countries = DB::connection('world')
            ->table('countries')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function updatedCountryId()
    {
        if ($this->country_id) {
            $this->cities = DB::connection('world')
                ->table('cities')
                ->where('country_id', $this->country_id)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        } else {
            $this->cities = [];
        }
        
        $this->city_id = '';
    }

    public function save()
    {
        $this->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'country_id' => 'required|exists:world.countries,id',
            'city_id' => 'required|exists:world.cities,id',
        ]);

        // Guardar cliente con ubicación
        Client::create([
            'name' => $this->name,
            'email' => $this->email,
            'country_id' => $this->country_id,
            'city_id' => $this->city_id,
        ]);

        session()->flash('message', 'Cliente creado exitosamente');
        return redirect()->route('clients.index');
    }

    public function render()
    {
        return view('livewire.client.create-client');
    }
}
```

### 2. Validación Personalizada
```php
// app/Rules/ValidWorldCountry.php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ValidWorldCountry implements Rule
{
    public function passes($attribute, $value)
    {
        return DB::connection('world')
            ->table('countries')
            ->where('id', $value)
            ->exists();
    }

    public function message()
    {
        return 'El país seleccionado no es válido.';
    }
}

// Uso en el formulario
public function rules()
{
    return [
        'country_id' => ['required', new ValidWorldCountry()],
        'city_id' => ['required', function ($attribute, $value, $fail) {
            if ($this->country_id) {
                $exists = DB::connection('world')
                    ->table('cities')
                    ->where('id', $value)
                    ->where('country_id', $this->country_id)
                    ->exists();
                
                if (!$exists) {
                    $fail('La ciudad seleccionada no pertenece al país elegido.');
                }
            }
        }],
    ];
}
```

## 🔍 Búsquedas Avanzadas

### 1. Búsqueda de Destinos para Tours
```php
// app/Services/DestinationService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DestinationService
{
    public function searchDestinations($query, $limit = 20)
    {
        return DB::connection('world')
            ->table('cities')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->where('cities.name', 'LIKE', "%{$query}%")
            ->orWhere('countries.name', 'LIKE', "%{$query}%")
            ->select(
                'cities.id as city_id',
                'cities.name as city_name',
                'countries.id as country_id',
                'countries.name as country_name',
                'countries.iso2 as country_code'
            )
            ->orderBy('cities.name')
            ->limit($limit)
            ->get();
    }

    public function getPopularDestinations()
    {
        // Destinos populares basados en tours existentes
        return DB::connection('world')
            ->table('cities')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->whereIn('cities.id', [149237, 112501, 123456]) // IDs de destinos populares
            ->select(
                'cities.id as city_id',
                'cities.name as city_name',
                'countries.name as country_name'
            )
            ->get();
    }
}
```

### 2. Autocompletado de Ciudades
```php
// app/Http/Controllers/Api/CityController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CityController extends Controller
{
    public function autocomplete(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $cities = DB::connection('world')
            ->table('cities')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->where('cities.name', 'LIKE', "%{$query}%")
            ->select(
                'cities.id as value',
                DB::raw("CONCAT(cities.name, ', ', countries.name) as label"),
                'cities.name as city_name',
                'countries.name as country_name'
            )
            ->orderBy('cities.name')
            ->limit(10)
            ->get();

        return response()->json($cities);
    }
}
```

## 📊 Casos de Uso Comunes

### 1. Reporte de Clientes por País
```php
// app/Http/Controllers/ReportController.php
public function clientsByCountry()
{
    $clients = DB::table('clients')
        ->join('world.countries', 'clients.country_id', '=', 'world.countries.id')
        ->select(
            'world.countries.name as country_name',
            DB::raw('COUNT(clients.id) as client_count')
        )
        ->groupBy('world.countries.id', 'world.countries.name')
        ->orderBy('client_count', 'desc')
        ->get();

    return view('reports.clients-by-country', compact('clients'));
}
```

### 2. Mapa de Destinos de Tours
```php
// app/Http/Controllers/TourController.php
public function getTourDestinations()
{
    $destinations = DB::connection('world')
        ->table('cities')
        ->join('countries', 'cities.country_id', '=', 'countries.id')
        ->join('tours', 'tours.destination_city_id', '=', 'cities.id')
        ->select(
            'cities.name as city_name',
            'countries.name as country_name',
            'cities.latitude',
            'cities.longitude',
            DB::raw('COUNT(tours.id) as tour_count')
        )
        ->groupBy('cities.id', 'cities.name', 'countries.name', 'cities.latitude', 'cities.longitude')
        ->get();

    return response()->json($destinations);
}
```

### 3. Validación de Códigos Postales
```php
// app/Services/AddressService.php
public function validateAddress($countryId, $cityId, $postalCode = null)
{
    $city = DB::connection('world')
        ->table('cities')
        ->join('countries', 'cities.country_id', '=', 'countries.id')
        ->where('cities.id', $cityId)
        ->where('countries.id', $countryId)
        ->select('cities.name as city_name', 'countries.name as country_name')
        ->first();

    if (!$city) {
        return [
            'valid' => false,
            'message' => 'La ciudad no pertenece al país seleccionado'
        ];
    }

    return [
        'valid' => true,
        'city' => $city->city_name,
        'country' => $city->country_name
    ];
}
```

## 🚀 Optimizaciones

### 1. Caché de Consultas Frecuentes
```php
// app/Services/CacheService.php
use Illuminate\Support\Facades\Cache;

public function getCachedCountries()
{
    return Cache::remember('world_countries', 3600, function () {
        return DB::connection('world')
            ->table('countries')
            ->select('id', 'name', 'iso2')
            ->orderBy('name')
            ->get();
    });
}
```

### 2. Consultas Paginadas
```php
public function getCitiesPaginated($countryId, $perPage = 50)
{
    return DB::connection('world')
        ->table('cities')
        ->where('country_id', $countryId)
        ->select('id', 'name')
        ->orderBy('name')
        ->paginate($perPage);
}
```

---

*Ejemplos de Uso - Base de Datos World - Septiembre 2025*
