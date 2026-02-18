-- ============================================
-- CREAR TABLA DE ASEGURADORAS
-- ============================================

-- 1. Crear la tabla de aseguradoras
CREATE TABLE IF NOT EXISTS aseguradora (
    id_aseguradora SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insertar datos iniciales
INSERT INTO aseguradora (nombre) VALUES 
('Sin Aseguradora'),
('Bupa'),
('Interoceanica')
ON CONFLICT DO NOTHING;

-- 3. Agregar columna id_aseguradora a la tabla cita
ALTER TABLE cita ADD COLUMN IF NOT EXISTS id_aseguradora INTEGER REFERENCES aseguradora(id_aseguradora);

-- 4. Actualizar citas existentes para usar 'Sin Aseguradora' (ID 1)
-- Asumimos que el ID 1 es 'Sin Aseguradora' por el orden de inserción
UPDATE cita SET id_aseguradora = 1 WHERE id_aseguradora IS NULL;

-- 5. Hacer que la columna sea NOT NULL si se desea (opcional, pero recomendado si todas deben tener una)
-- ALTER TABLE cita ALTER COLUMN id_aseguradora SET NOT NULL;

-- 6. Comentario
COMMENT ON COLUMN cita.id_aseguradora IS 'ID de la aseguradora asociada a la cita';
