-- ============================================
-- SCRIPT DE CORRECCIÓN DE ESQUEMA
-- Alinea la BD con el código existente
-- ============================================

-- ============================================
-- 1. CREAR ALIAS/VIEWS PARA COMPATIBILIDAD
-- ============================================

-- View para simular columna "fecha" en cita
CREATE OR REPLACE VIEW cita_compatible AS
SELECT 
  id_cita,
  id_paciente,
  id_usuario_sucursal,
  id_sucursal,
  id_consultorio,
  fecha_cita as fecha,  -- Alias para compatibilidad
  fecha_cita,            -- Mantener original
  hora_inicio,
  hora_fin,
  duracion_minutos,
  tipo_cita,
  motivo_consulta,
  estado_cita as estado, -- Alias para compatibilidad
  estado_cita,           -- Mantener original
  precio_cita as precio, -- Alias para compatibilidad
  precio_cita,           -- Mantener original
  forma_pago,
  estado_pago,
  notas_cita,
  cancelada_por,
  motivo_cancelacion,
  recordatorio_enviado,
  confirmacion_paciente,
  consulta_realizada,
  created_at,
  updated_at
FROM cita;

-- View para paciente con alias
CREATE OR REPLACE VIEW paciente_compatible AS
SELECT
  id_paciente,
  cedula as identificacion,  -- Alias para compatibilidad
  cedula,                    -- Mantener original  
  nombres,
  apellidos,
  fecha_nacimiento,
  edad,
  sexo,
  telefono,
  email as correo,           -- Alias para compatibilidad
  email,                     -- Mantener original
  direccion,
  fecha_registro,
  estado,
  created_at,
  updated_at
FROM paciente;

-- ============================================
-- 2. CREAR TABLA PAGO VIRTUAL (View)
-- ============================================

-- View que simula tabla "pago" usando datos de cita
CREATE OR REPLACE VIEW pago AS
SELECT
  id_cita as id_pago,        -- Usar ID de cita como ID de pago
  id_cita,
  precio_cita as monto,
  forma_pago,
  estado_pago,
  created_at as fecha_pago,
  NULL::text as referencia_pago,
  notas_cita as notas,
  created_at,
  updated_at
FROM cita
WHERE precio_cita > 0;

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

-- Dar permisos a las views
GRANT SELECT ON cita_compatible TO authenticated, anon;
GRANT SELECT ON paciente_compatible TO authenticated, anon;
GRANT SELECT ON pago TO authenticated, anon;

-- ============================================
-- 4. INSERTAR DATOS DE PRUEBA
-- ============================================

-- Insertar compañía si no existe
INSERT INTO compania (nombre, direccion, telefono, email, estado)
VALUES ('Hospital Demo', 'Av. Principal 123', '0999999999', 'info@hospital.com', 'activo')
ON CONFLICT DO NOTHING;

-- Insertar sucursal
INSERT INTO sucursal (id_compania, nombre, direccion, telefono, email, estado)
SELECT 
  (SELECT id_compania FROM compania ORDER BY id_compania DESC LIMIT 1),
  'Sucursal Central',
  'Av. Central 456',
  '0988888888',
  'central@hospital.com',
  'activo'
WHERE NOT EXISTS (SELECT 1 FROM sucursal WHERE nombre = 'Sucursal Central');

-- Asegurar que el usuario Juan Yepez esté activo
UPDATE usuario 
SET estado = 'activo', password = 'password123'
WHERE email = 'juan.yepez@hospital.com';

-- Asignar usuario a sucursal si no existe
INSERT INTO usuario_sucursal (id_usuario, id_sucursal, especialidad, cargo, estado)
SELECT 
  u.id_usuario,
  s.id_sucursal,
  'Cardiología',
  'Cardiólogo',
  'activo'
FROM usuario u
CROSS JOIN sucursal s
WHERE u.email = 'juan.yepez@hospital.com'
  AND s.nombre = 'Sucursal Central'
  AND NOT EXISTS (
    SELECT 1 FROM usuario_sucursal us
    WHERE us.id_usuario = u.id_usuario 
    AND us.id_sucursal = s.id_sucursal
  );

-- ============================================
-- 5. VERIFICACIÓN FINAL
-- ============================================

-- Verificar usuario
SELECT 
  'USUARIO' as tabla,
  id_usuario,
  nombre,
  apellido,
  email,
  password,
  tipo_usuario,
  estado
FROM usuario 
WHERE email = 'juan.yepez@hospital.com';

-- Verificar asignaciones
SELECT 
  'ASIGNACION' as tabla,
  us.id_usuario_sucursal,
  us.especialidad,
  us.estado,
  s.nombre as sucursal,
  c.nombre as compania
FROM usuario_sucursal us
JOIN usuario u ON us.id_usuario = u.id_usuario
JOIN sucursal s ON us.id_sucursal = s.id_sucursal
JOIN compania c ON s.id_compania = c.id_compania
WHERE u.email = 'juan.yepez@hospital.com';

-- Verificar views funcionando
SELECT 'VIEW pago' as test, COUNT(*) as registros FROM pago;
SELECT 'VIEW cita_compatible' as test, COUNT(*) as registros FROM cita_compatible;
SELECT 'VIEW paciente_compatible' as test, COUNT(*) as registros FROM paciente_compatible;
