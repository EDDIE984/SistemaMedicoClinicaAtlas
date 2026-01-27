-- =====================================================
-- SCRIPT COMPLETO DE MIGRACIÓN SUPABASE
-- Sistema MediControl - Todas las tablas
-- =====================================================

-- =====================================================
-- 1. TABLA: COMPAÑÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS compania (
  id_compania SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(50),
  direccion TEXT,
  telefono VARCHAR(50),
  correo VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA: SUCURSAL
-- =====================================================
CREATE TABLE IF NOT EXISTS sucursal (
  id_sucursal SERIAL PRIMARY KEY,
  id_compania INTEGER NOT NULL REFERENCES compania(id_compania) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: CONSULTORIO
-- =====================================================
CREATE TABLE IF NOT EXISTS consultorio (
  id_consultorio SERIAL PRIMARY KEY,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  tipo_usuario VARCHAR(50) CHECK (tipo_usuario IN ('medico', 'administrativo', 'asistente', 'otro')) DEFAULT 'otro',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA: USUARIO_SUCURSAL (Asignaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuario_sucursal (
  id_usuario_sucursal SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  especialidad VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_usuario, id_sucursal)
);

-- =====================================================
-- 6. TABLA: PRECIO_BASE
-- =====================================================
CREATE TABLE IF NOT EXISTS precio_base (
  id_precio_base SERIAL PRIMARY KEY,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA: PRECIO_USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS precio_usuario (
  id_precio_usuario SERIAL PRIMARY KEY,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA: ASIGNACION_CONSULTORIO (Horarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS asignacion_consultorio (
  id_asignacion_consultorio SERIAL PRIMARY KEY,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  id_consultorio INTEGER NOT NULL REFERENCES consultorio(id_consultorio) ON DELETE CASCADE,
  dia_semana VARCHAR(20) CHECK (dia_semana IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABLA: PACIENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS paciente (
  id_paciente VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE,
  cedula VARCHAR(50) UNIQUE,
  telefono VARCHAR(50),
  correo VARCHAR(255),
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABLA: SIGNOS_VITALES
-- =====================================================
CREATE TABLE IF NOT EXISTS signos_vitales (
  id_signos_vitales SERIAL PRIMARY KEY,
  id_paciente VARCHAR(50) NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  presion_arterial_sistolica INTEGER,
  presion_arterial_diastolica INTEGER,
  frecuencia_cardiaca INTEGER,
  temperatura DECIMAL(4, 2),
  frecuencia_respiratoria INTEGER,
  saturacion_oxigeno DECIMAL(5, 2),
  peso DECIMAL(6, 2),
  talla DECIMAL(5, 2),
  imc DECIMAL(5, 2),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABLA: ANTECEDENTES_MEDICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS antecedentes_medicos (
  id_antecedente SERIAL PRIMARY KEY,
  id_paciente VARCHAR(50) NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABLA: CITA
-- =====================================================
CREATE TABLE IF NOT EXISTS cita (
  id_cita SERIAL PRIMARY KEY,
  id_paciente VARCHAR(50) NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo TEXT,
  estado VARCHAR(50) CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')) DEFAULT 'programada',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABLA: PAGO
-- =====================================================
CREATE TABLE IF NOT EXISTS pago (
  id_pago SERIAL PRIMARY KEY,
  id_cita INTEGER REFERENCES cita(id_cita) ON DELETE SET NULL,
  id_paciente VARCHAR(50) NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  monto_total DECIMAL(10, 2) NOT NULL,
  monto_pagado DECIMAL(10, 2) DEFAULT 0,
  monto_pendiente DECIMAL(10, 2) DEFAULT 0,
  estado_pago VARCHAR(50) CHECK (estado_pago IN ('pendiente', 'pagado_parcial', 'pagado_completo', 'cancelado')) DEFAULT 'pendiente',
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. TABLA: DETALLE_PAGO (Formas de Pago)
-- =====================================================
CREATE TABLE IF NOT EXISTS detalle_pago (
  id_detalle_pago SERIAL PRIMARY KEY,
  id_pago INTEGER NOT NULL REFERENCES pago(id_pago) ON DELETE CASCADE,
  forma_pago VARCHAR(50) CHECK (forma_pago IN ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque', 'otro')) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  referencia VARCHAR(255),
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. TABLA: CARGO_ADICIONAL
-- =====================================================
CREATE TABLE IF NOT EXISTS cargo_adicional (
  id_cargo_adicional SERIAL PRIMARY KEY,
  id_pago INTEGER NOT NULL REFERENCES pago(id_pago) ON DELETE CASCADE,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. TABLA: DESCUENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS descuento (
  id_descuento SERIAL PRIMARY KEY,
  id_pago INTEGER NOT NULL REFERENCES pago(id_pago) ON DELETE CASCADE,
  descripcion VARCHAR(255) NOT NULL,
  tipo_descuento VARCHAR(20) CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo')) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 17. TABLA: CONVERSACION_CHATBOT
-- =====================================================
CREATE TABLE IF NOT EXISTS conversacion_chatbot (
  id_conversacion SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo_conversacion VARCHAR(50) CHECK (tipo_conversacion IN ('consulta_general', 'agendar_cita', 'consultar_paciente', 'reportes', 'ayuda_sistema', 'otro')) DEFAULT 'consulta_general',
  estado VARCHAR(50) CHECK (estado IN ('activa', 'cerrada', 'en_espera')) DEFAULT 'activa',
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadatos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 18. TABLA: MENSAJE_CHATBOT
-- =====================================================
CREATE TABLE IF NOT EXISTS mensaje_chatbot (
  id_mensaje SERIAL PRIMARY KEY,
  id_conversacion INTEGER NOT NULL REFERENCES conversacion_chatbot(id_conversacion) ON DELETE CASCADE,
  rol VARCHAR(20) CHECK (rol IN ('usuario', 'asistente', 'sistema')) NOT NULL,
  contenido TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadatos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_paciente_cedula ON paciente(cedula);
CREATE INDEX IF NOT EXISTS idx_paciente_nombre ON paciente(nombre, apellido);
CREATE INDEX IF NOT EXISTS idx_cita_fecha ON cita(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_paciente ON cita(id_paciente);
CREATE INDEX IF NOT EXISTS idx_cita_usuario ON cita(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pago_fecha ON pago(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pago_estado ON pago(estado_pago);
CREATE INDEX IF NOT EXISTS idx_conversacion_usuario ON conversacion_chatbot(id_usuario);
CREATE INDEX IF NOT EXISTS idx_mensaje_conversacion ON mensaje_chatbot(id_conversacion);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- =====================================================

-- Habilitar RLS en tablas sensibles (descomenta si lo necesitas)
-- ALTER TABLE paciente ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cita ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pago ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
-- CREATE POLICY "Todos pueden leer pacientes" ON paciente FOR SELECT USING (true);
-- CREATE POLICY "Solo autenticados pueden insertar pacientes" ON paciente FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar compañía de ejemplo
INSERT INTO compania (nombre, ruc, direccion, telefono, correo) VALUES
  ('Clínica San Rafael', '1234567890001', 'Av. Principal 123', '099-123-4567', 'info@sanrafael.com')
ON CONFLICT DO NOTHING;

-- Insertar sucursal de ejemplo
INSERT INTO sucursal (id_compania, nombre, direccion, telefono) VALUES
  (1, 'Sucursal Norte', 'Calle 10 y Av. Norte', '099-111-2222')
ON CONFLICT DO NOTHING;

-- Insertar usuario de ejemplo
INSERT INTO usuario (nombre, apellido, correo, telefono, tipo_usuario) VALUES
  ('Carlos', 'Pérez', 'carlos.perez@clinica.com', '099-333-4444', 'medico'),
  ('Ana', 'García', 'ana.garcia@clinica.com', '099-555-6666', 'administrativo')
ON CONFLICT (correo) DO NOTHING;

-- Insertar consultorio de ejemplo
INSERT INTO consultorio (id_sucursal, nombre, descripcion) VALUES
  (1, 'Consultorio 1', 'Consulta general'),
  (1, 'Consultorio 2', 'Pediatría')
ON CONFLICT DO NOTHING;

-- Insertar paciente de ejemplo
INSERT INTO paciente (id_paciente, nombre, apellido, cedula, telefono, fecha_nacimiento) VALUES
  ('PAC-001', 'Juan', 'Rodríguez', '0912345678', '099-777-8888', '1990-05-15')
ON CONFLICT (id_paciente) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Contar registros en cada tabla
SELECT 
  'compania' as tabla, COUNT(*) as registros FROM compania
UNION ALL
SELECT 'sucursal', COUNT(*) FROM sucursal
UNION ALL
SELECT 'consultorio', COUNT(*) FROM consultorio
UNION ALL
SELECT 'usuario', COUNT(*) FROM usuario
UNION ALL
SELECT 'paciente', COUNT(*) FROM paciente;

-- =====================================================
-- ¡SCRIPT COMPLETADO!
-- =====================================================
-- Todas las tablas han sido creadas exitosamente
-- =====================================================
