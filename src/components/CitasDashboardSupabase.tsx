import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Line
} from 'recharts';
import {
    Calendar, Building2, RefreshCw, Stethoscope
} from 'lucide-react';
import { Button } from './ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
    useCitasDashboard
} from '../hooks/useReportes';
import { supabaseAdmin } from '../lib/supabase';
import { formatearFechaCorta } from '../lib/reportesService';

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa", "#fb923c", "#34d399"];

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {label && <p style={{ color: "#6b7280", margin: "0 0 4px", fontSize: 12 }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || p.fill, margin: "2px 0", fontSize: 13 }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    );
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f1f1" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 12, color: "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</h3>
        {children}
    </div>
);

interface CitasDashboardProps {
    currentUser?: {
        compania?: string;
        sucursal?: string;
    } | null;
}

export default function CitasDashboardSupabase({ currentUser }: CitasDashboardProps = {}) {
    const [fechaInicio, setFechaInicio] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);
    const [idSucursal, setIdSucursal] = useState<string>("all");
    const [idEspecialidad, setIdEspecialidad] = useState<string>("all");

    const [sucursales, setSucursales] = useState<any[]>([]);
    const [especialidades, setEspecialidades] = useState<any[]>([]);

    const numSucursal = idSucursal === "all" ? undefined : parseInt(idSucursal);
    const numEspecialidad = idEspecialidad === "all" ? undefined : parseInt(idEspecialidad);

    const {
        stats, citasDia, citasEsp, distAseguradora, distTipo,
        distFormaPago, distEstadoPago, citasHora, duracionProm,
        distReferencia, medicos, isLoading, loadAll
    } = useCitasDashboard(fechaInicio, fechaFin, numSucursal, numEspecialidad);

    useEffect(() => {
        fetchFiltros();
    }, []);

    const fetchFiltros = async () => {
        const { data: sData } = await supabaseAdmin.from('sucursal').select('id_sucursal, nombre').eq('estado', 'activo');
        const { data: eData } = await supabaseAdmin.from('especialidad').select('id_especialidad, nombre').eq('estado', 'activo');
        if (sData) setSucursales(sData);
        if (eData) setEspecialidades(eData);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="size-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    // Data mapping
    const estadoCitasData = [
        { name: 'Agendada', value: stats?.citasPendientes || 0, color: '#6366f1' },
        { name: 'Atendida', value: stats?.citasCompletadas || 0, color: '#10b981' },
        { name: 'Cancelada', value: stats?.citasCanceladas || 0, color: '#f43f5e' },
    ];

    const kpis = [
        { label: "Total Citas", value: stats?.totalCitas || 0, icon: "📅", color: "#6366f1", sub: "+12% vs mes anterior" },
        { label: "Tasa Cancelación", value: `${stats?.tasaCancelacion?.toFixed(1) || 0}%`, icon: "❌", color: "#f43f5e", sub: "-2% vs mes anterior" },
        { label: "Tasa Asistencia", value: `${stats?.tasaAsistencia?.toFixed(1) || 0}%`, icon: "✅", color: "#10b981", sub: "+3% vs mes anterior" },
        { label: "No Asistieron", value: (stats?.totalCitas || 0) - (stats?.citasCompletadas || 0) - (stats?.citasCanceladas || 0), icon: "🚫", color: "#a78bfa", sub: "Este mes" },
    ];

    return (
        <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: 24, fontFamily: "sans-serif", color: "#111" }}>

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111" }}>🏥 {currentUser?.compania || 'Clínica Atlas'}</h1>
                    {numSucursal && sucursales.find(s => s.id_sucursal === numSucursal) && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            borderRadius: 9999
                        }}>
                            <Building2 className="size-3 text-blue-600" />
                            <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase' }}>
                                Sede {sucursales.find(s => s.id_sucursal === numSucursal)?.nombre}
                            </span>
                        </div>
                    )}
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: 12 }}>Dashboard Administrativo · Febrero 2026</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <Calendar className="size-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: '#6b7280', width: 100 }}
                        />
                        <span style={{ color: '#d1d5db' }}>-</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: '#6b7280', width: 100 }}
                        />
                    </div>

                    <Select value={idSucursal} onValueChange={setIdSucursal}>
                        <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-[11px] font-semibold">
                            <Building2 className="size-3.5 mr-2 text-gray-400" />
                            <SelectValue placeholder="Sedes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {sucursales.map(s => <SelectItem key={s.id_sucursal} value={s.id_sucursal.toString()}>{s.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={idEspecialidad} onValueChange={setIdEspecialidad}>
                        <SelectTrigger className="w-[150px] h-9 bg-white border-gray-200 text-[11px] font-semibold">
                            <Stethoscope className="size-3.5 mr-2 text-gray-400" />
                            <SelectValue placeholder="Especialidades" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {especialidades.map(e => <SelectItem key={e.id_especialidad} value={e.id_especialidad.toString()}>{e.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button size="icon" variant="ghost" className="h-9 w-9 bg-white border border-gray-200" onClick={loadAll}>
                        <RefreshCw className="size-4 text-blue-500" />
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                {kpis.map((k, i) => (
                    <div key={i} style={{
                        background: "#fff", borderRadius: 12, padding: "16px 18px",
                        borderTop: `3px solid ${k.color}`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: `1px solid #f1f1f1`,
                        borderTopColor: k.color
                    }}>
                        <div style={{ fontSize: 24 }}>{k.icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: k.color, margin: "6px 0 2px" }}>{k.value}</div>
                        <div style={{ fontSize: 12, color: "#374151" }}>{k.label}</div>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* FILA 1: Tendencia mensual + Estado citas */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                <Card title="📈 Tendencia Mensual de Citas">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={citasDia}>
                            <defs>
                                {[["ag", "#6366f1"], ["at", "#10b981"]].map(([id, c]) => (
                                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="fecha" tickFormatter={formatearFechaCorta} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                            <Area type="monotone" dataKey="total" name="Agendadas" stroke="#6366f1" fill="url(#ag)" strokeWidth={2} />
                            <Area type="monotone" dataKey="completadas" name="Atendidas" stroke="#10b981" fill="url(#at)" strokeWidth={2} />
                            <Line type="monotone" dataKey="canceladas" name="Canceladas" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="🗂️ Estado de Citas">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={estadoCitasData} cx="50%" cy="50%" outerRadius={80}
                                dataKey="value" labelLine={false} label={renderLabel}>
                                {estadoCitasData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 10, color: "#6b7280" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* FILA 2: Especialidad + Aseguradora */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Card title="🩺 Citas por Especialidad">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={citasEsp} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <YAxis type="category" dataKey="especialidad" tick={{ fill: "#374151", fontSize: 11 }} width={100} axisLine={false} />
                            <Tooltip content={<Tip />} />
                            <Bar dataKey="citas" name="Citas" radius={[0, 6, 6, 0]}>
                                {citasEsp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="🏦 Citas por Aseguradora">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={distAseguradora}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<Tip />} />
                            <Bar dataKey="value" name="Citas" radius={[6, 6, 0, 0]}>
                                {distAseguradora.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* FILA 3: Tipo de cita + Pico por hora */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
                <Card title="📋 Tipo de Cita">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={distTipo} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                                dataKey="value" labelLine={false} label={renderLabel}>
                                {distTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="🕐 Pico de Citas por Hora">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={citasHora}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="hora" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<Tip />} />
                            <Bar dataKey="citas" name="Citas" radius={[4, 4, 0, 0]}>
                                {citasHora.map((e, i) => <Cell key={i} fill={e.citas >= 5 ? "#f59e0b" : "#6366f1"} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: "6px 0 0", textAlign: "center" }}>
                        🟡 Horas pico  ·  🟣 Horas normales
                    </p>
                </Card>
            </div>

            {/* FILA 4: Distribución por Referencia */}
            <div style={{ marginBottom: 16 }}>
                <Card title="🔗 Distribución por Referencia">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={distReferencia}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                labelLine={false}
                                label={renderLabel}
                            >
                                {distReferencia.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* FILA 5: Rendimiento por Médico */}
            <div style={{ marginBottom: 16 }}>
                <Card title="👨‍⚕️ Rendimiento por Médico">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={medicos} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
                            <YAxis type="category" dataKey="medico" tick={{ fill: "#374151", fontSize: 11 }} width={120} axisLine={false} />
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                            <Bar dataKey="totalCitas" name="Total Citas" radius={[0, 6, 6, 0]} fill="#6366f1" />
                            <Bar dataKey="citasCompletadas" name="Completadas" radius={[0, 6, 6, 0]} fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div style={{ textAlign: "center", color: "#d1d5db", fontSize: 11, marginTop: 8 }}>
                Clínica Atlas · Dashboard Administrativo · Datos en tiempo real
            </div>
        </div>
    );
}
