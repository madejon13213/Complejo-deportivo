# 2. INTRODUCCIÓN Y DESCRIPCIÓN DEL PROYECTO

## 2.1. Introducción

### Interés del tema a tratar

El presente proyecto surge de la necesidad imperiosa de digitalizar y optimizar la gestión administrativa en centros deportivos medianos y pequeños. En la actualidad, gran parte de estos establecimientos aún dependen de métodos manuales (libretas físicas, hojas de cálculo de Excel o comunicación telefónica) para gestionar sus reservas e instalaciones. 

El **interés principal** radica en la aplicación práctica de tecnologías modernas de desarrollo web (FastAPI, Next.js, PostgreSQL) para resolver un problema cotidiano con un alto impacto en la eficiencia operativa. La transformación digital de un "Complejo Deportivo" tradicional en una entidad inteligente y automatizada es un reto técnico que abarca:

*   **Interacción en tiempo real**: Gestión de concurrencia en reservas.
*   **Seguridad**: Protección de datos de usuarios y roles de acceso.
*   **Experiencia de Usuario (UX)**: Interfaces limpias y responsivas con Tailwind CSS.

### Justificación del proyecto

La justificación de "Complejo Deportivo" se basa en tres pilares fundamentales:

1.  **Eficiencia Operativa**: La automatización de reservas elimina el error humano en la asignación de pistas y reduce la carga administrativa. El cálculo automático de precios basado en la duración y el tipo de espacio (completo vs. parcial) libera tiempo valioso para el personal del complejo.
2.  **Control y Transparencia**: El sistema de penalizaciones y el historial de reservas proporcionan un registro auditable y transparente, reduciendo conflictos entre usuarios y administración.
3.  **Escalabilidad**: Al utilizar una arquitectura de microservicios lógicos (separación clara entre Routes, Services y Repositories en el backend, y componentes reutilizables en el frontend), el sistema está preparado para crecer.

### Campos de aplicación

El sistema es directamente aplicable a:
*   **Centros Deportivos Municipales**: Gestión de piscinas, pabellones y campos de fútbol.
*   **Clubs Privados**: Control de acceso y reservas para socios.
*   **Instalaciones Hoteleras**: Gestión de servicios deportivos para huéspedes.
*   **Centros Educativos**: Reserva de instalaciones deportivas para alumnos y profesores.

### Relación con elementos curriculares del ciclo (DAW)

Este proyecto es una integración práctica de las competencias adquiridas en el **Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)**:

| Módulo Profesional | Aplicación en el Proyecto |
|--------------------------------|-----------------------------------|
| **M03 - Programación** | Lógica de negocio en Python (FastAPI), manejo de excepciones, algoritmos de cálculo de precios. |
| **M04 - Lenguajes de Marcas y Sistemas de Gestión de Información** | Uso de HTML5 semántico, Tailwind CSS para estilos utilitarios y diseño responsivo. |
| **M05 - Entornos de Desarrollo** | Uso de VSCode, Git (control de versiones), Docker para contenerización. |
| **M06 - Desarrollo Web en Entorno Cliente** | Implementación de la SPA con React 19, uso de hooks (`useState`, `useContext`, `useApiQuery`), TypeScript y Next.js App Router. |
| **M07 - Desarrollo Web en Entorno Servidor** | Creación de la API RESTful con FastAPI, uso de SQLAlchemy como ORM, manejo de sesiones y autenticación JWT. |
| **M08 - Acceso a Datos** | Diseño e implementación de la base de datos relacional en PostgreSQL, definición de esquemas Pydantic para validación. |
| **M09 - Despliegue de Aplicaciones Web** | Configuración de Docker y Docker Compose para levantar el entorno completo (BD, API, Web). |
| **M10 - Desarrollo de Aplicaciones Web Multiplataforma** | Adaptación del frontend para diversos dispositivos (Mobile First) usando Tailwind. |
| **M12 - Proyecto Integrado** | La totalidad del proyecto es la materialización del proyecto integrador, uniendo todas las tecnologías mencionadas. |

### Antecedentes y bibliografía

Para la realización de este proyecto se han consultado las siguientes fuentes:

*   **Documentación Oficial de FastAPI**: Para la implementación de dependencias (`Depends`), manejo de errores HTTP y generación automática de documentación OpenAPI.
*   **Documentación de Next.js 15+**: Para el entendimiento del App Router, Server Components vs. Client Components y estrategias de fetching de datos.
*   **SQLAlchemy 2.0 Documentation**: Para el mapeo objeto-relacional y la gestión de sesiones de base de datos.
*   **Tailwind CSS Official Docs**: Para la creación de interfaces modernas sin salir del HTML/JSX.
*   **RFC 7519 - JSON Web Token (JWT)**: Para entender la estructura de los tokens de acceso y refresh tokens.

---

## 2.2. Descripción del proyecto. Motivación y finalidad.

### Motivación

La motivación nace al observar la ineficiencia de los sistemas de reservas tradicionales. Un complejo deportivo moderno no puede depender de "llamar por teléfono" para reservar una pista. La motivación es demostrar que con herramientas actuales (Python 3.12+, React 19, TypeScript 5+) se puede construir un sistema robusto, seguro y atractivo en un corto periodo de tiempo, cumpliendo con estándares de industria.

### Finalidad

El sistema **Complejo Deportivo** tiene como finalidad principal ser una plataforma integral de gestión que permita:

1.  **Automatizar el proceso de reservas**: Dejar atrás las hojas de cálculo manuales.
2.  **Gestionar Usuarios y Roles**: Diferenciar entre Clientes (que reservan) y Administradores (que gestionan).
3.  **Control de Penalizaciones**: Automatizar sanciones por incumplimiento (no presentación a la reserva).
4.  **Visualización de Datos**: Proporcionar dashboards y calendarios para una visión clara del estado del complejo.

### Qué se quiere conseguir

Con la implementación de este sistema se persiguen los siguientes hitos:

*   **Cero Conflictos de Reserva**: Gracias al bloqueo transaccional (`with_for_update()`) en la base de datos, se garantiza que dos usuarios no puedan reservar la misma pista a la misma hora.
*   **Experiencia de Usuario Premium**: Una interfaz que no parezca un "trabajo", sino un producto comercial pulido, usando animaciones sutiles y diseño limpio.
*   **Seguridad Robusta**: Protección de rutas mediante JWT, contraseñas hasheadas con bcrypt y validación estricta de datos con Pydantic v2.
*   **Código Mantenible**: Arquitectura limpia donde la lógica de negocio (Services) está desacoplada de la infraestructura (Routes y Repositories).

---

## 2.3. Objetivos (Funcionales, Técnicos, Personales)

### Objetivos Funcionales

Los objetivos funcionales describen **qué hace el sistema**. Han sido definidos siguiendo el estándar **RA4 (Seguimiento, control y evaluación de incidencias)**.

| ID | Objetivo Funcional | Descripción Detallada | Estado |
|----|---------------------|----------------------|--------|
| **OF-01** | **Gestión de Reservas** | El sistema debe permitir a los usuarios registrar reservas de espacios deportivos, especificando fecha, hora de inicio/fin y tipo de reserva (completa/parcial). | Implementado |
| **OF-02** | **Cálculo Dinámico de Precios** | Al crear una reserva, el sistema debe calcular el precio en función de: `(duración en horas) × (precio/hora del espacio)` y ajustar si es reserva parcial. | Implementado |
| **OF-03** | **Cancelación de Reservas** | El usuario o admin debe poder cancelar una reserva futura. El sistema debe cambiar el estado a "Cancelada" y notificar al usuario (sin eliminar el registro de la BD). | Implementado |
| **OF-04** | **Gestión de Penalizaciones** | Los administradores deben poder aplicar penalizaciones a reservas ya finalizadas, registrando un motivo y asociándolo a la reserva. | Implementado |
| **OF-05** | **Notificaciones Automáticas** | El sistema debe generar notificaciones ante eventos clave (reserva cancelada, penalización aplicada). Al marcar como leída, la notificación debe eliminarse de la BD. | Implementado |
| **OF-06** | **Panel de Administración** | Vista exclusiva para roles "ADMIN" para visualizar todas las reservas, usuarios y penalizaciones, con capacidad de filtrado. | Implementado |
| **OF-07** | **Control de Concurrencia** | Implementar un mecanismo a nivel de base de datos que impida que dos usuarios reserven el mismo recurso simultáneamente. | Implementado (SQLAlchemy `with_for_update`) |

### Objetivos Técnicos

Los objetivos técnicos describen **cómo está construido el sistema** y los estándares de calidad exigidos por la "GuiaProyectoDAW.pdf".

| ID | Objetivo Técnico | Descripción Detallada | Indicador de Calidad (RA4) |
|----|-------------------|----------------------|---------------------------------|
| **OT-01** | **Arquitectura Backend** | Implementar arquitectura en capas: `Routes` (API), `Services` (Lógica), `Repositories` (Datos). Uso estricto de `Depends` en FastAPI. | Código sin lógica de negocio en las rutas. |
| **OT-02** | **Seguridad JWT** | Implementación de autenticación basada en tokens. Access Token (corto) y Refresh Token. Almacenamiento en cookies HttpOnly. | Pruebas de endpoints protegidos rechazando tokens inválidos. |
| **OT-03** | **Tipado Estático** | Uso de TypeScript 5+ en frontend y Type Hints en Python. Cero errores de compilación (`tsc --noEmit` limpio). | `npx tsc --noEmit` retorna 0 errores. |
| **OT-04** | **ORM y Migraciones** | Uso de SQLAlchemy 2.0 para definir modelos (`tables.py`) y relaciones. | Base de datos PostgreSQL refleja fielmente los modelos. |
| **OT-05** | **Componentización Frontend** | Crear componentes reutilizables en React 19 (`Button`, `Input`, `DataTable`). Uso de "use client" solo cuando es estrictamente necesario. | UI consistente y DRY. |
| **OT-06** | **Suite de Pruebas (RA4)** | **(Ver Issue Técnica más abajo)** Implementar pruebas unitarias (lógica de precios), de integración (API/BD) y control de concurrencia. | Cobertura de pruebas > 80% en servicios críticos. |
| **OT-07** | **Contenerización** | Definir `Dockerfile` y `docker-compose.yml` para levantar la app sin configuración manual compleja. | `docker-compose up` levanta todo el entorno. |

### Objetivos Personales

1.  **Dominio de FastAPI**: Profundizar en la creación de APIs RESTful modernas, entendiendo el ciclo de vida de una petición y la inyección de dependencias.
2.  **Maestría en React/Next.js**: Aprender el App Router, Server Components vs Client Components y el manejo de estado global con Context API.
3.  **Experiencia en Bases de Datos Relacionales**: Practicar SQL a través de SQLAlchemy y entender el bloqueo pesimista (`SELECT FOR UPDATE`) para concurrencia.
4.  **Atención al Detalle (UX)**: Crear una interfaz que no solo funcione, sino que sea estéticamente agradable y fácil de usar.

### Problema a Resolver (Contexto y Entorno)

**Situación Actual**: El "Complejo Deportivo" ficticio (o real) opera con un sistema manual. El administrador lleva un cuaderno donde apunta las reservas. Esto provoca:
*   **Solapamientos**: Dos personas creen haber reservado la misma pista a la misma hora.
*   **Pérdida de Ingresos**: Al no haber un sistema automático de penalizaciones, usuarios no se presentan y el espacio queda vacío.
*   **Falta de Información**: No hay forma rápida de saber "cuánto dinero se generó este mes" o "qué usuario penaliza más".

**Solución Propuesta**: 
El sistema desarrollado actúa como el "cerebro" digital del complejo. 
1.  El usuario accede a `http://localhost:3000`, ve los espacios y reserva.
2.  El backend valida que la pista esté libre (usando bloqueo transaccional).
3.  Si el usuario no va, el admin aplica una penalización desde el panel de control.
4.  Todo queda registrado, trazado y disponible para análisis.

**Entorno de Trabajo**:
*   **Desarrollo**: Windows 11, VSCode, Python 3.12, Node.js 20+.
*   **Producción (Simulada)**: Docker containers (Python Alpine, Node Alpine, Postgres Official).
*   **Colaboración**: El proyecto está preparado para ser gestionado vía Git (aunque en este caso se trabaja en local).

---

## APÉNDICE: Issue Técnica para RA4 (Control de Calidad)

### 🚩 ISSUE: Implementación de Suite de Pruebas Críticas - Sistema de Reservas

**Descripción**
Para dar cumplimiento al apartado 6 (Fase de pruebas) de la memoria del proyecto, es imperativo desarrollar una batería de pruebas automáticas que garanticen la integridad de la lógica de negocio y la persistencia de datos. No se puede dar por finalizada la fase de desarrollo sin corroborar de forma razonable el buen funcionamiento del sistema.

**Objetivos Técnicos (RA4)**
*   Definir indicadores de calidad para la evaluación del software.
*   Asegurar la solución de posibles incidencias mediante el registro de resultados.

### 🧪 Plan de Pruebas Obligatorio

#### 1. Pruebas Unitarias (Lógica de Negocio)
*   **Cálculo Dinámico de Precios**: Validar que la función `estimate_price` devuelve el coste exacto según duración, tipo de espacio (completo/parcial) y tarifas aplicables.
    *   *Caso A*: 2 horas en pista de tenis ($10/h) = $20.
    *   *Caso B*: 1.5 horas en espacio parcial (capacidad 10, usa 4 plazas) = (1.5 * (10/10) * 4) = $6.
*   **Validación de Horarios**: Testear que el sistema rechaza correctamente horas de fin anteriores a las de inicio.
*   **Reglas de Penalización**: Verificar que solo se pueden aplicar sanciones a reservas con estado "Finalizada".

#### 2. Pruebas de Integración (API & Database)
*   **Control de Concurrencia**: Simular peticiones simultáneas (usando `asyncio` o `threading`) sobre la misma pista y hora para verificar que el bloqueo transaccional de PostgreSQL (`reservation_repo.get_conflicting_for_update`) impide el solapamiento de reservas.
*   **Flujo de Notificaciones**: Comprobar que al cancelar una reserva (UC-03), se genera correctamente el registro en la tabla `Notificacion` asociada al usuario.
*   **Gestión de JWT**: Validar que los endpoints protegidos rechazan tokens expirados o mal formados.

#### 3. Pruebas de Aceptación (E2E - Opcional)
*   **Flujo de Reserva Completo**: Un usuario entra a la web, selecciona una fecha futura, elige una pista disponible, confirma y verifica que aparece en "Mis Reservas".

### 📊 Formato de Registro de Incidencias (RA4)

| ID Prueba | Descripción | Resultado Esperado | Resultado Obtenido | Estado | Observaciones |
|-----------|-------------|-------------------|-------------------|--------|----------------|
| TU-01 | Cálculo precio 2h Tenis | Total = 20.00€ | 20.00€ | ✅ PASSED | - |
| TI-01 | Reserva concurrente Pista 1 (14:00) | Una reserva se crea, la otra falla (409) | Por determinar | ⏳ PENDIENTE | Requiere script de carga |
| TI-02 | Notificación al cancelar | Se inserta fila en `Notificaciones` | Por determinar | ⏳ PENDIENTE | - |
| TU-02 | Penalizar reserva "Pendiente" | Debe retornar 400 Bad Request | Por determinar | ⏳ PENDIENTE | - |
