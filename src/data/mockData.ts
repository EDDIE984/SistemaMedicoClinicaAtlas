// Mock data para todas las tablas del sistema

// Tipos
export type TipoUsuario = 'medico' | 'administrativo' | 'enfermera';
export type Estado = 'activo' | 'inactivo';
export type Sexo = 'M' | 'F' | 'Otro';
export type TipoCita = 'consulta' | 'control' | 'emergencia' | 'primera_vez';
export type EstadoCita = 'agendada' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';
export type TipoDisponibilidad = 'bloqueo' | 'disponible' | 'vacaciones' | 'permiso';
export type FormaPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro';
export type EstadoPago = 'pendiente' | 'pagado' | 'parcial';
export type TipoHorario = 'atencion' | 'hora_muerta' | 'no_disponible';
export type TipoAjuste = 'ninguno' | 'porcentaje' | 'monto_fijo';
export type EstadoConsultorio = 'activo' | 'inactivo' | 'mantenimiento';
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TipoConversacionChatbot = 'agendamiento' | 'consulta_info' | 'cancelacion' | 'reagendamiento';
export type EstadoConversacion = 'completado' | 'pendiente' | 'cancelado';
export type TipoMensaje = 'bot' | 'paciente';

// COMPAÑIA
export const companias = [
  { 
    id_compania: 1, 
    nombre: "Hospital Atlas", 
    ruc: "1790123456001", 
    direccion: "Av. Principal 123", 
    telefono: "022345678", 
    email: "info@hospitalatlas.com", 
    estado: "activo" as const 
  }
];

// SUCURSAL
export const sucursales = [
  { 
    id_sucursal: 1, 
    id_compania: 1, 
    nombre: "Sucursal Norte", 
    direccion: "Av. Norte 456", 
    telefono: "022345679", 
    email: "norte@hospitalatlas.com",
    horario_atencion: "Lunes a Viernes 08:00-18:00",
    estado: "activo" as const 
  },
  { 
    id_sucursal: 2, 
    id_compania: 1, 
    nombre: "Sucursal Sur", 
    direccion: "Av. Sur 789", 
    telefono: "022345680", 
    email: "sur@hospitalatlas.com",
    horario_atencion: "Lunes a Sábado 07:00-19:00",
    estado: "activo" as const 
  }
];

// USUARIO
export const usuarios = [
  {
    id_usuario: 1,
    nombre: "Juan",
    apellido: "Yepez",
    cedula: "1715834692",
    email: "jyepez@hospitalatlas.com",
    telefono: "0998765432",
    password: "password123",
    tipo_usuario: "medico" as const,
    fecha_ingreso: "2020-01-15",
    estado: "activo" as const
  },
  {
    id_usuario: 2,
    nombre: "María",
    apellido: "López",
    cedula: "1709876543",
    email: "mlopez@hospitalatlas.com",
    telefono: "0987654321",
    password: "password123",
    tipo_usuario: "medico" as const,
    fecha_ingreso: "2023-06-01",
    estado: "activo" as const
  },
  {
    id_usuario: 3,
    nombre: "Carlos",
    apellido: "Ramírez",
    cedula: "1712345678",
    email: "cramirez@hospitalatlas.com",
    telefono: "0976543210",
    password: "password123",
    tipo_usuario: "medico" as const,
    fecha_ingreso: "2021-03-10",
    estado: "activo" as const
  },
  {
    id_usuario: 4,
    nombre: "Ana",
    apellido: "Torres",
    cedula: "1713456789",
    email: "atorres@hospitalatlas.com",
    telefono: "0965432109",
    password: "admin123",
    tipo_usuario: "administrativo" as const,
    fecha_ingreso: "2022-08-20",
    estado: "activo" as const
  },
  {
    id_usuario: 5,
    nombre: "Luis",
    apellido: "González",
    cedula: "1714567890",
    email: "lgonzalez@hospitalatlas.com",
    telefono: "0954321098",
    password: "admin123",
    tipo_usuario: "administrativo" as const,
    fecha_ingreso: "2019-03-15",
    estado: "activo" as const
  }
];

// USUARIO_SUCURSAL (relación muchos a muchos)
export const usuariosSucursales = [
  { 
    id_usuario_sucursal: 1, 
    id_usuario: 1, 
    id_sucursal: 1, 
    especialidad: "Cardiología",
    es_sucursal_principal: true,
    fecha_asignacion: "2020-01-15",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 2, 
    id_usuario: 1, 
    id_sucursal: 2, 
    especialidad: "Cardiología",
    es_sucursal_principal: false,
    fecha_asignacion: "2021-06-10",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 3, 
    id_usuario: 2, 
    id_sucursal: 1, 
    especialidad: "Cardiología",
    es_sucursal_principal: true,
    fecha_asignacion: "2023-06-01",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 4, 
    id_usuario: 3, 
    id_sucursal: 2, 
    especialidad: "Pediatría",
    es_sucursal_principal: true,
    fecha_asignacion: "2021-03-10",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 5, 
    id_usuario: 4, 
    id_sucursal: 1, 
    especialidad: "Administración",
    es_sucursal_principal: true,
    fecha_asignacion: "2022-08-20",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 6, 
    id_usuario: 5, 
    id_sucursal: 1, 
    especialidad: "Administración",
    es_sucursal_principal: true,
    fecha_asignacion: "2019-03-15",
    estado: "activo" as const 
  },
  { 
    id_usuario_sucursal: 7, 
    id_usuario: 5, 
    id_sucursal: 2, 
    especialidad: "Administración",
    es_sucursal_principal: false,
    fecha_asignacion: "2020-01-10",
    estado: "activo" as const 
  }
];

// CONSULTORIO
export let consultorios = [
  {
    id_consultorio: 1,
    id_sucursal: 1, // Sucursal Norte
    nombre: "Consultorio 1",
    numero: "101",
    piso: "1",
    descripcion: "Consultorio general con equipamiento básico",
    capacidad: 3,
    equipamiento: "Camilla, Tensiómetro, Estetoscopio, Mesa de examen",
    estado: "activo" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  },
  {
    id_consultorio: 2,
    id_sucursal: 1, // Sucursal Norte
    nombre: "Consultorio 2",
    numero: "102",
    piso: "1",
    descripcion: "Consultorio cardiológico especializado",
    capacidad: 4,
    equipamiento: "Camilla, Tensiómetro, ECG, Estetoscopio, Desfibrilador",
    estado: "activo" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  },
  {
    id_consultorio: 3,
    id_sucursal: 1, // Sucursal Norte
    nombre: "Consultorio Pediátrico",
    numero: "201",
    piso: "2",
    descripcion: "Consultorio especializado en pediatría",
    capacidad: 3,
    equipamiento: "Camilla pediátrica, Báscula infantil, Tallímetro, Juguetes",
    estado: "activo" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  },
  {
    id_consultorio: 4,
    id_sucursal: 2, // Sucursal Sur
    nombre: "Consultorio A",
    numero: "A-01",
    piso: "1",
    descripcion: "Consultorio general amplio",
    capacidad: 5,
    equipamiento: "Camilla, Tensiómetro, Estetoscopio, Lámpara de examen",
    estado: "activo" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  },
  {
    id_consultorio: 5,
    id_sucursal: 2, // Sucursal Sur
    nombre: "Consultorio B",
    numero: "B-01",
    piso: "1",
    descripcion: "Consultorio de cardiología",
    capacidad: 4,
    equipamiento: "Camilla, Tensiómetro digital, ECG, Monitor cardíaco",
    estado: "activo" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  },
  {
    id_consultorio: 6,
    id_sucursal: 2, // Sucursal Sur
    nombre: "Sala de Emergencias",
    numero: "E-01",
    piso: "1",
    descripcion: "Sala equipada para emergencias",
    capacidad: 6,
    equipamiento: "Camilla, Desfibrilador, Equipo de oxígeno, Monitor multiparamétrico",
    estado: "mantenimiento" as EstadoConsultorio,
    fecha_creacion: "2024-01-01"
  }
];

// ASIGNACION_CONSULTORIO
export let asignacionesConsultorio = [
  // Dr. Juan Yepez - Sucursal Norte - Lunes y Martes - Consultorio 2
  {
    id_asignacion: 1,
    id_consultorio: 2,
    id_usuario_sucursal: 1,
    dia_semana: 1 as DiaSemana, // Lunes
    hora_inicio: "08:00",
    hora_fin: "17:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 2,
    id_consultorio: 2,
    id_usuario_sucursal: 1,
    dia_semana: 2 as DiaSemana, // Martes
    hora_inicio: "08:00",
    hora_fin: "17:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  // Dr. Juan Yepez - Sucursal Sur - Miércoles y Jueves - Consultorio B
  {
    id_asignacion: 3,
    id_consultorio: 5,
    id_usuario_sucursal: 2,
    dia_semana: 3 as DiaSemana, // Miércoles
    hora_inicio: "14:00",
    hora_fin: "18:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 4,
    id_consultorio: 5,
    id_usuario_sucursal: 2,
    dia_semana: 4 as DiaSemana, // Jueves
    hora_inicio: "14:00",
    hora_fin: "18:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  // Dra. María López - Sucursal Norte - Lunes a Viernes - Consultorio 1
  {
    id_asignacion: 5,
    id_consultorio: 1,
    id_usuario_sucursal: 3,
    dia_semana: 1 as DiaSemana,
    hora_inicio: "09:00",
    hora_fin: "13:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 6,
    id_consultorio: 1,
    id_usuario_sucursal: 3,
    dia_semana: 2 as DiaSemana,
    hora_inicio: "09:00",
    hora_fin: "13:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 7,
    id_consultorio: 1,
    id_usuario_sucursal: 3,
    dia_semana: 3 as DiaSemana,
    hora_inicio: "09:00",
    hora_fin: "13:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 8,
    id_consultorio: 1,
    id_usuario_sucursal: 3,
    dia_semana: 4 as DiaSemana,
    hora_inicio: "09:00",
    hora_fin: "13:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  },
  {
    id_asignacion: 9,
    id_consultorio: 1,
    id_usuario_sucursal: 3,
    dia_semana: 5 as DiaSemana,
    hora_inicio: "09:00",
    hora_fin: "13:00",
    es_asignacion_fija: true,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: null,
    estado: "activo" as Estado
  }
];

// HORARIO_USUARIO_SUCURSAL
export const horariosUsuarioSucursal = [
  // Dr. Juan Yepez - Sucursal Norte - Lunes
  { id_horario: 1, id_usuario_sucursal: 1, dia_semana: 1, hora_inicio: "08:00", hora_fin: "12:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 2, id_usuario_sucursal: 1, dia_semana: 1, hora_inicio: "12:00", hora_fin: "13:00", tipo_horario: "hora_muerta" as TipoHorario },
  { id_horario: 3, id_usuario_sucursal: 1, dia_semana: 1, hora_inicio: "13:00", hora_fin: "17:00", tipo_horario: "atencion" as TipoHorario },
  // Dr. Juan Yepez - Sucursal Norte - Martes
  { id_horario: 4, id_usuario_sucursal: 1, dia_semana: 2, hora_inicio: "08:00", hora_fin: "12:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 5, id_usuario_sucursal: 1, dia_semana: 2, hora_inicio: "12:00", hora_fin: "13:00", tipo_horario: "hora_muerta" as TipoHorario },
  { id_horario: 6, id_usuario_sucursal: 1, dia_semana: 2, hora_inicio: "13:00", hora_fin: "17:00", tipo_horario: "atencion" as TipoHorario },
  // Dr. Juan Yepez - Sucursal Sur - Miércoles
  { id_horario: 7, id_usuario_sucursal: 2, dia_semana: 3, hora_inicio: "14:00", hora_fin: "18:00", tipo_horario: "atencion" as TipoHorario },
  // Dr. Juan Yepez - Sucursal Sur - Jueves
  { id_horario: 8, id_usuario_sucursal: 2, dia_semana: 4, hora_inicio: "14:00", hora_fin: "18:00", tipo_horario: "atencion" as TipoHorario },
  // Dra. María López - Sucursal Norte - Lunes a Viernes
  { id_horario: 9, id_usuario_sucursal: 3, dia_semana: 1, hora_inicio: "09:00", hora_fin: "13:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 10, id_usuario_sucursal: 3, dia_semana: 2, hora_inicio: "09:00", hora_fin: "13:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 11, id_usuario_sucursal: 3, dia_semana: 3, hora_inicio: "09:00", hora_fin: "13:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 12, id_usuario_sucursal: 3, dia_semana: 4, hora_inicio: "09:00", hora_fin: "13:00", tipo_horario: "atencion" as TipoHorario },
  { id_horario: 13, id_usuario_sucursal: 3, dia_semana: 5, hora_inicio: "09:00", hora_fin: "13:00", tipo_horario: "atencion" as TipoHorario },
];

// PRECIO_BASE_ESPECIALIDAD
export const preciosBaseEspecialidad = [
  {
    id_precio_base: 1,
    id_compania: 1,
    especialidad: "Cardiología",
    precio_base: 50.00,
    descripcion: "Consulta cardiológica estándar",
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  },
  {
    id_precio_base: 2,
    id_compania: 1,
    especialidad: "Pediatría",
    precio_base: 40.00,
    descripcion: "Consulta pediátrica estándar",
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  },
  {
    id_precio_base: 3,
    id_compania: 1,
    especialidad: "Administración",
    precio_base: 0.00,
    descripcion: "Personal administrativo sin consultas",
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  }
];

// PRECIO_USUARIO_SUCURSAL
export const preciosUsuarioSucursal = [
  {
    id_precio: 1,
    id_usuario_sucursal: 1, // Dr. Juan Yepez - Sucursal Norte
    id_precio_base: 1,
    precio_consulta: 50.00,
    precio_control: 40.00,
    precio_emergencia: 80.00,
    tipo_ajuste: "ninguno" as TipoAjuste,
    valor_ajuste: 0,
    duracion_consulta: 30,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  },
  {
    id_precio: 2,
    id_usuario_sucursal: 2, // Dr. Juan Yepez - Sucursal Sur
    id_precio_base: 1,
    precio_consulta: 55.00,
    precio_control: 45.00,
    precio_emergencia: 85.00,
    tipo_ajuste: "porcentaje" as TipoAjuste,
    valor_ajuste: 10, // 10% más caro en Sucursal Sur
    duracion_consulta: 30,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  },
  {
    id_precio: 3,
    id_usuario_sucursal: 3, // Dra. María López - Sucursal Norte
    id_precio_base: 1,
    precio_consulta: 50.00,
    precio_control: 40.00,
    precio_emergencia: 80.00,
    tipo_ajuste: "ninguno" as TipoAjuste,
    valor_ajuste: 0,
    duracion_consulta: 30,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  },
  {
    id_precio: 4,
    id_usuario_sucursal: 4, // Dr. Carlos Ramírez - Sucursal Sur (Pediatría)
    id_precio_base: 2,
    precio_consulta: 45.00,
    precio_control: 35.00,
    precio_emergencia: 70.00,
    tipo_ajuste: "monto_fijo" as TipoAjuste,
    valor_ajuste: 5, // $5 más que el precio base
    duracion_consulta: 45,
    fecha_vigencia_desde: "2024-01-01",
    fecha_vigencia_hasta: "2024-12-31",
    estado: "activo" as Estado
  }
];

// PACIENTE
export let pacientes = [
  {
    id_paciente: 1,
    id_compania: 1,
    nombres: "Pedro Antonio",
    apellidos: "García Mora",
    numero_identificacion: "1708123456",
    fecha_nacimiento: "1985-05-15",
    sexo: "M" as Sexo,
    email: "pedro.garcia@email.com",
    telefono: "0991234567",
    direccion: "Calle Flores 123",
    ciudad: "Quito",
    provincia: "Pichincha",
    fecha_registro: "2024-01-10",
    estado: "activo" as Estado
  },
  {
    id_paciente: 2,
    id_compania: 1,
    nombres: "María Fernanda",
    apellidos: "Rodríguez Silva",
    numero_identificacion: "1709234567",
    fecha_nacimiento: "1990-08-22",
    sexo: "F" as Sexo,
    email: "maria.rodriguez@email.com",
    telefono: "0982345678",
    direccion: "Av. América 456",
    ciudad: "Quito",
    provincia: "Pichincha",
    fecha_registro: "2024-02-15",
    estado: "activo" as Estado
  },
  {
    id_paciente: 3,
    id_compania: 1,
    nombres: "Carlos Andrés",
    apellidos: "Martínez López",
    numero_identificacion: "1710345678",
    fecha_nacimiento: "2015-03-10",
    sexo: "M" as Sexo,
    email: "carlos.martinez@email.com",
    telefono: "0973456789",
    direccion: "Calle Guayaquil 789",
    ciudad: "Quito",
    provincia: "Pichincha",
    fecha_registro: "2024-03-20",
    estado: "activo" as Estado
  },
  {
    id_paciente: 4,
    id_compania: 1,
    nombres: "Ana María",
    apellidos: "Pérez Vargas",
    numero_identificacion: "1711456789",
    fecha_nacimiento: "1978-11-05",
    sexo: "F" as Sexo,
    email: "ana.perez@email.com",
    telefono: "0964567890",
    direccion: "Av. Ecuador 101",
    ciudad: "Quito",
    provincia: "Pichincha",
    fecha_registro: "2024-04-25",
    estado: "activo" as Estado
  }
];

// CITA
export let citas = [
  {
    id_cita: 1,
    id_paciente: 1,
    id_usuario_sucursal: 1, // Dr. Juan Yepez - Sucursal Norte
    id_sucursal: 1,
    id_consultorio: 2, // Consultorio 2
    fecha_cita: "2024-11-26",
    hora_inicio: "09:00",
    hora_fin: "09:30",
    duracion_minutos: 30,
    tipo_cita: "consulta" as TipoCita,
    motivo_consulta: "Control de presión arterial",
    estado_cita: "atendida" as EstadoCita,
    precio_cita: 50.00,
    forma_pago: "efectivo" as FormaPago,
    estado_pago: "pagado" as EstadoPago,
    notas_cita: "Paciente con historial de hipertensión",
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-25T10:00:00",
    fecha_modificacion: "2024-11-25T10:00:00",
    recordatorio_enviado: true,
    confirmacion_paciente: true,
    consulta_realizada: true
  },
  {
    id_cita: 2,
    id_paciente: 2,
    id_usuario_sucursal: 1, // Dr. Juan Yepez - Sucursal Norte
    id_sucursal: 1,
    id_consultorio: 2, // Consultorio 2
    fecha_cita: "2024-11-26",
    hora_inicio: "10:00",
    hora_fin: "10:30",
    duracion_minutos: 30,
    tipo_cita: "primera_vez" as TipoCita,
    motivo_consulta: "Dolor en el pecho",
    estado_cita: "atendida" as EstadoCita,
    precio_cita: 60.00,
    forma_pago: "tarjeta" as FormaPago,
    estado_pago: "pendiente" as EstadoPago,
    notas_cita: null,
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-25T11:00:00",
    fecha_modificacion: "2024-11-25T11:00:00",
    recordatorio_enviado: false,
    confirmacion_paciente: false,
    consulta_realizada: true
  },
  {
    id_cita: 3,
    id_paciente: 3,
    id_usuario_sucursal: 2, // Dr. Juan Yepez - Sucursal Sur
    id_sucursal: 2,
    fecha_cita: "2024-11-27",
    hora_inicio: "14:00",
    hora_fin: "14:30",
    duracion_minutos: 30,
    tipo_cita: "control" as TipoCita,
    motivo_consulta: "Control pediátrico mensual",
    estado_cita: "confirmada" as EstadoCita,
    precio_cita: 45.00,
    forma_pago: "seguro" as FormaPago,
    estado_pago: "pagado" as EstadoPago,
    notas_cita: "Vacunas al día",
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-25T12:00:00",
    fecha_modificacion: "2024-11-25T12:00:00",
    recordatorio_enviado: true,
    confirmacion_paciente: true,
    consulta_realizada: false
  },
  {
    id_cita: 4,
    id_paciente: 1,
    id_usuario_sucursal: 2, // Dr. Juan Yepez - Sucursal Sur
    id_sucursal: 2,
    fecha_cita: "2024-11-28",
    hora_inicio: "11:00",
    hora_fin: "11:30",
    duracion_minutos: 30,
    tipo_cita: "consulta" as TipoCita,
    motivo_consulta: "Revisión general",
    estado_cita: "agendada" as EstadoCita,
    precio_cita: 50.00,
    forma_pago: "efectivo" as FormaPago,
    estado_pago: "pendiente" as EstadoPago,
    notas_cita: null,
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-25T13:00:00",
    fecha_modificacion: "2024-11-25T13:00:00",
    recordatorio_enviado: false,
    confirmacion_paciente: false,
    consulta_realizada: false
  },
  // Citas consecutivas para el 25 de noviembre (lunes) - Dr. Juan Yepez Sucursal Norte
  {
    id_cita: 5,
    id_paciente: 2,
    id_usuario_sucursal: 1,
    id_sucursal: 1,
    fecha_cita: "2024-11-25",
    hora_inicio: "08:30",
    hora_fin: "09:00",
    duracion_minutos: 30,
    tipo_cita: "consulta" as TipoCita,
    motivo_consulta: "Chequeo cardiológico",
    estado_cita: "confirmada" as EstadoCita,
    precio_cita: 60.00,
    forma_pago: "tarjeta" as FormaPago,
    estado_pago: "pagado" as EstadoPago,
    notas_cita: "Traer exámenes previos",
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-20T10:00:00",
    fecha_modificacion: "2024-11-20T10:00:00",
    recordatorio_enviado: true,
    confirmacion_paciente: true,
    consulta_realizada: false
  },
  {
    id_cita: 6,
    id_paciente: 3,
    id_usuario_sucursal: 1,
    id_sucursal: 1,
    fecha_cita: "2024-11-25",
    hora_inicio: "10:00",
    hora_fin: "10:30",
    duracion_minutos: 30,
    tipo_cita: "control" as TipoCita,
    motivo_consulta: "Control pediátrico",
    estado_cita: "en_atencion" as EstadoCita,
    precio_cita: 45.00,
    forma_pago: "efectivo" as FormaPago,
    estado_pago: "pagado" as EstadoPago,
    notas_cita: null,
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-22T14:00:00",
    fecha_modificacion: "2024-11-25T10:05:00",
    recordatorio_enviado: true,
    confirmacion_paciente: true,
    consulta_realizada: false
  },
  {
    id_cita: 7,
    id_paciente: 4,
    id_usuario_sucursal: 1,
    id_sucursal: 1,
    fecha_cita: "2024-11-25",
    hora_inicio: "10:30",
    hora_fin: "11:00",
    duracion_minutos: 30,
    tipo_cita: "consulta" as TipoCita,
    motivo_consulta: "Presión arterial alta",
    estado_cita: "agendada" as EstadoCita,
    precio_cita: 60.00,
    forma_pago: "seguro" as FormaPago,
    estado_pago: "pendiente" as EstadoPago,
    notas_cita: "Paciente lleva tratamiento previo",
    cancelada_por: null,
    motivo_cancelacion: null,
    fecha_creacion: "2024-11-23T16:00:00",
    fecha_modificacion: "2024-11-23T16:00:00",
    recordatorio_enviado: true,
    confirmacion_paciente: true,
    consulta_realizada: false
  }
];

// DISPONIBILIDAD_EXCEPCIONAL
export let disponibilidadExcepcional = [
  {
    id_disponibilidad: 1,
    id_usuario_sucursal: 1,
    fecha: "2024-12-05",
    hora_inicio: "14:00",
    hora_fin: "18:00",
    tipo: "bloqueo" as TipoDisponibilidad,
    motivo: "Conferencia médica",
    estado: "activo" as Estado
  },
  {
    id_disponibilidad: 2,
    id_usuario_sucursal: 2,
    fecha: "2024-12-10",
    hora_inicio: "08:00",
    hora_fin: "18:00",
    tipo: "vacaciones" as TipoDisponibilidad,
    motivo: "Vacaciones programadas",
    estado: "activo" as Estado
  }
];

// HISTORIAL_ESTADO_CITA
export let historialEstadoCita = [
  {
    id_historial: 1,
    id_cita: 1,
    estado_anterior: "agendada" as EstadoCita,
    estado_nuevo: "confirmada" as EstadoCita,
    id_usuario_cambio: 1,
    fecha_cambio: "2024-11-26T08:00:00",
    observaciones: "Paciente confirmó asistencia por teléfono"
  },
  {
    id_historial: 2,
    id_cita: 3,
    estado_anterior: "agendada" as EstadoCita,
    estado_nuevo: "confirmada" as EstadoCita,
    id_usuario_cambio: 1,
    fecha_cambio: "2024-11-26T09:00:00",
    observaciones: "Confirmación automática 24h antes"
  }
];

// ============================================
// INTERFACES TYPESCRIPT
// ============================================

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  password: string;
  tipo_usuario: TipoUsuario;
  fecha_ingreso: string;
  estado: Estado;
}

export interface Compania {
  id_compania: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: Estado;
}

export interface Sucursal {
  id_sucursal: number;
  id_compania: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario_atencion: string;
  estado: Estado;
}

export interface UsuarioSucursal {
  id_usuario_sucursal: number;
  id_usuario: number;
  id_sucursal: number;
  especialidad: string;
  es_sucursal_principal: boolean;
  fecha_asignacion: string;
  estado: Estado;
}

export interface HorarioUsuarioSucursal {
  id_horario: number;
  id_usuario_sucursal: number;
  dia_semana: DiaSemana; // 1=Lunes, 2=Martes... 7=Domingo
  hora_inicio: string;
  hora_fin: string;
  tipo_horario: TipoHorario;
}

export interface PrecioBaseEspecialidad {
  id_precio_base: number;
  id_compania: number;
  especialidad: string;
  precio_base: number;
  descripcion: string;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta: string;
  estado: Estado;
}

export interface PrecioUsuarioSucursal {
  id_precio: number;
  id_usuario_sucursal: number;
  id_precio_base: number | null;
  precio_consulta: number;
  precio_control: number;
  precio_emergencia: number;
  tipo_ajuste: TipoAjuste;
  valor_ajuste: number;
  duracion_consulta: number;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta: string;
  estado: Estado;
}

export interface Paciente {
  id_paciente: number;
  id_compania: number;
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  fecha_registro: string;
  estado: Estado;
}

export interface Consultorio {
  id_consultorio: number;
  id_sucursal: number;
  nombre: string;
  numero: string;
  piso: string;
  descripcion: string;
  capacidad: number;
  equipamiento: string;
  estado: EstadoConsultorio;
  fecha_creacion: string;
}

export interface AsignacionConsultorio {
  id_asignacion: number;
  id_consultorio: number;
  id_usuario_sucursal: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  es_asignacion_fija: boolean;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta: string | null;
  estado: Estado;
}

export interface Cita {
  id_cita: number;
  id_paciente: number;
  id_usuario_sucursal: number;
  id_sucursal: number;
  id_consultorio?: number; // Opcional para compatibilidad con citas antiguas
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  tipo_cita: TipoCita;
  motivo_consulta: string;
  estado_cita: EstadoCita;
  precio_cita: number;
  forma_pago: FormaPago;
  estado_pago: EstadoPago;
  notas_cita: string | null;
  cancelada_por: number | null;
  motivo_cancelacion: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  recordatorio_enviado?: boolean; // Flag para recordatorios
  confirmacion_paciente?: boolean; // Flag para confirmación
  consulta_realizada?: boolean; // Flag para marcar si la consulta ya fue realizada
}

export interface DisponibilidadExcepcional {
  id_disponibilidad: number;
  id_usuario_sucursal: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoDisponibilidad;
  motivo: string;
  estado: Estado;
}

export interface HistorialEstadoCita {
  id_historial: number;
  id_cita: number;
  estado_anterior: EstadoCita;
  estado_nuevo: EstadoCita;
  id_usuario_cambio: number;
  fecha_cambio: string;
  observaciones: string;
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

export function getUsuarioByEmail(email: string): Usuario | undefined {
  return usuarios.find(u => u.email === email && u.estado === 'activo');
}

export function getAsignacionesByUsuario(id_usuario: number): UsuarioSucursal[] {
  return usuariosSucursales.filter(us => us.id_usuario === id_usuario && us.estado === 'activo');
}

export function getSucursalById(id_sucursal: number): Sucursal | undefined {
  return sucursales.find(s => s.id_sucursal === id_sucursal);
}

export function getCompaniaById(id_compania: number): Compania | undefined {
  return companias.find(c => c.id_compania === id_compania);
}

export interface AsignacionCompleta {
  id_usuario_sucursal: number;
  compania: Compania;
  sucursal: Sucursal;
  especialidad: string;
}

export function getAsignacionesCompletasByUsuario(id_usuario: number): AsignacionCompleta[] {
  const asignaciones = getAsignacionesByUsuario(id_usuario);
  
  return asignaciones.map(asig => {
    const sucursal = getSucursalById(asig.id_sucursal);
    const compania = sucursal ? getCompaniaById(sucursal.id_compania) : undefined;
    
    return {
      id_usuario_sucursal: asig.id_usuario_sucursal,
      compania: compania!,
      sucursal: sucursal!,
      especialidad: asig.especialidad
    };
  }).filter(asig => asig.compania && asig.sucursal);
}

export function getPacienteById(id_paciente: number): Paciente | undefined {
  return pacientes.find(p => p.id_paciente === id_paciente);
}

export function getCitasByUsuarioSucursal(id_usuario_sucursal: number): Cita[] {
  return citas.filter(c => c.id_usuario_sucursal === id_usuario_sucursal);
}

export function getCitasByUsuario(id_usuario: number): Cita[] {
  const asignaciones = getAsignacionesByUsuario(id_usuario);
  const idsUsuarioSucursal = asignaciones.map(a => a.id_usuario_sucursal);
  return citas.filter(c => idsUsuarioSucursal.includes(c.id_usuario_sucursal));
}

export function addCita(cita: Omit<Cita, 'id_cita'>): Cita {
  const newCita = {
    ...cita,
    id_cita: Math.max(...citas.map(c => c.id_cita), 0) + 1
  };
  citas.push(newCita);
  return newCita;
}

export function addPaciente(paciente: Omit<Paciente, 'id_paciente' | 'fecha_registro' | 'estado'>): Paciente {
  const newPaciente = {
    ...paciente,
    id_paciente: Math.max(...pacientes.map(p => p.id_paciente), 0) + 1,
    fecha_registro: new Date().toISOString().split('T')[0],
    estado: 'activo' as Estado
  };
  pacientes.push(newPaciente);
  return newPaciente;
}

export function getPrecioUsuarioSucursal(id_usuario_sucursal: number, tipo_cita: TipoCita): number {
  const precio = preciosUsuarioSucursal.find(p => p.id_usuario_sucursal === id_usuario_sucursal && p.estado === 'activo');
  if (!precio) return 50; // Precio por defecto
  
  switch (tipo_cita) {
    case 'consulta':
    case 'primera_vez':
      return precio.precio_consulta;
    case 'control':
      return precio.precio_control;
    case 'emergencia':
      return precio.precio_emergencia;
    default:
      return precio.precio_consulta;
  }
}

export function getHorarioUsuarioSucursal(id_usuario_sucursal: number, dia_semana: DiaSemana): HorarioUsuarioSucursal[] {
  return horariosUsuarioSucursal.filter(h => h.id_usuario_sucursal === id_usuario_sucursal && h.dia_semana === dia_semana);
}

// Función para obtener día de la semana (1=Lunes, 7=Domingo)
export function getDiaSemana(fecha: string): DiaSemana {
  const date = new Date(fecha + 'T00:00:00');
  const dia = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  return dia === 0 ? 7 : dia as DiaSemana; // Convertir a formato 1=Lunes, 7=Domingo
}

// Función para convertir hora string a minutos
function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Función para convertir minutos a hora string
function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Función para verificar si un slot está disponible
function isSlotDisponible(
  fecha: string,
  horaInicio: string,
  horaFin: string,
  id_usuario_sucursal: number,
  citasExistentes: Cita[],
  disponibilidadExcepcional: DisponibilidadExcepcional[]
): boolean {
  const inicioMinutos = horaAMinutos(horaInicio);
  const finMinutos = horaAMinutos(horaFin);

  // Verificar disponibilidad excepcional (bloqueos, vacaciones, etc.)
  const excepciones = disponibilidadExcepcional.filter(
    d => d.id_usuario_sucursal === id_usuario_sucursal &&
         d.fecha === fecha &&
         d.estado === 'activo'
  );

  for (const excepcion of excepciones) {
    if (excepcion.tipo === 'bloqueo' || excepcion.tipo === 'vacaciones' || excepcion.tipo === 'permiso') {
      const excepcionInicio = horaAMinutos(excepcion.hora_inicio);
      const excepcionFin = horaAMinutos(excepcion.hora_fin);
      
      // Si hay superposición, el slot no está disponible
      if (inicioMinutos < excepcionFin && finMinutos > excepcionInicio) {
        return false;
      }
    }
  }

  // Verificar citas existentes
  for (const cita of citasExistentes) {
    if (cita.fecha_cita === fecha && 
        cita.id_usuario_sucursal === id_usuario_sucursal &&
        cita.estado_cita !== 'cancelada' &&
        cita.estado_cita !== 'no_asistio') {
      const citaInicio = horaAMinutos(cita.hora_inicio);
      const citaFin = horaAMinutos(cita.hora_fin);
      
      // Si hay superposición, el slot no está disponible
      if (inicioMinutos < citaFin && finMinutos > citaInicio) {
        return false;
      }
    }
  }

  return true;
}

// Función principal para obtener slots disponibles
export function getSlotsDisponibles(
  id_usuario_sucursal: number,
  fecha: string
): string[] {
  const slots: string[] = [];

  // Obtener duración de la consulta
  const precioConfig = preciosUsuarioSucursal.find(
    p => p.id_usuario_sucursal === id_usuario_sucursal && p.estado === 'activo'
  );
  const duracionMinutos = precioConfig?.duracion_consulta || 30;

  // Obtener día de la semana
  const diaSemana = getDiaSemana(fecha);

  // Obtener horarios del usuario para ese día
  const horarios = getHorarioUsuarioSucursal(id_usuario_sucursal, diaSemana).filter(
    h => h.tipo_horario === 'atencion'
  );

  if (horarios.length === 0) {
    return slots; // No hay horarios configurados para este día
  }

  // Obtener citas existentes
  const citasExistentes = citas;

  // Obtener disponibilidad excepcional
  const excepciones = disponibilidadExcepcional;

  // Generar slots para cada bloque de horario
  for (const horario of horarios) {
    const inicioBloque = horaAMinutos(horario.hora_inicio);
    const finBloque = horaAMinutos(horario.hora_fin);

    // Generar slots cada 'duracionMinutos'
    for (let minutos = inicioBloque; minutos + duracionMinutos <= finBloque; minutos += duracionMinutos) {
      const horaInicio = minutosAHora(minutos);
      const horaFin = minutosAHora(minutos + duracionMinutos);

      // Verificar si el slot está disponible
      if (isSlotDisponible(fecha, horaInicio, horaFin, id_usuario_sucursal, citasExistentes, excepciones)) {
        slots.push(horaInicio);
      }
    }
  }

  return slots;
}

// Función para cancelar una cita
export function cancelarCita(
  id_cita: number,
  id_usuario_cancelacion: number,
  motivo_cancelacion: string
): boolean {
  const cita = citas.find(c => c.id_cita === id_cita);
  
  if (!cita) {
    return false;
  }

  const estadoAnterior = cita.estado_cita;

  // Actualizar la cita
  cita.estado_cita = 'cancelada';
  cita.cancelada_por = id_usuario_cancelacion;
  cita.motivo_cancelacion = motivo_cancelacion;
  cita.fecha_modificacion = new Date().toISOString();

  // Registrar en historial
  const nuevoHistorial = {
    id_historial: Math.max(...historialEstadoCita.map(h => h.id_historial), 0) + 1,
    id_cita: id_cita,
    estado_anterior: estadoAnterior,
    estado_nuevo: 'cancelada' as EstadoCita,
    id_usuario_cambio: id_usuario_cancelacion,
    fecha_cambio: new Date().toISOString(),
    observaciones: `Cita cancelada. Motivo: ${motivo_cancelacion}`
  };

  historialEstadoCita.push(nuevoHistorial);

  return true;
}

// Función para modificar fecha y hora de una cita
export function modificarCita(
  id_cita: number,
  nueva_fecha: string,
  nueva_hora_inicio: string,
  nueva_hora_fin: string,
  nueva_duracion: number,
  id_usuario_modificacion: number,
  observaciones?: string
): { success: boolean; message: string } {
  const cita = citas.find(c => c.id_cita === id_cita);
  
  if (!cita) {
    return { success: false, message: 'Cita no encontrada' };
  }

  if (cita.estado_cita === 'cancelada') {
    return { success: false, message: 'No se puede modificar una cita cancelada' };
  }

  if (cita.estado_cita === 'atendida') {
    return { success: false, message: 'No se puede modificar una cita ya atendida' };
  }

  // Verificar disponibilidad del nuevo horario
  const citasExistentes = citas.filter(c => c.id_cita !== id_cita); // Excluir la cita actual
  const excepciones = disponibilidadExcepcional;

  if (!isSlotDisponible(nueva_fecha, nueva_hora_inicio, nueva_hora_fin, cita.id_usuario_sucursal, citasExistentes, excepciones)) {
    return { success: false, message: 'El horario seleccionado no está disponible' };
  }

  // Guardar valores anteriores para historial
  const fechaAnterior = cita.fecha_cita;
  const horaInicioAnterior = cita.hora_inicio;
  const horaFinAnterior = cita.hora_fin;

  // Actualizar la cita
  cita.fecha_cita = nueva_fecha;
  cita.hora_inicio = nueva_hora_inicio;
  cita.hora_fin = nueva_hora_fin;
  cita.duracion_minutos = nueva_duracion;
  cita.fecha_modificacion = new Date().toISOString();

  // Registrar en historial
  const nuevoHistorial = {
    id_historial: Math.max(...historialEstadoCita.map(h => h.id_historial), 0) + 1,
    id_cita: id_cita,
    estado_anterior: cita.estado_cita,
    estado_nuevo: cita.estado_cita,
    id_usuario_cambio: id_usuario_modificacion,
    fecha_cambio: new Date().toISOString(),
    observaciones: `Cita modificada de ${fechaAnterior} ${horaInicioAnterior}-${horaFinAnterior} a ${nueva_fecha} ${nueva_hora_inicio}-${nueva_hora_fin}${observaciones ? '. ' + observaciones : ''}`
  };

  historialEstadoCita.push(nuevoHistorial);

  return { success: true, message: 'Cita modificada exitosamente' };
}

// Función para obtener cita por ID
export function getCitaById(id_cita: number): Cita | undefined {
  return citas.find(c => c.id_cita === id_cita);
}

// Función para marcar una cita como consulta realizada
export function marcarConsultaRealizada(id_cita: number): boolean {
  const cita = citas.find(c => c.id_cita === id_cita);
  
  if (!cita) {
    return false;
  }

  cita.consulta_realizada = true;
  cita.estado_cita = 'atendida';
  cita.fecha_modificacion = new Date().toISOString();

  return true;
}

// ============================================
// FUNCIONES DE UTILIDAD PARA CONSULTORIOS
// ============================================

// Obtener consultorios por sucursal
export function getConsultoriosBySucursal(id_sucursal: number): Consultorio[] {
  return consultorios.filter(c => c.id_sucursal === id_sucursal && (c.estado === 'activo' || c.estado === 'inactivo'));
}

// Obtener consultorio por ID
export function getConsultorioById(id_consultorio: number): Consultorio | undefined {
  return consultorios.find(c => c.id_consultorio === id_consultorio);
}

// Obtener asignaciones de consultorio por usuario-sucursal y día
export function getAsignacionesConsultorioByUsuarioSucursal(
  id_usuario_sucursal: number,
  dia_semana: DiaSemana
): AsignacionConsultorio[] {
  const hoy = new Date().toISOString().split('T')[0];
  
  return asignacionesConsultorio.filter(a => 
    a.id_usuario_sucursal === id_usuario_sucursal &&
    a.dia_semana === dia_semana &&
    a.estado === 'activo' &&
    (!a.fecha_vigencia_hasta || a.fecha_vigencia_hasta >= hoy)
  );
}

// Obtener consultorios disponibles para un usuario en una fecha y hora específicas
export function getConsultoriosDisponibles(
  id_usuario_sucursal: number,
  fecha: string,
  hora_inicio: string,
  hora_fin: string
): Consultorio[] {
  const dia_semana = getDiaSemana(fecha);
  const asignaciones = getAsignacionesConsultorioByUsuarioSucursal(id_usuario_sucursal, dia_semana);
  
  // Filtrar asignaciones que cubren el horario solicitado
  const asignacionesValidas = asignaciones.filter(asig => {
    const asigInicio = horaAMinutos(asig.hora_inicio);
    const asigFin = horaAMinutos(asig.hora_fin);
    const solicitudInicio = horaAMinutos(hora_inicio);
    const solicitudFin = horaAMinutos(hora_fin);
    
    // La asignación debe cubrir completamente el horario solicitado
    return asigInicio <= solicitudInicio && asigFin >= solicitudFin;
  });
  
  // Obtener los consultorios de las asignaciones válidas
  const consultoriosAsignados = asignacionesValidas
    .map(a => getConsultorioById(a.id_consultorio))
    .filter(c => c !== undefined) as Consultorio[];
  
  // Verificar disponibilidad de cada consultorio (no debe tener citas en conflicto)
  return consultoriosAsignados.filter(consultorio => {
    return isConsultorioDisponible(consultorio.id_consultorio, fecha, hora_inicio, hora_fin);
  });
}

// Verificar si un consultorio está disponible en una fecha y hora específicas
export function isConsultorioDisponible(
  id_consultorio: number,
  fecha: string,
  hora_inicio: string,
  hora_fin: string
): boolean {
  const consultorio = getConsultorioById(id_consultorio);
  
  // Si el consultorio no existe o está en mantenimiento, no está disponible
  if (!consultorio || consultorio.estado === 'mantenimiento') {
    return false;
  }
  
  // Verificar si hay citas activas en el consultorio en ese horario
  const inicioMinutos = horaAMinutos(hora_inicio);
  const finMinutos = horaAMinutos(hora_fin);
  
  const citasEnConsultorio = citas.filter(c =>
    c.id_consultorio === id_consultorio &&
    c.fecha_cita === fecha &&
    c.estado_cita !== 'cancelada' &&
    c.estado_cita !== 'no_asistio'
  );
  
  for (const cita of citasEnConsultorio) {
    const citaInicio = horaAMinutos(cita.hora_inicio);
    const citaFin = horaAMinutos(cita.hora_fin);
    
    // Si hay superposición, el consultorio no está disponible
    if (inicioMinutos < citaFin && finMinutos > citaInicio) {
      return false;
    }
  }
  
  return true;
}