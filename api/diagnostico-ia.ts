import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DiagnosticoSugerido {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { hallazgos } = req.body as { hallazgos?: string };

  if (!hallazgos || hallazgos.trim().length < 5) {
    return res.status(400).json({ error: 'Los hallazgos clínicos son requeridos' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Servicio de IA no configurado. Configure OPENAI_API_KEY en las variables de entorno.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `Eres un asistente médico experto en clasificación diagnóstica CIE-10 (Clasificación Internacional de Enfermedades, 10.ª revisión).
Tu tarea es analizar los hallazgos clínicos descritos por el médico y sugerir los 3 diagnósticos más probables según el CIE-10.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin bloques markdown, sin explicaciones fuera del JSON.
- El JSON debe tener exactamente esta estructura:
{"diagnosticos":[{"codigo":"X00.0","nombre":"Nombre exacto CIE-10","descripcion":"Justificación clínica en máximo 15 palabras"},{"codigo":"X00.1","nombre":"...","descripcion":"..."},{"codigo":"X00.2","nombre":"...","descripcion":"..."}]}
- Los códigos deben ser válidos del CIE-10.
- Ordena por probabilidad descendente (el más probable primero).
- Los textos deben estar en español.`
          },
          {
            role: 'user',
            content: `Hallazgos clínicos del paciente:\n${hallazgos}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', response.status, errText);
      return res.status(502).json({ error: 'Error al contactar el servicio de IA' });
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'Respuesta vacía del servicio de IA' });
    }

    let parsed: { diagnosticos: DiagnosticoSugerido[] };
    try {
      // Limpiar posibles bloques markdown que el modelo pueda ignorar
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('JSON inválido de OpenAI:', content);
      return res.status(502).json({ error: 'El servicio de IA devolvió un formato inesperado' });
    }

    if (!Array.isArray(parsed?.diagnosticos) || parsed.diagnosticos.length === 0) {
      return res.status(502).json({ error: 'No se obtuvieron diagnósticos del servicio de IA' });
    }

    return res.status(200).json({ diagnosticos: parsed.diagnosticos.slice(0, 3) });

  } catch (error) {
    console.error('❌ Error en diagnostico-ia:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
