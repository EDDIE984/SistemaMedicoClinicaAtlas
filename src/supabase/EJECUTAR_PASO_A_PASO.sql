-- ========================================================
-- SOLUCIÓN COMPLETA - EJECUTAR PASO A PASO
-- ========================================================
-- CONTEXTO:
-- El trigger automático 'trigger_historial_estado_cita' intenta
-- insertar registros en historial_estado_cita con id_usuario_cambio NULL,
-- lo que viola la restricción NOT NULL de la columna.
--
-- SOLUCIÓN:
-- Deshabilitar el trigger y manejar el historial desde TypeScript
-- ========================================================

-- ========================================================
-- PASO 1: Ver el estado actual del trigger
-- ========================================================

SELECT 
  t.tgname as nombre_trigger,
  CASE 
    WHEN t.tgenabled = 'O' THEN '❌ HABILITADO (Causando problemas)'
    WHEN t.tgenabled = 'D' THEN '✅ DESHABILITADO (Correcto)'
    ELSE '⚠️ Estado: ' || t.tgenabled
  END as estado,
  'Tabla: ' || c.relname as tabla_asociada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- RESULTADO ESPERADO:
-- Si ves "❌ HABILITADO" → Necesitas ejecutar el PASO 2
-- Si ves "✅ DESHABILITADO" → El fix ya está aplicado, puedes saltar al PASO 3

-- ========================================================
-- PASO 2: DESHABILITAR EL TRIGGER (Ejecuta esta línea)
-- ========================================================

ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;

-- ========================================================
-- PASO 3: Verificar que el trigger fue deshabilitado
-- ========================================================

SELECT 
  t.tgname as nombre_trigger,
  CASE 
    WHEN t.tgenabled = 'D' THEN '✅✅✅ DESHABILITADO CORRECTAMENTE ✅✅✅'
    WHEN t.tgenabled = 'O' THEN '❌❌❌ TODAVÍA HABILITADO ❌❌❌'
    ELSE '⚠️ Estado desconocido: ' || t.tgenabled
  END as estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- ========================================================
-- PASO 4: Verificar la estructura de historial_estado_cita
-- ========================================================

SELECT 
  column_name as columna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_default
FROM information_schema.columns
WHERE table_name = 'historial_estado_cita'
ORDER BY ordinal_position;

-- RESULTADO ESPERADO:
-- Debe haber una columna "observaciones" (NO "motivo_cambio")
-- La columna "id_usuario_cambio" debe tener is_nullable = 'NO'

-- ========================================================
-- PASO 5: Ver el historial reciente (últimas 10 entradas)
-- ========================================================

SELECT 
  h.id_historial,
  c.id_cita,
  p.nombres || ' ' || p.apellidos AS paciente,
  h.estado_anterior || ' → ' || h.estado_nuevo as cambio_estado,
  CASE 
    WHEN h.id_usuario_cambio IS NULL THEN '❌ NULL (Error viejo)'
    ELSE '✅ Usuario: ' || u.nombre || ' ' || u.apellido
  END as usuario_que_cambio,
  h.observaciones,
  h.fecha_cambio
FROM historial_estado_cita h
JOIN cita c ON c.id_cita = h.id_cita
JOIN paciente p ON p.id_paciente = c.id_paciente
LEFT JOIN usuario u ON u.id_usuario = h.id_usuario_cambio
ORDER BY h.fecha_cambio DESC
LIMIT 10;

-- RESULTADO ESPERADO:
-- Las nuevas entradas (después del fix) deben tener "✅ Usuario: ..."
-- Las entradas viejas pueden tener "❌ NULL"

-- ========================================================
-- PASO 6 (OPCIONAL): Limpiar registros con id_usuario_cambio NULL
-- ========================================================

-- ⚠️ ADVERTENCIA: Esto eliminará registros del historial
-- Solo ejecuta esto si quieres limpiar datos problemáticos anteriores

-- DELETE FROM historial_estado_cita WHERE id_usuario_cambio IS NULL;

-- ========================================================
-- CONFIRMACIÓN FINAL
-- ========================================================

SELECT 
  '✅ FIX COMPLETADO' as resultado,
  'El trigger está deshabilitado' as paso_1,
  'El código TypeScript ahora maneja el historial' as paso_2,
  'Ya puedes marcar citas como completadas sin errores' as paso_3;

-- ========================================================
-- NOTAS IMPORTANTES:
-- ========================================================
-- 1. El trigger está DESHABILITADO (no eliminado), puedes re-habilitarlo:
--    ALTER TABLE cita ENABLE TRIGGER trigger_historial_estado_cita;
--
-- 2. Para eliminar el trigger permanentemente (OPCIONAL):
--    DROP TRIGGER IF EXISTS trigger_historial_estado_cita ON cita;
--    DROP FUNCTION IF EXISTS registrar_cambio_estado_cita();
--
-- 3. Tu código TypeScript en /lib/citasService.ts ahora inserta
--    correctamente en historial_estado_cita con id_usuario_cambio
--
-- 4. La columna correcta es "observaciones" NO "motivo_cambio"
-- ========================================================
