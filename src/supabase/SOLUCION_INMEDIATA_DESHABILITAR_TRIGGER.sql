-- ========================================================
-- SOLUCIÓN INMEDIATA: DESHABILITAR TRIGGER PROBLEMÁTICO
-- Ejecuta este script si NO puedes crear las funciones RPC
-- ========================================================

-- PASO 1: Ver qué triggers existen en la tabla cita
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'cita'
ORDER BY trigger_name;

-- IMPORTANTE: Copia los nombres de los triggers que aparecen arriba
-- Si hay algún trigger que mencione "historial" o "estado", ese es el problemático

-- ========================================================
-- PASO 2: DESHABILITAR EL TRIGGER
-- Descomenta y ejecuta la línea que corresponda al trigger encontrado
-- ========================================================

-- Si el trigger se llama "trigger_historial_estado_cita":
-- ALTER TABLE cita DISABLE TRIGGER trigger_historial_estado_cita;

-- Si el trigger se llama "actualizar_historial_estado":
-- ALTER TABLE cita DISABLE TRIGGER actualizar_historial_estado;

-- Si el trigger se llama "cita_estado_change_trigger":
-- ALTER TABLE cita DISABLE TRIGGER cita_estado_change_trigger;

-- Si no sabes el nombre, descomenta esta línea para deshabilitar TODOS los triggers:
-- ALTER TABLE cita DISABLE TRIGGER ALL;

-- ========================================================
-- VERIFICACIÓN: Comprobar que el trigger está deshabilitado
-- ========================================================

SELECT 
  trigger_name,
  status,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'cita';

-- Si el status dice "DISABLED", el trigger está deshabilitado correctamente

-- ========================================================
-- NOTA IMPORTANTE:
-- Después de deshabilitar el trigger, tu código TypeScript manejará
-- el historial manualmente (que ya está implementado)
-- ========================================================
