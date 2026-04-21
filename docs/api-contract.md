# API Contract - Complejo Deportivo

**Fecha de actualización**: 2024  
**Versión**: 1.0  
**Base URL**: `http://localhost:8000`

---

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Espacios](#espacios)
- [Pistas (Courts)](#pistas-courts)
- [Reservas](#reservas)
- [Penalizaciones](#penalizaciones)
- [Códigos de Error](#códigos-de-error)

---

## Autenticación

La mayoría de endpoints requieren autenticación mediante **JWT Token** en el header `Authorization`. 

El token se obtiene después del login y se envía en cada request:

```
Authorization: Bearer {token}
```

Los endpoints **públicos** (sin autenticación) están marcados como `PUBLIC`.

---

## Usuarios

### POST /users/register

Registra un nuevo usuario en el sistema.

**Descripción**: Crea una cuenta de usuario con los datos proporcionados. El usuario se registra por defecto como Cliente (rol_id = 2).

**Autenticación**: PUBLIC

#### Request Body

```json
{
  "nombre": "Juan",
  "pri_ape": "Pérez",
  "seg_ape": "García",
  "email": "juan.perez@example.com",
  "password": "SecurePass123!",
  "telefono": "+34 612 345 678",
  "id_rol": 2
}
```

**Campos obligatorios**: `nombre`, `pri_ape`, `email`, `password`  
**Campos opcionales**: `seg_ape`, `telefono`, `id_rol` (default: 2)

#### Response 201 (Created)

```json
{
  "id": 1,
  "nombre": "Juan",
  "pri_ape": "Pérez",
  "seg_ape": "García",
  "email": "juan.perez@example.com",
  "telefono": "+34 612 345 678",
  "id_rol": 2
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 400 | Email ya registrado o datos inválidos |
| 422 | Validación de datos fallida (email inválido, contraseña muy corta) |
| 500 | Error en el servidor |

---

### POST /users/login

Autentica un usuario y devuelve un token JWT.

**Descripción**: Valida las credenciales del usuario y genera un token de acceso para usar en requests posteriores.

**Autenticación**: PUBLIC

#### Request Body

```json
{
  "email": "juan.perez@example.com",
  "password": "SecurePass123!"
}
```

#### Response 200 (OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Credenciales inválidas |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### POST /users/logout

Cierra la sesión del usuario actual.

**Descripción**: Invalida el token de acceso y limpia la sesión.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "mensaje": "Sesión cerrada exitosamente"
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /users/me

Obtiene los datos del usuario autenticado.

**Descripción**: Devuelve la información del usuario actual basada en el token JWT.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "nombre": "Juan",
  "pri_ape": "Pérez",
  "seg_ape": "García",
  "email": "juan.perez@example.com",
  "telefono": "+34 612 345 678",
  "id_rol": 2
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### GET /users/getAll

Obtiene la lista de todos los usuarios registrados.

**Descripción**: Devuelve una lista con todos los usuarios del sistema. Requiere autenticación.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "pri_ape": "Pérez",
    "seg_ape": "García",
    "email": "juan.perez@example.com",
    "telefono": "+34 612 345 678",
    "id_rol": 2
  },
  {
    "id": 2,
    "nombre": "María",
    "pri_ape": "López",
    "seg_ape": null,
    "email": "maria.lopez@example.com",
    "telefono": null,
    "id_rol": 2
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /users/{user_id}

Obtiene los datos de un usuario específico.

**Descripción**: Devuelve la información de un usuario por su ID.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| user_id | integer | ID del usuario |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "nombre": "Juan",
  "pri_ape": "Pérez",
  "seg_ape": "García",
  "email": "juan.perez@example.com",
  "telefono": "+34 612 345 678",
  "id_rol": 2
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### DELETE /users/{user_id}

Elimina un usuario del sistema.

**Descripción**: Borra un usuario y todos sus datos asociados. Esta acción es irreversible.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| user_id | integer | ID del usuario a eliminar |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "mensaje": "Usuario eliminado exitosamente"
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### POST /users/refresh

Refresca el token de acceso.

**Descripción**: Genera un nuevo token de acceso usando el token actual. Útil para mantener la sesión activa.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "newToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

## Espacios

### GET /spaces/getAll

Obtiene la lista de todos los tipos de espacios disponibles.

**Descripción**: Devuelve todos los espacios registrados en el sistema (Canchas de tenis, piscina, gym, etc.). Este endpoint es público.

**Autenticación**: PUBLIC

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "tipo": "Cancha de Tenis",
    "permite_reserva_parcial": true
  },
  {
    "id": 2,
    "tipo": "Piscina Olímpica",
    "permite_reserva_parcial": false
  },
  {
    "id": 3,
    "tipo": "Gimnasio",
    "permite_reserva_parcial": true
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 500 | Error en el servidor |

---

## Pistas (Courts)

### GET /courts/getAll

Obtiene la lista de todas las pistas disponibles.

**Descripción**: Devuelve todas las pistas del complejo con sus detalles (precio, capacidad, tipo de espacio).

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "nombre": "Cancha Tenis 1",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  },
  {
    "id": 2,
    "nombre": "Cancha Tenis 2",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  },
  {
    "id": 3,
    "nombre": "Piscina Principal",
    "precio_hora": 60.00,
    "capacidad": 30,
    "precio_hora_parcial": null,
    "id_tipo_espacio": 2,
    "tipo_espacio": "Piscina Olímpica",
    "permite_reserva_parcial": false
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /courts/{id}

Obtiene los detalles de una pista específica.

**Descripción**: Devuelve la información completa de una pista por su ID.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la pista |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "nombre": "Cancha Tenis 1",
  "precio_hora": 45.50,
  "capacidad": 4,
  "precio_hora_parcial": 25.00,
  "id_tipo_espacio": 1,
  "tipo_espacio": "Cancha de Tenis",
  "permite_reserva_parcial": true
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Pista no encontrada |
| 500 | Error en el servidor |

---

### GET /courts/type/{id_tipo_espacio}

Obtiene todas las pistas de un tipo de espacio específico.

**Descripción**: Filtra las pistas por tipo de espacio (ej: todas las canchas de tenis).

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_tipo_espacio | integer | ID del tipo de espacio |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "nombre": "Cancha Tenis 1",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  },
  {
    "id": 2,
    "nombre": "Cancha Tenis 2",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Tipo de espacio no encontrado |
| 500 | Error en el servidor |

---

### GET /courts/partial/{permite_reserva_parcial}

Obtiene pistas que permiten o no reserva parcial.

**Descripción**: Filtra las pistas según si permiten reserva parcial de horas.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| permite_reserva_parcial | boolean | true/false para filtrar |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "nombre": "Cancha Tenis 1",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  },
  {
    "id": 2,
    "nombre": "Cancha Tenis 2",
    "precio_hora": 45.50,
    "capacidad": 4,
    "precio_hora_parcial": 25.00,
    "id_tipo_espacio": 1,
    "tipo_espacio": "Cancha de Tenis",
    "permite_reserva_parcial": true
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

## Reservas

### GET /reservations/getAll

Obtiene todas las reservas del sistema.

**Descripción**: Devuelve una lista completa de todas las reservas realizadas.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha": "2024-05-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 1,
    "id_espacio": 1
  },
  {
    "id": 2,
    "fecha": "2024-05-16",
    "hora_inicio": "14:30:00",
    "hora_fin": "15:30:00",
    "estado": "confirmada",
    "plazas_parciales": 2,
    "tipo_reserva": "parcial",
    "id_user": 2,
    "id_espacio": 2
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /reservations/active

Obtiene todas las reservas activas (no canceladas ni vencidas).

**Descripción**: Filtra las reservas que están vigentes o próximas a realizarse.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha": "2024-05-20",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 1,
    "id_espacio": 1
  },
  {
    "id": 3,
    "fecha": "2024-05-21",
    "hora_inicio": "16:00:00",
    "hora_fin": "17:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 2,
    "id_espacio": 3
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /reservations/{id}

Obtiene los detalles de una reserva específica.

**Descripción**: Devuelve la información completa de una reserva por su ID.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la reserva |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "fecha": "2024-05-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "estado": "confirmada",
  "plazas_parciales": null,
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 1
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Reserva no encontrada |
| 500 | Error en el servidor |

---

### GET /reservations/user/{id}

Obtiene todas las reservas de un usuario específico.

**Descripción**: Devuelve el historial de reservas de un usuario por su ID.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID del usuario |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha": "2024-05-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 1,
    "id_espacio": 1
  },
  {
    "id": 5,
    "fecha": "2024-06-10",
    "hora_inicio": "15:00:00",
    "hora_fin": "16:30:00",
    "estado": "confirmada",
    "plazas_parciales": 3,
    "tipo_reserva": "parcial",
    "id_user": 1,
    "id_espacio": 2
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### GET /reservations/space/{id}

Obtiene todas las reservas de un espacio específico.

**Descripción**: Devuelve el calendario de reservas de una pista/espacio.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID del espacio/pista |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha": "2024-05-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 1,
    "id_espacio": 1
  },
  {
    "id": 7,
    "fecha": "2024-05-15",
    "hora_inicio": "12:00:00",
    "hora_fin": "13:00:00",
    "estado": "confirmada",
    "plazas_parciales": null,
    "tipo_reserva": "completa",
    "id_user": 3,
    "id_espacio": 1
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Espacio no encontrado |
| 500 | Error en el servidor |

---

### POST /reservations/create

Crea una nueva reserva.

**Descripción**: Registra una nueva reserva de espacio. Verifica disponibilidad y conflictos horarios.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "fecha": "2024-05-22",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "plazas_parciales": null,
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 1
}
```

**Campos obligatorios**: `fecha`, `hora_inicio`, `hora_fin`, `tipo_reserva`, `id_user`, `id_espacio`  
**Campos opcionales**: `plazas_parciales` (requerido si tipo_reserva es "parcial")

#### Response 201 (Created)

```json
{
  "id": 10,
  "fecha": "2024-05-22",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "estado": "confirmada",
  "plazas_parciales": null,
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 1
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 400 | Espacio no disponible en ese horario o datos inválidos |
| 401 | Token inválido o expirado |
| 404 | Espacio o usuario no encontrado |
| 409 | Conflicto de horarios |
| 422 | Validación de datos fallida |
| 500 | Error en el servidor |

---

### PUT /reservations/update/{id}

Actualiza una reserva existente.

**Descripción**: Modifica los datos de una reserva. Valida conflictos horarios si se cambia fecha/hora.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la reserva |

#### Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "fecha": "2024-05-23",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "estado": "confirmada",
  "plazas_parciales": null,
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 1
}
```

**Campos opcionales**: Todos los campos son opcionales

#### Response 200 (OK)

```json
{
  "id": 10,
  "fecha": "2024-05-23",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "estado": "confirmada",
  "plazas_parciales": null,
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 1
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 400 | Espacio no disponible en ese horario o datos inválidos |
| 401 | Token inválido o expirado |
| 404 | Reserva no encontrada |
| 409 | Conflicto de horarios |
| 422 | Validación de datos fallida |
| 500 | Error en el servidor |

---

### DELETE /reservations/delete/{id}

Elimina una reserva.

**Descripción**: Cancela y elimina una reserva. Esta acción es irreversible.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la reserva a eliminar |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "mensaje": "Reserva eliminada exitosamente"
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Reserva no encontrada |
| 500 | Error en el servidor |

---

## Penalizaciones

### GET /penalties/getAll

Obtiene todas las penalizaciones registradas.

**Descripción**: Devuelve una lista de todas las penalizaciones del sistema.

**Autenticación**: Requerida

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha_inicio": "2024-05-15",
    "fecha_fin": "2024-05-22",
    "tipo_penalizacion": "no_show",
    "id_reserva": 1
  },
  {
    "id": 2,
    "fecha_inicio": "2024-05-20",
    "fecha_fin": "2024-05-27",
    "tipo_penalizacion": "cancelacion_tardía",
    "id_reserva": 5
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 500 | Error en el servidor |

---

### GET /penalties/{id}

Obtiene los detalles de una penalización específica.

**Descripción**: Devuelve la información completa de una penalización por su ID.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la penalización |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "fecha_inicio": "2024-05-15",
  "fecha_fin": "2024-05-22",
  "tipo_penalizacion": "no_show",
  "id_reserva": 1
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Penalización no encontrada |
| 500 | Error en el servidor |

---

### GET /penalties/user/{id}

Obtiene todas las penalizaciones de un usuario específico.

**Descripción**: Devuelve el historial de penalizaciones de un usuario.

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID del usuario |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
[
  {
    "id": 1,
    "fecha_inicio": "2024-05-15",
    "fecha_fin": "2024-05-22",
    "tipo_penalizacion": "no_show",
    "id_reserva": 1
  },
  {
    "id": 3,
    "fecha_inicio": "2024-05-20",
    "fecha_fin": "2024-05-27",
    "tipo_penalizacion": "cancelacion_tardía",
    "id_reserva": 7
  }
]
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |
| 500 | Error en el servidor |

---

### GET /penalties/reservation/{id}

Obtiene la penalización asociada a una reserva específica.

**Descripción**: Devuelve la penalización vinculada a una reserva (si existe).

**Autenticación**: Requerida

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | ID de la reserva |

#### Headers

```
Authorization: Bearer {token}
```

#### Response 200 (OK)

```json
{
  "id": 1,
  "fecha_inicio": "2024-05-15",
  "fecha_fin": "2024-05-22",
  "tipo_penalizacion": "no_show",
  "id_reserva": 1
}
```

#### Errores Posibles

| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Reserva no encontrada o sin penalización asociada |
| 500 | Error en el servidor |

---

## Códigos de Error

### Errores Globales

| Código | Descripción | Solución |
|--------|-------------|----------|
| 400 | Bad Request - Datos inválidos | Revisa el formato de los datos enviados |
| 401 | Unauthorized - Token inválido/expirado | Realiza login nuevamente para obtener un token válido |
| 403 | Forbidden - Acceso denegado | No tienes permisos para acceder a este recurso |
| 404 | Not Found - Recurso no encontrado | Verifica que el ID exista |
| 409 | Conflict - Conflicto en la operación | Intenta con datos diferentes o a una hora diferente |
| 422 | Unprocessable Entity - Validación fallida | Revisa que los campos cumplan con los requisitos |
| 500 | Internal Server Error - Error del servidor | Intenta nuevamente más tarde o contacta soporte |

---

## Notas Generales

- **Base URL**: Todos los endpoints están en `http://localhost:8000`
- **Autenticación**: La mayoría de endpoints requieren un JWT token válido en el header `Authorization: Bearer {token}`
- **Formatos de fecha/hora**: 
  - Fechas: `YYYY-MM-DD` (ej: 2024-05-15)
  - Horas: `HH:MM:SS` (ej: 14:30:00)
- **Rate Limiting**: No hay límite de rate en desarrollo, pero en producción se aplicará
- **CORS**: Solo se permite acceso desde `http://localhost:3000`
- **Encoding**: Todos los requests/responses usan `application/json`
