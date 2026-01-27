-- ============================================
-- AGREGAR TABLAS FALTANTES PARA EL MÓDULO DE PACIENTES
-- ============================================

-- ============================================
-- TABLA: SIGNO_VITAL
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

-- ============================================
-- TABLA: ANTECEDENTE
-- ============================================
CREATE TABLE IF NOT EXISTS antecedente (
  id_antecedente SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_diagnostico DATE,
  tratamiento TEXT,
  observaciones TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: ARCHIVO_MEDICO
-- ============================================
CREATE TABLE IF NOT EXISTS archivo_medico (
  id_archivo SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(100) NOT NULL,
  url_archivo TEXT NOT NULL,
  tamanio_kb INTEGER,
  descripcion TEXT,
  fecha_carga TIMESTAMP NOT NULL DEFAULT NOW(),
  subido_por INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Signos vitales
CREATE INDEX IF NOT EXISTS idx_signo_vital_paciente ON signo_vital(id_paciente);
CREATE INDEX IF NOT EXISTS idx_signo_vital_fecha ON signo_vital(fecha_registro);

-- Antecedentes
CREATE INDEX IF NOT EXISTS idx_antecedente_paciente ON antecedente(id_paciente);
CREATE INDEX IF NOT EXISTS idx_antecedente_categoria ON antecedente(categoria);
CREATE INDEX IF NOT EXISTS idx_antecedente_estado ON antecedente(estado);

-- Archivos médicos
CREATE INDEX IF NOT EXISTS idx_archivo_medico_paciente ON archivo_medico(id_paciente);
CREATE INDEX IF NOT EXISTS idx_archivo_medico_fecha ON archivo_medico(fecha_carga);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_signo_vital_updated_at 
BEFORE UPDATE ON signo_vital 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_antecedente_updated_at 
BEFORE UPDATE ON antecedente 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archivo_medico_updated_at 
BEFORE UPDATE ON archivo_medico 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================

COMMENT ON TABLE signo_vital IS 'Registro de signos vitales de pacientes';
COMMENT ON TABLE antecedente IS 'Antecedentes médicos de pacientes';
COMMENT ON TABLE archivo_medico IS 'Archivos médicos (laboratorios, imágenes, etc.) de pacientes';

-- ============================================
-- DATOS DE PRUEBA (Opcional)
-- ============================================

-- Insertar signos vitales de prueba si hay pacientes
DO $$
DECLARE
  paciente_id INTEGER;
BEGIN
  -- Obtener un paciente de prueba
  SELECT id_paciente INTO paciente_id FROM paciente LIMIT 1;
  
  IF paciente_id IS NOT NULL THEN
    -- Insertar signo vital de ejemplo
    INSERT INTO signo_vital (
      id_paciente, 
      fecha_registro, 
      estatura_cm, 
      peso_kg, 
      imc,
      temperatura_c,
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      saturacion_oxigeno,
      notas
    ) VALUES (
      paciente_id,
      NOW(),
      170.5,
      75.0,
      25.8,
      36.5,
      120,
      80,
      72,
      16,
      98,
      'Signos vitales normales'
    ) ON CONFLICT DO NOTHING;
    
    -- Insertar antecedente de ejemplo
    INSERT INTO antecedente (
      id_paciente,
      categoria,
      tipo,
      descripcion,
      fecha_diagnostico,
      tratamiento,
      estado
    ) VALUES (
      paciente_id,
      'Médicos Personales',
      'Hipertensión',
      'Hipertensión arterial controlada',
      '2020-01-15',
      'Enalapril 10mg/día',
      'activo'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Datos de prueba insertados para paciente ID: %', paciente_id;
  ELSE
    RAISE NOTICE 'No hay pacientes en la base de datos. Crea un paciente primero.';
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
  'Tablas creadas exitosamente' as status,
  (SELECT COUNT(*) FROM signo_vital) as signos_vitales,
  (SELECT COUNT(*) FROM antecedente) as antecedentes,
  (SELECT COUNT(*) FROM archivo_medico) as archivos;
