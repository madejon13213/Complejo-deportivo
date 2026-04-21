# 🚀 Issue: Implementar Frontend Completo con Sistema de Rutas, Autenticación e Iconos

## Descripción

Crear un frontend completamente funcional para la API del Complejo Deportivo que integre:
- Sistema de rutas protegidas con middleware
- Autenticación mediante JWT (AuthContext)
- Diseño visual consistente (estilos de `global.css`)
- Iconografía con Lucide React
- Componentes reutilizables y modulares
- Páginas existentes refactorizadas

---

## 📋 Requisitos Generales

### Estilos & Diseño
- **Paleta de colores** (global.css):
  - `--color-azul-pro`: #0052FF (Primario)
  - `--color-lima-neon`: #CCFF00(Acentos)
  - `--color-carbon`: #1A1A1B (Fondo oscuro)
  - `--color-nieve`: #F8F9FA (Fondo claro)
  - `--color-acero`: #E2E8F0 (Bordes/Dividers)
- **Tipografía**: 
  - Títulos: Variable `--font-titles` (uppercase, 900 weight, letter-spacing -0.03em)
  - Body: Variable `--font-body`
- **Responsive**: Mobile-first con Tailwind CSS
- **Componentes Premium**: Bordes redondeados, sombras sutiles, transiciones suaves

### Autenticación
- Usar `AuthContext` (`context/AuthContext.tsx`) para:
  - `login()`: Almacenar datos de usuario
  - `logout()`: Limpiar sesión
  - `checkAuth()`: Verificar estado de autenticación
  - Estados: `isAuthenticated`, `isAdmin`, `isCliente`, `isReady`
- Proteger rutas mediante middleware (`middleware.js`)
- Redirigir a `/auth` si no hay token válido
- Refrescar tokens automáticamente

### Rutas & Middleware
- **Rutas públicas** (sin autenticación):
  - `/` (Home)
  - `/auth` (Auth page unificada - login + register)
  - `/register`
  - `/login`

- **Rutas protegidas** (requieren autenticación):
  - `/dashboard` (Panel principal del usuario)
  - `/reservations` (Gestión de reservas)
  - `/reservations/create` (Crear nueva reserva)
  - `/reservations/my` (Mis reservas)
  - `/courts` (Listado de pistas)
  - `/courts/{id}` (Detalle de pista)
  - `/spaces` (Tipos de espacios)
  - `/profile` (Mi perfil)
  - `/penalties` (Mis penalizaciones)
  - `/getAllUsers` (Solo admin)

- **Actualizar middleware.js** con:
  ```javascript
  const ROLE_PERMISSIONS = {
    "/getAllUsers": ["administrador"],
    "/dashboard": ["cliente", "administrador"],
    "/reservations": ["cliente", "administrador"],
    "/courts": ["cliente", "administrador"],
    "/spaces": ["cliente", "administrador"],
    "/profile": ["cliente", "administrador"],
    "/penalties": ["cliente", "administrador"],
  };
  ```

### Iconografía (Lucide React)
Usar iconos en estos lugares:
- **Navegación**: `Menu`, `X`, `LogOut`, `User`, `BarChart3`
- **Reservas**: `Calendar`, `Clock`, `MapPin`, `CheckCircle`, `Trash2`
- **Pistas/Courts**: `Dumbbell`, `Trophy`, `Users`, `DollarSign`, `Star`
- **Usuario**: `User`, `LogOut`, `Settings`, `AlertTriangle`
- **Formularios**: `Mail`, `Lock`, `Phone`, `User`, `Eye`, `EyeOff`
- **Estados**: `CheckCircle2`, `XCircle`, `AlertCircle`, `Info`
- **Acciones**: `Plus`, `Edit`, `Trash2`, `Search`, `Filter`, `Download`

---

## 📄 Páginas a Crear/Refactorizar

### 1. `/auth` - Página Unificada de Autenticación
**Archivos**: 
- `app/auth/page.tsx`

**Features**:
- Tab switcher: "Iniciar Sesión" | "Registrarse"
- Formulario de Login:
  - Email (EmailInput con icono `Mail`)
  - Contraseña (PasswordInput con toggle `Eye`/`EyeOff`)
  - Botón "Entrar" con icono `ArrowRight`
  - Link "¿Sin cuenta?" → pestaña registro
  - Estado loading con spinner
- Formulario de Register:
  - Nombre, Apellido 1, Apellido 2
  - Email, Contraseña, Teléfono (opcional)
  - Checkbox "Aceptar términos"
  - Botón "Crear Cuenta" con icono `UserPlus`
  - Link "¿Ya tienes cuenta?" → pestaña login
- **Estilos**: Fondo carbon, cards en nieve, acentos lima-neon
- **Validación**: Mostrar errores en tiempo real
- Integrar con AuthContext

### 2. `/dashboard` - Panel Principal
**Archivos**:
- `app/dashboard/page.tsx`

**Features**:
- Bienvenida personalizada ("Hola, {nombre}")
- Cards con estadísticas:
  - Total reservas (icon: `Calendar`)
  - Proximas reservas (icon: `Clock`)
  - Penalizaciones activas (icon: `AlertTriangle`)
  - Tus favoritos (icon: `Star`)
- Quick actions:
  - "Hacer Reserva" → `/reservations/create`
  - "Mis Reservas" → `/reservations/my`
  - "Pistas Disponibles" → `/courts`
  - "Mi Perfil" → `/profile`
- Lista de próximas 3 reservas con tabla/cards
- Si es admin: Link a `/getAllUsers`
- **Responsive**: Grid 1-2-3 columnas

### 3. `/reservations` - Gestión de Reservas
**Archivos**:
- `app/reservations/page.tsx`
- `app/reservations/my/page.tsx` (Mis reservas)
- `app/reservations/create/page.tsx` (Crear reserva)

**3.1 - `/reservations` (Listado General)**:
- Tabla/Cards de todas las reservas
- Filtros: Por fecha, estado, pista
- Columnas: ID, Pista, Fecha, Hora, Usuario, Estado (badge), Acciones (Ver, Editar, Eliminar)
- Iconos: `Calendar`, `Clock`, `MapPin`, `Eye`, `Edit`, `Trash2`
- Paginación
- Acceso: Solo admin

**3.2 - `/reservations/my` (Mis Reservas)**:
- Mis reservas activas y pasadas
- Estados: Confirmada (verde), Cancelada (rojo), Completada (gris)
- Cards con:
  - Nombre pista (icon: `MapPin`)
  - Fecha y hora (icons: `Calendar`, `Clock`)
  - Estado (badge con icono)
  - Botones: "Editar", "Cancelar", "Ver detalles"
- Filtro: Activas | Pasadas | Todas
- Opción descargar historial (icon: `Download`)

**3.3 - `/reservations/create` (Crear Reserva)**:
- Formulario multi-step:
  - **Step 1**: Seleccionar pista (grid de cards con nombres, precios, capacidad)
  - **Step 2**: Seleccionar fecha y hora (date picker + time picker)
  - **Step 3**: Verificar disponibilidad y confirmar
  - **Step 4**: Resumen y pago (mock)
- Mostrar conflictos horarios en rojo
- Horarios disponibles en verde
- Botones: "Anterior", "Siguiente", "Confirmar Reserva"
- Toast de confirmación

### 4. `/courts` - Listado y Detalle de Pistas
**Archivos**:
- `app/courts/page.tsx`
- `app/courts/[id]/page.tsx` (Detalle)

**4.1 - `/courts` (Listado)**:
- Grid de cards por pista:
  - Imagen (placeholder con icono deportivo)
  - Nombre pista
  - Tipo espacio (badge)
  - Precio/hora (icon: `DollarSign`)
  - Capacidad (icon: `Users`)
  - Rating/Puntuación (icon: `Star`)
  - Botón "Ver detalle" → `/courts/{id}`
  - Botón "Reservar" → `/reservations/create?courtId={id}`
- Filtros:
  - Por tipo (dropdown)
  - Por precio (range slider)
  - Permite reserva parcial (checkbox)
  - Buscar por nombre
- Ordenar: Por precio, por rating, más reservadas
- Responsive: 1-2-3-4 columnas

**4.2 - `/courts/[id]` (Detalle)**:
- Galería de imágenes (carousel)
- Nombre, tipo, descripción
- Detalles técnicos:
  - Precio/hora (icon: `DollarSign`)
  - Precio parcial (si aplica)
  - Capacidad (icon: `Users`)
  - Servicios disponibles (checkmarks)
- Calendario de disponibilidad (próximos 7 días)
- Reviews/Opiniones (si existen)
- Botón "Hacer Reserva" → `/reservations/create?courtId={id}`
- Botón "Volver" (breadcrumb)

### 5. `/spaces` - Tipos de Espacios
**Archivos**:
- `app/spaces/page.tsx`

**Features**:
- Lista de tipos de espacios
- Cards con:
  - Icono temático (cancha, piscina, gym)
  - Nombre tipo
  - Descripción
  - Total pistas disponibles
  - Botón "Ver pistas" → filtra `/courts?spaceType={id}`
- Grid responsive
- Iconos variados por tipo

### 6. `/profile` - Mi Perfil
**Archivos**:
- `app/profile/page.tsx`

**Features**:
- Avatar del usuario (iniciales o foto)
- Datos personales:
  - Nombre, Apellidos (con edit inline)
  - Email (read-only)
  - Teléfono (con edit inline)
  - Rol (badge)
- Estadísticas:
  - Total reservas (icon: `Calendar`)
  - Reservas activas (icon: `Clock`)
  - Penalizaciones (icon: `AlertTriangle`)
  - Puntuación (icon: `Trophy`)
- Opciones:
  - Cambiar contraseña (modal form)
  - Descargar datos (mock)
  - Eliminar cuenta (confirmación)
- Botón "Cerrar Sesión" con icono `LogOut`

### 7. `/getAllUsers` - Admin: Gestión de Usuarios
**Archivos**:
- `app/getAllUsers/page.tsx`

**Features**:
- Tabla de usuarios:
  - ID, Nombre, Email, Teléfono, Rol, Acciones
  - Iconos: `User`, `Edit`, `Trash2`, `Eye`
- Filtros: Por rol, por estado (activo/inactivo)
- Buscar por nombre/email
- Paginación
- Botones:
  - Ver detalle usuario
  - Editar rol
  - Eliminar usuario (confirmación)
- Acceso: Solo admin (protegido por middleware)

### 8. Refactorizar Páginas Existentes

#### `/` (Home) - `app/page.tsx`
- ✅ Mantener estructura
- ✅ Actualizar botones con estilos global.css
- ✅ Añadir más iconos en features section:
  - `Zap` para velocidad
  - `Calendar` para reservas
  - `MapPin` para ubicación
  - `Trophy` para competencias
  - `Users` para comunidad
- ✅ Mejorar responsive
- ✅ Agregar testimonios con avatares

#### `/login` - `app/login/page.tsx`
- ✅ Refactorizar para usar la nueva `/auth` page
- ✅ Opcionalmente: Mantener como redirect a `/auth?tab=login`
- ✅ O eliminar y usar `/auth` como única página de login

#### `/register` - `app/register/page.tsx`
- ✅ Refactorizar para usar la nueva `/auth` page
- ✅ O eliminar y usar `/auth` como única página de registro

---

## 🧩 Componentes a Crear/Actualizar

### Nuevos Componentes
```
app/components/
├── Layout/
│   ├── Header.tsx (Navbar con auth state)
│   ├── Footer.tsx (Actualizar)
│   ├── Sidebar.tsx (Nav lateral para dashboard)
│   └── HeaderLinks.tsx (Actualizar)
├── Forms/
│   ├── LoginForm.tsx (Reutilizable)
│   ├── RegisterForm.tsx (Reutilizable)
│   └── ReservationForm.tsx
├── Cards/
│   ├── CourtCard.tsx
│   ├── ReservationCard.tsx
│   ├── StatCard.tsx (Para dashboard)
│   └── SpaceCard.tsx
├── Tables/
│   ├── ReservationsTable.tsx
│   ├── UsersTable.tsx (Admin)
│   └── PenaltiesTable.tsx
├── Modals/
│   ├── ConfirmDeleteModal.tsx
│   ├── ChangePasswordModal.tsx
│   └── ReservationDetailModal.tsx
├── UI/
│   ├── Badge.tsx (Estado, Rol)
│   ├── Button.tsx (Variants: primary, secondary, danger)
│   ├── Input.tsx (Text, Email, Password)
│   ├── Select.tsx
│   ├── DatePicker.tsx
│   ├── TimePicker.tsx
│   ├── Toast.tsx (Notificaciones)
│   ├── Spinner.tsx (Loading)
│   └── Breadcrumb.tsx
├── Filters/
│   ├── CourtFilters.tsx
│   ├── ReservationFilters.tsx
│   └── UserFilters.tsx
└── Pagination/
    └── Pagination.tsx
```

---

## 🔐 Seguridad & Middleware

### Actualizar `middleware.js`

```javascript
const ROLE_PERMISSIONS = {
  "/getAllUsers": ["administrador"],
  "/dashboard": ["cliente", "administrador"],
  "/reservations": ["cliente", "administrador"],
  "/reservations/create": ["cliente", "administrador"],
  "/reservations/my": ["cliente", "administrador"],
  "/courts": ["cliente", "administrador"],
  "/spaces": ["cliente", "administrador"],
  "/profile": ["cliente", "administrador"],
  "/penalties": ["cliente", "administrador"],
};

// Rutas públicas (sin autenticación)
const PUBLIC_ROUTES = ["/", "/auth", "/login", "/register"];

// Si no tiene token → redirigir a /auth
// Si token expirado → intentar refresh
// Si no tiene permisos → redirigir a /dashboard con error
// Si role no coincide → redirigir a /dashboard con error 403
```

---

## 🎨 Guía de Colores por Contexto

| Contexto | Color | Ejemplo |
|----------|-------|---------|
| Primario | `azul-pro` (#0052FF) | Botones principales, links, acentos |
| Éxito | Verde (Tailwind) | Estados "Confirmada", checkmarks |
| Advertencia | Amarillo (Tailwind) | Estados "Pendiente", "En espera" |
| Error | Rojo (Tailwind) | Estados "Cancelada", "Eliminada" |
| Acentos | `lima-neon` (#CCFF00) | Highlights, CTAs, badges especiales |
| Fondo | `carbon` (#1A1A1B) | Secciones oscuras, hero |
| Fondo Alt | `nieve` (#F8F9FA) | Cards, containers claros |
| Bordes | `acero` (#E2E8F0) | Separadores, dividers |

---

## 📱 Responsividad

- **Mobile** (< 640px): 1 columna, full width
- **Tablet** (640px - 1024px): 2 columnas
- **Desktop** (> 1024px): 3-4 columnas
- Menú mobile con hamburguesa en < 768px
- Sidebar collapsible en dashboard

---

## ✅ Checklist de Implementación

### Fase 1: Setup Base
- [ ] Crear estructura de carpetas `components/`
- [ ] Crear componentes UI base (Button, Input, Badge, etc.)
- [ ] Actualizar `Header.tsx` y `Footer.tsx`
- [ ] Crear `Sidebar.tsx` para dashboard

### Fase 2: Autenticación
- [ ] Refactorizar `/login` y `/register` → `/auth` unificada
- [ ] Implementar login form con validaciones
- [ ] Implementar register form con validaciones
- [ ] Integrar con AuthContext (login, logout)
- [ ] Actualizar middleware con ROLE_PERMISSIONS

### Fase 3: Dashboard & Rutas Protegidas
- [ ] Crear `/dashboard` con cards y quick actions
- [ ] Crear `/profile` con edición de datos
- [ ] Implementar protección de rutas en middleware
- [ ] Crear animaciones de loading y transiciones

### Fase 4: Reservas
- [ ] Crear `/reservations` (listado general - admin)
- [ ] Crear `/reservations/my` (mis reservas)
- [ ] Crear `/reservations/create` (formulario multi-step)
- [ ] Integrar con API: GET, POST, PUT, DELETE
- [ ] Mostrar conflictos horarios

### Fase 5: Pistas & Espacios
- [ ] Crear `/courts` (listado con filtros)
- [ ] Crear `/courts/[id]` (detalle)
- [ ] Crear `/spaces` (tipos de espacios)
- [ ] Implementar filtros y búsqueda
- [ ] Galería de imágenes en detalle

### Fase 6: Admin
- [ ] Crear `/getAllUsers` (tabla de usuarios)
- [ ] Implementar filtros y búsqueda
- [ ] Acciones: Ver, Editar, Eliminar

### Fase 7: Refinamiento
- [ ] Añadir toasts/notificaciones
- [ ] Optimizar imágenes
- [ ] Mejorar accessibility (ARIA labels)
- [ ] Testear en móvil
- [ ] Crear página 404 y 500

---

## 🔗 Integraciones API

### Endpoints a Consumir (Basados en api-contract.md)

| Recurso | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| Auth | POST | `/users/register` | Registrar usuario |
| Auth | POST | `/users/login` | Iniciar sesión |
| Auth | POST | `/users/logout` | Cerrar sesión |
| Auth | POST | `/users/refresh` | Refrescar token |
| User | GET | `/users/me` | Datos usuario actual |
| User | GET | `/users/getAll` | Listado usuarios (admin) |
| User | GET | `/users/{id}` | Datos usuario específico |
| User | DELETE | `/users/{id}` | Eliminar usuario |
| Courts | GET | `/courts/getAll` | Listado pistas |
| Courts | GET | `/courts/{id}` | Detalle pista |
| Courts | GET | `/courts/type/{id_tipo_espacio}` | Pistas por tipo |
| Courts | GET | `/courts/partial/{bool}` | Pistas por reserva parcial |
| Spaces | GET | `/spaces/getAll` | Tipos de espacios |
| Reservations | GET | `/reservations/getAll` | Todas reservas (admin) |
| Reservations | GET | `/reservations/active` | Reservas activas |
| Reservations | GET | `/reservations/{id}` | Detalle reserva |
| Reservations | GET | `/reservations/user/{id}` | Reservas usuario |
| Reservations | GET | `/reservations/space/{id}` | Reservas pista |
| Reservations | POST | `/reservations/create` | Crear reserva |
| Reservations | PUT | `/reservations/update/{id}` | Actualizar reserva |
| Reservations | DELETE | `/reservations/delete/{id}` | Eliminar reserva |
| Penalties | GET | `/penalties/getAll` | Todas penalizaciones (admin) |
| Penalties | GET | `/penalties/{id}` | Detalle penalización |
| Penalties | GET | `/penalties/user/{id}` | Penalizaciones usuario |
| Penalties | GET | `/penalties/reservation/{id}` | Penalización por reserva |

---

## 📚 Referencias

- **Documentación API**: Ver `docs/api-contract.md`
- **Colores**: Definidos en `global.css`
- **Iconos**: https://lucide.dev/
- **Validación**: Usar librerías como `zod` o `react-hook-form`
- **Estado Global**: AuthContext (ya existente)
- **Estilos**: Tailwind CSS (ya configurado)

---

## 🎯 Objetivos de Calidad

- ✅ Code: TypeScript strict, sin `any`, componentes funcionales
- ✅ Diseño: 100% consistente con paleta global.css
- ✅ UX: Feedback visual en todas las acciones (toasts, loading, validaciones)
- ✅ Performance: Lazy loading en listas, optimización de imágenes
- ✅ Accesibilidad: ARIA labels, navegación por teclado
- ✅ Responsividad: Mobile-first, testeado en múltiples pantallas
- ✅ Seguridad: Tokens JWT, protección de rutas, CSRF (si aplica)

---

**Prioridad**: Alta  
**Esfuerzo**: Considerable (múltiples componentes y páginas)  
**Dependencias**: API Backend (debe estar funcionando)
