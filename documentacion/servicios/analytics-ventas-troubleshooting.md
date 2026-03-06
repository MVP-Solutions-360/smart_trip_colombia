# Troubleshooting - Analytics de Ventas

## 🚨 Problemas Comunes y Soluciones

### **1. Gráfica No Se Muestra**

#### **Síntomas**:
- La gráfica aparece en blanco
- Mensaje "No hay datos" cuando sí hay ventas
- Console muestra errores de JavaScript

#### **Diagnóstico**:
```javascript
// Verificar en consola del navegador
console.log('Chart Data:', chartData);
console.log('Chart Labels:', chartLabels);
console.log('Data sum:', chartData ? chartData.reduce((a, b) => a + b, 0) : 'undefined');
```

#### **Soluciones**:
1. **Verificar datos en PHP**:
```php
// En app/Livewire/Sales/MySales.php
Log::info('Debug Analytics', [
    'chart_data' => $this->chartData,
    'chart_labels' => $this->chartLabels,
    'total_amount' => $this->totalSalesAmount
]);
```

2. **Verificar Chart.js**:
```javascript
// Verificar que Chart.js se cargó
if (typeof Chart === 'undefined') {
    console.error('Chart.js no está cargado');
}
```

3. **Verificar canvas**:
```javascript
const ctx = document.getElementById('salesChart');
if (!ctx) {
    console.error('Canvas no encontrado');
}
```

### **2. Valores Incorrectos en la Gráfica**

#### **Síntomas**:
- Total muestra $3.850.000 pero gráfica muestra $40.000.000
- Valores no coinciden entre total y gráfica
- Gráfica muestra datos de todo el mes cuando hay filtros

#### **Diagnóstico**:
```php
// Verificar campo correcto
Log::info('Campo total_fare', [
    'sample_sale' => Sale::first()->total_fare,
    'calculated_total' => Sale::sum('total_fare')
]);
```

#### **Soluciones**:
1. **Verificar campo de cálculo**:
```php
// Asegurar que se usa total_fare, no total
$this->totalSalesAmount = $sales->sum('total_fare');
$dayTotal = $daySales->sum('total_fare');
```

2. **Verificar filtros de fecha**:
```php
// Verificar que los filtros se aplican correctamente
$analyticsQuery->whereDate('created_at', '>=', $startDate)
              ->whereDate('created_at', '<=', $endDate);
```

### **3. Filtros No Funcionan**

#### **Síntomas**:
- Cambiar filtros no actualiza la gráfica
- Filtro por asesor no aparece
- Filtros de fecha no se aplican

#### **Diagnóstico**:
```php
// Verificar permisos de usuario
Log::info('User roles', [
    'roles' => auth()->user()->getRoleNames()->toArray(),
    'can_filter_advisor' => auth()->user()->hasRole(['administrador', 'supervisor'])
]);
```

#### **Soluciones**:
1. **Verificar roles de usuario**:
```php
// Asegurar que el usuario tiene los roles correctos
if ($user->hasRole(['administrador', 'supervisor', 'super-admin'])) {
    // Mostrar filtro por asesor
}
```

2. **Verificar eventos de Livewire**:
```javascript
// Asegurar que los eventos se disparan
document.addEventListener('livewire:updated', function() {
    console.log('Livewire updated, re-initializing chart');
    initChart();
});
```

### **4. Performance Lenta**

#### **Síntomas**:
- La página tarda en cargar
- La gráfica se actualiza lentamente
- Timeout en consultas

#### **Diagnóstico**:
```php
// Verificar tiempo de consulta
$start = microtime(true);
$sales = $analyticsQuery->get();
$time = microtime(true) - $start;
Log::info('Query time', ['time' => $time]);
```

#### **Soluciones**:
1. **Agregar índices**:
```sql
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_agency_id ON sales(agency_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
```

2. **Implementar caché**:
```php
$cacheKey = 'analytics_' . md5(serialize($filters));
return Cache::remember($cacheKey, 300, function() use ($query) {
    return $this->calculateAnalytics($query);
});
```

3. **Limitar datos**:
```php
// Limitar a últimos 90 días
$query->where('created_at', '>=', now()->subDays(90));
```

### **5. Errores de JavaScript**

#### **Síntomas**:
- Errores en consola del navegador
- Gráfica no se renderiza
- Funciones no definidas

#### **Diagnóstico**:
```javascript
// Verificar errores en consola
console.error('Error details:', error);
```

#### **Soluciones**:
1. **Verificar Chart.js**:
```html
<!-- Asegurar que Chart.js se carga antes del script -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Tu código aquí
</script>
```

2. **Verificar sintaxis**:
```javascript
// Verificar que no hay errores de sintaxis
try {
    salesChart = new Chart(ctx, config);
} catch (error) {
    console.error('Error creating chart:', error);
}
```

### **6. Problemas de Permisos**

#### **Síntomas**:
- Usuario no ve sus ventas
- Filtro por asesor no aparece
- Acceso denegado

#### **Diagnóstico**:
```php
// Verificar permisos del usuario
Log::info('User permissions', [
    'user_id' => auth()->id(),
    'agency_id' => auth()->user()->agency_id,
    'roles' => auth()->user()->getRoleNames()->toArray()
]);
```

#### **Soluciones**:
1. **Verificar roles en base de datos**:
```sql
SELECT u.name, r.name as role_name 
FROM users u 
JOIN model_has_roles mhr ON u.id = mhr.model_id 
JOIN roles r ON mhr.role_id = r.id 
WHERE u.id = ?;
```

2. **Verificar relaciones**:
```php
// Asegurar que el usuario tiene agency_id
if (!$user->agency_id) {
    throw new Exception('Usuario sin agencia asignada');
}
```

## 🔍 Herramientas de Debug

### **Logs de PHP**
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log | grep "Debug Analytics"
```

### **Logs de JavaScript**
```javascript
// Habilitar debug detallado
localStorage.setItem('debug', 'true');

// Ver logs en consola
console.log('Debug enabled');
```

### **Herramientas de Base de Datos**
```sql
-- Verificar datos de ventas
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as ventas,
    SUM(total_fare) as total
FROM sales 
WHERE created_at >= '2025-09-01' 
GROUP BY DATE(created_at)
ORDER BY fecha;
```

## 📋 Checklist de Verificación

### **Antes de Reportar un Problema**:

- [ ] Verificar que Chart.js se carga correctamente
- [ ] Revisar logs de PHP para errores
- [ ] Verificar permisos del usuario
- [ ] Comprobar que los datos existen en la base de datos
- [ ] Verificar que los filtros se aplican correctamente
- [ ] Revisar la consola del navegador para errores de JavaScript

### **Información a Incluir en el Reporte**:

1. **Descripción del problema**
2. **Pasos para reproducir**
3. **Logs relevantes** (PHP y JavaScript)
4. **Capturas de pantalla**
5. **Información del usuario** (rol, agencia)
6. **Filtros aplicados** (fechas, asesor, etc.)

## 🆘 Contacto de Soporte

Para problemas que no se resuelven con esta guía:

- **Email**: soporte@empresa.com
- **Slack**: #crm-support
- **Jira**: Proyecto CRM

**Incluir siempre**:
- Descripción detallada
- Logs completos
- Pasos para reproducir
- Impacto en el negocio

---

**Última actualización**: Septiembre 2025  
**Versión**: 1.0.0
