# Módulo de Paquetes y Reservas

Este módulo permite la creación de paquetes turísticos dinámicos y la gestión de sus reservas correspondientes con control de inventario y tarifas multijugador.

## 🏗️ Estructura del Módulo

El módulo se compone de tres entidades principales:
1. **Package (Paquete)**: El contenedor principal de la oferta (Título, Destino, Inclusiones).
2. **PackageSchedule (Salida)**: Las fechas puntuales de salida con su propio inventario (cupos) y estado.
3. **PackageFare (Tarifa/Hotel)**: La configuración de precios por hotel, tipo de habitación, plan de alimentación y tipo de pasajero (Adulto, Niño, Infante).

---

## 🆕 Creación de Paquetes (`CreatePackage`)

La creación de paquetes ha sido optimizada para manejar grandes volúmenes de datos geográficos.

### 🌍 Integración con BD World
Los campos **Ciudad de Origen** y **Ciudad de Destino** utilizan el componente `<x-city-search>`. 
- **Origen de datos**: Tabla `cities` de la base de datos externa `world`.
- **Rendimiento**: La búsqueda es dinámica (AJAX/Livewire). Los datos no se cargan masivamente en el estado público del componente para evitar bloqueos del navegador (Payload Optimization).
- **Validación de Fechas**:
    - `Fecha de inicio`: No permite fechas pasadas.
    - `Fecha de fin`: Automáticamente restringida para ser igual o posterior a la fecha de inicio.

---

## 📅 Reservas de Paquetes (`CreatePackageReserve`)

Permite realizar solicitudes de reserva vinculadas a una salida y hotel específicos.

### 🛍️ Flujo de Reserva
1. **Selección desde Detalle**: El usuario elige una combinación de Hotel/Plan en la vista de detalle del paquete.
2. **Parámetros de URL**: El formulario recibe por URL el `package_schedule` y los datos del hotel para pre-configurar la vista.
3. **Distribución de Pasajeros**:
    - Se pueden añadir múltiples habitaciones.
    - Cada habitación permite definir cantidad de adultos, niños e infantes.
    - **Cálculo Automático**: El sistema busca las tarifas correspondientes y calcula el total de la habitación en tiempo real:
      `Total = (Adultos * Tarifa) + (Niños * TarifaNiño) + (Infantes * TarifaInfante)`.
4. **Control de Inventario**: Al confirmar la reserva, el sistema descuenta automáticamente los cupos (Adultos + Niños) de la `disponibilidad` de la salida (`available_units`).

---

## 📡 API de Reservas

Se ha implementado un endpoint para integraciones externas:

### `POST /v1/package-booking`

**Cuerpo de la petición (JSON):**
```json
{
    "agency_id": 1,
    "package_id": 10,
    "package_schedule_id": 15,
    "notes": "Vuelo de llegada a las 10am",
    "rooms": [
        {
            "package_fare_id": 105,
            "adults": 2,
            "children": 1,
            "infants": 0,
            "child_ages": [8],
            "infant_ages": [],
            "description": "Cama adicional para el niño"
        }
    ]
}
```

**Respuesta Exitosa (201):**
```json
{
    "success": true,
    "message": "Package reservation created successfully",
    "data": {
        "booking_id": 45,
        "booking_number": "PKG-202310-0045",
        "total_amount": 2500000.00
    }
}
```

---

## 🛠️ Notas Técnicas
- **Traits Utilizados**: `HasWorldCountries`, `HasCitySearch`.
- **Modelos**: `Package`, `PackageSchedule`, `PackageFare`, `PackageBooking`, `PackageReserve`.
- **Seguridad**: Las reservas API validan stock disponible antes de persistir la transacción (DB Transaction).
