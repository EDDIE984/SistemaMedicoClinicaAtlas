import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { type AlertaSignoVital, RANGOS_SIGNOS_VITALES } from '../lib/pacientesService';

interface AlertasSignosVitalesPanelProps {
  alertas: AlertaSignoVital[];
}

export function AlertasSignosVitalesPanel({ alertas }: AlertasSignosVitalesPanelProps) {
  if (alertas.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Todos los valores en rango normal</span>
      </div>
    );
  }

  const tieneCriticos = alertas.some(a => a.nivel === 'critico');
  const panelColor = tieneCriticos
    ? 'border-red-300 bg-red-50'
    : 'border-yellow-300 bg-yellow-50';
  const headerColor = tieneCriticos ? 'text-red-700' : 'text-yellow-700';
  const iconColor = tieneCriticos ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className={`rounded-lg border ${panelColor} p-3`}>
      <div className={`flex items-center gap-2 font-semibold text-sm ${headerColor} mb-2`}>
        <AlertTriangle className={`h-4 w-4 shrink-0 ${iconColor}`} />
        <span>
          {alertas.length === 1
            ? '1 valor fuera de rango'
            : `${alertas.length} valores fuera de rango`}
        </span>
      </div>

      <div className="space-y-1.5">
        {alertas.map((alerta, idx) => {
          const rango = RANGOS_SIGNOS_VITALES[alerta.campo];
          const esCritico = alerta.nivel === 'critico';
          const valorNum = alerta.valor ?? 0;
          const esBajo = rango ? valorNum < rango.normalMin : false;

          return (
            <div
              key={idx}
              className={`flex items-start gap-2 rounded px-2 py-1.5 text-xs ${
                esCritico ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <XCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${esCritico ? 'text-red-500' : 'text-yellow-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {rango?.etiqueta ?? alerta.campo}:{' '}
                  <span className="font-bold">
                    {alerta.valor} {rango?.unidad}
                  </span>
                  <span
                    className={`ml-1.5 rounded px-1 py-0.5 text-[10px] font-bold uppercase ${
                      esCritico ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {esCritico ? 'CRÍTICO' : 'ADVERTENCIA'} — {esBajo ? 'BAJO' : 'ALTO'}
                  </span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Rango normal:{' '}
                  {rango?.soloMin
                    ? `≥${alerta.rango_min} ${rango.unidad}`
                    : `${alerta.rango_min}–${alerta.rango_max} ${rango?.unidad ?? ''}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
