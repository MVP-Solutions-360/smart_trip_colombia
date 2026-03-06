# Sistema de Notificaciones con Toasts en Tiempo Real

Este sistema implementa notificaciones completas para Laravel 11 + Livewire 3 con soporte para toasts automáticos y notificaciones en tiempo real.

## 🚀 Características

- ✅ Notificaciones guardadas en base de datos
- ✅ Toasts automáticos con Flux UI
- ✅ Campana de notificaciones con badge
- ✅ Dropdown de notificaciones recientes
- ✅ Marcado de notificaciones como leídas
- ✅ Soporte para diferentes tipos (success, error, warning, info)
- ✅ Estructura preparada para Laravel Echo + Pusher
- ✅ Componentes Livewire reutilizables

## 📁 Archivos Implementados

### 1. Notificaciones
- `app/Notifications/TaskAssignedNotification.php` - Notificación de ejemplo para tareas asignadas

### 2. Eventos
- `app/Events/NotificationSent.php` - Evento para broadcasting de notificaciones

### 3. Componentes Livewire
- `app/Livewire/NotificationBell.php` - Campana de notificaciones con dropdown
- `app/Livewire/Toast.php` - Sistema de toasts global

### 4. Vistas
- `resources/views/livewire/notification-bell.blade.php` - Vista de la campana
- `resources/views/livewire/toast.blade.php` - Vista de toasts

### 5. Layout
- `resources/views/components/layouts/app/header.blade.php` - Header con NotificationBell
- `resources/views/components/layouts/app/header.blade.php` - Layout con componente Toast

### 6. Ejemplos
- `app/Http/Controllers/NotificationExampleController.php` - Controlador con ejemplos de uso

## 🛠️ Instalación

### 1. Verificar Dependencias
El sistema usa la tabla `notifications` nativa de Laravel, que ya está disponible.

### 2. Componentes en Layout
Los componentes ya están integrados en el layout principal:
- `<livewire:notification-bell />` en el header
- `<livewire:toast />` al final del body

### 3. Configuración de Broadcasting (Opcional)
Para notificaciones en tiempo real completo, configurar en `.env`:
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=your_app_cluster
```

## 📖 Uso Básico

### 1. Enviar Notificación Simple
```php
use App\Notifications\TaskAssignedNotification;

// En un controlador o componente
$user->notify(new TaskAssignedNotification($task, $assignedBy));
```

### 2. Enviar Notificación Personalizada
```php
use App\Events\NotificationSent;

$notificationData = [
    'message' => 'Tu mensaje personalizado',
    'type' => 'success', // success, error, warning, info
    'icon' => 'check-circle',
    'action_url' => route('dashboard'),
];

// Guardar en BD
$user->notifications()->create([
    'id' => \Illuminate\Support\Str::uuid(),
    'type' => 'App\Notifications\CustomNotification',
    'data' => json_encode($notificationData),
    'read_at' => null,
]);

// Disparar evento para toast
event(new NotificationSent($user->id, $notificationData));
```

### 3. Marcar como Leída
```php
// Una notificación específica
$notification->markAsRead();

// Todas las notificaciones
$user->unreadNotifications()->update(['read_at' => now()]);
```

## 🎨 Personalización

### 1. Nuevos Tipos de Notificación
Crear nueva clase extendiendo `Notification`:
```php
class CustomNotification extends Notification implements ShouldQueue
{
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Tu mensaje',
            'type' => 'info',
            'icon' => 'bell',
            'action_url' => route('home'),
        ];
    }
}
```

### 2. Nuevos Íconos
Agregar casos en `resources/views/livewire/notification-bell.blade.php`:
```php
@case('custom-icon')
    <svg class="w-5 h-5 text-blue-500">...</svg>
    @break
```

### 3. Estilos de Toast
Modificar `resources/views/livewire/toast.blade.php` para personalizar colores y animaciones.

## 🔧 API Endpoints de Ejemplo

### Asignar Tarea con Notificación
```http
POST /api/notifications/assign-task
{
    "task_id": 1,
    "user_id": 2
}
```

### Enviar Notificación Personalizada
```http
POST /api/notifications/send-custom
{
    "user_id": 2,
    "message": "Mensaje personalizado",
    "type": "success"
}
```

### Marcar como Leída
```http
POST /api/notifications/mark-read
{
    "notification_id": "uuid-opcional"
}
```

## 🚀 Escalabilidad

### 1. Colas para Notificaciones
Las notificaciones implementan `ShouldQueue` para procesamiento asíncrono.

### 2. Broadcasting en Tiempo Real
El evento `NotificationSent` está preparado para Laravel Echo:
```javascript
Echo.private(`user.${userId}`)
    .listen('notification.sent', (e) => {
        // Manejar notificación en tiempo real
        console.log(e.notification);
    });
```

### 3. Múltiples Canales
Extender `via()` en las notificaciones para email, SMS, etc.:
```php
public function via(object $notifiable): array
{
    return ['database', 'mail', 'broadcast'];
}
```

## 🐛 Troubleshooting

### 1. Notificaciones No Aparecen
- Verificar que el usuario tenga el trait `Notifiable`
- Comprobar que la tabla `notifications` existe
- Revisar logs de Laravel

### 2. Toasts No Se Muestran
- Verificar que `<livewire:toast />` esté en el layout
- Comprobar que el evento `showToast` se dispare
- Revisar consola del navegador para errores JavaScript

### 3. Broadcasting No Funciona
- Verificar configuración de Pusher en `.env`
- Comprobar que Laravel Echo esté configurado
- Revisar logs de broadcasting

## 📝 Próximos Pasos

1. **Implementar Laravel Echo** para notificaciones en tiempo real
2. **Agregar más tipos de notificación** (email, SMS, etc.)
3. **Crear página de historial** de notificaciones
4. **Implementar filtros** por tipo y fecha
5. **Agregar notificaciones push** del navegador

## 🤝 Contribución

Para agregar nuevas funcionalidades:
1. Crear nueva notificación extendiendo `Notification`
2. Agregar ícono correspondiente en las vistas
3. Actualizar documentación
4. Probar en diferentes navegadores

---

**Sistema desarrollado para Laravel 11 + Livewire 3 + Flux UI**
