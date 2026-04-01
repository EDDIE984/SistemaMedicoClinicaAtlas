-- ============================================================
-- Agregar campos: fecha_seguimiento y pedido_hospitalizacion
-- a la tabla consulta_medica
-- ============================================================

ALTER TABLE public.consulta_medica
  ADD COLUMN IF NOT EXISTS fecha_seguimiento DATE,
  ADD COLUMN IF NOT EXISTS pedido_hospitalizacion TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN public.consulta_medica.fecha_seguimiento IS 'Fecha de próxima consulta / seguimiento recomendado por el médico';
COMMENT ON COLUMN public.consulta_medica.pedido_hospitalizacion IS 'Descripción del pedido de hospitalización si aplica, NULL si no se requiere';
