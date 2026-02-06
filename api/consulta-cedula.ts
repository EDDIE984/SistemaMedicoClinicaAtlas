
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { Cedula, Apikey } = request.query;

    if (!Cedula || !Apikey) {
        return response.status(400).json({ error: 'Faltan parámetros: Cedula y Apikey son requeridos.' });
    }

    const targetUrl = `http://nessoftfact-001-site6.atempurl.com/api/ConsultasDatos/ConsultaCedulaV2?Cedula=${Cedula}&Apikey=${Apikey}`;

    try {
        const apiResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Error from external API (${apiResponse.status}):`, errorText);
            return response.status(apiResponse.status).json({
                error: 'Error al consultar el servicio externo',
                details: errorText
            });
        }

        const data = await apiResponse.json();

        // Configurar cabeceras de CORS para permitir peticiones desde el frontend en producción
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

        return response.status(200).json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        return response.status(500).json({ error: 'Error interno del servidor al procesar la solicitud' });
    }
}
