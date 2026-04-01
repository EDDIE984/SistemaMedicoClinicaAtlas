-- Migración 034: Tabla de planificación de horarios para médicos suplentes y respaldo
-- Ejecutado en Supabase el 2026-03-30

CREATE TABLE public.planificacion_horario_suplente (
  id_planificacion serial NOT NULL,
  id_usuario_sucursal integer NOT NULL,
  id_consultorio integer NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  dia_semana integer NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  duracion_consulta integer NOT NULL DEFAULT 30,
  estado character varying(20) NOT NULL DEFAULT 'activo',
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT planificacion_horario_suplente_pkey PRIMARY KEY (id_planificacion),
  CONSTRAINT planificacion_horario_suplente_usuario_sucursal_fkey
    FOREIGN KEY (id_usuario_sucursal) REFERENCES usuario_sucursal(id_usuario_sucursal) ON DELETE CASCADE,
  CONSTRAINT planificacion_horario_suplente_consultorio_fkey
    FOREIGN KEY (id_consultorio) REFERENCES consultorio(id_consultorio) ON DELETE CASCADE,
  CONSTRAINT planificacion_horario_suplente_dia_semana_check
    CHECK (dia_semana >= 1 AND dia_semana <= 7),
  CONSTRAINT planificacion_horario_suplente_estado_check
    CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT planificacion_horario_suplente_duracion_check
    CHECK (duracion_consulta > 0 AND duracion_consulta <= 480),
  CONSTRAINT planificacion_horario_suplente_fechas_check
    CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_planificacion_usuario_sucursal
  ON public.planificacion_horario_suplente(id_usuario_sucursal);

CREATE INDEX idx_planificacion_fechas
  ON public.planificacion_horario_suplente(fecha_inicio, fecha_fin);

CREATE TRIGGER update_planificacion_updated_at
  BEFORE UPDATE ON planificacion_horario_suplente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.planificacion_horario_suplente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso autenticado" ON public.planificacion_horario_suplente
  FOR ALL USING (auth.role() = 'authenticated');
