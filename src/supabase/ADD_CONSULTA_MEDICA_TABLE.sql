-- ============================================
-- AGREGAR TABLA: CONSULTA_MEDICA
-- Para guardar el historial clínico, receta y pedido de exámenes
-- ============================================

CREATE TABLE IF NOT EXISTS consulta_medica (
  id_consulta_medica SERIAL PRIMARY KEY,
  id_cita INTEGER NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
  fecha_consulta TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Contenido de la consulta
  historial_clinico TEXT,
  diagnostico TEXT,
  receta_medica TEXT,
  pedido_examenes TEXT,
  observaciones TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_consulta_medica_cita ON consulta_medica(id_cita);
CREATE INDEX IF NOT EXISTS idx_consulta_medica_paciente ON consulta_medica(id_paciente);
CREATE INDEX IF NOT EXISTS idx_consulta_medica_fecha ON consulta_medica(fecha_consulta);

-- ============================================
-- TRIGGER PARA UPDATED_AT
-- ============================================
CREATE TRIGGER update_consulta_medica_updated_at 
BEFORE UPDATE ON consulta_medica 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIO EN TABLA (Documentación)
-- ============================================
COMMENT ON TABLE consulta_medica IS 'Registro del historial clínico, recetas y pedidos de exámenes de cada consulta médica';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
  'Tabla consulta_medica creada exitosamente' as status,
  (SELECT COUNT(*) FROM consulta_medica) as total_consultas;
