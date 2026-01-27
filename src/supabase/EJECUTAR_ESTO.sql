-- ========================================================
-- ⚡ SCRIPT RÁPIDO - COPIAR Y PEGAR EN SUPABASE
-- ========================================================
-- Este script deshabilita el trigger que causa el error:
-- "null value in column id_usuario_cambio violates not-null constraint"
-- ========================================================

-- 🔍 PASO 1: Ver el problema actual
SELECT 
  '🔍 DIAGNÓSTICO INICIAL' as paso,
  t.tgname as trigger,
  CASE 
    WHEN t.tgenabled = 'O' THEN '❌ HABILITADO (Causando errores)'
    WHEN t.tgenabled = 'D' THEN '✅ DESHABILITADO (Ya está correcto)'
  END as estado_actual
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- ========================================================

-- ⚡ PASO 2: DESHABILITAR EL TRIGGER (Ejecuta esta línea)
ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;

-- ========================================================

-- ✅ PASO 3: Verificar que funcionó
SELECT 
  '✅ VERIFICACIÓN' as paso,
  t.tgname as trigger,
  CASE 
    WHEN t.tgenabled = 'D' THEN '✅✅✅ TRIGGER DESHABILITADO - PROBLEMA RESUELTO ✅✅✅'
    ELSE '❌ Algo salió mal, revisar estado: ' || t.tgenabled
  END as resultado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- ========================================================
-- 🎉 ¡LISTO!
-- ========================================================
-- Una vez que veas "✅✅✅ TRIGGER DESHABILITADO", 
-- ya puedes marcar citas como completadas sin errores.
--
-- El código TypeScript en /lib/citasService.ts ahora
-- maneja correctamente el historial con id_usuario_cambio.
-- ========================================================
