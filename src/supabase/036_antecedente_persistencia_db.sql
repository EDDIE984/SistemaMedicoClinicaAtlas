-- 036_antecedente_persistencia_db.sql
-- Asegura soporte operativo para persistencia de antecedentes desde la aplicacion.

-- El proyecto usa auth personalizada, por convención RLS debe estar deshabilitado.
ALTER TABLE IF EXISTS public.antecedente DISABLE ROW LEVEL SECURITY;

-- Optimiza lectura/escritura por paciente + seccion (categoria).
CREATE INDEX IF NOT EXISTS idx_antecedente_paciente_categoria_estado
ON public.antecedente (id_paciente, categoria, estado);

-- Documentacion de convencion de guardado en app:
-- categoria: nombre de la seccion (ej. antecedentesPatologicos)
-- tipo: 'json'
-- descripcion: JSON serializado del contenido de la seccion
COMMENT ON COLUMN public.antecedente.categoria IS 'Seccion funcional de antecedentes en frontend';
COMMENT ON COLUMN public.antecedente.tipo IS 'Formato de payload. Para UI actual: json';
COMMENT ON COLUMN public.antecedente.descripcion IS 'Contenido serializado JSON de la seccion';
