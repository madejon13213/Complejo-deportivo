-- 1. ROL
CREATE TABLE IF NOT EXISTS rol (
    id SERIAL PRIMARY KEY,
    rol VARCHAR(50) NOT NULL
);

-- 2. USUARIO (id_rol debe existir en la tabla rol)
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pri_ape VARCHAR(100) NOT NULL,
    seg_ape VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    id_rol INTEGER NOT NULL REFERENCES rol(id)
);

-- 3. TIPO_ESPACIO
CREATE TABLE IF NOT EXISTS tipo_espacio (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL UNIQUE,
    permite_reserva_parcial BOOLEAN NOT NULL
);

-- 4. ESPACIO
CREATE TABLE IF NOT EXISTS espacio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio_hora DECIMAL(10, 2) NOT NULL CHECK (precio_hora > 0),
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    precio_hora_parcial DECIMAL(10, 2) CHECK (precio_hora_parcial > 0),
    id_tipo_espacio INTEGER NOT NULL REFERENCES tipo_espacio(id)
);

-- 5. RESERVA
CREATE TABLE IF NOT EXISTS reserva (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(50) NOT NULL,
    plazas_parciales INTEGER CHECK (plazas_parciales > 0),
    tipo_reserva VARCHAR(50) NOT NULL,
    id_user INTEGER NOT NULL REFERENCES usuario(id),
    id_espacio INTEGER NOT NULL REFERENCES espacio(id),
    CONSTRAINT chk_reserva_horas CHECK (hora_fin > hora_inicio)
);

-- 6. PENALIZACION
CREATE TABLE IF NOT EXISTS penalizacion (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo_penalizacion VARCHAR(100) NOT NULL,
    id_reserva INTEGER NOT NULL REFERENCES reserva(id),
    CONSTRAINT chk_penalizacion_fechas CHECK (fecha_fin >= fecha_inicio)
);

-- 1. ROLES (Aseguramos que existan)
INSERT INTO rol (id, rol) 
VALUES (1, 'Administrador'), (2, 'Cliente') 
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS (Admin y un Cliente de prueba)
-- La contraseña es la que me pasaste: $2b$12$Bvg1q/2nbsT3Qq9d2TEiP.FOg3PH6hRflYTriRtO9uInNTHILLAX2
INSERT INTO usuario (nombre, pri_ape, seg_ape, email, contraseña, telefono, id_rol) 
VALUES 
('Admin', 'Sistema', 'Principal', 'admin@ejemplo.com', '$2b$12$/RDWFcVoQzx4NA2I9Q/3Y.der0QDXT6.EZvgVkdQ6FVr07KIWTawC', '600111222', 1),
('Juan', 'Pérez', 'García', 'juan.perez@email.com', '$2b$12$/RDWFcVoQzx4NA2I9Q/3Y.der0QDXT6.EZvgVkdQ6FVr07KIWTawC', '600333444', 2)
ON CONFLICT (email) DO NOTHING;

-- 3. TIPOS DE ESPACIO
INSERT INTO tipo_espacio (tipo, permite_reserva_parcial) 
VALUES 
('Pista Deportiva', FALSE), 
('Gimnasio', TRUE) 
ON CONFLICT (tipo) DO NOTHING;

-- 4. ESPACIOS
INSERT INTO espacio (nombre, precio_hora, capacidad, precio_hora_parcial, id_tipo_espacio) 
VALUES 
('Pista de Pádel 1', 20.00, 4, NULL, 1),
('Gimnasio Principal', 10.00, 50, 3.00, 2),
('Campo de Fútbol 7', 60.00, 14, NULL, 1)
ON CONFLICT (nombre) DO NOTHING;

-- 5. RESERVAS (COMPLEJO DEPORTIVO)

-- Reserva 1: Juan reserva una pista de pádel completa
INSERT INTO reserva (fecha, hora_inicio, hora_fin, estado, plazas_parciales, tipo_reserva, id_user, id_espacio)
VALUES 
('2026-05-10', '10:00:00', '11:30:00', 'Confirmada', NULL, 'Completa', 2, 1),

-- Reserva 2: Juan reserva 3 plazas en el gimnasio (parcial)
('2026-05-12', '09:00:00', '11:00:00', 'Pendiente', 3, 'Parcial', 2, 2),

-- Reserva 3: Reserva pasada en pista de fútbol (para penalización)
('2026-03-01', '18:00:00', '20:00:00', 'Finalizada', NULL, 'Completa', 2, 3);


-- 6. PENALIZACIONES
-- Penalización por mal uso de la pista de fútbol
INSERT INTO penalizacion (fecha_inicio, fecha_fin, tipo_penalizacion, id_reserva)
VALUES 
('2026-03-02', '2026-03-09', 'Mal uso del campo de fútbol', 3);

-- 6. PENALIZACIONES
-- Penalizamos a Juan por la reserva 3 (por ejemplo, por dejar la sala en mal estado)
INSERT INTO penalizacion (fecha_inicio, fecha_fin, tipo_penalizacion, id_reserva)
VALUES 
('2026-03-02', '2026-03-09', 'Mal uso de instalaciones', 3);