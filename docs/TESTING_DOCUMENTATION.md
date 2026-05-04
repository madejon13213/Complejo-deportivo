# Documentación de Pruebas - Complejo Deportivo

## Fase de Pruebas

Esta documentación describe las pruebas realizadas para el sistema de gestión de Complejo Deportivo. Se incluyen pruebas unitarias, de integración y de componentes.

## Resumen Ejecutivo de Pruebas

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| **Backend - Endpoints** | 45+ | ✅ Implementadas |
| **Frontend - Componentes** | 6+ | ✅ Implementadas |
| **Frontend - Servicios** | 4+ | ✅ Implementadas |
| **Integración** | Múltiples | ✅ Implementadas |

## Estructura de Pruebas

```
backend/tests/
├── __init__.py
├── test_courts.py              # Pruebas CRUD de pistas
├── test_all_endpoints.py       # Pruebas de usuarios, espacios, notificaciones
├── test_reservations_penalties.py  # Pruebas de reservas, penalizaciones, admin
└── test_integration.py         # Pruebas de integración completas

frontend/__tests__/
├── CourtCard.test.tsx          # Tests de componente
└── courtsServices.test.ts      # Tests de servicios
```

## Pruebas Backend (FastAPI)

## Pruebas Backend (FastAPI)

### Configuración de Pruebas
- **Framework**: pytest
- **Cliente**: TestClient de FastAPI
- **Base de datos**: SQLite en memoria para pruebas
- **Dependencias**: pytest, httpx
- **Archivos de prueba**: 4 módulos especializados

### Pruebas de Endpoints - USER ROUTER (`/users`)

#### 1. Prueba: Registro de usuario
**Descripción**: Verifica que un usuario nuevo puede registrarse con datos válidos.

**Datos utilizados**:
- Endpoint: `POST /users/register`
- Body: nombre, pri_ape, seg_ape, email, password (SecurePass123), repeat_password, telefono, rol

**Resultado esperado**: 200-201
**Resultado obtenido**: ✅ Pasa

#### 2. Prueba: Login de usuario
**Descripción**: Verifica que un usuario registrado puede hacer login.

**Datos utilizados**:
- Endpoint: `POST /users/login`
- Body: email, password

**Resultado esperado**: 200
**Resultado obtenido**: ✅ Pasa

#### 3. Prueba: Obtener usuario actual
**Descripción**: Verifica que un usuario autenticado puede obtener su información.

**Datos utilizados**:
- Endpoint: `GET /users/me`
- Headers: Authorization Bearer token

**Resultado esperado**: 200 o 401
**Resultado obtenido**: ✅ Pasa

#### 4. Prueba: Obtener todos los usuarios
**Descripción**: Verifica que un usuario autenticado puede obtener la lista de usuarios.

**Datos utilizados**:
- Endpoint: `GET /users/getAll`
- Headers: Authorization Bearer token

**Resultado esperado**: 200 o 401
**Resultado obtenido**: ✅ Pasa

#### 5. Prueba: Logout de usuario
**Descripción**: Verifica que un usuario puede hacer logout.

**Datos utilizados**:
- Endpoint: `POST /users/logout`

**Resultado esperado**: 200-204
**Resultado obtenido**: ✅ Pasa

### Pruebas de Endpoints - SPACES ROUTER (`/spaces`)

#### 6. Prueba: Obtener todos los espacios
**Descripción**: Verifica que se pueden obtener todos los tipos de espacios.

**Datos utilizados**:
- Endpoint: `GET /spaces/getAll`
- Parámetros: page, limit (optional)

**Resultado esperado**: 200
**Resultado obtenido**: ✅ Pasa

#### 7. Prueba: Obtener tipos de espacio
**Descripción**: Verifica que se pueden obtener los tipos de espacio disponibles.

**Datos utilizados**:
- Endpoint: `GET /spaces/types`

**Resultado esperado**: 200
**Resultado obtenido**: ✅ Pasa

### Pruebas de Endpoints - COURTS ROUTER (`/courts`)
**Descripción**: Verifica que el endpoint GET /courts/getAll devuelve una lista paginada de pistas correctamente.

**Datos utilizados**:
- Endpoint: `/courts/getAll`
- Parámetros: page=1, limit=10
- Método: GET

**Resultado esperado**:
- Código de estado: 200
- Respuesta contiene: items (array), total, page, limit, total_pages

**Resultado obtenido**: ✅ Pasa
- La respuesta incluye todos los campos requeridos
- La paginación funciona correctamente

**Solución propuesta**: Ninguna, funciona correctamente.

#### 2. Prueba: Crear pista como administrador
**Descripción**: Verifica que un administrador puede crear una nueva pista.

**Datos utilizados**:
- Endpoint: `/courts/`
- Método: POST
- Headers: Authorization con token de admin
- Body: {
  "nombre": "Cancha Test",
  "precio_hora": 25.0,
  "capacidad": 22,
  "precio_hora_parcial": 15.0,
  "id_tipo_espacio": 1
}

**Resultado esperado**:
- Código de estado: 201
- Respuesta contiene la pista creada con ID asignado

**Resultado obtenido**: ✅ Pasa
- La pista se crea correctamente
- Se devuelve la pista completa con ID

**Solución propuesta**: Ninguna.

#### 3. Prueba: Crear pista como usuario regular (debe fallar)
**Descripción**: Verifica que usuarios no administradores no pueden crear pistas.

**Datos utilizados**:
- Mismos datos que la prueba anterior
- Headers: Authorization con token de usuario regular

**Resultado esperado**:
- Código de estado: 403 (Forbidden)

**Resultado obtenido**: ✅ Pasa
- Correctamente denegado el acceso

**Solución propuesta**: Ninguna.

#### 4. Prueba: Obtener pista por ID
**Descripción**: Verifica que se puede obtener una pista específica por su ID.

**Datos utilizados**:
- Endpoint: `/courts/{id}`
- Método: GET
- ID de una pista existente

**Resultado esperado**:
- Código de estado: 200
- Respuesta contiene los datos de la pista

**Resultado obtenido**: ✅ Pasa
- Devuelve correctamente la pista

**Solución propuesta**: Ninguna.

#### 5. Prueba: Actualizar pista como administrador
**Descripción**: Verifica que un admin puede actualizar una pista existente.

**Datos utilizados**:
- Endpoint: `/courts/{id}`
- Método: PUT
- Headers: Token admin
- Body: {"nombre": "Cancha Actualizada", "precio_hora": 30.0}

**Resultado esperado**:
- Código de estado: 200
- La pista se actualiza parcialmente

**Resultado obtenido**: ✅ Pasa
- Solo los campos proporcionados se actualizan

**Solución propuesta**: Ninguna.

#### 6. Prueba: Actualizar pista como usuario regular (debe fallar)
**Descripción**: Verifica que usuarios regulares no pueden actualizar pistas.

**Resultado esperado**:
- Código de estado: 403

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 7. Prueba: Eliminar pista como administrador
**Descripción**: Verifica que un admin puede eliminar una pista.

**Datos utilizados**:
- Endpoint: `/courts/{id}`
- Método: DELETE
- Headers: Token admin

**Resultado esperado**:
- Código de estado: 204
- La pista ya no existe

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 8. Prueba: Eliminar pista como usuario regular (debe fallar)
**Descripción**: Verifica que usuarios regulares no pueden eliminar pistas.

**Resultado esperado**:
- Código de estado: 403

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 9. Prueba: Filtrar pistas
**Descripción**: Verifica que los filtros de búsqueda funcionan correctamente.

**Datos utilizados**:
- Endpoint: `/courts/getAll?search=Fútbol&min_price=22`

**Resultado esperado**:
- Solo devuelve pistas que coinciden con los filtros

**Resultado obtenido**: ✅ Pasa
- Filtros de búsqueda y precio funcionan

**Solución propuesta**: Ninguna.

## Pruebas Frontend (Next.js)

### Configuración de Pruebas
- **Framework**: Jest
- **Librería**: React Testing Library
- **Entorno**: jsdom

### Pruebas Implementadas

#### 1. Prueba: CourtCard renderiza correctamente
**Descripción**: Verifica que el componente CourtCard muestra toda la información de la pista.

**Datos utilizados**:
- Props: court object con datos completos
- isAdmin: false

**Resultado esperado**:
- Se muestra nombre, precio, capacidad
- Botones "Ver detalle" y "Reservar" presentes
- Enlaces correctos

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 2. Prueba: CourtCard muestra botones admin cuando isAdmin=true
**Descripción**: Verifica que los botones de editar y eliminar aparecen para admins.

**Datos utilizados**:
- Props: isAdmin=true, onEdit y onDelete funciones

**Resultado esperado**:
- Botones "Editar" y "Eliminar" visibles

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 3. Prueba: CourtCard no muestra botones admin cuando isAdmin=false
**Descripción**: Verifica que los botones admin no aparecen para usuarios regulares.

**Resultado esperado**:
- Botones "Editar" y "Eliminar" no visibles

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 4. Prueba: CourtCard llama a onEdit al hacer clic
**Descripción**: Verifica que el botón editar llama a la función proporcionada.

**Datos utilizados**:
- Mock function para onEdit

**Resultado esperado**:
- onEdit se llama al hacer clic en "Editar"

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 5. Prueba: CourtCard llama a onDelete al hacer clic
**Descripción**: Verifica que el botón eliminar llama a la función proporcionada.

**Resultado esperado**:
- onDelete se llama al hacer clic en "Eliminar"

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 6. Prueba: CourtCard tiene enlaces correctos
**Descripción**: Verifica que los enlaces apuntan a las rutas correctas.

**Resultado esperado**:
- "Ver detalle" enlaza a `/courts/{id}`
- "Reservar" enlaza a `/reservas?courtId={id}`

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

## Pruebas de Servicios Frontend

#### 1. Prueba: getCourts llama correctamente a la API
**Descripción**: Verifica que la función getCourts hace la llamada correcta a la API.

**Datos utilizados**:
- Parámetros: page=1, limit=10, filters con search y typeId

**Resultado esperado**:
- fetch se llama con URL correcta incluyendo parámetros
- Método GET, cache no-store

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 2. Prueba: createCourt envía datos correctos
**Descripción**: Verifica que createCourt envía POST con datos JSON.

**Resultado esperado**:
- Método POST a /api/courts/
- Body contiene los datos de la pista

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 3. Prueba: updateCourt actualiza correctamente
**Descripción**: Verifica que updateCourt hace PUT request.

**Resultado esperado**:
- Método PUT a /api/courts/{id}
- Body con datos actualizados

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

#### 4. Prueba: deleteCourt elimina correctamente
**Descripción**: Verifica que deleteCourt hace DELETE request.

**Resultado esperado**:
- Método DELETE a /api/courts/{id}

**Resultado obtenido**: ✅ Pasa

**Solución propuesta**: Ninguna.

## Conclusión

Todas las pruebas implementadas pasan correctamente, verificando que:

1. **Backend**: Los endpoints CRUD funcionan correctamente con autenticación apropiada
2. **Frontend**: Los componentes renderizan correctamente y los servicios llaman a la API adecuadamente
3. **Seguridad**: Las operaciones CRUD están protegidas para administradores únicamente
4. **Integración**: Frontend y backend se comunican correctamente

El sistema de gestión de pistas está completamente funcional y seguro.