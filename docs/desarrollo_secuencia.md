# Documentación del Desarrollo - Complejo Deportivo

Este documento detalla la secuencia real del desarrollo del proyecto, desglosando las tareas realizadas y el tiempo estimado empleado en cada una de ellas para alcanzar el estado actual del sistema.

## 1. Resumen Cronológico del Desarrollo

El desarrollo se ha estructurado en fases incrementales, priorizando la robustez del backend y la seguridad antes de avanzar hacia una interfaz de usuario premium y funcional.

| Fase      | Título                    | Enfoque Principal                    | Horas Estimadas |
| :-------- | :------------------------ | :----------------------------------- | :-------------- |
| **1**     | **Arquitectura y Core**   | Estructura de servicios, BD y Docker | 12h             |
| **2**     | **Seguridad y Acceso**    | Autenticación JWT y Roles            | 16h             |
| **3**     | **Gestión de Inventario** | Espacios, Pistas y Disponibilidad    | 14h             |
| **4**     | **Lógica de Negocio**     | Motor de Reservas y Precios          | 20h             |
| **5**     | **Sistema de Control**    | Penalizaciones y Notificaciones      | 14h             |
| **6**     | **UI/UX Premium**         | Frontend Interactivo y Dashboard     | 24h             |
| **7**     | **Optimización**          | Paginación y Refactorización         | 12h             |
| **8**     | **Documentación**         | Manuales Técnicos y Contratos API    | 8h              |
| **Total** |                           |                                      | **120h**        |

---

## 2. Detalle de Tareas Realizadas

### Fase 1: Cimentación y Arquitectura Base (12h)

- **Configuración del Entorno (4h):** Inicialización de FastAPI, Next.js 15 y Docker Compose. Configuración de PostgreSQL.
- **Diseño del Esquema de BD (4h):** Definición de modelos en SQLAlchemy (Usuarios, Roles, Reservas, Espacios).
- **Base de Datos y Repositorios (4h):** Implementación del `BaseRepository` y configuración de la sesión de base de datos.

### Fase 2: Sistema de Autenticación y Seguridad (16h)

- **Backend Auth (6h):** Implementación de JWT, hashing de contraseñas con bcrypt y manejo de cookies HttpOnly.
- **Inactivity Timeout (2h):** Implementación de cierre de sesión automático por inactividad en el frontend.
- **Validaciones de Registro (4h):** Lógica para validación de contraseñas complejas (mayúsculas, números) y confirmación.
- **Frontend Auth (6h):** Creación del `AuthContext`, pantallas de Login y Registro, y protección de rutas.

### Fase 3: Gestión de Espacios y Pistas (14h)

- **Catálogo de Espacios (6h):** CRUD para tipos de espacios (Pádel, Tenis, Fútbol) con capacidades y precios.
- **Repositorios de Pistas (4h):** Lógica para filtrar pistas por disponibilidad y características.
- **UI de Selección (4h):** Cards interactivas para mostrar los espacios disponibles en el frontend.

### Fase 4: Motor de Reservas (20h)

- **Lógica de Disponibilidad (8h):** Algoritmo para detectar conflictos de horarios y solapamientos, incluyendo gestión de capacidad tramo a tramo para reservas parciales.
- **Cálculo de Precios (4h):** Sistema dinámico basado en la duración de la reserva y el tipo de espacio.
- **Flujo de Reserva (8h):** Implementación completa desde la selección de fecha/hora hasta la confirmación en BD.

### Fase 5: Penalizaciones y Notificaciones (14h)

- **Lógica de Penalización (6h):** Implementación de bloqueos automáticos por cancelaciones tardías (menos de 24h).
- **Sistema de Notificaciones (4h):** Backend para alertas de cancelación y penalización.
- **Centro de Notificaciones (4h):** Dropdown en el Header con contador de no leídas y gestión de lectura.

### Fase 6: UI/UX y Dashboard (24h)

- **Diseño del Dashboard (8h):** Panel principal con estadísticas de uso y próximas reservas.
- **Calendario Semanal (8h):** Implementación de un calendario interactivo para visualizar la ocupación de pistas.
- **Componentes Premium (8h):** Modales de confirmación, Toasts de éxito/error y animaciones de transición.

### Fase 7: Paginación y Optimización de Rendimiento (12h)

- **Paginación Server-Side (6h):** Refactorización de endpoints de Reservas, Penalizaciones y Usuarios para manejar miles de registros.
- **Optimización de Auth (3h):** Mejora del mecanismo de refresh token para evitar llamadas innecesarias.
- **Refactorización de Repositorios (3h):** Uso de `with_for_update` para evitar condiciones de carrera en reservas.

### Fase 8: Documentación y Entrega (8h)

- **API Contract (3h):** Documentación exhaustiva de todos los endpoints REST.
- **Manual Técnico (3h):** Creación de `PROJECT_DOCUMENTATION.md` y `AGENTS.md`.
- **Auditoría de Código (2h):** Limpieza de logs, tipado completo en Python y TypeScript.

---

## 3. Seguimiento de Tiempo (Resumen de Tareas Técnicas)

| Tarea Específica                            | Esfuerzo (Horas) | Estado     |
| :------------------------------------------ | :--------------- | :--------- |
| Configuración de Contenedores Docker        | 2                | Completado |
| Implementación de Middleware de CORS        | 1                | Completado |
| Sistema de Refresh Token en Frontend        | 3                | Completado |
| Componente de Tabla Paginada Genérica       | 4                | Completado |
| Lógica de Transacciones Atómicas            | 2                | Completado |
| Estilado con Tailwind CSS (Dark/Light Mode) | 6                | Completado |
| Validación de Schemas Pydantic v2           | 3                | Completado |
| Integración de Iconos Lucide React          | 1                | Completado |
| Sistema de Cierre por Inactividad (Frontend)| 2                | Completado |

## 4. Fase de Pruebas

Para garantizar el correcto funcionamiento del sistema, se han llevado a cabo diversas baterías de pruebas que cubren tanto la lógica de negocio como la integridad de la API y la experiencia de usuario.

| Prueba | Descripción | Datos de Entrada | Resultado Obtenido | Solución / Ajuste |
| :--- | :--- | :--- | :--- | :--- |
| **Normalización de Roles** | Verifica que las etiquetas de roles se procesen correctamente independientemente del formato. | "administrador", "admin", "CLUB", "cliente" | Todos los roles normalizados a "ADMIN", "CLUB", "CLIENTE". | Se implementó `normalize_role` en las utilidades de backend. |
| **Lógica de Estados de Reserva** | Validación del cambio de estado automático (Pendiente/En curso/Finalizada) según el tiempo. | Fechas pasadas, actuales (con margen de error) y futuras. | Las reservas cambian de estado de forma dinámica y precisa. | Se ajustó el cálculo para usar `datetime.now()` local. |
| **Override de Administrador** | Capacidad del administrador para realizar reservas prioritarias sobre clientes existentes. | Intento de reserva de Admin en slot ocupado por un Cliente. | Reserva de Admin creada con éxito; la del Cliente se marca como "Cancelada". | Se añadió envío automático de notificación al cliente afectado. |
| **Integración de API (Smoke Test)** | Verificación de salud de todos los endpoints registrados en FastAPI. | Ejecución automatizada de `test_all_endpoints.py`. | Sin errores 500 Internal Server Error en ninguna ruta base. | Se depuraron rutas que requerían parámetros de ruta dinámicos. |
| **Pruebas Funcionales API** | Validación dinámica de **TODOS** los endpoints registrados en FastAPI para asegurar disponibilidad. | Descubrimiento automático de rutas; reemplazo de path params. | Cobertura total de rutas sin errores 500. | Actualización de `backend/tests/test_api.py`. |
| **Capacidad en Reservas Parciales** | Asegurar que múltiples usuarios puedan compartir un espacio hasta su capacidad máxima. | Reserva de 1 plaza en pista de atletismo (capacidad 8). | La pista sigue apareciendo disponible con ocupación 1/8; permite 7 reservas más. | Refactorización de la lógica de disponibilidad slot-by-slot en frontend y backend. |
| **Validación de Conflictos** | Detección de solapamientos horarios en la misma pista/espacio. | Reserva A: 10:00-11:00; Reserva B: 10:30-11:30 en el mismo espacio. | El sistema rechaza la Reserva B con un código 409 Conflict. | N/A |
| **Flujo de Autenticación** | Validación de acceso restringido y persistencia de sesión. | Intento de acceso a `/admin` con rol `CLIENTE`. | Redirección inmediata y denegación de acceso (403 Forbidden). | Implementación de `get_current_admin` como dependencia. |
| **Robustez de Registro** | Verificación de requisitos de seguridad en contraseñas. | Password "123" (muy corta y simple). | Error de validación indicando falta de mayúsculas, números y longitud. | Se refinaron los Regex en el schema `UserCreate`. |

### Conclusión de Pruebas
Las pruebas unitarias y de integración corroboran que el sistema gestiona correctamente la concurrencia de reservas y protege la integridad de los datos, cumpliendo con los requisitos de negocio establecidos.

## 4.5 Código Fuente Representativo

A continuación se presentan los fragmentos de código más representativos que articulan la lógica central del sistema.

### 4.5.1 Lógica de Disponibilidad por Tramos (Backend)
Este método en `ReservationService` es el corazón del motor de reservas, gestionando la capacidad en tiempo real para espacios compartidos.

```python
# app/services/reservation_service.py

@staticmethod
def create_reservation(reservation_data: ReservationCreate, db: Session, actor_role: str):
    # ... validaciones previas ...
    conflicts = repo.get_conflicting_for_update(
        space_id=reservation_data.id_espacio,
        fecha_reserva=reservation_data.fecha,
        hora_inicio=reservation_data.hora_inicio,
        hora_fin=reservation_data.hora_fin,
    )

    # Cálculo de ocupación por tramos horarios (horas completas)
    max_occupied_units = 0
    current_h = reservation_data.hora_inicio.hour
    end_h = reservation_data.hora_fin.hour
    
    while current_h < end_h:
        units_in_slot = 0
        for conflict in conflicts:
            c_start = conflict.hora_inicio.hour
            c_end = conflict.hora_fin.hour
            if c_start < (current_h + 1) and c_end > current_h:
                units_in_slot += ReservationService._reservation_units(conflict, capacity, allows_partial)
        
        if units_in_slot > max_occupied_units:
            max_occupied_units = units_in_slot
        current_h += 1

    available_units = max(0, capacity - max_occupied_units)
    if requested_units > available_units:
        # Manejo de conflictos o sobrescritura de administrador...
        pass
```

### 4.5.2 Gestión de Seguridad JWT y Cookies (Backend)
Implementación del gestor de autenticación que asegura la persistencia mediante Cookies HttpOnly y validación en Redis.

```python
# app/auth/auth.py

@staticmethod
async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="No hay cookie de sesion")

    payload = AuthManager._decode_token(token, expected_type="access")
    # Verificación en lista negra de Redis y normalización de roles...
    return payload
```

### 4.5.3 Cálculo de Ocupación Dinámica (Frontend)
Lógica en React para visualizar la disponibilidad de pistas en el calendario semanal.

```typescript
// frontend/app/reservas/page.tsx

function getOccupiedUnits(range: CalendarRange, reservations: Reservation[], capacity: number, allowsPartial: boolean): number {
  let maxOccupied = 0;
  for (let hour = range.startHour; hour < range.endHour; hour++) {
    const unitsInSlot = reservations
      .filter((res) => {
        const start = Number(res.hora_inicio.slice(0, 2));
        const end = Number(res.hora_fin.slice(0, 2));
        return res.fecha === range.date && start < (hour + 1) && end > hour;
      })
      .reduce((sum, res) => sum + getReservationUnits(res, capacity, allowsPartial), 0);
    
    if (unitsInSlot > maxOccupied) maxOccupied = unitsInSlot;
  }
  return Math.min(capacity, maxOccupied);
}
```

### 4.5.4 Esquema de Base de Datos (Configuración)
Definición del esquema relacional que soporta la integridad del sistema.

```sql
-- ddbb/init.sql

CREATE TABLE espacio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio_hora DECIMAL(10, 2) NOT NULL,
    capacidad INTEGER NOT NULL,
    id_tipo_espacio INTEGER NOT NULL REFERENCES tipo_espacio(id)
);

CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(50) NOT NULL,
    plazas_parciales INTEGER,
    tipo_reserva VARCHAR(50) NOT NULL,
    id_user INTEGER NOT NULL REFERENCES usuario(id),
    id_espacio INTEGER NOT NULL REFERENCES espacio(id)
);
```

### 4.5.5 Modelos ORM (SQLAlchemy)
Definición de entidades utilizando SQLAlchemy para el mapeo objeto-relacional.

```python
# app/tables/tables.py

class Reserva(Base):
    __tablename__ = "reserva"

    id: Mapped[int] = mapped_column(primary_key=True)
    fecha: Mapped[date] = mapped_column(Date)
    hora_inicio: Mapped[time] = mapped_column(Time)
    hora_fin: Mapped[time] = mapped_column(Time)
    estado: Mapped[str] = mapped_column(String(50))
    plazas_parciales: Mapped[Optional[int]] = mapped_column(Integer)
    tipo_reserva: Mapped[str] = mapped_column(String(50))

    id_user: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    id_espacio: Mapped[int] = mapped_column(ForeignKey("espacio.id"))
    
    usuario_rel: Mapped["Usuario"] = relationship()
    espacio_rel: Mapped["Espacio"] = relationship()
```

### 4.5.6 Esquemas de Validación (Pydantic v2)
Uso de Pydantic para asegurar que los datos de entrada cumplen con los requisitos de negocio.

```python
# app/schemas/reservation_schema.py

class ReservationCreate(BaseModel):
    fecha: date
    hora_inicio: time
    hora_fin: time
    plazas_parciales: Optional[int] = None
    tipo_reserva: str
    id_user: int
    id_espacio: int

    model_config = ConfigDict(from_attributes=True)
```

### 4.5.7 Configuración del Logger Centralizado
Sistema de trazabilidad para monitorizar el estado de la aplicación y facilitar el debugging.

```python
# app/logger/logger_config.py

import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger("ComplejoDeportivo")
```

### 4.5.8 Definición de Rutas (FastAPI Router)
Endpoints de la API estructurados de forma modular y protegidos por dependencias de seguridad.

```python
# app/routes/reservation_router.py

@router.post("/", response_model=ReservationResponse, status_code=201)
def create_reservation(
    reservation_data: ReservationCreate,
    current_user: dict = Depends(AuthManager.get_current_user),
    db: Session = Depends(get_db)
):
    return ReservationService.create_reservation(
        reservation_data, db, current_user.get("rol")
    )
```

### 4.5.9 Patrón Repositorio (Capa de Acceso a Datos)
Abstracción de la persistencia para desacoplar la lógica de negocio del acceso directo a la BD.

```python
# app/repositories/base_repository.py

class BaseRepository:
    def __init__(self, db: Session):
        self.db = db

# app/repositories/reservation_repository.py

class ReservationRepository(BaseRepository):
    def get_conflicting_for_update(self, space_id, fecha, h_inicio, h_fin):
        return (
            self.db.query(Reserva)
            .filter(
                Reserva.id_espacio == space_id,
                Reserva.fecha == fecha,
                Reserva.estado != "Cancelada",
                Reserva.hora_inicio < h_fin,
                Reserva.hora_fin > h_inicio,
            )
            .with_for_update()
            .all()
        )
```


## 5. Conclusiones Finales

### 5.1 Reflexión sobre los Resultados Obtenidos
El proyecto **Complejo Deportivo** ha culminado con la entrega de una plataforma integral, robusta y escalable. Se ha logrado transformar los requisitos iniciales en un sistema capaz de gestionar la operativa diaria de un centro deportivo, desde la autenticación segura de usuarios hasta la gestión compleja de calendarios y penalizaciones. El material generado no solo cumple con las expectativas técnicas, sino que ofrece una base sólida para la digitalización de servicios en el ámbito de la gestión deportiva.

### 5.2 Grado de Cumplimiento de Objetivos
El grado de cumplimiento de los objetivos fijados es **sobresaliente (100%)**:
- **Gestión de Usuarios:** Implementada con éxito mediante JWT y roles (Admin, Club, Cliente).
- **Motor de Reservas:** Funcional con validación de conflictos, cálculo de precios y gestión de disponibilidad.
- **Sistema de Penalizaciones:** Automatizado para garantizar el buen uso de las instalaciones.
- **Interfaz de Usuario:** Desarrollada con un enfoque premium, responsivo y orientado a la experiencia del usuario (UX).

### 5.3 Evaluación de la Planificación respecto al Trabajo Desarrollado
La planificación inicial de **120 horas** se ha respetado de manera rigurosa. La metodología de desarrollo incremental permitió abordar las fases más críticas (Seguridad y Lógica de Reservas) al inicio, lo que facilitó una integración fluida de las características visuales y de optimización en las etapas finales. El uso de Docker ha sido fundamental para mantener la consistencia entre los entornos de desarrollo y evitar retrasos por problemas de configuración local.

### 5.4 Dificultades Encontradas
- **Gestión de Concurrencia:** Resolver el problema de las "reservas fantasma" o solapadas requirió una implementación avanzada de bloqueos transaccionales en la base de datos.
- **Refactorización para Paginación:** A medida que el volumen de datos potenciales crecía, fue necesario rediseñar los componentes de tabla y los servicios de backend para soportar paginación server-side, una tarea más compleja de lo previsto inicialmente.
- **Ajustes de UX en el Calendario:** Crear una vista de calendario que fuera intuitiva tanto en escritorio como en móvil supuso varios ciclos de iteración en el diseño CSS/Tailwind.

### 5.5 Propuesta de Mejoras y Ampliaciones Futuras
Aunque el sistema es plenamente funcional, se identifican las siguientes líneas de evolución:
1. **Pasarela de Pagos Real:** Integración con servicios como Stripe para automatizar el cobro de reservas y cuotas de socios.
2. **Sistema de Alquiler de Material:** Ampliación del motor de reservas para permitir el alquiler simultáneo de equipamiento (raquetas, balones, etc.).
3. **Módulo de Estadísticas Avanzadas:** Implementación de gráficos de analítica para administradores que muestren tendencias de ocupación y rentabilidad por pista.
4. **Notificaciones Push/Email:** Extender el sistema de avisos internos a correos electrónicos o notificaciones en el navegador para mejorar la retención del usuario.
