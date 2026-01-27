import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { citas, pacientes, usuarios, sucursales, usuariosSucursales } from '../data/mockData';
import type { EstadoCita, TipoCita, EstadoPago } from '../data/mockData';

export function ReportesView() {
  const [medicoFilter, setMedicoFilter] = useState('todos');
  const [sucursalFilter, setSucursalFilter] = useState('todos');
  const [periodoFilter, setPeriodoFilter] = useState('mes-actual');

  // Obtener médicos disponibles
  const medicos = useMemo(() => {
    return usuarios
      .filter(u => u.tipo_usuario === 'medico' && u.estado === 'activo')
      .map(u => ({
        id: u.id_usuario,
        nombre: `Dr. ${u.nombre} ${u.apellido}`
      }));
  }, []);

  // Filtrar citas según los filtros aplicados
  const citasFiltradas = useMemo(() => {
    let resultado = [...citas];

    // Filtrar por médico
    if (medicoFilter !== 'todos') {
      const idMedico = parseInt(medicoFilter);
      const asignacionesMedico = usuariosSucursales
        .filter(us => us.id_usuario === idMedico)
        .map(us => us.id_usuario_sucursal);
      resultado = resultado.filter(c => asignacionesMedico.includes(c.id_usuario_sucursal));
    }

    // Filtrar por sucursal
    if (sucursalFilter !== 'todos') {
      resultado = resultado.filter(c => c.id_sucursal === parseInt(sucursalFilter));
    }

    // Filtrar por periodo
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    resultado = resultado.filter(c => {
      const fechaCita = new Date(c.fecha_cita);
      switch (periodoFilter) {
        case 'mes-actual':
          return fechaCita >= inicioMes;
        case 'mes-anterior':
          return fechaCita >= inicioMesPasado && fechaCita <= finMesPasado;
        case 'anio-actual':
          return fechaCita >= inicioAnio;
        case 'todos':
          return true;
        default:
          return true;
      }
    });

    return resultado;
  }, [medicoFilter, sucursalFilter, periodoFilter]);

  // MÉTRICA 1: Citas por Estado
  const citasPorEstado = useMemo(() => {
    const estados: Record<EstadoCita, number> = {
      agendada: 0,
      confirmada: 0,
      en_atencion: 0,
      atendida: 0,
      cancelada: 0,
      no_asistio: 0
    };

    citasFiltradas.forEach(c => {
      estados[c.estado_cita]++;
    });

    return [
      { name: 'Agendada', value: estados.agendada, color: '#3b82f6' },
      { name: 'Confirmada', value: estados.confirmada, color: '#10b981' },
      { name: 'En Atención', value: estados.en_atencion, color: '#f59e0b' },
      { name: 'Atendida', value: estados.atendida, color: '#8b5cf6' },
      { name: 'Cancelada', value: estados.cancelada, color: '#ef4444' },
      { name: 'No Asistió', value: estados.no_asistio, color: '#6b7280' }
    ];
  }, [citasFiltradas]);

  // MÉTRICA 2: Ingresos por Estado de Pago
  const ingresosPorEstado = useMemo(() => {
    const estados: Record<EstadoPago, number> = {
      pendiente: 0,
      pagado: 0,
      parcial: 0
    };

    citasFiltradas.forEach(c => {
      if (c.estado_cita === 'atendida') {
        estados[c.estado_pago] += c.precio_cita;
      }
    });

    return [
      { name: 'Pendiente', value: estados.pendiente, color: '#ef4444' },
      { name: 'Pagado', value: estados.pagado, color: '#10b981' },
      { name: 'Parcial', value: estados.parcial, color: '#f59e0b' }
    ];
  }, [citasFiltradas]);

  // MÉTRICA 3: Citas por Tipo
  const citasPorTipo = useMemo(() => {
    const tipos: Record<TipoCita, number> = {
      consulta: 0,
      control: 0,
      emergencia: 0,
      primera_vez: 0
    };

    citasFiltradas.forEach(c => {
      tipos[c.tipo_cita]++;
    });

    return [
      { name: 'Consulta', value: tipos.consulta },
      { name: 'Control', value: tipos.control },
      { name: 'Emergencia', value: tipos.emergencia },
      { name: 'Primera Vez', value: tipos.primera_vez }
    ];
  }, [citasFiltradas]);

  // MÉTRICA 4: Consultas por Médico
  const consultasPorMedico = useMemo(() => {
    const porMedico: Record<string, number> = {};

    citasFiltradas
      .filter(c => c.estado_cita === 'atendida')
      .forEach(c => {
        const asignacion = usuariosSucursales.find(us => us.id_usuario_sucursal === c.id_usuario_sucursal);
        if (asignacion) {
          const medico = usuarios.find(u => u.id_usuario === asignacion.id_usuario);
          if (medico) {
            const nombre = `Dr. ${medico.apellido}`;
            porMedico[nombre] = (porMedico[nombre] || 0) + 1;
          }
        }
      });

    return Object.entries(porMedico)
      .map(([name, consultas]) => ({ name, consultas }))
      .sort((a, b) => b.consultas - a.consultas);
  }, [citasFiltradas]);

  // MÉTRICA 5: Pacientes por Género
  const pacientesPorGenero = useMemo(() => {
    const generos = {
      M: 0,
      F: 0,
      Otro: 0
    };

    pacientes
      .filter(p => p.estado === 'activo')
      .forEach(p => {
        generos[p.sexo]++;
      });

    return [
      { name: 'Masculino', value: generos.M, color: '#3b82f6' },
      { name: 'Femenino', value: generos.F, color: '#ec4899' },
      { name: 'Otro', value: generos.Otro, color: '#8b5cf6' }
    ];
  }, []);

  // MÉTRICA 6: Ingresos Totales
  const ingresosTotales = useMemo(() => {
    const totales = {
      total: 0,
      pagado: 0,
      pendiente: 0,
      parcial: 0
    };

    citasFiltradas
      .filter(c => c.estado_cita === 'atendida')
      .forEach(c => {
        totales.total += c.precio_cita;
        totales[c.estado_pago] += c.precio_cita;
      });

    return totales;
  }, [citasFiltradas]);

  // MÉTRICA 7: Citas por Día de la Semana
  const citasPorDia = useMemo(() => {
    const dias = {
      'Lun': 0,
      'Mar': 0,
      'Mié': 0,
      'Jue': 0,
      'Vie': 0,
      'Sáb': 0,
      'Dom': 0
    };

    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    citasFiltradas.forEach(c => {
      const fecha = new Date(c.fecha_cita);
      const dia = nombresDias[fecha.getDay()];
      if (dia && dias[dia as keyof typeof dias] !== undefined) {
        dias[dia as keyof typeof dias]++;
      }
    });

    return [
      { name: 'Lun', citas: dias['Lun'] },
      { name: 'Mar', citas: dias['Mar'] },
      { name: 'Mié', citas: dias['Mié'] },
      { name: 'Jue', citas: dias['Jue'] },
      { name: 'Vie', citas: dias['Vie'] },
      { name: 'Sáb', citas: dias['Sáb'] },
      { name: 'Dom', citas: dias['Dom'] }
    ];
  }, [citasFiltradas]);

  const handleRemoveFilters = () => {
    setMedicoFilter('todos');
    setSucursalFilter('todos');
    setPeriodoFilter('mes-actual');
  };

  const totalCitas = citasFiltradas.length;
  const totalPacientes = pacientes.filter(p => p.estado === 'activo').length;
  const citasAtendidas = citasFiltradas.filter(c => c.estado_cita === 'atendida').length;
  const tasaAsistencia = totalCitas > 0 ? ((citasAtendidas / totalCitas) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-2">Reportes y Estadísticas</h1>
        <p className="text-gray-600">Análisis completo del sistema de citas médicas</p>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Médico */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Médico:</span>
            <Select value={medicoFilter} onValueChange={setMedicoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los médicos</SelectItem>
                {medicos.map(m => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sucursal */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sucursal:</span>
            <Select value={sucursalFilter} onValueChange={setSucursalFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las sucursales</SelectItem>
                {sucursales.map(s => (
                  <SelectItem key={s.id_sucursal} value={s.id_sucursal.toString()}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periodo */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Periodo:</span>
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-actual">Mes actual</SelectItem>
                <SelectItem value="mes-anterior">Mes anterior</SelectItem>
                <SelectItem value="anio-actual">Año actual</SelectItem>
                <SelectItem value="todos">Todos los periodos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limpiar filtros */}
          <Button
            onClick={handleRemoveFilters}
            variant="ghost"
            size="icon"
            title="Limpiar filtros"
          >
            <X className="size-5" />
          </Button>
        </div>
      </Card>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Citas */}
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Citas</div>
          <div className="text-3xl mb-1">{totalCitas}</div>
          <div className="text-xs text-gray-500">Todas las citas del periodo</div>
        </Card>

        {/* Citas Atendidas */}
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Citas Atendidas</div>
          <div className="text-3xl mb-1">{citasAtendidas}</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {tasaAsistencia}% de asistencia
          </div>
        </Card>

        {/* Ingresos Totales */}
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Ingresos Totales</div>
          <div className="text-3xl mb-1">${ingresosTotales.total.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Pagado: ${ingresosTotales.pagado.toFixed(2)}
          </div>
        </Card>

        {/* Total Pacientes */}
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Pacientes Activos</div>
          <div className="text-3xl mb-1">{totalPacientes}</div>
          <div className="text-xs text-gray-500">Registrados en el sistema</div>
        </Card>
      </div>

      {/* Grid de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CITAS POR ESTADO */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">CITAS POR ESTADO</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={citasPorEstado.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {citasPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ESTADO DE PAGOS */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">ESTADO DE PAGOS (Citas Atendidas)</h3>
          <div className="space-y-3 mb-4">
            {ingresosPorEstado.map((estado) => (
              <div key={estado.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{estado.name}</span>
                  <span className="text-sm">${estado.value.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${ingresosTotales.total > 0 ? (estado.value / ingresosTotales.total) * 100 : 0}%`,
                      backgroundColor: estado.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm">Pendiente:</span>
              <span className="text-sm text-red-600">${ingresosTotales.pendiente.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* CITAS POR DÍA DE LA SEMANA */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">CITAS POR DÍA DE LA SEMANA</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={citasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="citas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* CITAS POR TIPO */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">CITAS POR TIPO</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={citasPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* CONSULTAS POR MÉDICO */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">CONSULTAS ATENDIDAS POR MÉDICO</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={consultasPorMedico} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="consultas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* PACIENTES POR GÉNERO */}
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-4">PACIENTES POR GÉNERO</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              {pacientesPorGenero.map((genero) => (
                <div key={genero.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: genero.color }}
                  />
                  <span className="text-sm">{genero.name}: {genero.value}</span>
                </div>
              ))}
            </div>
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pacientesPorGenero.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {pacientesPorGenero.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
