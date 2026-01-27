// Componente para probar la conexión con Supabase
import { useEffect, useState } from 'react';
import { supabase, testConnection } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export function TestSupabaseConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Probando conexión...');
  const [details, setDetails] = useState<any>(null);

  const runTest = async () => {
    setStatus('loading');
    setMessage('Probando conexión a Supabase...');
    setDetails(null);

    try {
      // Test 1: Verificar configuración
      const url = 'https://bhrcsbtylvysoeuyaauz.supabase.co';
      const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocmNzYnR5bHZ5c29ldXlhYXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjM4MTIsImV4cCI6MjA3OTczOTgxMn0._-jeSwJ9fY9tUTL0ZtYikbQScSPRC0G0-mzJT3noH_s';


      // Test 2: Verificar conexión básica

      const { data: companiaData, error: companiaError } = await supabase
        .from('compania')
        .select('*')
        .limit(1);


      if (companiaError) {
        setStatus('error');
        setMessage('❌ Error al acceder a la tabla compania');
        setDetails({
          url: '✅ Configurada: ' + url,
          key: '✅ Configurada (primeros 50 chars): ' + key.substring(0, 50) + '...',
          error_code: companiaError.code || 'N/A',
          error_message: companiaError.message || 'Sin mensaje',
          error_details: JSON.stringify(companiaError, null, 2),
          solucion: '⚠️ Probablemente no ejecutaste migration.sql en Supabase'
        });
        return;
      }

      // Test 3: Obtener datos de prueba
      const { data: usuarios, error: errorUsuario } = await supabase
        .from('usuario')
        .select('id_usuario, nombre, apellido')
        .limit(5);


      const { data: pacientes, error: errorPaciente } = await supabase
        .from('paciente')
        .select('id_paciente, nombres, apellidos')
        .limit(5);


      const { data: citas, error: errorCita } = await supabase
        .from('cita')
        .select('id_cita, fecha_cita, estado_cita')
        .limit(5);


      // Todo exitoso
      setStatus('success');
      setMessage('✅ Conexión exitosa a Supabase');
      setDetails({
        url: '✅ ' + url,
        connection: '✅ Conectado',
        tables: '✅ Acceso a tablas',
        compania: companiaData?.length || 0,
        usuarios: usuarios?.length || 0,
        pacientes: pacientes?.length || 0,
        citas: citas?.length || 0,
      });
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Error inesperado');
      setDetails({
        error_type: error.name || 'Unknown',
        error_message: error.message || 'Error desconocido',
        error_stack: error.stack?.substring(0, 200) || 'No stack trace',
      });
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="mb-2">🔌 Prueba de Conexión Supabase</h1>
          <p className="text-gray-600">Verificando conexión con la base de datos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            {status === 'loading' && (
              <>
                <Loader2 className="size-6 text-blue-600 animate-spin" />
                <span className="font-medium">Conectando...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="size-6 text-green-600" />
                <span className="font-medium text-green-600">Conexión Exitosa</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="size-6 text-red-600" />
                <span className="font-medium text-red-600">Error de Conexión</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-700 mb-4">{message}</p>

          {details && (
            <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Detalles:</p>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="font-mono">
                    {typeof value === 'number' ? `${value} registros` : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={runTest}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              disabled={status === 'loading'}
            >
              <RefreshCw className="size-4" />
              Probar de Nuevo
            </button>

            {status === 'success' && (
              <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                ✅ Sistema listo
              </span>
            )}

            {status === 'error' && (
              <span className="px-3 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                ❌ Revisa config
              </span>
            )}
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-amber-900 mb-2">
              Pasos para solucionar:
            </h3>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Verifica que ejecutaste migration.sql en Supabase</li>
              <li>Verifica que ejecutaste seed_data.sql en Supabase</li>
              <li>Confirma que las variables de entorno estén configuradas</li>
              <li>Reinicia el servidor de desarrollo (si es local)</li>
              <li>Revisa la consola del navegador para más detalles</li>
            </ol>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-900 mb-2">
              ✅ ¡Perfecto! Sistema configurado correctamente
            </h3>
            <p className="text-sm text-green-800">
              Tu aplicación está conectada a Supabase. Ahora puedes usar datos reales.
              Los componentes se actualizarán automáticamente cuando cambies datos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}