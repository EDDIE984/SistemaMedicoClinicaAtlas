-- ========================================================
-- DIAGNÓSTICO RÁPIDO
-- Ejecuta este script para ver el estado completo del sistema
-- ========================================================

-- 🔍 1. ESTADO DEL TRIGGER
-- ========================================================
SELECT 
  '🔍 ESTADO DEL TRIGGER' as seccion,
  t.tgname as trigger,
  CASE 
    WHEN t.tgenabled = 'O' THEN '❌ HABILITADO (Causará errores)'
    WHEN t.tgenabled = 'D' THEN '✅ DESHABILITADO (Correcto)'
    ELSE '⚠️ Estado: ' || t.tgenabled
  END as estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname LIKE '%historial_estado%';

-- 📊 2. ESTRUCTURA DE LA TABLA historial_estado_cita
-- ========================================================
SELECT 
  '📊 ESTRUCTURA DE TABLA' as seccion,
  column_name as columna,
  data_type as tipo,
  CASE 
    WHEN is_nullable = 'NO' THEN '❌ NOT NULL'
    ELSE '✅ NULL permitido'
  END as restriccion
FROM information_schema.columns
WHERE table_name = 'historial_estado_cita'
ORDER BY ordinal_position;

-- 📝 3. ÚLTIMOS REGISTROS DEL HISTORIAL
-- ========================================================
SELECT 
  '📝 ÚLTIMOS CAMBIOS' as seccion,
  h.id_historial,
  c.id_cita,
  p.nombres || ' ' || p.apellidos AS paciente,
  h.estado_anterior || ' → ' || h.estado_nuevo as cambio,
  CASE 
    WHEN h.id_usuario_cambio IS NULL THEN '❌ NULL'
    ELSE '✅ OK'
  END as usuario_status,
  h.fecha_cambio
FROM historial_estado_cita h
JOIN cita c ON c.id_cita = h.id_cita
JOIN paciente p ON p.id_paciente = c.id_paciente
ORDER BY h.fecha_cambio DESC
LIMIT 5;

-- 📈 4. RESUMEN ESTADÍSTICO
-- ========================================================
SELECT 
  '📈 ESTADÍSTICAS' as seccion,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN id_usuario_cambio IS NULL THEN 1 END) as registros_con_null,
  COUNT(CASE WHEN id_usuario_cambio IS NOT NULL THEN 1 END) as registros_correctos,
  ROUND(
    100.0 * COUNT(CASE WHEN id_usuario_cambio IS NOT NULL THEN 1 END) / COUNT(*),
    2
  ) as porcentaje_correctos
FROM historial_estado_cita;

-- 🎯 5. DIAGNÓSTICO AUTOMÁTICO
-- ========================================================
SELECT 
  '🎯 DIAGNÓSTICO' as seccion,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE c.relname = 'cita'
        AND t.tgname = 'trigger_historial_estado_cita'
        AND t.tgenabled = 'D'
    ) THEN '✅ Sistema funcionando correctamente'
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE c.relname = 'cita'
        AND t.tgname = 'trigger_historial_estado_cita'
        AND t.tgenabled = 'O'
    ) THEN '❌ ACCIÓN REQUERIDA: Ejecutar EJECUTAR_PASO_A_PASO.sql'
    ELSE '⚠️ Trigger no encontrado'
  END as resultado;

-- ========================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- ========================================================
-- ✅ Si el trigger está DESHABILITADO (D) → Todo correcto
-- ❌ Si el trigger está HABILITADO (O) → Ejecuta EJECUTAR_PASO_A_PASO.sql
-- ⚠️ Si hay registros con NULL → Son datos antiguos, puedes limpiarlos
-- ========================================================
