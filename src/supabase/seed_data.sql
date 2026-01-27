-- ============================================
-- DATOS INICIALES (SEED DATA)
-- Sistema de Control de Citas Médicas
-- ============================================

-- ============================================
-- 1. COMPAÑIA
-- ============================================
INSERT INTO compania (nombre, direccion, telefono, email, estado) VALUES
('Hospital Atlas', 'Av. Principal 123', '022345678', 'contacto@hospitalatlas.com', 'activo');

-- ============================================
-- 2. SUCURSAL
-- ============================================
INSERT INTO sucursal (id_compania, nombre, direccion, telefono, email, estado) VALUES
(1, 'Sucursal Norte', 'Av. Norte 456', '022345679', 'norte@hospitalatlas.com', 'activo'),
(1, 'Sucursal Sur', 'Av. Sur 789', '022345680', 'sur@hospitalatlas.com', 'activo');

-- ============================================
-- 3. USUARIO
-- ============================================
-- IMPORTANTE: Las contraseñas están en texto plano para el seed
-- En producción, deberían estar hasheadas
INSERT INTO usuario (nombre, apellido, cedula, email, telefono, password, tipo_usuario, fecha_ingreso, estado) VALUES
('Juan', 'Yepez', '1234567890', 'juan.yepez@hospital.com', '0991234567', 'password123', 'medico', '2020-01-15', 'activo'),
('María', 'López', '1234567891', 'maria.lopez@hospital.com', '0991234568', 'password123', 'medico', '2019-06-20', 'activo'),
('Carlos', 'Ramírez', '1234567892', 'carlos.ramirez@hospital.com', '0991234569', 'password123', 'medico', '2021-03-10', 'activo'),
('Ana', 'Torres', '1234567893', 'ana.torres@hospital.com', '0991234570', 'password123', 'administrativo', '2020-11-05', 'activo'),
('Luis', 'Mendoza', '1234567894', 'luis.mendoza@hospital.com', '0991234571', 'password123', 'administrativo', '2022-01-20', 'activo');

-- ============================================
-- 4. USUARIO_SUCURSAL
-- ============================================
INSERT INTO usuario_sucursal (id_usuario, id_sucursal, especialidad, cargo, estado) VALUES
(1, 1, 'Cardiología', 'Cardiólogo', 'activo'),
(1, 2, 'Cardiología', 'Cardiólogo', 'activo'),
(2, 1, 'Cardiología', 'Cardióloga', 'activo'),
(2, 2, 'Cardiología', 'Cardióloga', 'activo'),
(3, 2, 'Pediatría', 'Pediatra', 'activo'),
(4, 1, 'Administración', 'Recepcionista', 'activo'),
(5, 2, 'Administración', 'Recepcionista', 'activo');

-- ============================================
-- 5. HORARIO_USUARIO_SUCURSAL
-- ============================================
-- Dr. Juan Yepez - Sucursal Norte (Lun-Vie 8:00-12:00)
INSERT INTO horario_usuario_sucursal (id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(1, 1, '08:00', '12:00', 'activo'),
(1, 2, '08:00', '12:00', 'activo'),
(1, 3, '08:00', '12:00', 'activo'),
(1, 4, '08:00', '12:00', 'activo'),
(1, 5, '08:00', '12:00', 'activo');

-- Dr. Juan Yepez - Sucursal Sur (Lun-Vie 14:00-18:00)
INSERT INTO horario_usuario_sucursal (id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(2, 1, '14:00', '18:00', 'activo'),
(2, 2, '14:00', '18:00', 'activo'),
(2, 3, '14:00', '18:00', 'activo'),
(2, 4, '14:00', '18:00', 'activo'),
(2, 5, '14:00', '18:00', 'activo');

-- Dra. María López - Sucursal Norte (Lun-Vie 14:00-18:00)
INSERT INTO horario_usuario_sucursal (id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(3, 1, '14:00', '18:00', 'activo'),
(3, 2, '14:00', '18:00', 'activo'),
(3, 3, '14:00', '18:00', 'activo'),
(3, 4, '14:00', '18:00', 'activo'),
(3, 5, '14:00', '18:00', 'activo');

-- Dr. Carlos Ramírez - Sucursal Sur (Lun-Sab 9:00-13:00)
INSERT INTO horario_usuario_sucursal (id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(5, 1, '09:00', '13:00', 'activo'),
(5, 2, '09:00', '13:00', 'activo'),
(5, 3, '09:00', '13:00', 'activo'),
(5, 4, '09:00', '13:00', 'activo'),
(5, 5, '09:00', '13:00', 'activo'),
(5, 6, '09:00', '13:00', 'activo');

-- ============================================
-- 6. PRECIO_BASE_ESPECIALIDAD
-- ============================================
INSERT INTO precio_base_especialidad (id_compania, especialidad, precio_consulta, precio_control, precio_emergencia, estado) VALUES
(1, 'Cardiología', 60.00, 45.00, 120.00, 'activo'),
(1, 'Pediatría', 50.00, 40.00, 100.00, 'activo'),
(1, 'Medicina General', 40.00, 30.00, 80.00, 'activo');

-- ============================================
-- 7. PRECIO_USUARIO_SUCURSAL
-- ============================================
INSERT INTO precio_usuario_sucursal (id_usuario_sucursal, precio_consulta, precio_control, precio_emergencia, tipo_ajuste, valor_ajuste, estado) VALUES
(1, 50.00, 40.00, 100.00, 'ninguno', 0, 'activo'),
(2, 50.00, 40.00, 100.00, 'ninguno', 0, 'activo'),
(3, 55.00, 42.00, 110.00, 'ninguno', 0, 'activo'),
(5, 45.00, 35.00, 90.00, 'ninguno', 0, 'activo');

-- ============================================
-- 8. PACIENTE
-- ============================================
INSERT INTO paciente (cedula, nombres, apellidos, fecha_nacimiento, sexo, telefono, email, direccion, estado) VALUES
('1720345678', 'Pedro Antonio', 'García Mora', '1985-05-15', 'M', '0987654321', 'pedro.garcia@email.com', 'Calle Los Pinos 123', 'activo'),
('1720345679', 'María Fernanda', 'Rodríguez Silva', '1990-08-22', 'F', '0987654322', 'maria.rodriguez@email.com', 'Av. Central 456', 'activo'),
('1720345680', 'Carlos Andrés', 'Martínez López', '2018-03-10', 'M', '0987654323', 'carlos.martinez@email.com', 'Barrio El Carmen 789', 'activo'),
('1720345681', 'Ana María', 'Pérez Vargas', '1978-11-30', 'F', '0987654324', 'ana.perez@email.com', 'Urbanización Las Flores 321', 'activo');

-- ============================================
-- 9. CONSULTORIO
-- ============================================
INSERT INTO consultorio (id_sucursal, nombre, piso, numero, capacidad, equipamiento, estado) VALUES
(1, 'Consultorio 1', '1', '101', 1, 'Computadora, Camilla, Tensiómetro', 'activo'),
(1, 'Consultorio 2', '1', '102', 1, 'Computadora, Camilla, Estetoscopio', 'activo'),
(1, 'Consultorio 3', '2', '201', 1, 'Computadora, Camilla, ECG', 'activo'),
(2, 'Consultorio 1', '1', '101', 1, 'Computadora, Camilla, Tensiómetro', 'activo'),
(2, 'Consultorio 2', '1', '102', 1, 'Computadora, Camilla, Báscula Pediátrica', 'activo'),
(2, 'Consultorio 3', '2', '201', 1, 'Computadora, Camilla, Otoscopio', 'activo');

-- ============================================
-- 10. ASIGNACION_CONSULTORIO
-- ============================================
-- Dr. Juan Yepez - Sucursal Norte - Consultorio 2 (Lun-Vie 8:00-12:00)
INSERT INTO asignacion_consultorio (id_consultorio, id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(2, 1, 1, '08:00', '12:00', 'activo'),
(2, 1, 2, '08:00', '12:00', 'activo'),
(2, 1, 3, '08:00', '12:00', 'activo'),
(2, 1, 4, '08:00', '12:00', 'activo'),
(2, 1, 5, '08:00', '12:00', 'activo');

-- Dra. María López - Sucursal Norte - Consultorio 3 (Lun-Vie 14:00-18:00)
INSERT INTO asignacion_consultorio (id_consultorio, id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(3, 3, 1, '14:00', '18:00', 'activo'),
(3, 3, 2, '14:00', '18:00', 'activo'),
(3, 3, 3, '14:00', '18:00', 'activo'),
(3, 3, 4, '14:00', '18:00', 'activo'),
(3, 3, 5, '14:00', '18:00', 'activo');

-- Dr. Carlos Ramírez - Sucursal Sur - Consultorio 2 (Lun-Sab 9:00-13:00)
INSERT INTO asignacion_consultorio (id_consultorio, id_usuario_sucursal, dia_semana, hora_inicio, hora_fin, estado) VALUES
(5, 5, 1, '09:00', '13:00', 'activo'),
(5, 5, 2, '09:00', '13:00', 'activo'),
(5, 5, 3, '09:00', '13:00', 'activo'),
(5, 5, 4, '09:00', '13:00', 'activo'),
(5, 5, 5, '09:00', '13:00', 'activo'),
(5, 5, 6, '09:00', '13:00', 'activo');

-- ============================================
-- 11. CITA (Datos de ejemplo)
-- ============================================
INSERT INTO cita (id_paciente, id_usuario_sucursal, id_sucursal, id_consultorio, fecha_cita, hora_inicio, hora_fin, duracion_minutos, tipo_cita, motivo_consulta, estado_cita, precio_cita, forma_pago, estado_pago, notas_cita, recordatorio_enviado, confirmacion_paciente, consulta_realizada) VALUES
(1, 1, 1, 2, '2024-11-26', '09:00', '09:30', 30, 'consulta', 'Control de presión arterial', 'atendida', 50.00, 'efectivo', 'pagado', 'Paciente con historial de hipertensión', true, true, true),
(2, 1, 1, 2, '2024-11-26', '10:00', '10:30', 30, 'primera_vez', 'Dolor en el pecho', 'atendida', 60.00, 'tarjeta', 'pendiente', null, false, false, true),
(3, 5, 2, null, '2024-11-27', '14:00', '14:30', 30, 'control', 'Control pediátrico mensual', 'confirmada', 45.00, 'seguro', 'pagado', 'Vacunas al día', true, true, false),
(1, 2, 2, null, '2024-11-28', '11:00', '11:30', 30, 'consulta', 'Revisión general', 'agendada', 50.00, 'efectivo', 'pendiente', null, false, false, false);

-- ============================================
-- 12. DISPONIBILIDAD_EXCEPCIONAL
-- ============================================
INSERT INTO disponibilidad_excepcional (id_usuario_sucursal, fecha_inicio, fecha_fin, hora_inicio, hora_fin, tipo, motivo, estado) VALUES
(1, '2024-12-24', '2024-12-26', '08:00', '18:00', 'vacaciones', 'Vacaciones de Navidad', 'activo'),
(3, '2024-11-28', '2024-11-28', '14:00', '16:00', 'bloqueo', 'Conferencia médica', 'activo');

-- ============================================
-- 13. CONVERSACION_CHATBOT
-- ============================================
INSERT INTO conversacion_chatbot (id_paciente, id_cita, fecha_conversacion, hora_inicio, hora_fin, tipo, estado, mensajes, resultado) VALUES
(1, 1, '2024-11-25', '09:30', '09:35', 'agendamiento', 'completado', 
'[
  {"id_mensaje": 1, "tipo": "bot", "texto": "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", "hora": "09:30"},
  {"id_mensaje": 2, "tipo": "paciente", "texto": "Hola, quiero agendar una cita con cardiología", "hora": "09:31"},
  {"id_mensaje": 3, "tipo": "bot", "texto": "Perfecto, con gusto te ayudo. Tenemos disponibles al Dr. Juan Yepez y la Dra. María López en cardiología. ¿Con cuál prefieres?", "hora": "09:31"},
  {"id_mensaje": 4, "tipo": "paciente", "texto": "Con el Dr. Yepez por favor", "hora": "09:32"},
  {"id_mensaje": 5, "tipo": "bot", "texto": "¡Listo! Tu cita ha sido agendada para el martes 26 de noviembre a las 09:00 AM con el Dr. Juan Yepez.", "hora": "09:34"}
]'::jsonb,
'{"cita_fecha": "2024-11-26", "cita_hora": "09:00", "id_medico": 1, "motivo": "Control de presión arterial"}'::jsonb),

(2, 2, '2024-11-24', '10:15', '10:20', 'agendamiento', 'completado',
'[
  {"id_mensaje": 1, "tipo": "bot", "texto": "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", "hora": "10:15"},
  {"id_mensaje": 2, "tipo": "paciente", "texto": "Necesito agendar una cita urgente, tengo dolor en el pecho", "hora": "10:16"},
  {"id_mensaje": 3, "tipo": "bot", "texto": "¡Cita confirmada! Martes 26 de noviembre a las 10:00 AM con el Dr. Juan Yepez.", "hora": "10:19"}
]'::jsonb,
'{"cita_fecha": "2024-11-26", "cita_hora": "10:00", "id_medico": 1, "motivo": "Dolor en el pecho"}'::jsonb),

(4, null, '2024-11-22', '11:00', '11:04', 'consulta_info', 'completado',
'[
  {"id_mensaje": 1, "tipo": "bot", "texto": "¡Hola! Soy el asistente virtual de Hospital Atlas. ¿En qué puedo ayudarte hoy?", "hora": "11:00"},
  {"id_mensaje": 2, "tipo": "paciente", "texto": "Necesito información sobre horarios de atención", "hora": "11:01"},
  {"id_mensaje": 3, "tipo": "bot", "texto": "Con gusto te ayudo. Nuestros horarios son: Sucursal Norte de lunes a viernes 08:00-18:00.", "hora": "11:02"}
]'::jsonb,
null);

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================
SELECT 'Compañías' as tabla, COUNT(*) as registros FROM compania
UNION ALL
SELECT 'Sucursales', COUNT(*) FROM sucursal
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuario
UNION ALL
SELECT 'Usuario-Sucursal', COUNT(*) FROM usuario_sucursal
UNION ALL
SELECT 'Horarios', COUNT(*) FROM horario_usuario_sucursal
UNION ALL
SELECT 'Precios Base', COUNT(*) FROM precio_base_especialidad
UNION ALL
SELECT 'Precios Usuario', COUNT(*) FROM precio_usuario_sucursal
UNION ALL
SELECT 'Pacientes', COUNT(*) FROM paciente
UNION ALL
SELECT 'Consultorios', COUNT(*) FROM consultorio
UNION ALL
SELECT 'Asignaciones', COUNT(*) FROM asignacion_consultorio
UNION ALL
SELECT 'Citas', COUNT(*) FROM cita
UNION ALL
SELECT 'Disponibilidad', COUNT(*) FROM disponibilidad_excepcional
UNION ALL
SELECT 'Conversaciones', COUNT(*) FROM conversacion_chatbot
ORDER BY tabla;

-- ============================================
-- FIN DEL SEED DATA
-- ============================================
