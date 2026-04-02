-- ============================================================
-- 037: Agregar columna diagnostico_ia a consulta_medica
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.consulta_medica
  ADD COLUMN IF NOT EXISTS diagnostico_ia TEXT;
