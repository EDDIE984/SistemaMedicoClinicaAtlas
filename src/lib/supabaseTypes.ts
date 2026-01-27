// Tipos TypeScript para Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuario: {
        Row: {
          id_usuario: number
          nombre: string
          apellido: string
          cedula: string
          email: string
          telefono: string | null
          password: string
          tipo_usuario: 'medico' | 'administrativo' | 'enfermera'
          fecha_ingreso: string
          estado: 'activo' | 'inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_usuario?: number
          nombre: string
          apellido: string
          cedula: string
          email: string
          telefono?: string | null
          password?: string
          tipo_usuario: 'medico' | 'administrativo' | 'enfermera'
          fecha_ingreso?: string
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_usuario?: number
          nombre?: string
          apellido?: string
          cedula?: string
          email?: string
          telefono?: string | null
          password?: string
          tipo_usuario?: 'medico' | 'administrativo' | 'enfermera'
          fecha_ingreso?: string
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      paciente: {
        Row: {
          id_paciente: number
          id_compania: number
          cedula: string
          nombres: string
          apellidos: string
          fecha_nacimiento: string
          edad: number | null
          sexo: 'M' | 'F' | 'Otro'
          telefono: string | null
          email: string | null
          direccion: string | null
          fecha_registro: string
          estado: 'activo' | 'inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_paciente?: number
          id_compania: number
          cedula: string
          nombres: string
          apellidos: string
          fecha_nacimiento: string
          edad?: number | null
          sexo: 'M' | 'F' | 'Otro'
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_registro?: string
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_paciente?: number
          id_compania?: number
          cedula?: string
          nombres?: string
          apellidos?: string
          fecha_nacimiento?: string
          edad?: number | null
          sexo?: 'M' | 'F' | 'Otro'
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_registro?: string
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      cita: {
        Row: {
          id_cita: number
          id_paciente: number
          id_usuario_sucursal: number
          id_sucursal: number
          id_consultorio: number | null
          fecha_cita: string
          hora_inicio: string
          hora_fin: string
          duracion_minutos: number
          tipo_cita: 'consulta' | 'control' | 'emergencia' | 'primera_vez'
          motivo_consulta: string | null
          estado_cita: 'agendada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio'
          precio_cita: number
          forma_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro' | null
          estado_pago: 'pendiente' | 'pagado' | 'parcial'
          notas_cita: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_cita?: number
          id_paciente: number
          id_usuario_sucursal: number
          id_sucursal: number
          id_consultorio?: number | null
          fecha_cita: string
          hora_inicio: string
          hora_fin: string
          duracion_minutos: number
          tipo_cita: 'consulta' | 'control' | 'emergencia' | 'primera_vez'
          motivo_consulta?: string | null
          estado_cita: 'agendada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio'
          precio_cita: number
          forma_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro' | null
          estado_pago: 'pendiente' | 'pagado' | 'parcial'
          notas_cita?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_cita?: number
          id_paciente?: number
          id_usuario_sucursal?: number
          id_sucursal?: number
          id_consultorio?: number | null
          fecha_cita?: string
          hora_inicio?: string
          hora_fin?: string
          duracion_minutos?: number
          tipo_cita?: 'consulta' | 'control' | 'emergencia' | 'primera_vez'
          motivo_consulta?: string | null
          estado_cita?: 'agendada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio'
          precio_cita?: number
          forma_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro' | null
          estado_pago?: 'pendiente' | 'pagado' | 'parcial'
          notas_cita?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sucursal: {
        Row: {
          id_sucursal: number
          nombre: string
          direccion: string | null
          telefono: string | null
          email: string | null
          es_principal: boolean
          estado: 'activo' | 'inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_sucursal?: number
          nombre: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          es_principal?: boolean
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_sucursal?: number
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          es_principal?: boolean
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      usuario_sucursal: {
        Row: {
          id_usuario_sucursal: number
          id_usuario: number
          id_sucursal: number
          especialidad: string | null
          estado: 'activo' | 'inactivo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_usuario_sucursal?: number
          id_usuario: number
          id_sucursal: number
          especialidad?: string | null
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_usuario_sucursal?: number
          id_usuario?: number
          id_sucursal?: number
          especialidad?: string | null
          estado?: 'activo' | 'inactivo'
          created_at?: string
          updated_at?: string
        }
      }
      precio_usuario_sucursal: {
        Row: {
          id_precio_usuario_sucursal: number
          id_usuario_sucursal: number
          precio_consulta: number
          duracion_consulta: number
          estado: 'activo' | 'inactivo'
          created_at: string
        }
        Insert: {
          id_precio_usuario_sucursal?: number
          id_usuario_sucursal: number
          precio_consulta: number
          duracion_consulta: number
          estado?: 'activo' | 'inactivo'
          created_at?: string
        }
        Update: {
          id_precio_usuario_sucursal?: number
          id_usuario_sucursal?: number
          precio_consulta?: number
          duracion_consulta?: number
          estado?: 'activo' | 'inactivo'
          created_at?: string
        }
      }
      signo_vital: {
        Row: {
          id_signo_vital: number
          id_paciente: number
          fecha_registro: string
          estatura_cm: number | null
          peso_kg: number | null
          imc: number | null
          temperatura_c: number | null
          frecuencia_respiratoria: number | null
          frecuencia_cardiaca: number | null
          presion_sistolica: number | null
          presion_diastolica: number | null
          saturacion_oxigeno: number | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id_signo_vital?: number
          id_paciente: number
          fecha_registro: string
          estatura_cm?: number | null
          peso_kg?: number | null
          imc?: number | null
          temperatura_c?: number | null
          frecuencia_respiratoria?: number | null
          frecuencia_cardiaca?: number | null
          presion_sistolica?: number | null
          presion_diastolica?: number | null
          saturacion_oxigeno?: number | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id_signo_vital?: number
          id_paciente?: number
          fecha_registro?: string
          estatura_cm?: number | null
          peso_kg?: number | null
          imc?: number | null
          temperatura_c?: number | null
          frecuencia_respiratoria?: number | null
          frecuencia_cardiaca?: number | null
          presion_sistolica?: number | null
          presion_diastolica?: number | null
          saturacion_oxigeno?: number | null
          notas?: string | null
          created_at?: string
        }
      }
      archivo_medico: {
        Row: {
          id_archivo: number
          id_paciente: number
          nombre_archivo: string
          descripcion: string | null
          tipo_archivo: string
          url_archivo: string | null
          fecha_carga: string
          created_at: string
        }
        Insert: {
          id_archivo?: number
          id_paciente: number
          nombre_archivo: string
          descripcion?: string | null
          tipo_archivo: string
          url_archivo?: string | null
          fecha_carga: string
          created_at?: string
        }
        Update: {
          id_archivo?: number
          id_paciente?: number
          nombre_archivo?: string
          descripcion?: string | null
          tipo_archivo?: string
          url_archivo?: string | null
          fecha_carga?: string
          created_at?: string
        }
      }
      // Agregar otras tablas según necesites
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
