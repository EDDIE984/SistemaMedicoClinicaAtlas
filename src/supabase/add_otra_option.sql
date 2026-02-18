-- ============================================
-- ACTUALIZAR RESTRICCIÓN DE SEXO
-- Permite el valor 'Otro' además de 'M', 'F'
-- ============================================

-- 1. Eliminar la restricción existente
ALTER TABLE paciente DROP CONSTRAINT IF EXISTS paciente_sexo_check;

-- 2. Agregar la nueva restricción que incluye solo 'Otro'
ALTER TABLE paciente ADD CONSTRAINT paciente_sexo_check CHECK (sexo IN ('M', 'F', 'Otro'));

-- Comentario de verificación
COMMENT ON COLUMN paciente.sexo IS 'Sexo del paciente: M (Masculino), F (Femenino), Otro (Otro)';
