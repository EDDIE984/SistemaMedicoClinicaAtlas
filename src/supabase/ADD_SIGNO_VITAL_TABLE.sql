-- ============================================
-- AGREGAR TABLA: SIGNO_VITAL
-- ============================================

CREATE TABLE IF NOT EXISTS signo_vital (
  id_signo_vital SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
  estatura_cm DECIMAL(5,2),
  peso_kg DECIMAL(5,2),
  imc DECIMAL(5,2),
  temperatura_c DECIMAL(4,2),
  presion_sistolica INTEGER,
  presion_diastolica INTEGER,
  frecuencia_cardiaca INTEGER,
  frecuencia_respiratoria INTEGER,
  saturacion_oxigeno INTEGER,
  glucosa_mg_dl INTEGER,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para mejorar las búsquedas por paciente
CREATE INDEX IF NOT EXISTS idx_signo_vital_paciente ON signo_vital(id_paciente);
CREATE INDEX IF NOT EXISTS idx_signo_vital_fecha ON signo_vital(fecha_registro);

-- Trigger para updated_at
CREATE TRIGGER update_signo_vital_updated_at 
BEFORE UPDATE ON signo_vital 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Comentario
COMMENT ON TABLE signo_vital IS 'Registro de signos vitales de pacientes';

-- Verificar que se creó correctamente
SELECT 'Tabla signo_vital creada exitosamente' as status;
