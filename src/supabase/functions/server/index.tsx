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

    if (!fecha) {
      return c.json({ error: "El parámetro 'fecha' es requerido" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const diaSemana = getDiaSemana(fecha);

    // ── 1. ESPECIALISTAS: usar asignacion_consultorio ──────────────────────
    let queryEspecialistas = supabase
      .from("asignacion_consultorio")
      .select(`
        id_asignacion,
        hora_inicio,
        hora_fin,
        duracion_consulta,
        estado,
        usuario_sucursal!inner(
          id_usuario,
          cargo,
          usuario!inner(id_usuario, nombre, apellido)
        ),
        consultorio!inner(
          id_consultorio,
          nombre,
          id_sucursal,
          sucursal(id_sucursal, nombre)
        )
      `)
      .eq("dia_semana", diaSemana)
      .eq("estado", "activo")
      .eq("usuario_sucursal.cargo", "MEDICO ESPECIALISTA");

    if (idSucursal) {
      queryEspecialistas = queryEspecialistas.eq("consultorio.id_sucursal", parseInt(idSucursal));
    }
    if (idMedico) {
      queryEspecialistas = queryEspecialistas.eq("usuario_sucursal.id_usuario", parseInt(idMedico));
    }

    const { data: horariosEspecialistas, error: errorEspecialistas } = await queryEspecialistas;
    if (errorEspecialistas) {
      console.error("Error horarios especialistas:", errorEspecialistas);
      return c.json({ error: "Error al obtener horarios: " + errorEspecialistas.message }, 500);
    }

    // ── 2. SUPLENTES Y RESPALDO: usar planificacion_horario_suplente ───────
    let querySuplentes = supabase
      .from("planificacion_horario_suplente")
      .select(`
        id_planificacion,
        hora_inicio,
        hora_fin,
        duracion_consulta,
        estado,
        usuario_sucursal!inner(
          id_usuario,
          cargo,
          usuario!inner(id_usuario, nombre, apellido)
        ),
        consultorio!inner(
          id_consultorio,
          nombre,
          id_sucursal,
          sucursal(id_sucursal, nombre)
        )
      `)
      .eq("dia_semana", diaSemana)
      .eq("estado", "activo")
      .lte("fecha_inicio", fecha)
      .gte("fecha_fin", fecha);

    if (idSucursal) {
      querySuplentes = querySuplentes.eq("consultorio.id_sucursal", parseInt(idSucursal));
    }
    if (idMedico) {
      querySuplentes = querySuplentes.eq("usuario_sucursal.id_usuario", parseInt(idMedico));
    }

    const { data: horariosSuplentes, error: errorSuplentes } = await querySuplentes;
    if (errorSuplentes) {
      console.error("Error horarios suplentes:", errorSuplentes);
      return c.json({ error: "Error al obtener planificaciones: " + errorSuplentes.message }, 500);
    }

    // ── 3. Combinar horarios ───────────────────────────────────────────────
    const horariosEspecialistasNorm = (horariosEspecialistas || []).map((h: any) => ({
      ...h,
      _source: "asignacion_consultorio",
      _ref_id: h.id_asignacion,
    }));

    const horariosSuplentesNorm = (horariosSuplentes || []).map((h: any) => ({
      ...h,
      id_asignacion: null,
      _source: "planificacion_horario_suplente",
      _ref_id: h.id_planificacion,
    }));

    const todosHorarios = [...horariosEspecialistasNorm, ...horariosSuplentesNorm];

    if (todosHorarios.length === 0) {
      return c.json({
        fecha,
        dia_semana: diaSemana,
        slots_disponibles: [],
        mensaje: `No hay horarios configurados para el día ${diaSemana}`
      });
    }

    // ── 4. Citas ocupadas para esa fecha ──────────────────────────────────
    const { data: citasOcupadas, error: errorCitas } = await supabase
      .from("cita")
      .select("id_asignacion, hora_inicio, hora_fin, estado_cita")
      .eq("fecha_cita", fecha)
      .not("estado_cita", "in", '("cancelada","no_asistio")');

    if (errorCitas) {
      console.error("Error al obtener citas:", errorCitas);
      return c.json({ error: "Error al obtener citas: " + errorCitas.message }, 500);
    }

    // ── 5. Generar slots ──────────────────────────────────────────────────
    const slotsDisponibles = todosHorarios.map((horario: any) => {
      const todosLosSlots = generarSlots(
        horario.hora_inicio,
        horario.hora_fin,
        horario.duracion_consulta
      );

      // Para especialistas: filtrar por id_asignacion
      // Para suplentes: filtrar por solapamiento de hora en esa fecha (sin id_asignacion)
      const citasDeEsteHorario = (citasOcupadas || []).filter((cita: any) => {
        if (horario._source === "asignacion_consultorio") {
          return cita.id_asignacion === horario.id_asignacion;
        }
        // Suplentes: citas de esa fecha que NO tienen id_asignacion (agendadas para suplentes)
        return cita.id_asignacion === null;
      });

      const slots = filtrarSlotsDisponibles(todosLosSlots, citasDeEsteHorario);

      return {
        id_asignacion: horario._source === "asignacion_consultorio" ? horario.id_asignacion : null,
        id_planificacion: horario._source === "planificacion_horario_suplente" ? horario.id_planificacion : null,
        fuente_horario: horario._source,
        medico: {
          id_usuario: horario.usuario_sucursal.usuario.id_usuario,
          nombre: horario.usuario_sucursal.usuario.nombre,
          apellido: horario.usuario_sucursal.usuario.apellido,
          nombre_completo: `${horario.usuario_sucursal.usuario.nombre} ${horario.usuario_sucursal.usuario.apellido}`,
          cargo: horario.usuario_sucursal.cargo,
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
      total_horarios: todosHorarios.length,
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