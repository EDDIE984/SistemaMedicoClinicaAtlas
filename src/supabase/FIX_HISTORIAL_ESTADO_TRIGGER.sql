-- ============================================
-- CORREGIR TRIGGER DE HISTORIAL_ESTADO_CITA
-- Si existe un trigger que inserta automáticamente, necesitamos deshabilitarlo
-- porque ahora insertamos manualmente con el id_usuario_cambio
-- ============================================

-- Verificar si existe trigger automático
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'cita'
  AND trigger_name LIKE '%historial%';

-- Si hay un trigger que inserta en historial_estado_cita automáticamente,
-- descoméntalo y ejecuta el siguiente comando para eliminarlo:

-- DROP TRIGGER IF EXISTS trigger_historial_estado_cita ON cita;
-- DROP FUNCTION IF EXISTS fn_insertar_historial_estado_cita();

-- ============================================
-- NOTA: 
-- El código ahora inserta manualmente en historial_estado_cita
-- con el id_usuario_cambio correcto.
-- Si hay un trigger automático, causará duplicados o errores.
-- ============================================
