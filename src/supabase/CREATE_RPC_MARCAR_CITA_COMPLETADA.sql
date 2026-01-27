-- ============================================
-- FUNCIÓN RPC PARA MARCAR CITA COMO COMPLETADA
-- Esta función maneja correctamente el trigger de historial
-- ============================================

-- Primero, necesitamos crear o reemplazar la función
CREATE OR REPLACE FUNCTION marcar_cita_completada(
  p_id_cita INTEGER,
  p_id_usuario INTEGER
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado_anterior VARCHAR(20);
  v_result json;
BEGIN
  -- Obtener el estado actual
  SELECT estado_cita INTO v_estado_anterior
  FROM cita
  WHERE id_cita = p_id_cita;

  -- Si no existe la cita, retornar error
  IF v_estado_anterior IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cita no encontrada'
    );
  END IF;

  -- Actualizar el estado de la cita
  UPDATE cita
  SET 
    estado_cita = 'atendida',
    consulta_realizada = true
  WHERE id_cita = p_id_cita;

  -- Insertar en historial (esto evita que el trigger lo haga)
  -- Si el trigger existe, podría causar duplicados, así que lo hacemos explícitamente
  INSERT INTO historial_estado_cita (
    id_cita,
    estado_anterior,
    estado_nuevo,
    id_usuario_cambio,
    motivo_cambio
  ) VALUES (
    p_id_cita,
    v_estado_anterior,
    'atendida',
    p_id_usuario,
    'Consulta médica completada'
  );

  -- Retornar éxito
  RETURN json_build_object(
    'success', true,
    'id_cita', p_id_cita,
    'estado_anterior', v_estado_anterior,
    'estado_nuevo', 'atendida'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- FUNCIÓN RPC PARA CANCELAR CITA
-- ============================================

CREATE OR REPLACE FUNCTION cancelar_cita_completa(
  p_id_cita INTEGER,
  p_id_usuario_cancelo INTEGER,
  p_motivo_cancelacion TEXT
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado_anterior VARCHAR(20);
  v_result json;
BEGIN
  -- Obtener el estado actual
  SELECT estado_cita INTO v_estado_anterior
  FROM cita
  WHERE id_cita = p_id_cita;

  -- Si no existe la cita, retornar error
  IF v_estado_anterior IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cita no encontrada'
    );
  END IF;

  -- Actualizar el estado de la cita
  UPDATE cita
  SET estado_cita = 'cancelada'
  WHERE id_cita = p_id_cita;

  -- Insertar en historial
  INSERT INTO historial_estado_cita (
    id_cita,
    estado_anterior,
    estado_nuevo,
    id_usuario_cambio,
    motivo_cambio
  ) VALUES (
    p_id_cita,
    v_estado_anterior,
    'cancelada',
    p_id_usuario_cancelo,
    p_motivo_cancelacion
  );

  -- Insertar en tabla de cancelaciones
  INSERT INTO cancelacion (
    id_cita,
    id_usuario_cancelo,
    fecha_cancelacion,
    motivo_cancelacion
  ) VALUES (
    p_id_cita,
    p_id_usuario_cancelo,
    NOW(),
    p_motivo_cancelacion
  );

  -- Retornar éxito
  RETURN json_build_object(
    'success', true,
    'id_cita', p_id_cita,
    'estado_anterior', v_estado_anterior,
    'estado_nuevo', 'cancelada'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- VERIFICAR TRIGGERS EXISTENTES
-- ============================================

-- Para ver qué triggers existen en la tabla cita:
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'cita'
ORDER BY trigger_name;

-- ============================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Verifica los triggers que aparecen al final
-- 3. Si hay un trigger que inserta en historial_estado_cita,
--    considera deshabilitarlo o eliminarlo porque ahora
--    usamos funciones RPC que manejan el historial correctamente
-- ============================================
