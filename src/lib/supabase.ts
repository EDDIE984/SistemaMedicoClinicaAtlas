// Cliente de Supabase para la aplicación
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// ✅ CREDENCIALES CONFIGURADAS
const supabaseUrl = 'https://bhrcsbtylvysoeuyaauz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocmNzYnR5bHZ5c29ldXlhYXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjM4MTIsImV4cCI6MjA3OTczOTgxMn0._-jeSwJ9fY9tUTL0ZtYikbQScSPRC0G0-mzJT3noH_s';

// Cliente único con Anon Key
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ⚡ Alias para mantener compatibilidad con código existente
export const supabaseAdmin = supabase;

// Verificar conexión
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('compania')
      .select('id_compania')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión a Supabase:', error);
      return false;
    }


    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return false;
  }
}