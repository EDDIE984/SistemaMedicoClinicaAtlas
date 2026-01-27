// Componente helper para mostrar credenciales de prueba
import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from './ui/button';

export function LoginHelper() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="Ver credenciales de prueba"
      >
        <Info className="size-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="size-5 text-blue-600" />
          <h3 className="font-semibold">Credenciales de Prueba</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-xs text-blue-800 mb-2">👨‍⚕️ Médico (Dr. García)</p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Email:</span> juan.garcia@ejemplo.com
          </p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Pass:</span> pass123
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-xs text-green-800 mb-2">👩‍💼 Recepcionista (María López)</p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Email:</span> maria.lopez@ejemplo.com
          </p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Pass:</span> pass123
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <p className="text-xs text-purple-800 mb-2">👨‍💼 Administrador (Carlos Ruiz)</p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Email:</span> carlos.ruiz@ejemplo.com
          </p>
          <p className="font-mono text-xs">
            <span className="text-gray-600">Pass:</span> pass123
          </p>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            ✅ Datos cargados desde <span className="font-semibold">Supabase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
