/**
 * OpenAI Service for Health Recommendations
 * Provides AI-powered health recommendations based on biomarker analysis
 */

class OpenAIService {
  constructor() {
    try {
      // Safe access to environment variables
      this.apiKey = (typeof process !== 'undefined' && process.env) ? process.env.OPENAI_API_KEY : null;
      this.baseURL = 'https://api.openai.com/v1';
      this.model = 'gpt-3.5-turbo';
      console.log('🔧 OpenAI Service initialized');
    } catch (error) {
      console.error('Error initializing OpenAI Service:', error);
      this.apiKey = null;
      this.baseURL = 'https://api.openai.com/v1';
      this.model = 'gpt-3.5-turbo';
    }
  }

  async generateRecommendations(prompt) {
    try {
      console.log('🤖 Generating AI recommendations...');
      
      // If no API key available, use fallback
      if (!this.apiKey) {
        console.warn('⚠️ OpenAI API key not available, using fallback recommendations');
        return this.generateFallbackRecommendations(prompt);
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente de salud especializado en análisis biométrico. Proporciona recomendaciones de salud personalizadas, precisas y accionables basadas en datos biométricos. Mantén un enfoque profesional y recuerda que tus recomendaciones son complementarias, no reemplazan el consejo médico profesional.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const recommendations = data.choices[0]?.message?.content || 'No se pudieron generar recomendaciones';
      
      console.log('✅ AI recommendations generated successfully');
      return recommendations;

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.generateFallbackRecommendations(prompt);
    }
  }

  generateFallbackRecommendations(prompt) {
    try {
      console.log('⚠️ Using fallback health recommendations');
      
      // Extract key biomarker values from prompt for basic recommendations
      const heartRateMatch = prompt.match(/Frecuencia Cardíaca:\s*(\d+)/);
      const stressMatch = prompt.match(/Nivel de Estrés:\s*(\d+)/);
      const voiceQualityMatch = prompt.match(/Calidad de Voz:\s*(\d+)/);
      
      const heartRate = heartRateMatch ? parseInt(heartRateMatch[1]) : 72;
      const stressLevel = stressMatch ? parseInt(stressMatch[1]) : 20;
      const voiceQuality = voiceQualityMatch ? parseInt(voiceQualityMatch[1]) : 75;
      
      let recommendations = `RECOMENDACIONES PERSONALIZADAS DE SALUD

ANÁLISIS GENERAL:
Basándome en su análisis biométrico, he identificado las siguientes áreas de enfoque para optimizar su bienestar.

RECOMENDACIONES INMEDIATAS (24-48 horas):
`;

      // Heart rate recommendations
      if (heartRate > 90) {
        recommendations += `
• CARDIOVASCULAR: Su frecuencia cardíaca (${heartRate} BPM) está elevada. Practique técnicas de respiración profunda durante 5-10 minutos cada 2 horas.
• Reduzca el consumo de cafeína y mantenga una hidratación adecuada (8-10 vasos de agua al día).
• Evite actividades físicas intensas hasta que su ritmo cardíaco se normalice.`;
      } else if (heartRate < 60) {
        recommendations += `
• CARDIOVASCULAR: Su frecuencia cardíaca (${heartRate} BPM) está baja. Considere actividad física ligera como caminatas de 10-15 minutos.
• Mantenga un registro de su energía y consulte con un profesional si experimenta fatiga.`;
      } else {
        recommendations += `
• CARDIOVASCULAR: Su frecuencia cardíaca (${heartRate} BPM) está en rango saludable. Mantenga sus hábitos actuales de actividad física.`;
      }

      // Stress recommendations
      if (stressLevel > 30) {
        recommendations += `

• MANEJO DEL ESTRÉS: Su nivel de estrés (${stressLevel}%) requiere atención. Implemente técnicas de relajación:
  - Meditación mindfulness: 10 minutos al despertar y antes de dormir
  - Ejercicios de respiración 4-7-8: Inhale 4 segundos, mantenga 7, exhale 8
  - Limite la exposición a noticias estresantes y redes sociales`;
      } else {
        recommendations += `

• MANEJO DEL ESTRÉS: Su nivel de estrés (${stressLevel}%) está bien controlado. Continue con sus estrategias actuales de manejo del estrés.`;
      }

      // Voice quality recommendations
      if (voiceQuality < 70) {
        recommendations += `

• SALUD VOCAL: Su calidad vocal (${voiceQuality}%) puede mejorar:
  - Mantenga hidratación constante (especialmente agua tibia con miel)
  - Practique ejercicios de vocalización suaves
  - Evite hablar en ambientes ruidosos que requieran elevar la voz`;
      }

      recommendations += `

CAMBIOS DE ESTILO DE VIDA (1-4 semanas):
• Establezca una rutina de ejercicio regular: 150 minutos de actividad moderada por semana
• Optimice su horario de sueño: 7-9 horas diarias, acostándose y levantándose a la misma hora
• Implemente una dieta antiinflamatoria rica en omega-3, antioxidantes y fibra
• Practique técnicas de manejo del estrés de forma consistente

OBJETIVOS A LARGO PLAZO (1-3 meses):
• Monitoree regularmente sus biomarcadores con análisis mensuales
• Desarrolle resiliencia al estrés a través de actividades que disfrute
• Mantenga un peso saludable y composición corporal óptima
• Cultive relaciones sociales positivas y apoyo emocional

CUÁNDO CONSULTAR UN PROFESIONAL:
• Si experimenta síntomas cardiovasculares persistentes
• Si los niveles de estrés no mejoran con las técnicas implementadas
• Para evaluación médica anual y seguimiento de biomarcadores
• Si tiene preocupaciones específicas sobre algún resultado del análisis

SEGUIMIENTO RECOMENDADO:
Repita este análisis biométrico en 2-4 semanas para evaluar el progreso y ajustar las recomendaciones según sea necesario.

Recuerde: Estas recomendaciones son complementarias al cuidado médico profesional y no lo reemplazan.`;

      return recommendations;
    } catch (error) {
      console.error('Error generating fallback recommendations:', error);
      return 'Recomendaciones de salud no disponibles temporalmente. Por favor, consulte con un profesional de la salud.';
    }
  }

  async testConnection() {
    try {
      if (!this.apiKey) {
        return { success: false, message: 'API key not configured' };
      }

      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return { 
        success: response.ok, 
        message: response.ok ? 'Connection successful' : `HTTP ${response.status}` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  isApiKeyConfigured() {
    return Boolean(this.apiKey);
  }
}

// Create singleton instance with error handling
let openaiServiceInstance;
try {
  openaiServiceInstance = new OpenAIService();
} catch (error) {
  console.error('Failed to create OpenAI service instance:', error);
  openaiServiceInstance = null;
}

// Export additional functions for component compatibility
export const analyzePersonalHealth = async (healthData) => {
  try {
    if (!openaiServiceInstance) {
      return 'Servicio OpenAI no disponible. Consulte con un profesional de la salud.';
    }

    const prompt = `Analiza los siguientes datos de salud personal y proporciona recomendaciones:
    
DATOS DE SALUD PERSONAL:
${JSON.stringify(healthData, null, 2)}
    
Proporciona recomendaciones personalizadas de salud y bienestar basadas en estos datos.`;
    
    return await openaiServiceInstance.generateRecommendations(prompt);
  } catch (error) {
    console.error('Error analyzing personal health:', error);
    return 'Análisis de salud personal no disponible temporalmente. Por favor, consulte con un profesional de la salud.';
  }
};

export const analyzeCompanyHealth = async (companyData) => {
  try {
    if (!openaiServiceInstance) {
      return 'Servicio OpenAI no disponible. Consulte con especialistas en bienestar organizacional.';
    }

    const prompt = `Analiza los siguientes datos de salud empresarial y proporciona recomendaciones:
    
DATOS DE SALUD EMPRESARIAL:
${JSON.stringify(companyData, null, 2)}
    
Proporciona recomendaciones para mejorar la salud organizacional, bienestar de empleados y productividad.`;
    
    return await openaiServiceInstance.generateRecommendations(prompt);
  } catch (error) {
    console.error('Error analyzing company health:', error);
    return 'Análisis de salud empresarial no disponible temporalmente. Considere consultar con especialistas en bienestar organizacional.';
  }
};

export const analyzeInsuranceRisk = async (riskData) => {
  try {
    if (!openaiServiceInstance) {
      return 'Servicio OpenAI no disponible. Consulte con un actuario de seguros de salud.';
    }

    const prompt = `Analiza los siguientes datos de riesgo para seguros de salud:
    
DATOS DE EVALUACIÓN DE RIESGO:
${JSON.stringify(riskData, null, 2)}
    
Proporciona una evaluación de riesgo y recomendaciones para la gestión de seguros de salud.`;
    
    return await openaiServiceInstance.generateRecommendations(prompt);
  } catch (error) {
    console.error('Error analyzing insurance risk:', error);
    return 'Análisis de riesgo de seguros no disponible temporalmente. Consulte con un actuario de seguros de salud.';
  }
};

export const testOpenAIConnection = async () => {
  try {
    if (!openaiServiceInstance) {
      return { success: false, message: 'OpenAI service not initialized' };
    }
    return await openaiServiceInstance.testConnection();
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const isApiKeyConfigured = () => {
  try {
    return openaiServiceInstance ? openaiServiceInstance.isApiKeyConfigured() : false;
  } catch (error) {
    return false;
  }
};

export const generatePersonalizedRecommendations = async (biomarkers) => {
  try {
    if (!openaiServiceInstance) {
      return 'Servicio de recomendaciones no disponible. Consulte con un profesional de la salud.';
    }

    const prompt = `Analiza los siguientes biomarcadores y genera recomendaciones personalizadas:
    
BIOMARCADORES ANALIZADOS:
${JSON.stringify(biomarkers, null, 2)}
    
Proporciona recomendaciones específicas y accionables basadas en estos biomarcadores.`;
    
    return await openaiServiceInstance.generateRecommendations(prompt);
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return 'Recomendaciones personalizadas no disponibles temporalmente. Consulte con un profesional de la salud.';
  }
};

// Export service instance with null check
export const openaiService = openaiServiceInstance;
export default openaiServiceInstance;