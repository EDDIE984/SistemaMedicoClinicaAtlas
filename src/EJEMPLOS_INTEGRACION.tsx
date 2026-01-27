// ============================================
// EJEMPLOS DE INTEGRACIÓN DEL SISTEMA DE SLOTS
// ============================================

// EJEMPLO 1: Componente Simple de Agendamiento
// ============================================

import { useState } from 'react';
import { SelectorSlotsDisponibles } from './components/agenda/SelectorSlotsDisponibles';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { toast } from 'sonner@2.0.3';

export function AgendamientoSimple() {
  const [paciente, setPaciente] = useState({ id: 1, nombre: 'Juan Pérez' });
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);

  const handleCrearCita = async () => {
    if (!slotSeleccionado) {
      toast.error('Selecciona un horario');
      return;
    }

    try {
      // Llamar a tu servicio de citas
      await crearCita({
        id_paciente: paciente.id,
        id_asignacion: slotSeleccionado.idAsignacion,
        fecha_cita: slotSeleccionado.fecha,
        hora_inicio: slotSeleccionado.horaInicio,
        hora_fin: slotSeleccionado.horaFin,
        tipo_cita: 'consulta',
        estado_cita: 'agendada'
      });

      toast.success('Cita agendada exitosamente');
      setSlotSeleccionado(null);
    } catch (error) {
      toast.error('Error al agendar cita');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2>Paciente: {paciente.nombre}</h2>
      </Card>

      <SelectorSlotsDisponibles 
        onSlotSeleccionado={setSlotSeleccionado}
      />

      {slotSeleccionado && (
        <Button onClick={handleCrearCita}>
          Confirmar Cita para {slotSeleccionado.fecha} a las {slotSeleccionado.horaInicio}
        </Button>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 2: Integración con Servicio Directo
// ============================================

import { obtenerSlotsDisponibles } from './lib/slotsService';

async function ejemploBuscarSlots() {
  // Buscar todos los slots del lunes 9 de diciembre
  const resultado = await obtenerSlotsDisponibles('2024-12-09');
  
  console.log('Día:', resultado.dia_semana);
  console.log('Total horarios:', resultado.total_horarios);
  
  resultado.slots_disponibles.forEach(horario => {
    console.log(`\n${horario.medico.nombre_completo}`);
    console.log(`${horario.consultorio.nombre}`);
    console.log(`Disponibles: ${horario.slots_disponibles}/${horario.total_slots}`);
    
    horario.slots.forEach(slot => {
      console.log(`  - ${slot.hora_inicio} a ${slot.hora_fin}`);
    });
  });
}

// ============================================
// EJEMPLO 3: Selector de Médico con Slots
// ============================================

import { useEffect, useState } from 'react';
import { obtenerMedicosDisponibles } from './lib/slotsService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

export function SelectorMedicoConDisponibilidad() {
  const [fecha, setFecha] = useState('');
  const [medicosDisponibles, setMedicosDisponibles] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  useEffect(() => {
    if (fecha) {
      buscarMedicos();
    }
  }, [fecha]);

  const buscarMedicos = async () => {
    try {
      const medicos = await obtenerMedicosDisponibles(fecha);
      setMedicosDisponibles(medicos);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      {medicosDisponibles.length > 0 && (
        <Select onValueChange={(value) => setMedicoSeleccionado(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un médico" />
          </SelectTrigger>
          <SelectContent>
            {medicosDisponibles.map((medico) => (
              <SelectItem key={medico.id_usuario} value={medico.id_usuario.toString()}>
                {medico.nombre_completo} ({medico.slots_disponibles} horarios)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 4: Mostrar Solo Horarios de un Médico
// ============================================

import { obtenerHorariosMedico } from './lib/slotsService';

export function HorariosMedicoEspecifico({ idMedico, fecha }) {
  const [horarios, setHorarios] = useState([]);

  useEffect(() => {
    async function cargar() {
      const data = await obtenerHorariosMedico(fecha, idMedico);
      setHorarios(data);
    }
    cargar();
  }, [fecha, idMedico]);

  return (
    <div>
      {horarios.map((horario) => (
        <div key={horario.id_asignacion}>
          <h3>{horario.consultorio.nombre}</h3>
          <div className="grid grid-cols-4 gap-2">
            {horario.slots.map((slot) => (
              <button key={slot.hora_inicio}>
                {slot.hora_inicio}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EJEMPLO 5: Verificar Disponibilidad Antes de Agendar
// ============================================

import { verificarSlotDisponible } from './lib/slotsService';

async function agendarConVerificacion(fecha, idAsignacion, horaInicio) {
  // Verificar que el slot siga disponible antes de crear la cita
  const disponible = await verificarSlotDisponible(fecha, idAsignacion, horaInicio);
  
  if (!disponible) {
    toast.error('Este horario ya no está disponible');
    return;
  }

  // Proceder con el agendamiento
  await crearCita({
    fecha_cita: fecha,
    id_asignacion: idAsignacion,
    hora_inicio: horaInicio,
    // ... otros campos
  });

  toast.success('Cita agendada');
}

// ============================================
// EJEMPLO 6: Vista de Calendario Completo
// ============================================

export function CalendarioSemanal() {
  const [semana, setSemana] = useState([
    '2024-12-09', // Lunes
    '2024-12-10', // Martes
    '2024-12-11', // Miércoles
    '2024-12-12', // Jueves
    '2024-12-13', // Viernes
  ]);

  const [slotsPorDia, setSlotsPorDia] = useState({});

  useEffect(() => {
    async function cargarSemana() {
      const resultados = {};
      
      for (const fecha of semana) {
        const slots = await obtenerSlotsDisponibles(fecha);
        resultados[fecha] = slots;
      }
      
      setSlotsPorDia(resultados);
    }
    
    cargarSemana();
  }, [semana]);

  return (
    <div className="grid grid-cols-5 gap-4">
      {semana.map((fecha) => (
        <div key={fecha}>
          <h3>{fecha}</h3>
          {slotsPorDia[fecha]?.slots_disponibles.map((horario) => (
            <div key={horario.id_asignacion}>
              <p>{horario.medico.nombre_completo}</p>
              <p>{horario.slots_disponibles} slots</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// EJEMPLO 7: Filtrar por Sucursal
// ============================================

export function SelectorPorSucursal() {
  const [sucursal, setSucursal] = useState(1);
  const [fecha, setFecha] = useState('2024-12-09');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    async function cargar() {
      const resultado = await obtenerSlotsDisponibles(
        fecha,
        sucursal  // Filtrar por sucursal
      );
      setSlots(resultado.slots_disponibles);
    }
    cargar();
  }, [fecha, sucursal]);

  return (
    <div>
      <select value={sucursal} onChange={(e) => setSucursal(Number(e.target.value))}>
        <option value={1}>Sucursal Centro</option>
        <option value={2}>Sucursal Norte</option>
      </select>

      {/* Mostrar slots... */}
    </div>
  );
}

// ============================================
// EJEMPLO 8: Reagendar Cita
// ============================================

async function reagendarCita(idCitaActual, nuevaFecha, nuevoIdAsignacion, nuevaHora) {
  try {
    // 1. Verificar que el nuevo slot esté disponible
    const disponible = await verificarSlotDisponible(nuevaFecha, nuevoIdAsignacion, nuevaHora);
    
    if (!disponible) {
      toast.error('El horario seleccionado ya no está disponible');
      return false;
    }

    // 2. Cancelar cita actual
    await actualizarCita(idCitaActual, { estado_cita: 'cancelada' });

    // 3. Crear nueva cita
    await crearCita({
      fecha_cita: nuevaFecha,
      id_asignacion: nuevoIdAsignacion,
      hora_inicio: nuevaHora,
      // ... otros campos
    });

    toast.success('Cita reagendada exitosamente');
    return true;
  } catch (error) {
    toast.error('Error al reagendar');
    return false;
  }
}

// ============================================
// EJEMPLO 9: Estadísticas de Disponibilidad
// ============================================

async function obtenerEstadisticasDisponibilidad(fecha) {
  const resultado = await obtenerSlotsDisponibles(fecha);
  
  const stats = {
    total_medicos: resultado.total_horarios,
    total_slots: 0,
    slots_disponibles: 0,
    slots_ocupados: 0,
    porcentaje_ocupacion: 0
  };

  resultado.slots_disponibles.forEach(horario => {
    stats.total_slots += horario.total_slots;
    stats.slots_disponibles += horario.slots_disponibles;
    stats.slots_ocupados += horario.slots_ocupados;
  });

  if (stats.total_slots > 0) {
    stats.porcentaje_ocupacion = (stats.slots_ocupados / stats.total_slots * 100).toFixed(1);
  }

  return stats;
}

// Uso:
const stats = await obtenerEstadisticasDisponibilidad('2024-12-09');
console.log(`Ocupación: ${stats.porcentaje_ocupacion}%`);

// ============================================
// EJEMPLO 10: Hook Personalizado
// ============================================

import { useState, useEffect } from 'react';

function useSlotsDisponibles(fecha, idSucursal = null, idMedico = null) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fecha) return;

    setLoading(true);
    setError(null);

    obtenerSlotsDisponibles(fecha, idSucursal, idMedico)
      .then(resultado => {
        setSlots(resultado.slots_disponibles);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fecha, idSucursal, idMedico]);

  return { slots, loading, error };
}

// Uso del hook:
function MiComponente() {
  const { slots, loading, error } = useSlotsDisponibles('2024-12-09');

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {slots.map(slot => (
        <div key={slot.id_asignacion}>
          {/* Renderizar slots */}
        </div>
      ))}
    </div>
  );
}

// ============================================
// FUNCIONES AUXILIARES (Mock - implementar según tu sistema)
// ============================================

async function crearCita(datos) {
  // Implementar según tu servicio de citas
  const response = await fetch('/api/citas', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
  return response.json();
}

async function actualizarCita(id, datos) {
  // Implementar según tu servicio de citas
  const response = await fetch(`/api/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
  return response.json();
}
