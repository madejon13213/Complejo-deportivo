# Complejo Deportivo - Documentación del Proyecto

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Backend](#backend)
   - [Tecnologías](#tecnologías-backend)
   - [Estructura de Directorios](#estructura-de-directorios-backend)
   - [Modelos de Datos (Tables)](#modelos-de-datos)
   - [Schemas (Pydantic)](#schemas)
   - [Repositorios](#repositorios)
   - [Servicios](#servicios)
   - [Rutas (Routes)](#rutas)
   - [Autenticación y Seguridad](#autenticación-y-seguridad)
   - [Manejo de Errores](#manejo-de-errores)
   - [Logging](#logging)
4. [Frontend](#frontend)
   - [Tecnologías](#tecnologías-frontend)
   - [Estructura de Directorios](#estructura-de-directorios-frontend)
   - [Componentes](#componentes)
   - [Páginas (App Router)](#páginas)
   - [Servicios](#servicios-frontend)
   - [Contexto y Estado](#contexto-y-estado)
   - [Hooks Personalizados](#hooks-personalizados)
5. [Base de Datos](#base-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Despliegue](#despliegue)
   - [Docker](#docker)
   - [Variables de Entorno](#variables-de-entorno)
8. [Guía de Desarrollo](#guía-de-desarrollo)
9. [Flujos de Trabajo](#flujos-de-trabajo)
   - [Reservas](#flujo-de-reservas)
   - [Penalizaciones](#flujo-de-penalizaciones)
   - [Notificaciones](#flujo-de-notificaciones)
10. [Checklist de Calidad](#checklist-de-calidad)

---

## Descripción General

El sistema **Complejo Deportivo** es una plataforma integral para la gestión de un complejo deportivo. Permite administrar reservas de espacios deportivos, membresías, usuarios y penalizaciones.

### Características Principales
- Reserva de espacios deportivos (pistas, canchas, etc.)
- Gestión de usuarios con diferentes roles (Cliente, Admin, Club)
- Sistema de penalizaciones por cancelaciones tardías
- Notificaciones automáticas
- Panel de administración
- Calendario semanal interactivo
- Cálculo automático de precios basado en duración

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                   │
│                     Next.js 15+ (React 19)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Components  │  │    Pages     │  │   Services   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           │                   │                   │               │
│           └───────────────────┴───────────────────┘               │
│                          │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                           │
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Server (FastAPI)                      │
│                     Python 3.12+                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Routes     │  │   Services   │  │ Repositories │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           │                   │                   │               │
│           └───────────────────┴───────────────────┘               │
│                          │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                           │
                           │ SQLAlchemy ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend

### Tecnologías Backend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| FastAPI | 0.136+ | Framework web ASGI |
| Python | 3.12+ | Lenguaje de programación |
| SQLAlchemy | 2.0+ | ORM para base de datos |
| Pydantic | v2 | Validación de datos y schemas |
| PyJWT | 2.12+ | JSON Web Tokens |
| psycopg2 | 2.9+ | Driver de PostgreSQL |
| bcrypt | 5.0+ | Hash de contraseñas |
| uvicorn | 0.46+ | Servidor ASGI |
| python-dotenv | - | Carga de variables de entorno |

### Estructura de Directorios Backend

```
backend/
├── app/
│   ├── auth/              # Autenticación y JWT
│   │   └── auth.py
│   ├── exceptions/        # Manejadores de errores
│   │   └── handers.py
│   ├── logger/           # Configuración de logs
│   │   └── logger_config.py
│   ├── repositories/      # Capa de acceso a datos
│   │   ├── base_repository.py
│   │   ├── court_repository.py
│   │   ├── notification_repository.py
│   │   ├── penalty_repository.py
│   │   ├── reservation_repository.py
│   │   ├── space_repository.py
│   │   └── user_repository.py
│   ├── routes/           # Endpoints de la API
│   │   ├── admin_router.py
│   │   ├── court_router.py
│   │   ├── notification_router.py
│   │   ├── penalty_router.py
│   │   ├── reservation_router.py
│   │   ├── spaces_router.py
│   │   └── user_router.py
│   ├── schemas/          # Schemas Pydantic
│   │   ├── court_schema.py
│   │   ├── notification_schema.py
│   │   ├── penalty_schema.py
│   │   ├── reservation_schema.py
│   │   ├── spaces_schema.py
│   │   └── user_schema.py
│   ├── services/         # Lógica de negocio
│   │   ├── court_service.py
│   │   ├── notification_service.py
│   │   ├── penalty_service.py
│   │   ├── reservation_service.py
│   │   ├── spaces_service.py
│   │   └── user_service.py
│   ├── tables/           # Modelos SQLAlchemy
│   │   └── tables.py
│   ├── utils/            # Utilidades
│   ├── database.py       # Configuración de BD
│   └── main.py          # Punto de entrada
├── tests/               # Pruebas
├── .env                 # Variables de entorno (no versionado)
├── Dockerfile
├── requirements.txt
└── test_all_endpoints.py
```

### Modelos de Datos

Los modelos se definen en `app/tables/tables.py` usando SQLAlchemy ORM.

#### Usuario (Usuario)
```python
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False)
    pri_ape: Mapped[str] = mapped_column(String(50), nullable=False)
    seg_ape: Mapped[Optional[str]] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    contraseña: Mapped[str] = mapped_column(String(255), nullable=False)
    telefono: Mapped[Optional[str]] = mapped_column(String(20))
    id_rol: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"))
    
    # Relaciones
    rol_rel: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")
    reservas: Mapped[List["Reserva"]] = relationship("Reserva", back_populates="usuario_rel")
```

#### Reserva (Reserva)
```python
class Reserva(Base):
    __tablename__ = "reservas"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
    hora_fin: Mapped[time] = mapped_column(Time, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="Pendiente")
    plazas_parciales: Mapped[Optional[int]] = mapped_column(Integer, default=1)
    tipo_reserva: Mapped[str] = mapped_column(String(20))  # "completa" o "parcial"
    precio_total: Mapped[Optional[float]] = mapped_column(Float)
    id_user: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"))
    id_espacio: Mapped[int] = mapped_column(Integer, ForeignKey("espacios.id"))
    
    # Estados posibles: "Pendiente", "Confirmada", "En curso", "Finalizada", "Cancelada"
```

#### Penalización (Penalizacion)
```python
class Penalizacion(Base):
    __tablename__ = "penalizaciones"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    tipo_penalizacion: Mapped[str] = mapped_column(String(255))
    id_reserva: Mapped[int] = mapped_column(Integer, ForeignKey("reservas.id"), unique=True)
```

#### Espacio (TipoEspacio)
```python
class TipoEspacio(Base):
    __tablename__ = "tipos_espacio"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[Optional[str]] = mapped_column(Text)
    capacidad: Mapped[int] = mapped_column(Integer)
    precio_hora: Mapped[float] = mapped_column(Float)
    permite_reserva_parcial: Mapped[bool] = mapped_column(Boolean, default=False)
```

#### Notificación (Notificacion)
```python
class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_user: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"))
    tipo: Mapped[str] = mapped_column(String(50))
    mensaje: Mapped[str] = mapped_column(Text)
    leida: Mapped[bool] = mapped_column(Boolean, default=False)
    creada_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    id_reserva: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("reservas.id"))
    
    # Tipos: "RESERVA_CANCELADA", "PENALIZACION", etc.
```

### Schemas

Los schemas en `app/schemas/` usan Pydantic v2 para validación.

#### Ejemplo: ReservationCreate
```python
class ReservationCreate(BaseModel):
    fecha: date
    hora_inicio: time
    hora_fin: time
    plazas_parciales: Optional[int] = None
    numero_personas: Optional[int] = None
    tipo_reserva: str
    id_user: int
    id_espacio: int
    
    model_config = ConfigDict(from_attributes=True)
```

#### Ejemplo: ReservationResponse
```python
class ReservationResponse(BaseModel):
    id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str
    plazas_parciales: Optional[int] = None
    tipo_reserva: str
    precio_total: float
    id_user: int
    id_espacio: int
```

### Repositorios

Capa de acceso a datos usando SQLAlchemy.

#### BaseRepository
```python
class BaseRepository:
    def __init__(self, db: Session):
        self.db = db
```

#### ReservationRepository (métodos clave)
```python
class ReservationRepository(BaseRepository):
    def get_all(self) -> list[Reserva]:
        return self.db.query(Reserva).all()
    
    def get_by_id(self, id: int) -> Optional[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id == id).first()
    
    def get_by_user(self, user_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_user == user_id).all()
    
    def get_conflicting_for_update(self, space_id, fecha, hora_inicio, hora_fin):
        # Para manejo de concurrencia
        return (self.db.query(Reserva)
                  .filter(...)
                  .with_for_update()
                  .all())
    
    def get_filtered_paginated(self, fecha, usuario, page, limit):
        # Búsqueda con paginación
        ...
```

### Servicios

Capa de lógica de negocio.

#### ReservationService (métodos principales)

| Método | Descripción |
|--------|-------------|
| `get_all_reservations()` | Obtiene todas las reservas |
| `get_user_reservations(user_id, db)` | Reservas de un usuario |
| `get_active_reservations(db)` | Reservas activas (no vencidas) |
| `get_filtered_reservations(fecha, usuario, page, limit)` | Búsqueda paginada |
| `create_reservation(data, db, actor_role)` | Crea reserva con validaciones |
| `update_reservation(id, data, db)` | Actualiza reserva y calcula estado |
| `cancel_reservation(id, db)` | Cambia estado a "Cancelada" |
| `delete_reservation(id, db)` | Elimina reserva (solo futuras) |
| `estimate_price(data, db)` | Calcula precio estimado |

#### Lógica de Cancelación (reservation_service.py)
```python
@staticmethod
def delete_reservation(reservation_id: int, db: Session) -> dict:
    # 1. Verificar que la reserva existe
    # 2. Verificar que no ha comenzado (solo se pueden cancelar futuras)
    # 3. Enviar notificación de cancelación
    # 4. Eliminar la reserva
    # NOTA: En la última actualización se cambió para que solo cambie estado a "Cancelada"
```

### Rutas

Endpoints de la API organizados por routers.

#### Rutas de Reservas (`/reservations`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/reservations/getAll` | Todas las reservas | User |
| GET | `/reservations/active` | Reservas activas | User |
| GET | `/reservations/user/{id}` | Reservas de usuario | User |
| GET | `/reservations/space/{id}` | Reservas de espacio | User |
| POST | `/reservations/create` | Crear reserva | User |
| PUT | `/reservations/update/{id}` | Actualizar reserva | User |
| DELETE | `/reservations/delete/{id}` | Eliminar/Cancelar reserva | User |
| GET | `/reservations/search?fecha=&usuario=&page=&limit=` | Búsqueda paginada | Admin |
| GET | `/reservations/{id}` | Detalle de reserva | User |

#### Rutas de Penalizaciones (`/penalties`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/penalties/getAll` | Todas las penalizaciones | User |
| POST | `/penalties/create` | Crear penalización | Admin |
| GET | `/penalties/user/{id}` | Por usuario | User |
| GET | `/penalties/reservation/{id}` | Por reserva | User |
| GET | `/penalties/{id}` | Por ID | User |

#### Rutas de Admin (`/admin`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users/{user_id}/reservations` | Reservas de usuario (admin) | Admin |
| GET | `/admin/users/{user_id}/penalties` | Penalizaciones de usuario | Admin |

#### Rutas de Espacios (`/spaces`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/spaces/getAll` | Tipos de espacios | Público |

#### Rutas de Usuarios (`/users`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Registro | Público |
| POST | `/users/login` | Login | Público |
| POST | `/users/logout` | Logout | User |
| GET | `/users/me` | Datos del usuario actual | User |
| GET | `/users/getAll` | Todos los usuarios | Admin |
| GET | `/users/{user_id}` | Por ID | User |
| DELETE | `/users/{user_id}` | Eliminar | Admin |
| POST | `/users/refresh` | Refresh token | User |

#### Rutas de Notificaciones (`/notifications`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications/unread` | No leídas | User |
| GET | `/notifications/my?limit=` | Mis notificaciones | User |
| PUT | `/notifications/{id}/read` | Marcar como leída (elimina) | User |
| POST | `/notifications/mark-read` | Marcar como leída (legacy) | User |

### Autenticación y Seguridad

#### JWT (JSON Web Tokens)
- **Access Token**: Expira en 30 minutos (configurable)
- **Refresh Token**: Para renovar access tokens
- **Algoritmo**: HS256
- **Almacenamiento**: Cookies HttpOnly

#### Roles de Usuario
| Rol | Permisos |
|-----|------------|
| CLIENTE | Reservar espacios, ver sus datos |
| CLUB | (Reservado para clubs deportivos) |
| ADMINISTRADOR (ADMIN) | Gestión total del sistema |

#### auth.py (Funciones clave)
```python
class AuthManager:
    @staticmethod
    def create_access_token(data: dict) -> tuple[str, int]:
        # Crea JWT con expiración
        # Retorna (token, expires_at)
    
    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
        # Valida JWT y retorna datos del usuario
    
    @staticmethod
    def get_current_admin(current_user: dict = Depends(get_current_user)):
        # Verifica que el usuario sea admin
```

### Manejo de Errores

Los errores se manejan con `HTTPException` de FastAPI:

```python
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Reserva no encontrada"
)
```

Códigos de estado comunes:
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado (rol insuficiente)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej. reserva duplicada)
- `500 Internal Server Error`: Error del servidor

### Logging

Configurado en `app/logger/logger_config.py` usando el módulo `logging` de Python.

```python
logger = logging.getLogger("app")
logger.info("[ReservationService.create] created id=%s", reservation.id)
logger.warning("[PenaltyService.create] duplicated penalty id_reserva=%s", id)
logger.exception("[UserService.login] error")  # Con traceback
```

---

## Frontend

### Tecnologías Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 15+ | Framework de React (App Router) |
| React | 19 | Biblioteca UI |
| TypeScript | 5+ | Tipado estático |
| Tailwind CSS | 3+ | Estilos utilitarios |
| Lucide React | - | Iconos |
| Heroicons | - | Iconos alternativos |

### Estructura de Directorios Frontend

```
frontend/
├── app/                      # Next.js App Router
│   ├── admin/               # Rutas de administración
│   │   ├── penailzaciones/
│   │   ├── reservas/
│   │   ├── usuarios/
│   │   └── page.tsx        # Dashboard admin
│   ├── api/                 # API routes de Next.js (proxy)
│   │   └── users/
│   │       └── login/route.ts
│   ├── auth/                # Login y registro
│   │   └── page.tsx
│   ├── components/          # Componentes React
│   │   ├── Cards/          # Tarjetas (SpaceCard, ReservationCard)
│   │   ├── Domain/         # Lógica de dominio (Calendar)
│   │   ├── Filters/        # Filtros
│   │   ├── Forms/          # Formularios
│   │   ├── Layout/         # Sidebar, Header, Footer
│   │   ├── Modals/         # Modales (PenalizationForm)
│   │   ├── Pagination/     # Controles de paginación
│   │   ├── Tables/         # Tablas (DataTable)
│   │   └── UI/             # Componentes base (Button, Input)
│   ├── context/              # React Context
│   │   └── AuthContext.tsx  # Autenticación global
│   ├── courtes/             # Página de pistas
│   ├── dashboard/           # Dashboard de usuario
│   ├── lib/                 # Utilidades y servicios
│   │   ├── api.ts          # Cliente HTTP
│   │   ├── hooks/          # Custom hooks (useApiQuery)
│   │   └── services/       # Llamadas a la API
│   ├── login/               # (Redirección)
│   ├── notifications/       # Notificaciones
│   ├── penalties/           # Mis penalizaciones
│   ├── profile/            # Perfil de usuario
│   │   └── [id]/         # Perfil de otros (admin)
│   ├── register/            # Registro
│   ├── reservations/        # Mis reservas
│   ├── spaces/              # Tipos de espacios
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx             # Home
│   └── not-found.tsx       # 404
├── next.config.ts
├── package.json
├── tsconfig.json
└── next-env.d.ts
```

### Componentes

#### UI Base

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Button | `app/components/UI/Button.tsx` | Botón reutilizable con variantes |
| Input | `app/components/UI/Input.tsx` | Campo de formulario |
| Spinner | `app/components/UI/Spinner.tsx` | Indicador de carga |
| Toast | `app/components/UI/Toast.tsx` | Notificación temporal |

#### Layout

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Sidebar | `app/components/Layout/Sidebar.tsx` | Barra lateral con navegación |
| Header | `app/components/Layout/Header.tsx` | Cabecera |
| Footer | `app/components/Layout/Footer.tsx` | Pie de página |
| NotificationsBanner | `.../NotificationsBanner.tsx` | Banner de notificaciones |

#### Cards

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| SpaceCard | `app/components/Cards/SpaceCard.tsx` | Tarjeta de tipo de espacio |
| ReservationCard | `.../ReservationCard.tsx` | Tarjeta de reserva |
| CourtCard | `.../CourtCard.tsx` | Tarjeta de pista |
| StatCard | `.../StatCard.tsx` | Tarjeta de estadística |

#### Tables

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| DataTable | `app/components/Tables/DataTable.tsx` | Tabla genérica con búsqueda |
| PenaltiesTable | `.../PenaltiesTable.tsx` | Tabla de penalizaciones |
| ReservationsTable | `.../ReservationsTable.tsx` | Tabla de reservas |

### Páginas

#### Página Principal (`/`)
Home con enlaces a características del complejo.

#### Dashboard (`/dashboard`)
Panel principal del usuario con:
- Estadísticas (total reservas, penalizaciones)
- Próximas reservas
- Calendario semanal

#### Reservas (`/reservations`)
Mis reservas con tabs:
- Activas
- Pasadas
- Canceladas

#### Admin Reservas (`/admin/reservas`)
Tabla con todas las reservas, filtros por fecha y usuario, paginación.

#### Admin Penalizaciones (`/admin/penalizaciones`)
Gestión de penalizaciones con formulario de creación.

#### Espacios (`/spaces`)
Tipos de espacios disponibles (Pádel, Tenis, etc.).

### Servicios Frontend

Funciones para comunicarse con el backend (en `frontend/lib/services/`).

#### Ejemplo: reservations.ts
```typescript
export function getReservationsByUser(userId: number) {
  return apiFetch<Reservation[]>(`/reservations/user/${userId}`, { 
    method: "GET", 
    cache: "no-store" 
  });
}

export function createReservation(payload: ReservationCreatePayload) {
  return apiFetch<Reservation>("/reservations/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelReservation(reservationId: number) {
  // Cambia el estado a "Cancelada" (no elimina)
  return apiFetch<{ mensaje?: string }>(`/reservations/update/${reservationId}`, {
    method: "PUT",
    body: JSON.stringify({ estado: "Cancelada" }),
  });
}
```

### Contexto y Estado

#### AuthContext (`frontend/context/AuthContext.tsx`)

Maneja el estado global de autenticación:

```typescript
interface AuthContextType {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isCliente: boolean;
  isClub: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  notifications: Notification[];
  unreadNotificationsCount: number;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
}
```

**Comportamiento de notificaciones**: Al marcar como leída, se **elimina** la notificación (no solo se marca como leída).

### Hooks Personalizados

#### useApiQuery (`frontend/lib/hooks/useApiQuery.ts`)
```typescript
function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[],
  options?: { enabled?: boolean }
): { data: T | null; loading: boolean; error: string | null; refetch: () => void }
```

Hook personalizado que maneja:
- Estados de carga
- Manejo de errores
- Reintentos
- Dependencias para re-fetch

---

## Base de Datos

### Esquema (PostgreSQL)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   roles     │     │  usuarios   │     │  reservas   │
│             │     │             │     │             │
│ id (PK)    │◄────│ id_rol (FK) │─────│ id_user (FK) │
│ rol        │     │             │     │ id_espacio  │
└─────────────┘     │ nombre     │     │ (FK)        │
                    │ email      │     │             │
                    └─────────────┘     └──────┬────────┘
                                             │
                    ┌─────────────┐              │
                    │penalizacio-│◄─────────────┘
                    │   nes       │  id_reserva (FK)
                    │             │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ tipos_     │     │ espacios   │     │notificacio- │
│ espacio     │────►│             │     │   nes       │
│             │     │ id_tipo     │     │ id_user(FK) │
│ id (PK)    │     │ (FK)        │     │ id_reserva  │
│ nombre     │     │             │     │ (FK)        │
│ capacidad  │     └─────────────┘     └─────────────┘
│ precio_hora│
└─────────────┘
```

### Variables de Entorno (`.env`)

```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=complejo_deportivo

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## API Endpoints

### Documentación de Endpoints Principales

#### POST /users/register
Crea un nuevo usuario.

**Request:**
```json
{
  "nombre": "Juan",
  "pri_ape": "Pérez",
  "seg_ape": "García",
  "email": "juan@email.com",
  "password": "contraseña123",
  "telefono": "123456789",
  "rol": "CLIENTE"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "juan@email.com",
  "rol": "CLIENTE",
  "mensaje": "Usuario creado exitosamente"
}
```

#### POST /users/login
Inicia sesión y establece cookies.

**Response (200):**
```json
{
  "success": true,
  "id": 1,
  "name": "Juan",
  "email": "juan@email.com",
  "rol": "CLIENTE",
  "expires_at": 1234567890,
  "mensaje": "Inicio de sesión exitoso"
}
```

#### POST /reservations/create
Crea una nueva reserva.

**Request:**
```json
{
  "fecha": "2026-05-10",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:30:00",
  "tipo_reserva": "completa",
  "id_user": 1,
  "id_espacio": 3
}
```

**Response (201):**
```json
{
  "id": 123,
  "fecha": "2026-05-10",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:30:00",
  "estado": "Pendiente",
  "precio_total": 45.00,
  "id_user": 1,
  "id_espacio": 3
}
```

#### PUT /reservations/update/{id}
Actualiza una reserva (usado para cancelar cambiando `estado` a "Cancelada").

**Request:**
```json
{
  "estado": "Cancelada"
}
```

#### GET /reservations/search?fecha=2026-05-10&usuario=Juan&page=1&limit=20
Búsqueda paginada de reservas.

**Response (200):**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

---

## Despliegue

### Docker

#### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: complejo_deportivo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/complejo_deportivo
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30

  web:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

volumes:
  postgres_data:
```

### Comandos de Despliegue

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# Solo base de datos
docker-compose up db

# Ejecutar migraciones (si se usa Alembic)
docker-compose exec api alembic upgrade head

# Ver logs
docker-compose logs -f api
```

---

## Guía de Desarrollo

### Configuración del Entorno

1. **Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

2. **Frontend:**
```bash
cd frontend
npm install
```

3. **Base de Datos:**
- Instalar PostgreSQL
- Crear base de datos `complejo_deportivo`
- Configurar `.env` en `backend/`

### Ejecución en Desarrollo

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Acceder a:
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

### Convenciones de Código

#### Python (Backend)
- **Nombres**: `snake_case` para variables y funciones, `PascalCase` para clases
- **Tipos**: Usar type hints en todas las funciones
- **Docstrings**: Para lógica compleja
- **Logger**: Usar `logger.info()`, `logger.warning()`, `logger.exception()`

#### TypeScript (Frontend)
- **Nombres**: `camelCase` para variables, `PascalCase` para componentes
- **Tipos**: No usar `any`, definir interfaces explicitas
- **Estilos**: Tailwind CSS con clases utilitarias
- **Componentes**: "use client" solo cuando hay interactividad

---

## Flujos de Trabajo

### Flujo de Reservas

```
Usuario → Selecciona espacio → Elige fecha/hora → 
→ Sistema valida disponibilidad → Calcula precio →
→ Confirma reserva → Estado: "Pendiente"

En día de la reserva:
→ Estado cambia a "En curso" → Al finalizar → "Finalizada"

Si se cancela antes:
→ Estado cambia a "Cancelada" (se mantiene en BD)
```

### Flujo de Penalizaciones

```
Admin revisa reservas finalizadas → Selecciona reserva →
→ Llena formulario (motivo) → Crea penalización →
→ Usuario recibe notificación
```

### Flujo de Notificaciones

```
Evento (ej. reserva cancelada) → NotificationService crea notificación →
→ Usuario ve banner/notificaciones → Hace clic →
→ Notificación se ELIMINA (no solo marca como leída)
```

---

## Checklist de Calidad

### Para IA Agents y Desarrolladores

- [ ] **Linting**: ESLint (frontend) y Ruff (backend) sin errores
- [ ] **Type Safety**: Sin errores de TypeScript, hints en Python
- [ ] **Seguridad**: Sin secretos en código, usar `.env`
- [ ] **Responsive**: UI funciona en móvil
- [ ] **Documentación**: Docstrings en Python, JSDoc en React complejo
- [ ] **Consistencia**: `camelCase` en JS/TS, `snake_case` en Python
- [ ] **Arquitectura**: 
  - Frontend: Componentes pequeños, `lucide-react`
  - Backend: Lógica en Services, no en Routes
- [ ] **Sin Placeholders**: Implementaciones completas, no "TODO"
- [ ] **Manejo de Errores**:
  - Python: `try/except` con logging
  - JS/TS: `try/catch` con feedback al usuario
- [ ] **Notificaciones**: Al marcar como leída, se eliminan de BD
- [ ] **Reservas canceladas**: No tienen botones de acción (cancelar/penalizar)

### Prioridades de Tareas
1. **Alta**: Corrección de errores, seguridad
2. **Media**: Paginación (backend), optimización
3. **Baja**: Mejoras UI, refactorizaciones

---

## Apendice

### Scripts Disponibles

#### Backend (requirements.txt)
```
fastapi==0.136.1
uvicorn==0.46.0
sqlalchemy==2.0.49
psycopg2-binary==2.9.12
pydantic==2.13.3
pydantic-core==2.46.3
python-dotenv==1.2.2
pyjwt==2.12.1
bcrypt==5.0.0
```

#### Frontend (package.json - dependencies clave)
```json
{
  "next": "16.1.6",
  "react": "19.1.0",
  "typescript": "5+",
  "tailwindcss": "4+",
  "lucide-react": "latest"
}
```

### Troubleshooting

#### Error: "password authentication failed for user "postgres""
- Verificar `.env` en `backend/`
- Confirmar que PostgreSQL está corriendo
- Revisar credenciales

#### Error: "Module not found: fastapi"
```bash
cd backend
pip install -r requirements.txt
```

#### Error de TypeScript en frontend
```bash
cd frontend
npx tsc --noEmit  # Ver errores
npm run lint      # Corregir con ESLint
```

---

**Documentación generada**: Mayo 2026  
**Versión del Proyecto**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo
