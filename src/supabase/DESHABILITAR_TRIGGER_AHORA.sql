-- ========================================================
-- DESHABILITAR TRIGGER QUE CAUSA EL ERROR
-- Ejecuta este script en Supabase SQL Editor
-- ========================================================

-- El trigger se llama: trigger_historial_estado_cita
-- El trigger inserta en historial_estado_cita con id_usuario_cambio NULL
-- Esto causa el error: null value in column "id_usuario_cambio" violates not-null constraint

-- ========================================================
-- SOLUCIÓN: Deshabilitar el trigger
-- ========================================================

-- Opción 1: Deshabilitar el trigger (se puede re-habilitar después)
ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;

-- ========================================================
-- Verificar que el trigger está deshabilitado
-- ========================================================

SELECT 
  t.tgname as trigger_name,
  CASE 
    WHEN t.tgenabled = 'D' THEN '✅ DESHABILITADO (Correcto)'
    WHEN t.tgenabled = 'O' THEN '❌ HABILITADO (Problema)'
    ELSE 'Estado desconocido'
  END as estado,
  t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- Si tgenabled = 'D', el trigger está DESHABILITADO (correcto)
-- Si tgenabled = 'O', el trigger está HABILITADO (problema)

-- ========================================================
-- NOTA IMPORTANTE:
-- Después de deshabilitar el trigger, el código TypeScript
-- manejará todas las inserciones en historial_estado_cita
-- con el id_usuario_cambio correcto.
-- ========================================================

-- ========================================================
-- Opción 2 (OPCIONAL): Eliminar completamente el trigger
-- Solo descomenta estas líneas si quieres eliminarlo permanentemente
-- ========================================================

-- DROP TRIGGER IF EXISTS trigger_historial_estado_cita ON cita;
-- DROP FUNCTION IF EXISTS registrar_cambio_estado_cita();

-- ========================================================
-- ¿Qué hace este script?
-- ========================================================
-- 1. Deshabilita el trigger automático que causa el error
-- 2. Verifica que el trigger está deshabilitado
-- 3. Tu código TypeScript ahora manejará el historial manualmente
-- 4. NO más errores de id_usuario_cambio null
-- ========================================================
