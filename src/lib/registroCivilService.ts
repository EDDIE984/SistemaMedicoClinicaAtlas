import { supabase } from './supabase';
import { toast } from 'sonner';

export interface DatosRegistroCivil {
    cedula: string;
    nombre: string;
    genero: string;
    fechaNacimiento: string;
    estadoCivil: string;
    conyuge: string;
    nacionalidad: string;
    fechaCedulacion: string;
    lugarDomicilio: string;
    calleDomicilio: string;
    numeracionDomicilio: string;
    nombreMadre: string;
    nombrePadre: string;
    lugarNacimiento: string;
    instruccion: string;
    profesion: string;
}

export interface PersonaMapeada {
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    sexo: 'M' | 'F' | 'Otro';
    direccion: string;
}

// Obtener API Key de la tabla rubros
const getApiKey = async (): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('rubros')
            .select('valor_texto')
            .eq('id', 1)
            .single() as any;

        if (error) {
            console.error('Error al obtener API Key de rubros:', error);
            return null;
        }

        const key = data?.valor_texto || null;
        // console.log('API Key lookup result:', key ? 'Found' : 'Not Found');
        if (!key) toast.error('DEBUG: No se encontró API Key en tabla rubros');
        return key;
    } catch (error) {
        console.error('Error inesperado al obtener API Key:', error);
        toast.error('DEBUG: Error al consultar tabla rubros');
        return null;
    }
};

// Parsear nombre completo (Asumiendo formato: APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2)
const parsearNombre = (nombreCompleto: string): { nombres: string, apellidos: string } => {
    if (!nombreCompleto) return { nombres: '', apellidos: '' };

    const partes = nombreCompleto.trim().split(/\s+/);

    // Si tiene menos de 2 partes, asumimos que es nombre o apellido
    if (partes.length < 2) {
        return { nombres: nombreCompleto, apellidos: '' };
    }

    // Comúnmente los dos primeros son apellidos
    // Ejemplo: ESPIN PAREDES ZOILA ROSA XIMENA
    // Apellidos: ESPIN PAREDES
    // Nombres: ZOILA ROSA XIMENA

    const apellidos = partes.slice(0, 2).join(' ');
    const nombres = partes.slice(2).join(' ');

    return { nombres, apellidos };
};

// Formatear fecha de DD/MM/YYYY a YYYY-MM-DD
const parsearFecha = (fecha: string): string => {
    if (!fecha) return '';
    // entrada: 21/06/1960
    const partes = fecha.split('/');
    if (partes.length !== 3) return '';

    // salida: 1960-06-21
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

// Mapear género
const parsearGenero = (genero: string): 'M' | 'F' | 'Otro' => {
    if (!genero) return 'Otro';
    const g = genero.toUpperCase();
    if (g.includes('MUJER') || g.includes('FEMENINO')) return 'F';
    if (g.includes('HOMBRE') || g.includes('MASCULINO')) return 'M';
    return 'Otro';
};

// Función principal para consultar cédula
export const consultarCedulaRegistroCivil = async (cedula: string): Promise<PersonaMapeada | null> => {
    if (!cedula || cedula.length < 10) return null;

    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            console.warn('No se encontró API Key para consulta de registro civil');
            return null;
        }

        const targetUrl = `http://nessoftfact-001-site6.atempurl.com/api/ConsultasDatos/ConsultaCedulaV2?Cedula=${cedula}&Apikey=${apiKey}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        console.log('Fetching via Proxy:', proxyUrl);
        toast.info('DEBUG: Consultando registro civil...');

        const response = await fetch(proxyUrl);

        console.log('Response status:', response.status);

        if (!response.ok) {
            console.error('Error en respuesta de API Registro Civil:', response.statusText);
            return null;
        }

        const data: any = await response.json();
        console.log('Respuesta API Registro Civil:', data);

        // Soportar tanto camelCase como PascalCase (que es común en APIs .NET)
        const nombreCompleto = data.nombre || data.Nombre;
        const fechaNacimiento = data.fechaNacimiento || data.FechaNacimiento;
        const genero = data.genero || data.Genero;
        const lugarDomicilio = data.lugarDomicilio || data.LugarDomicilio;
        const calleDomicilio = data.calleDomicilio || data.CalleDomicilio;
        const numeracionDomicilio = data.numeracionDomicilio || data.NumeracionDomicilio;

        if (!nombreCompleto && !fechaNacimiento) {
            // Respuesta vacía o inválida
            console.warn('Datos vacíos en respuesta API', data);
            toast.warning('La API retornó datos vacíos');
            return null;
        }

        const { nombres, apellidos } = parsearNombre(nombreCompleto);

        // Construir dirección
        const direccionPartes = [lugarDomicilio, calleDomicilio, numeracionDomicilio].filter(Boolean);
        const direccion = direccionPartes.join(', ');

        toast.success('¡Datos recuperados exitosamente!');

        return {
            nombres,
            apellidos,
            fecha_nacimiento: parsearFecha(fechaNacimiento),
            sexo: parsearGenero(genero),
            direccion
        };

    } catch (error) {
        console.error('Error al consultar registro civil:', error);
        toast.error('Error de red al consultar registro civil');
        return null;
    }
};
