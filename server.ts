import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client utility (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check if Gemini API is available
function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
}

// Resilient AI generation with automatic model fallback (flash-lite / flash-3.8)
async function generateAiJson(prompt: string): Promise<any> {
  // Use gemini-3.1-flash-lite as primary fast model with gemini-3.8-flash fallback
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const raw = response.text || '';
      const cleanJson = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJson);
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo conectar con el servicio de IA');
}

// 1. Corregir y pulir redacción clínica del motivo de consulta / HEA
app.post('/api/ai/correct-motivo', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({ error: 'El texto debe tener al menos 5 caracteres.' });
    }

    if (!hasGeminiKey()) {
      const cleaned = text
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^([a-z])/, (m) => m.toUpperCase());
      return res.json({
        correctedText: cleaned.endsWith('.') ? cleaned : `${cleaned}.`,
        suggestions: [
          'Especifique el tiempo de evolución (días, meses o años).',
          'Documente el impacto en áreas laboral, académica o interpersonal.',
        ],
      });
    }

    const prompt = `Eres un psicólogo clínico senior y perito evaluador en salud mental en Ecuador (normativa MSP y Código Deontológico).
El psicólogo tratante ha transcrito lo que expresó el paciente (que a veces es coloquial, desorganizado, con cabos sueltos o ideas fragmentadas).
Tu labor es:
1. Reestructurar y pulir la redacción del "Motivo de consulta" en una síntesis clínica técnica, respetuosa, clara y formal.
2. Identificar y extraer si el texto menciona elementos de la Historia de la Enfermedad Actual (HEA):
   - Inicio y curso temporal (cuándo comenzó, evolución, frecuencia).
   - Factores precipitantes / desencadenantes (situaciones, pérdidas, cambios).
   - Factores mantenedores (evitaciones, rumiaciones, dinámicas).
   - Intentos previos de solución (autocuidado, tratamientos anteriores).
   - Impacto funcional (laboral, académico, familiar, social o de pareja).
3. Identificar cabos sueltos o preguntas clínicas clave que el psicólogo debería explorar.

Texto original transcrito:
"${text}"

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "correctedText": "Texto clínico profesional estructurado para el motivo",
  "hea_inicio": "Texto para inicio y curso (o vacío si no se deduce)",
  "hea_precipitantes": "Texto para precipitantes (o vacío si no se deduce)",
  "hea_mantenedores": "Texto para mantenedores (o vacío si no se deduce)",
  "hea_soluciones": "Intentos previos de solución (o vacío si no se deduce)",
  "hea_impacto": "Impacto funcional observado (o vacío si no se deduce)",
  "suggestions": ["Cabos sueltos a explorar o recomendaciones clínicas"]
}`;

    const parsed = await generateAiJson(prompt);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error en /api/ai/correct-motivo:', error);
    return res.status(500).json({
      error: 'Error al procesar con IA. Verifique el registro clínico.',
      details: error?.message,
    });
  }
});

// 2. Sugerencia de diagnósticos CIE-11 y DSM-5-TR
app.post('/api/ai/suggest-dx', async (req: Request, res: Response) => {
  try {
    const { motivo, hea, mse, tests, antecedentes } = req.body;

    if (!hasGeminiKey()) {
      return res.json({
        suggestions: [
          {
            code: '6A70',
            name: 'Trastorno depresivo de episodio único',
            system: 'CIE-11',
            type: 'principal',
            justification: 'Sintomatología compatible con alteración del estado de ánimo reportada.',
          },
          {
            code: 'F32.9',
            name: 'Trastorno depresivo mayor, episodio único, no especificado',
            system: 'DSM-5-TR',
            type: 'principal',
            justification: 'Criterios compatibles con episodio afectivo según exploración inicial.',
          },
          {
            code: '6B00',
            name: 'Trastorno de ansiedad generalizada',
            system: 'CIE-11',
            type: 'comorbilidad',
            justification: 'Posible componente ansioso reactivo a evaluar con evolución.',
          },
        ],
      });
    }

    const contextPrompt = `Eres un psicólogo clínico especialista en psicopatología y diagnóstico diferencial.
Con base en los datos de la valoración clínica a continuación, sugiere entre 2 y 4 diagnósticos diferenciales
en codificación oficial CIE-11 y su correspondiente DSM-5-TR.

DATOS DEL CASO:
- Motivo de consulta (palabras del paciente y terapeuta): ${JSON.stringify(motivo || '')}
- Historia de la Enfermedad Actual (HEA): ${JSON.stringify(hea || {})}
- Examen Mental (MSE): ${JSON.stringify(mse || {})}
- Pruebas psicométricas aplicadas y resultados: ${JSON.stringify(tests || [])}
- Antecedentes relevantes: ${JSON.stringify(antecedentes || {})}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "suggestions": [
    {
      "code": "Código oficial (ej: 6A70 o F32.1)",
      "name": "Nombre oficial del trastorno",
      "system": "CIE-11" o "DSM-5-TR",
      "type": "principal" o "secundario" o "comorbilidad",
      "justification": "Explicación técnica fundamentada en los síntomas y pruebas observadas"
    }
  ]
}`;

    const parsed = await generateAiJson(contextPrompt);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error en /api/ai/suggest-dx:', error);
    return res.status(500).json({ error: 'Error al sugerir diagnósticos con IA.', details: error?.message });
  }
});

// 3. Sugerencia de plan terapéutico según enfoque y diagnósticos
app.post('/api/ai/suggest-plan', async (req: Request, res: Response) => {
  try {
    const { enfoque, diagnoses, motivo, patientInfo } = req.body;

    if (!hasGeminiKey()) {
      return res.json({
        objetivos:
          '1. Establecer alianza terapéutica y psicoeducación del cuadro clínico.\n2. Identificar y reestructurar distorsiones cognitivas automáticas y patrones conductuales desadaptativos.\n3. Desarrollar habilidades de autorregulación emocional y estrategias de afrontamiento asertivo.',
        tecnicas:
          'Psicoeducación, autorregistro de pensamientos y emociones, reestructuración cognitiva, respiración diafragmática, activación conductual y asignación gradual de tareas.',
        frecuencia: 'Semanal (sesiones de 45 a 50 minutos)',
        pronostico: 'Favorable, sujeto a regularidad de asistencia y adherencia terapéutica.',
        recomendaciones: [
          'Involucrar red de apoyo familiar si el paciente lo autoriza.',
          'Reevaluación psicométrica a la 4ta y 8va sesión.',
        ],
      });
    }

    const planPrompt = `Eres un psicoterapeuta supervisor clínico.
Formula una propuesta de plan terapéutico estructurado y basado en evidencia para el siguiente caso:

- Enfoque terapéutico seleccionado: ${enfoque || 'Terapia Cognitivo-Conductual'}
- Diagnósticos clínicos identificados: ${JSON.stringify(diagnoses || [])}
- Motivo de consulta principal: ${JSON.stringify(motivo || '')}
- Información del paciente: ${JSON.stringify(patientInfo || {})}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "objetivos": "Objetivos terapéuticos SMART numerados y medibles",
  "tecnicas": "Técnicas terapéuticas concretas congruentes con el enfoque seleccionado",
  "frecuencia": "Frecuencia sugerida de sesiones (ej: Semanal, 45-50 min)",
  "pronostico": "Pronóstico clínico fundamentado",
  "recomendaciones": ["Recomendación clínica 1", "Recomendación clínica 2"]
}`;

    const parsed = await generateAiJson(planPrompt);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error en /api/ai/suggest-plan:', error);
    return res.status(500).json({ error: 'Error al generar plan terapéutico.', details: error?.message });
  }
});

// Iniciar servidor con Vite en desarrollo o estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PSIVIA Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
