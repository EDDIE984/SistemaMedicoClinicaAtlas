-- ============================================
-- MIGRACIÓN: TABLAS DE FACTURACIÓN Y COBROS
-- ============================================

-- 1. TABLA PAGO
CREATE TABLE IF NOT EXISTS pago (
  id_pago SERIAL PRIMARY KEY,
  id_cita INTEGER NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  forma_pago VARCHAR(50) NOT NULL CHECK (forma_pago IN ('efectivo', 'tarjeta', 'transferencia', 'seguro', 'cortesia')),
  estado_pago VARCHAR(50) NOT NULL DEFAULT 'pagado' CHECK (estado_pago IN ('pendiente', 'pagado', 'parcial', 'cancelado')),
  fecha_pago TIMESTAMP DEFAULT NOW(),
  referencia_pago TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLA CARGO ADICIONAL
CREATE TABLE IF NOT EXISTS cargo_adicional (
  id_cargo_adicional SERIAL PRIMARY KEY,
  id_cita INTEGER NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLA DESCUENTO
CREATE TABLE IF NOT EXISTS descuento (
  id_descuento SERIAL PRIMARY KEY,
  id_cita INTEGER NOT NULL REFERENCES cita(id_cita) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) CHECK (monto >= 0),
  porcentaje DECIMAL(5,2) CHECK (porcentaje >= 0 AND porcentaje <= 100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_pago_cita ON pago(id_cita);
CREATE INDEX IF NOT EXISTS idx_cargo_adicional_cita ON cargo_adicional(id_cita);
CREATE INDEX IF NOT EXISTS idx_descuento_cita ON descuento(id_cita);

-- 5. TRIGGER PARA UPDATED_AT EN PAGO
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pago_updated_at ON pago;
CREATE TRIGGER update_pago_updated_at 
BEFORE UPDATE ON pago 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. COMENTARIOS
COMMENT ON TABLE pago IS 'Registro de pagos asociados a citas';
COMMENT ON TABLE cargo_adicional IS 'Cargos extra por servicios adicionales';
COMMENT ON TABLE descuento IS 'Descuentos aplicados a las citas';
