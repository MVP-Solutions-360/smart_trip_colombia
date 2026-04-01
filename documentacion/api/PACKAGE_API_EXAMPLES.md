# EJEMPLOS DE USO - API DE PAQUETES

## Descripcion

Este archivo resume como consumir la API del modulo de paquetes desde el sitio web publico y desde las integraciones internas. La nueva API publica permite renderizar las secciones por destino directamente con los datos creados en el CRM.

---

## Nuevos campos disponibles

### Campos agregados recientemente
- `status`: Estado del paquete (`active` o `inactive`).
- `valid_from`: Fecha de inicio de validez (YYYY-MM-DD).
- `valid_until`: Fecha de fin de validez (YYYY-MM-DD).
- `available_units`: Cupo de unidades.

### Filtros adicionales
- `package_status`: Filtra por estado del paquete en las rutas por agencia.
- `status`: Filtra por estado de la salida (`active`, `inactive`, `cancelled`).
- `only_active_schedules`: (API publica) controla si se devuelven solo salidas activas.

---

## Endpoints disponibles

### API publica para la web
1. `GET /api/v1/packages`
2. `GET /api/v1/packages/{id}`
3. `GET /api/v1/packages/destinations`

### API por agencia (backoffice)
1. `GET /api/v1/agency/{slug}/packages`
2. `GET /api/v1/agency/{slug}/packages/{id}`
3. `GET /api/v1/agency/{slug}/packages/destinations`
4. `GET /api/v1/agency/{slug}/packages/featured`

_Base URL (dev y prod):_ `https://mvpsolutions365.com/api/v1`

---

## Ejemplo 1: Seccion "Paquetes por destino" (API publica)

```
GET https://mvpsolutions365.com/api/v1/packages?destination=Cartagena&per_page=6
```

Respuesta:
```json
{
    "data": [
        {
            "id": 87,
            "title": "Caribe Premium",
            "origin": "Medellin",
            "destination": "Cartagena",
            "status": "active",
            "main_image": "https://mvpsolutions365.com/storage/packages/caribe-premium.jpg",
            "min_price": 1850000,
            "max_price": 2450000,
            "agency": {
                "id": 3,
                "name": "MVP Travel",
                "slug": "mvp-travel"
            },
            "schedules": [
                {
                    "id": 145,
                    "start_date": "2026-05-10",
                    "status": "active",
                    "min_fare": 1850000,
                    "max_fare": 2100000
                }
            ]
        }
    ],
    "links": {
        "first": "https://mvpsolutions365.com/api/v1/packages?page=1",
        "last": "https://mvpsolutions365.com/api/v1/packages?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "per_page": 6,
        "total": 1
    },
    "success": true,
    "filters": {
        "destination": "Cartagena",
        "status": "active",
        "only_active_schedules": true
    }
}
```

Parametros utiles:
- `destination`: nombre exacto mostrado en la web.
- `search`: texto libre en titulo/origen/destino.
- `agency`: slug para limitar por agencia.
- `only_active_schedules`: `true` por defecto.
- `per_page`: minimo 1, maximo 50 (default 12).

---

## Ejemplo 2: Landing o modal con el detalle (API publica)

```
GET https://mvpsolutions365.com/api/v1/packages/87
```

Respuesta:
```json
{
    "data": {
        "id": 87,
        "title": "Caribe Premium",
        "origin": "Medellin",
        "destination": "Cartagena",
        "include": "<p>Vuelo + Hotel + Traslados</p>",
        "details": "<p>Plan completo</p>",
        "gallery_images": [
            "https://mvpsolutions365.com/storage/packages/gallery/caribe-1.jpg",
            "https://mvpsolutions365.com/storage/packages/gallery/caribe-2.jpg"
        ],
        "document_file": "https://mvpsolutions365.com/storage/packages/docs/caribe.pdf",
        "schedules": [
            {
                "id": 145,
                "start_date": "2026-05-10",
                "end_date": "2026-05-15",
                "status": "active",
                "fares": [
                    {
                        "id": 411,
                        "passenger_type": "adult",
                        "accommodation_type": "double",
                        "fare": 1850000,
                        "currency": "COP"
                    }
                ]
            }
        ]
    },
    "success": true
}
```

Tip: agrega `only_active_schedules=true` si quieres ocultar salidas canceladas.

---

## Ejemplo 3: Tabs de destinos (API publica)

```
GET https://mvpsolutions365.com/api/v1/packages/destinations
```

Respuesta:
```json
{
    "success": true,
    "data": [
        "Cartagena",
        "La Guajira",
        "San Andres"
    ],
    "filters": {
        "status": "active",
        "only_active_schedules": true
    }
}
```

Puedes combinarlo con `agency=mvp-travel` si el sitio tiene una sola marca.

---

## Ejemplo 4: Listar paquetes por agencia (API interna)

```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages
```

Respuesta incluida en `API_DOCUMENTATION.md`. Recuerda los filtros extra: `search`, `destination`, `status`, `package_status`, `limit`.

---

## Ejemplo 5: Destinos y destacados por agencia

```
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages/destinations
GET https://mvpsolutions365.com/api/v1/agency/agencia-principal/packages/featured
```

Ambos devuelven el objeto `agency` junto a los datos filtrados.

---

## Ejemplo 6: Consumir la API publica desde JavaScript

```javascript
async function loadPackagesByDestination(destination) {
    const params = new URLSearchParams({
        destination,
        per_page: 6,
        only_active_schedules: true,
    });

    const response = await fetch(`https://mvpsolutions365.com/api/v1/packages?${params.toString()}`);
    const payload = await response.json();

    if (payload.success) {
        return payload.data.map(pkg => ({
            id: pkg.id,
            title: pkg.title,
            min_price: pkg.min_price,
            destination: pkg.destination,
        }));
    }

    return [];
}

loadPackagesByDestination('Cartagena').then(console.log);
```

Para consumir la API interna solo cambia la URL base y agrega el `agency_slug` correspondiente.
