-- ============================================
-- MIGRACIÓN COMPLETA A SUPABASE
-- Sistema de Control de Citas Médicas
-- 13 Tablas + Triggers + RLS
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA 1: COMPANIA
-- ============================================
CREATE TABLE compania (
  id_compania SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 2: SUCURSAL
-- ============================================
CREATE TABLE sucursal (
  id_sucursal SERIAL PRIMARY KEY,
  id_compania INTEGER NOT NULL REFERENCES compania(id_compania) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 3: USUARIO
-- ============================================
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('medico', 'administrativo', 'enfermera')),
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 4: USUARIO_SUCURSAL
-- ============================================
CREATE TABLE usuario_sucursal (
  id_usuario_sucursal SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  especialidad VARCHAR(100),
  cargo VARCHAR(100),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_usuario, id_sucursal)
);

-- ============================================
-- TABLA 5: HORARIO_USUARIO_SUCURSAL
-- ============================================
CREATE TABLE horario_usuario_sucursal (
  id_horario SERIAL PRIMARY KEY,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 6: PRECIO_BASE_ESPECIALIDAD
-- ============================================
CREATE TABLE precio_base_especialidad (
  id_precio_base SERIAL PRIMARY KEY,
  id_compania INTEGER NOT NULL REFERENCES compania(id_compania) ON DELETE CASCADE,
  especialidad VARCHAR(100) NOT NULL,
  precio_consulta DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_control DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_emergencia DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 7: PRECIO_USUARIO_SUCURSAL
-- ============================================
CREATE TABLE precio_usuario_sucursal (
  id_precio SERIAL PRIMARY KEY,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  precio_consulta DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_control DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_emergencia DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo_ajuste VARCHAR(50) NOT NULL DEFAULT 'ninguno' CHECK (tipo_ajuste IN ('ninguno', 'porcentaje', 'monto_fijo')),
  valor_ajuste DECIMAL(10,2) DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_usuario_sucursal)
);

-- ============================================
-- TABLA 8: PACIENTE
-- ============================================
CREATE TABLE paciente (
  id_paciente SERIAL PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  edad INTEGER,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('M', 'F', 'Otro')),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 9: CONSULTORIO
-- ============================================
CREATE TABLE consultorio (
  id_consultorio SERIAL PRIMARY KEY,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  piso VARCHAR(20),
  numero VARCHAR(20),
  capacidad INTEGER DEFAULT 1,
  equipamiento TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 10: ASIGNACION_CONSULTORIO
-- ============================================
CREATE TABLE asignacion_consultorio (
  id_asignacion SERIAL PRIMARY KEY,
  id_consultorio INTEGER NOT NULL REFERENCES consultorio(id_consultorio) ON DELETE CASCADE,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 11: CITA
-- ============================================
CREATE TABLE cita (
  id_cita SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE RESTRICT,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE RESTRICT,
  id_sucursal INTEGER NOT NULL REFERENCES sucursal(id_sucursal) ON DELETE RESTRICT,
  id_consultorio INTEGER REFERENCES consultorio(id_consultorio) ON DELETE SET NULL,
  fecha_cita DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_minutos INTEGER NOT NULL DEFAULT 30,
  tipo_cita VARCHAR(50) NOT NULL CHECK (tipo_cita IN ('consulta', 'control', 'emergencia', 'primera_vez')),
  motivo_consulta TEXT,
  estado_cita VARCHAR(50) NOT NULL DEFAULT 'agendada' CHECK (estado_cita IN ('agendada', 'confirmada', 'en_atencion', 'atendida', 'cancelada', 'no_asistio')),
  precio_cita DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pago VARCHAR(50) CHECK (forma_pago IN ('efectivo', 'tarjeta', 'transferencia', 'seguro')),
  estado_pago VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'parcial')),
  notas_cita TEXT,
  cancelada_por INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  motivo_cancelacion TEXT,
  recordatorio_enviado BOOLEAN DEFAULT FALSE,
  confirmacion_paciente BOOLEAN DEFAULT FALSE,
  consulta_realizada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 12: DISPONIBILIDAD_EXCEPCIONAL
-- ============================================
CREATE TABLE disponibilidad_excepcional (
  id_disponibilidad SERIAL PRIMARY KEY,
  id_usuario_sucursal INTEGER NOT NULL REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('bloqueo', 'disponible', 'vacaciones', 'conferencia')),
  motivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 13: HISTORIAL_ESTADO_CITA
-- ============================================
CREATE TABLE historial_estado_cita (
  id_historial SERIAL PRIMARY KEY,
  id_cita INTEGER NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
  estado_anterior VARCHAR(50) NOT NULL,
  estado_nuevo VARCHAR(50) NOT NULL,
  id_usuario_cambio INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
  fecha_cambio TIMESTAMP NOT NULL DEFAULT NOW(),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 14: CONVERSACION_CHATBOT
-- ============================================
CREATE TABLE conversacion_chatbot (
  id_conversacion SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  id_cita INTEGER REFERENCES cita(id_cita) ON DELETE SET NULL,
  fecha_conversacion DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('agendamiento', 'consulta_info', 'reagendamiento', 'cancelacion')),
  estado VARCHAR(50) NOT NULL DEFAULT 'completado' CHECK (estado IN ('completado', 'pendiente', 'cancelado')),
  mensajes JSONB NOT NULL DEFAULT '[]',
  resultado JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices en tablas principales
CREATE INDEX idx_sucursal_compania ON sucursal(id_compania);
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_cedula ON usuario(cedula);
CREATE INDEX idx_usuario_sucursal_usuario ON usuario_sucursal(id_usuario);
CREATE INDEX idx_usuario_sucursal_sucursal ON usuario_sucursal(id_sucursal);
CREATE INDEX idx_paciente_cedula ON paciente(cedula);
CREATE INDEX idx_paciente_email ON paciente(email);

-- Índices en citas (muy importante para performance)
CREATE INDEX idx_cita_paciente ON cita(id_paciente);
CREATE INDEX idx_cita_usuario_sucursal ON cita(id_usuario_sucursal);
CREATE INDEX idx_cita_fecha ON cita(fecha_cita);
CREATE INDEX idx_cita_estado ON cita(estado_cita);
CREATE INDEX idx_cita_fecha_estado ON cita(fecha_cita, estado_cita);

-- Índices en consultorios
CREATE INDEX idx_consultorio_sucursal ON consultorio(id_sucursal);
CREATE INDEX idx_asignacion_consultorio ON asignacion_consultorio(id_consultorio);
CREATE INDEX idx_asignacion_usuario_sucursal ON asignacion_consultorio(id_usuario_sucursal);

-- Índices en conversaciones chatbot
CREATE INDEX idx_conversacion_paciente ON conversacion_chatbot(id_paciente);
CREATE INDEX idx_conversacion_fecha ON conversacion_chatbot(fecha_conversacion);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_compania_updated_at BEFORE UPDATE ON compania FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sucursal_updated_at BEFORE UPDATE ON sucursal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuario_sucursal_updated_at BEFORE UPDATE ON usuario_sucursal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_horario_updated_at BEFORE UPDATE ON horario_usuario_sucursal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_precio_base_updated_at BEFORE UPDATE ON precio_base_especialidad FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_precio_usuario_updated_at BEFORE UPDATE ON precio_usuario_sucursal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_paciente_updated_at BEFORE UPDATE ON paciente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultorio_updated_at BEFORE UPDATE ON consultorio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asignacion_updated_at BEFORE UPDATE ON asignacion_consultorio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cita_updated_at BEFORE UPDATE ON cita FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disponibilidad_updated_at BEFORE UPDATE ON disponibilidad_excepcional FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversacion_updated_at BEFORE UPDATE ON conversacion_chatbot FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER PARA CALCULAR EDAD AUTOMÁTICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION calcular_edad()
RETURNS TRIGGER AS $$
BEGIN
  NEW.edad = EXTRACT(YEAR FROM AGE(NEW.fecha_nacimiento));
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_edad 
BEFORE INSERT OR UPDATE ON paciente 
FOR EACH ROW EXECUTE FUNCTION calcular_edad();

-- ============================================
-- TRIGGER PARA HISTORIAL DE CAMBIOS DE CITA
-- ============================================

CREATE OR REPLACE FUNCTION registrar_cambio_estado_cita()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado_cita != NEW.estado_cita THEN
    INSERT INTO historial_estado_cita (
      id_cita, 
      estado_anterior, 
      estado_nuevo, 
      id_usuario_cambio,
      observaciones
    ) VALUES (
      NEW.id_cita,
      OLD.estado_cita,
      NEW.estado_cita,
      NEW.cancelada_por, -- Ajustar según necesidad
      'Cambio automático de estado'
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_historial_estado_cita
AFTER UPDATE ON cita
FOR EACH ROW
WHEN (OLD.estado_cita IS DISTINCT FROM NEW.estado_cita)
EXECUTE FUNCTION registrar_cambio_estado_cita();

-- ============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================

COMMENT ON TABLE compania IS 'Empresas u hospitales del sistema';
COMMENT ON TABLE sucursal IS 'Sucursales de cada compañía';
COMMENT ON TABLE usuario IS 'Usuarios del sistema (médicos, administrativos)';
COMMENT ON TABLE usuario_sucursal IS 'Asignación de usuarios a sucursales';
COMMENT ON TABLE horario_usuario_sucursal IS 'Horarios de atención por usuario';
COMMENT ON TABLE precio_base_especialidad IS 'Precios base por especialidad';
COMMENT ON TABLE precio_usuario_sucursal IS 'Precios personalizados por médico';
COMMENT ON TABLE paciente IS 'Pacientes del sistema';
COMMENT ON TABLE consultorio IS 'Consultorios disponibles';
COMMENT ON TABLE asignacion_consultorio IS 'Asignación de consultorios a médicos';
COMMENT ON TABLE cita IS 'Citas médicas agendadas';
COMMENT ON TABLE disponibilidad_excepcional IS 'Bloqueos y excepciones de horario';
COMMENT ON TABLE historial_estado_cita IS 'Historial de cambios de estado de citas';
COMMENT ON TABLE conversacion_chatbot IS 'Conversaciones del chatbot con pacientes';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================

-- Verificar que todo se creó correctamente
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
