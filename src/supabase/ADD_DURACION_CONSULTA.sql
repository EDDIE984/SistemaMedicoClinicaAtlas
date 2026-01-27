-- =====================================================
-- AGREGAR CAMPO DURACION_CONSULTA
-- A la tabla asignacion_consultorio
-- =====================================================

-- Paso 1: Agregar la columna duracion_consulta
ALTER TABLE asignacion_consultorio 
ADD COLUMN IF NOT EXISTS duracion_consulta INTEGER DEFAULT 30;

-- Paso 2: Agregar comentario descriptivo
COMMENT ON COLUMN asignacion_consultorio.duracion_consulta IS 'Duración de la consulta en minutos';

-- Paso 3: Agregar constraint para validar valores positivos
ALTER TABLE asignacion_consultorio 
ADD CONSTRAINT check_duracion_positiva 
CHECK (duracion_consulta > 0 AND duracion_consulta <= 480);

-- Paso 4: Actualizar registros existentes con valor por defecto (30 minutos)
UPDATE asignacion_consultorio 
SET duracion_consulta = 30 
WHERE duracion_consulta IS NULL;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'asignacion_consultorio' 
AND column_name = 'duracion_consulta';

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Columna: duracion_consulta
-- ✅ Tipo: INTEGER
-- ✅ Default: 30
-- ✅ Validación: Entre 1 y 480 minutos (8 horas)
-- =====================================================
