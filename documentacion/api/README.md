# API Documentation

## 📋 Descripción General

Esta sección contiene toda la documentación relacionada con las APIs del sistema CRM. Incluye endpoints, autenticación, ejemplos de uso y recursos para desarrolladores que trabajen con la API.

## 🎯 Contenido de la Sección

- ✅ **Endpoints de la API** para todos los servicios
- ✅ **Autenticación y autorización** 
- ✅ **Ejemplos de uso** con diferentes lenguajes
- ✅ **Recursos y respuestas** de la API
- ✅ **Códigos de error** y manejo de excepciones
- ✅ **Rate limiting** y mejores prácticas
- ✅ **Testing de APIs** y herramientas

## 📁 Archivos de Documentación

### 🔗 [Endpoints de la API](endpoints.md)
**Archivo**: `endpoints.md`

**Contenido**:
- Endpoints para Tours
- Endpoints para Traslados
- Endpoints para Tiquetes Aéreos
- Endpoints para Hoteles
- Endpoints para Clientes
- Endpoints para Requests
- Endpoints para Agencias
- Métodos HTTP soportados
- Parámetros de entrada y salida

### 🔐 [Autenticación](autenticacion.md)
**Archivo**: `autenticacion.md`

**Contenido**:
- Sistema de autenticación
- Tokens de acceso
- Middleware de autorización
- Permisos y roles
- Seguridad de endpoints
- Manejo de sesiones

### 💻 [Ejemplos de Uso](ejemplos.md)
**Archivo**: `ejemplos.md`

**Contenido**:
- Ejemplos con cURL
- Ejemplos con JavaScript
- Ejemplos con PHP
- Ejemplos con Python
- Manejo de respuestas
- Manejo de errores

## 🚀 Inicio Rápido

### 1. Autenticación
```bash
curl -X POST https://api.crm.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### 2. Obtener Tours
```bash
curl -X GET https://api.crm.com/tours \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### 3. Crear un Tour
```bash
curl -X POST https://api.crm.com/tours \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tour por Bogotá",
    "start_date": "2025-10-15",
    "adult": 2,
    "fare": 150000
  }'
```

## 🔧 Servicios Disponibles

### Tours
- `GET /api/tours` - Listar tours
- `POST /api/tours` - Crear tour
- `GET /api/tours/{id}` - Obtener tour
- `PUT /api/tours/{id}` - Actualizar tour
- `DELETE /api/tours/{id}` - Eliminar tour

### Traslados
- `GET /api/transfers` - Listar traslados
- `POST /api/transfers` - Crear traslado
- `GET /api/transfers/{id}` - Obtener traslado
- `PUT /api/transfers/{id}` - Actualizar traslado
- `DELETE /api/transfers/{id}` - Eliminar traslado

### Tiquetes Aéreos
- `GET /api/tickets` - Listar tiquetes
- `POST /api/tickets` - Crear tiquete
- `GET /api/tickets/{id}` - Obtener tiquete
- `PUT /api/tickets/{id}` - Actualizar tiquete
- `DELETE /api/tickets/{id}` - Eliminar tiquete

### Hoteles
- `GET /api/hotels` - Listar hoteles
- `POST /api/hotels` - Crear hotel
- `GET /api/hotels/{id}` - Obtener hotel
- `PUT /api/hotels/{id}` - Actualizar hotel
- `DELETE /api/hotels/{id}` - Eliminar hotel

## 📊 Estadísticas de la API

- **4 servicios principales** (Tours, Traslados, Tiquetes, Hoteles)
- **20+ endpoints** disponibles
- **Autenticación JWT** implementada
- **Rate limiting** configurado
- **Documentación completa** con ejemplos

## 🔗 Enlaces Útiles

- [Endpoints de la API](endpoints.md)
- [Autenticación](autenticacion.md)
- [Ejemplos de Uso](ejemplos.md)
- [Documentación General](../README.md)

## 📝 Notas de Desarrollo

### Características Técnicas
- **Autenticación**: JWT tokens
- **Formato**: JSON
- **Versionado**: v1
- **Rate Limiting**: 100 requests/minuto
- **CORS**: Configurado para desarrollo

### Mejores Prácticas
- Usar HTTPS en producción
- Implementar rate limiting
- Validar todos los inputs
- Manejar errores apropiadamente
- Documentar todos los endpoints

---

*Documentación de API - Septiembre 2025*
