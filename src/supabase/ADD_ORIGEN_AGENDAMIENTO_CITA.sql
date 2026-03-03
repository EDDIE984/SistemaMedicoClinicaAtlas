-- =====================================================
-- NUEVO CAMPO: ORIGEN DE AGENDAMIENTO EN CITA
-- Objetivo:
-- 1) Guardar automáticamente 'SISTEMA' para citas creadas desde el sistema
-- 2) Permitir que chatbot actualice el valor a 'CHATBOT'
-- =====================================================

ALTER TABLE cita
ADD COLUMN IF NOT EXISTS origen_agendamiento VARCHAR(20);

-- Backfill para registros existentes
UPDATE cita
SET origen_agendamiento = 'SISTEMA'
WHERE origen_agendamiento IS NULL;

-- Default para nuevos registros
ALTER TABLE cita
ALTER COLUMN origen_agendamiento SET DEFAULT 'SISTEMA';

-- No nulo para garantizar trazabilidad
ALTER TABLE cita
ALTER COLUMN origen_agendamiento SET NOT NULL;

-- Validar valores permitidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cita_origen_agendamiento_check'
  ) THEN
    ALTER TABLE cita
    ADD CONSTRAINT cita_origen_agendamiento_check
    CHECK (origen_agendamiento IN ('SISTEMA', 'CHATBOT'));
  END IF;
END $$;

-- Índice opcional para reportes por origen
CREATE INDEX IF NOT EXISTS idx_cita_origen_agendamiento ON cita(origen_agendamiento);
