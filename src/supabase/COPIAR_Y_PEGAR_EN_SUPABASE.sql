-- ================================================
-- COPIAR TODO ESTE ARCHIVO Y EJECUTAR EN SUPABASE
-- ================================================

CREATE OR REPLACE FUNCTION marcar_cita_completada(
  p_id_cita INTEGER,
  p_id_usuario INTEGER
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado_anterior VARCHAR(20);
BEGIN
  SELECT estado_cita INTO v_estado_anterior FROM cita WHERE id_cita = p_id_cita;
  
  IF v_estado_anterior IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Cita no encontrada');
  END IF;
  
  UPDATE cita SET estado_cita = 'atendida', consulta_realizada = true WHERE id_cita = p_id_cita;
  
  INSERT INTO historial_estado_cita (id_cita, estado_anterior, estado_nuevo, id_usuario_cambio, motivo_cambio)
  VALUES (p_id_cita, v_estado_anterior, 'atendida', p_id_usuario, 'Consulta médica completada');
  
  RETURN json_build_object('success', true, 'id_cita', p_id_cita, 'estado_anterior', v_estado_anterior, 'estado_nuevo', 'atendida');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

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
BEGIN
  SELECT estado_cita INTO v_estado_anterior FROM cita WHERE id_cita = p_id_cita;
  
  IF v_estado_anterior IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Cita no encontrada');
  END IF;
  
  UPDATE cita SET estado_cita = 'cancelada' WHERE id_cita = p_id_cita;
  
  INSERT INTO historial_estado_cita (id_cita, estado_anterior, estado_nuevo, id_usuario_cambio, motivo_cambio)
  VALUES (p_id_cita, v_estado_anterior, 'cancelada', p_id_usuario_cancelo, p_motivo_cancelacion);
  
  INSERT INTO cancelacion (id_cita, id_usuario_cancelo, fecha_cancelacion, motivo_cancelacion)
  VALUES (p_id_cita, p_id_usuario_cancelo, NOW(), p_motivo_cancelacion);
  
  RETURN json_build_object('success', true, 'id_cita', p_id_cita, 'estado_anterior', v_estado_anterior, 'estado_nuevo', 'cancelada');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
