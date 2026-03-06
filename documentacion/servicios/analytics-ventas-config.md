# Configuración de Analytics de Ventas

## ⚙️ Variables de Configuración

### **Configuración de Gráfica**

```php
// En app/Livewire/Sales/MySales.php
class MySales extends Component
{
    // Configuración de analytics
    private $chartConfig = [
        'height' => 'h-64',                    // Altura del contenedor
        'tension' => 0.3,                     // Curvatura de líneas (0-1)
        'borderWidth' => 3,                   // Grosor de línea
        'pointRadius' => 5,                   // Radio de puntos con datos
        'pointRadiusEmpty' => 2,              // Radio de puntos sin datos
        'maxTicksLimit' => 15,                // Máximo de etiquetas en X
        'showEveryNthTick' => 2,              // Mostrar cada N etiquetas
    ];
    
    // Colores del tema
    private $chartColors = [
        'line' => 'rgb(59, 130, 246)',        // Color de línea principal
        'fill' => 'rgba(59, 130, 246, 0.1)',  // Color de área rellena
        'point' => 'rgb(59, 130, 246)',       // Color de puntos con datos
        'pointEmpty' => 'rgba(156, 163, 175, 0.5)', // Color de puntos sin datos
    ];
}
```

### **Configuración de Roles**

```php
// En app/Livewire/Sales/MySales.php
private function getRoleBasedQuery($user, $query)
{
    if ($user->hasRole('super-admin')) {
        // Sin restricciones
        return $query;
    } elseif ($user->hasRole(['administrador', 'supervisor'])) {
        // Solo agencia del usuario
        return $query->where('agency_id', $user->agency_id)
                    ->where('tenant_id', $user->agency->tenant_id);
    } else {
        // Solo ventas del usuario
        return $query->where('user_id', $user->id)
                    ->where('agency_id', $user->agency_id)
                    ->where('tenant_id', $user->agency->tenant_id);
    }
}
```

### **Configuración de Filtros**

```php
// Filtros disponibles por rol
private $availableFilters = [
    'super-admin' => ['search', 'status', 'orderBy', 'startDate', 'endDate', 'advisorId'],
    'administrador' => ['search', 'status', 'orderBy', 'startDate', 'endDate', 'advisorId'],
    'supervisor' => ['search', 'status', 'orderBy', 'startDate', 'endDate', 'advisorId'],
    'vendedor' => ['search', 'status', 'orderBy', 'startDate', 'endDate'],
    'asesor' => ['search', 'status', 'orderBy', 'startDate', 'endDate'],
];
```

## 🎨 Personalización Visual

### **Tema de Colores**

```css
/* Colores principales */
--chart-primary: rgb(59, 130, 246);      /* Azul principal */
--chart-secondary: rgba(59, 130, 246, 0.1); /* Azul transparente */
--chart-empty: rgba(156, 163, 175, 0.5);    /* Gris para ceros */

/* Colores de badges */
--badge-sales: bg-green-100 text-green-800;     /* Verde para ventas */
--badge-monthly: bg-blue-100 text-blue-800;     /* Azul para mensual */
--badge-total: bg-purple-100 text-purple-800;   /* Púrpura para total */
```

### **Configuración de Chart.js**

```javascript
// Opciones personalizables
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: function(context) {
                    return 'Ventas: $' + context.parsed.y.toLocaleString('es-CO');
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value) {
                    return '$' + value.toLocaleString('es-CO');
                }
            }
        },
        x: {
            ticks: {
                maxTicksLimit: 15,
                callback: function(value, index, ticks) {
                    return index % 2 === 0 ? this.getLabelForValue(value) : '';
                }
            }
        }
    }
};
```

## 📊 Configuración de Datos

### **Campos de Base de Datos**

```sql
-- Tabla sales
CREATE TABLE sales (
    id BIGINT PRIMARY KEY,
    tenant_id UUID,
    agency_id BIGINT,
    request_id BIGINT,
    client_id BIGINT,
    user_id BIGINT,
    reservation_code VARCHAR(255) UNIQUE,
    total_fare INTEGER,           -- Campo principal para cálculos
    total_provider INTEGER,
    created_by TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### **Relaciones del Modelo**

```php
// En app/Models/Sale.php
class Sale extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at'];
    
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}
```

## 🔧 Configuración de Performance

### **Optimizaciones de Consulta**

```php
// Eager loading para evitar N+1 queries
$query = Sale::with(['client', 'agency', 'request']);

// Índices recomendados
// CREATE INDEX idx_sales_created_at ON sales(created_at);
// CREATE INDEX idx_sales_agency_id ON sales(agency_id);
// CREATE INDEX idx_sales_user_id ON sales(user_id);
// CREATE INDEX idx_sales_tenant_id ON sales(tenant_id);
```

### **Configuración de Caché**

```php
// En app/Livewire/Sales/MySales.php
public function calculateAnalytics($query)
{
    $cacheKey = 'analytics_' . md5(serialize([
        'user_id' => auth()->id(),
        'start_date' => $this->startDate,
        'end_date' => $this->endDate,
        'advisor_id' => $this->advisorId
    ]));
    
    return Cache::remember($cacheKey, 300, function() use ($query) {
        // Cálculo de analytics
    });
}
```

## 🚨 Configuración de Debug

### **Niveles de Log**

```php
// En config/logging.php
'channels' => [
    'analytics' => [
        'driver' => 'single',
        'path' => storage_path('logs/analytics.log'),
        'level' => 'debug',
    ],
];
```

### **Debug en Desarrollo**

```php
// En app/Livewire/Sales/MySales.php
if (config('app.debug')) {
    Log::channel('analytics')->debug('Analytics calculation', [
        'user_id' => auth()->id(),
        'filters' => [
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'advisor_id' => $this->advisorId
        ],
        'results' => [
            'total_sales' => $sales->count(),
            'total_amount' => $this->totalSalesAmount,
            'chart_data_points' => count($this->chartData)
        ]
    ]);
}
```

## 📈 Configuración de Métricas

### **Métricas Adicionales**

```php
// Métricas que se pueden agregar
private function calculateAdditionalMetrics($sales)
{
    return [
        'average_daily_sales' => $sales->avg('total_fare'),
        'best_day' => $sales->max('total_fare'),
        'worst_day' => $sales->min('total_fare'),
        'growth_rate' => $this->calculateGrowthRate($sales),
        'conversion_rate' => $this->calculateConversionRate($sales),
    ];
}
```

### **Umbrales de Alertas**

```php
// Configuración de alertas
private $alertThresholds = [
    'low_sales' => 1000000,        // $1,000,000
    'high_sales' => 10000000,      // $10,000,000
    'zero_days' => 3,              // 3 días consecutivos sin ventas
];
```

## 🔄 Configuración de Actualización

### **Frecuencia de Actualización**

```javascript
// Auto-refresh cada 5 minutos
setInterval(function() {
    if (document.visibilityState === 'visible') {
        Livewire.emit('refreshAnalytics');
    }
}, 300000); // 5 minutos
```

### **Eventos de Livewire**

```php
// En app/Livewire/Sales/MySales.php
protected $listeners = [
    'refreshAnalytics' => 'refreshData',
    'filterChanged' => 'updateAnalytics',
];

public function refreshData()
{
    $this->render();
}

public function updateAnalytics()
{
    $this->calculateAnalytics($this->getBaseQuery());
}
```

---

**Nota**: Esta configuración debe ser ajustada según las necesidades específicas del negocio y los requisitos de performance del sistema.
