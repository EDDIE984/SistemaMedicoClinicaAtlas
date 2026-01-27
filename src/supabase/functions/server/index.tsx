import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { generarSlots, filtrarSlotsDisponibles, getDiaSemana } from "./slots_utils.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3d193f8d/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// ENDPOINT: OBTENER SLOTS DISPONIBLES
// ============================================
app.get("/make-server-3d193f8d/agenda/slots-disponibles", async (c) => {
  try {
    const fecha = c.req.query("fecha"); // Formato: YYYY-MM-DD
    const idSucursal = c.req.query("id_sucursal");
    const idMedico = c.req.query("id_medico"); // Opcional

    // Validar parámetros requeridos
    if (!fecha) {
      return c.json({ error: "El parámetro 'fecha' es requerido" }, 400);
    }

    // Crear cliente de Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtener el día de la semana
    const diaSemana = getDiaSemana(fecha);

    // Query para obtener horarios (plantillas)
    let queryHorarios = supabase
      .from("asignacion_consultorio")
      .select(`
        id_asignacion,
        hora_inicio,
        hora_fin,
        duracion_consulta,
        estado,
        usuario_sucursal!inner(
          id_usuario,
          usuario!inner(
            id_usuario,
            nombre,
            apellido
          )
        ),
        consultorio!inner(
          id_consultorio,
          nombre,
          id_sucursal,
          sucursal(
            id_sucursal,
            nombre
          )
        )
      `)
      .eq("dia_semana", diaSemana)
      .eq("estado", "activo");

    // Filtrar por sucursal si se proporciona
    if (idSucursal) {
      queryHorarios = queryHorarios.eq("consultorio.id_sucursal", parseInt(idSucursal));
    }

    // Filtrar por médico si se proporciona
    if (idMedico) {
      queryHorarios = queryHorarios.eq("usuario_sucursal.id_usuario", parseInt(idMedico));
    }

    const { data: horarios, error: errorHorarios } = await queryHorarios;

    if (errorHorarios) {
      console.error("Error al obtener horarios:", errorHorarios);
      return c.json({ error: "Error al obtener horarios: " + errorHorarios.message }, 500);
    }

    if (!horarios || horarios.length === 0) {
      return c.json({
        fecha,
        dia_semana: diaSemana,
        slots_disponibles: [],
        mensaje: `No hay horarios configurados para ${diaSemana}`
      });
    }

    // Obtener citas ocupadas para esa fecha
    let queryCitas = supabase
      .from("cita")
      .select("id_asignacion, hora_inicio, hora_fin, estado_cita")
      .eq("fecha_cita", fecha)
      .not("estado_cita", "in", '("cancelada","no_asistio")');

    const { data: citasOcupadas, error: errorCitas } = await queryCitas;

    if (errorCitas) {
      console.error("Error al obtener citas:", errorCitas);
      return c.json({ error: "Error al obtener citas: " + errorCitas.message }, 500);
    }

    // Generar slots disponibles para cada horario
    const slotsDisponibles = horarios.map((horario: any) => {
      // Generar todos los slots posibles
      const todosLosSlots = generarSlots(
        horario.hora_inicio,
        horario.hora_fin,
        horario.duracion_consulta
      );

      // Filtrar citas que pertenecen a esta asignación
      const citasDeEsteHorario = (citasOcupadas || []).filter(
        (cita: any) => cita.id_asignacion === horario.id_asignacion
      );

      // Filtrar slots disponibles
      const slots = filtrarSlotsDisponibles(todosLosSlots, citasDeEsteHorario);

      return {
        id_asignacion: horario.id_asignacion,
        medico: {
          id_usuario: horario.usuario_sucursal.usuario.id_usuario,
          nombre: horario.usuario_sucursal.usuario.nombre,
          apellido: horario.usuario_sucursal.usuario.apellido,
          nombre_completo: `${horario.usuario_sucursal.usuario.nombre} ${horario.usuario_sucursal.usuario.apellido}`
        },
        consultorio: {
          id_consultorio: horario.consultorio.id_consultorio,
          nombre: horario.consultorio.nombre
        },
        sucursal: {
          id_sucursal: horario.consultorio.sucursal.id_sucursal,
          nombre: horario.consultorio.sucursal.nombre
        },
        horario_general: {
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          duracion_consulta: horario.duracion_consulta
        },
        slots: slots,
        total_slots: todosLosSlots.length,
        slots_disponibles: slots.length,
        slots_ocupados: todosLosSlots.length - slots.length
      };
    });

    return c.json({
      fecha,
      dia_semana: diaSemana,
      total_horarios: horarios.length,
      slots_disponibles: slotsDisponibles
    });

  } catch (error: any) {
    console.error("Error en endpoint slots-disponibles:", error);
    return c.json({
      error: "Error interno del servidor",
      detalles: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);