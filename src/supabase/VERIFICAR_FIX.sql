-- ========================================================
-- VERIFICAR QUE EL FIX FUNCIONÓ
-- Ejecuta esto DESPUÉS de deshabilitar el trigger
-- ========================================================

-- 1. Verificar que el trigger está deshabilitado
SELECT 
  t.tgname as trigger_name,
  CASE 
    WHEN t.tgenabled = 'D' THEN '✅ DESHABILITADO (Correcto)'
    WHEN t.tgenabled = 'O' THEN '❌ HABILITADO (Problema)'
    ELSE 'Estado desconocido'
  END as estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'cita'
  AND t.tgname = 'trigger_historial_estado_cita';

-- ========================================================

-- 2. Ver el historial de estados reciente
SELECT 
  h.id_historial,
  c.id_cita,
  p.nombres || ' ' || p.apellidos AS paciente,
  h.estado_anterior,
  h.estado_nuevo,
  CASE 
    WHEN h.id_usuario_cambio IS NULL THEN '❌ NULL (Error)'
    ELSE '✅ ' || u.nombre || ' ' || u.apellido
  END as usuario_cambio,
  h.observaciones,
  h.fecha_cambio
FROM historial_estado_cita h
JOIN cita c ON c.id_cita = h.id_cita
JOIN paciente p ON p.id_paciente = c.id_paciente
LEFT JOIN usuario u ON u.id_usuario = h.id_usuario_cambio
ORDER BY h.fecha_cambio DESC
LIMIT 10;

-- ========================================================

-- 3. Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'historial_estado_cita'
ORDER BY ordinal_position;

-- ========================================================
-- RESULTADOS ESPERADOS:
-- ========================================================
-- 1. Trigger debe estar DESHABILITADO (D)
-- 2. Historial reciente debe tener id_usuario_cambio NO NULL
-- 3. Columnas deben incluir:
--    - id_historial
--    - id_cita
--    - estado_anterior
--    - estado_nuevo
--    - id_usuario_cambio (NOT NULL)
--    - fecha_cambio
--    - observaciones (NO "motivo_cambio")
-- ========================================================
