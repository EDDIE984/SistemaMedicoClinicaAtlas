-- ============================================================
-- 035: Tabla de alertas de signos vitales fuera de rango
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alerta_signo_vital (
  id_alerta        SERIAL PRIMARY KEY,
  id_signo_vital   INT NOT NULL REFERENCES public.signo_vital(id_signo_vital) ON DELETE CASCADE,
  campo            VARCHAR(50) NOT NULL,
  valor            NUMERIC(7,2),
  rango_min        NUMERIC(7,2),
  rango_max        NUMERIC(7,2),
  nivel            VARCHAR(20) NOT NULL CHECK (nivel IN ('advertencia', 'critico')),
  descripcion      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS (el proyecto no usa Supabase Auth nativo)
ALTER TABLE public.alerta_signo_vital DISABLE ROW LEVEL SECURITY;

-- Índice para búsquedas por signo vital
CREATE INDEX IF NOT EXISTS idx_alerta_signo_vital_id_signo
  ON public.alerta_signo_vital(id_signo_vital);

-- Comentarios descriptivos
COMMENT ON TABLE public.alerta_signo_vital IS
  'Alertas generadas automáticamente cuando un signo vital está fuera del rango clínico normal';
COMMENT ON COLUMN public.alerta_signo_vital.campo IS
  'Nombre del campo del signo vital (ej: temperatura_c, frecuencia_cardiaca)';
COMMENT ON COLUMN public.alerta_signo_vital.nivel IS
  'advertencia = fuera de rango leve; critico = fuera de rango peligroso';
