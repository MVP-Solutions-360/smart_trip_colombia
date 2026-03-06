# Analytics de Ventas - Sistema CRM

## 📊 Descripción General

El sistema de analytics de ventas proporciona visualizaciones en tiempo real del comportamiento de las ventas, incluyendo gráficas interactivas, sumatorias automáticas y filtros avanzados basados en roles de usuario.

## 🎯 Funcionalidades Principales

### 1. **Gráfica Lineal de Comportamiento**
- **Tecnología**: Chart.js v3+
- **Tipo**: Línea con área rellena
- **Características**:
  - Líneas curvadas suaves (`tension: 0.3`)
  - Puntos diferenciados por tipo de día
  - Escalado automático del eje Y
  - Tooltips informativos con formato de moneda

### 2. **Sumatoria de Ventas**
- **Campo utilizado**: `total_fare` de la tabla `sales`
- **Formato**: Moneda colombiana con separadores de miles
- **Actualización**: Tiempo real con filtros aplicados

### 3. **Filtros Inteligentes**
- **Filtro por fechas**: Rango personalizable (Desde/Hasta)
- **Filtro por asesor**: Solo para administradores y supervisores
- **Filtro de búsqueda**: Cliente, código, destino
- **Filtro de ordenamiento**: Múltiples criterios disponibles

## 🏗️ Arquitectura Técnica

### **Flujo de Datos**:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Usuario       │    │   Livewire       │    │   Chart.js      │
│   (Filtros)     │───▶│   Component      │───▶│   Frontend      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Base de Datos  │
                       │   (Tabla sales)  │
                       └──────────────────┘
```

### **Proceso de Cálculo**:
```
1. Usuario aplica filtros (fechas, asesor, búsqueda)
   ↓
2. Livewire valida permisos según rol de usuario
   ↓
3. Se ejecuta query con filtros aplicados
   ↓
4. Se calculan analytics (total, datos de gráfica)
   ↓
5. Se renderiza vista con datos
   ↓
6. JavaScript inicializa/actualiza Chart.js
   ↓
7. Gráfica se muestra con datos actualizados
```

### **Backend (Laravel Livewire)**

#### **Componente Principal**: `app/Livewire/Sales/MySales.php`

```php
class MySales extends Component
{
    use WithPagination;
    
    // Propiedades de filtros
    public $search = '';
    public $status = '';
    public $orderBy = 'created_at_desc';
    public $startDate = '';
    public $endDate = '';
    public $advisorId = '';
    
    // Propiedades de analytics
    public $totalSalesAmount = 0;
    public $chartData = [];
    public $chartLabels = [];
}
```

#### **Método de Cálculo de Analytics**:
```php
private function calculateAnalytics($query)
{
    // 1. Clonar query sin paginación
    $analyticsQuery = clone $query;
    $analyticsQuery->getQuery()->orders = null;
    
    // 2. Aplicar filtros de fecha
    $startDate = $this->startDate ?: now()->startOfMonth()->format('Y-m-d');
    $endDate = $this->endDate ?: now()->endOfMonth()->format('Y-m-d');
    
    $analyticsQuery->whereDate('created_at', '>=', $startDate)
                  ->whereDate('created_at', '<=', $endDate);
    
    // 3. Obtener ventas del período
    $sales = $analyticsQuery->get();
    
    // 4. Calcular total vendido
    $this->totalSalesAmount = $sales->sum('total_fare');
    
    // 5. Generar datos para gráfica (incluyendo ceros)
    for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
        $dateStr = $date->format('Y-m-d');
        $daySales = $salesByDay->get($dateStr, collect());
        $dayTotal = $daySales->sum('total_fare');
        
        $this->chartLabels[] = $date->format('d/m');
        $this->chartData[] = $dayTotal;
    }
}
```

### **Frontend (Blade + Chart.js)**

#### **Vista Principal**: `resources/views/livewire/sales/my-sales.blade.php`

```blade
{{-- Gráfica de ventas --}}
<div class="mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Comportamiento de Ventas
            </h3>
            <div class="text-sm text-gray-500 dark:text-gray-400">
                {{-- Rango de fechas dinámico --}}
            </div>
        </div>
        <div class="h-64 relative">
            <canvas id="salesChart" width="400" height="200"></canvas>
            <div id="noDataMessage" class="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded hidden">
                <div class="text-center">
                    <x-heroicon-o-chart-bar class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay datos de ventas para el período seleccionado</p>
                </div>
            </div>
        </div>
    </div>
</div>
```

#### **Configuración de Chart.js**:
```javascript
salesChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: 'Ventas ($)',
            data: chartData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: function(context) {
                return context.parsed.y > 0 ? 'rgb(59, 130, 246)' : 'rgba(156, 163, 175, 0.5)';
            },
            pointRadius: function(context) {
                return context.parsed.y > 0 ? 5 : 2;
            }
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
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
    }
});
```

## 🔐 Control de Acceso Basado en Roles

### **Jerarquía de Permisos**:

1. **Super-Admin**:
   - Ve todas las ventas del sistema
   - Acceso completo a todos los filtros
   - Sin restricciones de `agency_id` o `tenant_id`

2. **Administrador/Supervisor**:
   - Ve todas las ventas de su agencia
   - Acceso al filtro por asesor
   - Filtrado por `agency_id` y `tenant_id`

3. **Vendedor/Asesor**:
   - Ve solo sus propias ventas
   - Sin acceso al filtro por asesor
   - Filtrado por `user_id`, `agency_id` y `tenant_id`

### **Implementación de Filtros**:
```php
// Aplicar filtros según el rol del usuario
if ($user->hasRole('super-admin')) {
    // Super admin ve todas las ventas
    // No aplicamos filtros adicionales
} elseif ($user->hasRole(['administrador', 'supervisor'])) {
    // Administrador y Supervisor ven todas las ventas de su agencia
    $query->where('agency_id', $user->agency_id)
          ->where('tenant_id', $user->agency->tenant_id);
} else {
    // Vendedor (asesor) solo ve sus propias ventas
    $query->where('user_id', $user->id)
          ->where('agency_id', $user->agency_id)
          ->where('tenant_id', $user->agency->tenant_id);
}
```

## 📈 Comportamiento de la Gráfica

### **Sin Filtros de Fecha**:
- **Rango**: Todo el mes actual
- **Datos**: Todos los días del mes (incluyendo ceros)
- **Visualización**: Línea completa con tendencia mensual
- **Puntos**: Diferenciados por días con/sin ventas

### **Con Filtros de Fecha**:
- **Rango**: Período seleccionado (Desde/Hasta)
- **Datos**: Solo días del rango filtrado
- **Visualización**: Línea ajustada al período
- **Adaptación**: Se recalcula automáticamente

### **Estados Especiales**:
- **Sin datos**: Mensaje informativo con icono
- **Todos ceros**: Gráfica plana en $0
- **Un solo día**: Punto único con línea horizontal

## 🎨 Elementos Visuales

### **Indicadores de Resumen**:
```blade
<div class="flex space-x-3">
    <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
        {{ $sales->total() }} ventas
    </span>
    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
        {{ $monthlySales ? $monthlySales->count() : 0 }} este mes
    </span>
    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
        ${{ number_format($totalSalesAmount, 0, ',', '.') }} vendido
    </span>
</div>
```

### **Información del Período**:
```blade
<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center space-x-2">
            <x-heroicon-o-calendar class="w-4 h-4" />
            <span>Período:</span>
            <span class="font-medium">
                @if($startDate && $endDate)
                    {{ \Carbon\Carbon::parse($startDate)->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d/m/Y') }}
                @else
                    {{ now()->startOfMonth()->format('d/m/Y') }} - {{ now()->endOfMonth()->format('d/m/Y') }}
                @endif
            </span>
        </div>
        <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Ventas diarias</span>
            </span>
            <span class="text-xs">
                Total: ${{ number_format($totalSalesAmount, 0, ',', '.') }}
            </span>
        </div>
    </div>
</div>
```

## 🔧 Configuración y Personalización

### **Variables de Configuración**:
- **Altura de gráfica**: `h-64` (256px)
- **Tensión de línea**: `0.3` (suave)
- **Grosor de línea**: `3px`
- **Radio de puntos**: `5px` (con datos), `2px` (sin datos)
- **Límite de etiquetas X**: `15`

### **Colores del Tema**:
- **Línea principal**: `rgb(59, 130, 246)` (azul)
- **Área rellena**: `rgba(59, 130, 246, 0.1)` (azul transparente)
- **Puntos con datos**: `rgb(59, 130, 246)` (azul)
- **Puntos sin datos**: `rgba(156, 163, 175, 0.5)` (gris)

## 🐛 Debug y Monitoreo

### **Logs de PHP**:
```php
Log::info('Debug Analytics - Valores de ventas', [
    'total_sales_count' => $sales->count(),
    'total_amount' => $this->totalSalesAmount,
    'chart_data_count' => count($this->chartData),
    'chart_labels_count' => count($this->chartLabels),
    'chart_data' => $this->chartData,
    'chart_labels' => $this->chartLabels,
    'sample_sales' => $sales->take(3)->map(function($sale) {
        return [
            'id' => $sale->id,
            'total_fare' => $sale->total_fare,
            'created_at' => $sale->created_at->format('Y-m-d H:i:s')
        ];
    })->toArray()
]);
```

### **Logs de JavaScript**:
```javascript
console.log('Chart Data:', chartData);
console.log('Chart Labels:', chartLabels);
console.log('Data length:', chartData ? chartData.length : 'undefined');
console.log('Data sum:', chartData ? chartData.reduce((a, b) => a + b, 0) : 'undefined');
```

## 📋 Dependencias

### **Backend**:
- Laravel 10+
- Livewire 3+
- Spatie Laravel Permission
- Carbon (manejo de fechas)

### **Frontend**:
- Chart.js 3+
- Tailwind CSS
- Heroicons
- Alpine.js (via Livewire)

## 🚀 Próximas Mejoras

### **Funcionalidades Planificadas**:
1. **Múltiples métricas**: Ingresos vs Gastos
2. **Comparativas**: Período anterior vs actual
3. **Exportación**: PDF/Excel de gráficas
4. **Notificaciones**: Alertas de metas alcanzadas
5. **Filtros avanzados**: Por tipo de producto, estado de pago

### **Optimizaciones Técnicas**:
1. **Caché de consultas**: Para mejorar performance
2. **Lazy loading**: Carga diferida de datos
3. **WebSockets**: Actualizaciones en tiempo real
4. **Compresión**: Optimización de datos transferidos

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo con:
- Descripción detallada del problema
- Pasos para reproducir
- Logs relevantes (PHP y JavaScript)
- Capturas de pantalla si aplica

---

**Última actualización**: Septiembre 2025  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo CRM
