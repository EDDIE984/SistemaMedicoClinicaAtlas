-- =====================================================
-- AGREGAR CAMPO DURACION_CONSULTA (Versión Segura)
-- Maneja si ya existe parcialmente
-- =====================================================

-- Paso 1: Agregar la columna duracion_consulta (si no existe)
ALTER TABLE asignacion_consultorio 
ADD COLUMN IF NOT EXISTS duracion_consulta INTEGER DEFAULT 30;

-- Paso 2: Agregar comentario descriptivo
COMMENT ON COLUMN asignacion_consultorio.duracion_consulta IS 'Duración de la consulta en minutos';

-- Paso 3: Eliminar constraint anterior si existe y recrearlo
ALTER TABLE asignacion_consultorio 
DROP CONSTRAINT IF EXISTS check_duracion_positiva;

ALTER TABLE asignacion_consultorio 
ADD CONSTRAINT check_duracion_positiva 
CHECK (duracion_consulta > 0 AND duracion_consulta <= 480);

-- Paso 4: Actualizar registros existentes con valor por defecto (30 minutos)
UPDATE asignacion_consultorio 
SET duracion_consulta = 30 
WHERE duracion_consulta IS NULL;

-- Paso 5: Hacer el campo NOT NULL (opcional, pero recomendado)
ALTER TABLE asignacion_consultorio 
ALTER COLUMN duracion_consulta SET NOT NULL;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Ver estructura de la columna
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'asignacion_consultorio' 
AND column_name = 'duracion_consulta';

-- Ver constraints aplicados
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'asignacion_consultorio'::regclass
AND conname = 'check_duracion_positiva';

-- Ver algunos registros de prueba
SELECT 
    id_asignacion,
    dia_semana,
    hora_inicio,
    hora_fin,
    duracion_consulta,
    estado
FROM asignacion_consultorio
LIMIT 5;
