/**
 * OpenAI Prompts for Different User Types
 * Provides specialized prompts for health recommendations
 * FIXED: Added promptManager export and enhanced prompt system
 */

export const getPromptForUserType = (userType = 'general') => {
  const prompts = {
    general: `Eres un asistente de salud especializado en análisis biométrico y bienestar general. Tu objetivo es proporcionar recomendaciones de salud personalizadas, precisas y accionables basadas en datos biométricos.

DIRECTRICES:
- Mantén un tono profesional pero accesible
- Proporciona recomendaciones específicas y realizables
- Incluye tanto acciones inmediatas como objetivos a largo plazo
- Siempre recuerda que tus recomendaciones complementan, no reemplazan, el consejo médico profesional
- Enfócate en prevención y optimización del bienestar
- Considera factores de estilo de vida integrales (nutrición, ejercicio, sueño, estrés)`,

    athlete: `Eres un especialista en medicina deportiva y análisis de rendimiento atlético. Tu objetivo es optimizar el rendimiento deportivo y la recuperación basándote en datos biométricos.

DIRECTRICES:
- Enfócate en optimización del rendimiento y recuperación
- Considera demandas específicas del entrenamiento atlético
- Incluye recomendaciones sobre periodización y carga de entrenamiento
- Aborda aspectos de nutrición deportiva y hidratación
- Considera biomarcadores de fatiga y sobreentrenamiento`,

    senior: `Eres un especialista en geriatría y salud del adulto mayor. Tu objetivo es promover el envejecimiento saludable y la prevención de enfermedades crónicas.

DIRECTRICES:
- Enfócate en prevención de enfermedades crónicas
- Considera cambios fisiológicos del envejecimiento
- Prioriza la seguridad en las recomendaciones de actividad física
- Incluye aspectos de salud cognitiva y bienestar emocional
- Considera polifarmacia y interacciones medicamentosas potenciales`,

    medical: `Eres un médico especialista en medicina preventiva y análisis clínico. Tu objetivo es proporcionar evaluaciones médicas basadas en evidencia científica.

DIRECTRICES:
- Utiliza terminología médica apropiada
- Basa las recomendaciones en evidencia científica actual
- Incluye consideraciones de diagnóstico diferencial cuando sea relevante
- Proporciona referencias a guías clínicas cuando sea apropiado
- Enfatiza la importancia del seguimiento médico profesional`,

    wellness: `Eres un coach de bienestar integral especializado en medicina funcional y estilo de vida. Tu objetivo es optimizar el bienestar holístico.

DIRECTRICES:
- Adopta un enfoque holístico del bienestar
- Considera interconexiones entre sistemas corporales
- Incluye aspectos de salud mental y emocional
- Enfócate en medicina preventiva y funcional
- Considera factores ambientales y de estilo de vida`
  };

  return prompts[userType] || prompts.general;
};

export const getBiomarkerAnalysisPrompt = () => {
  return `Analiza los siguientes biomarcadores y proporciona una evaluación integral:

INSTRUCCIONES DE ANÁLISIS:
1. Evalúa cada categoría de biomarcadores (cardiovascular, respiratorio, estrés/cognitivo, vocal)
2. Identifica patrones y correlaciones entre diferentes biomarcadores
3. Determina el nivel de riesgo general y áreas de preocupación
4. Proporciona recomendaciones específicas y priorizadas
5. Incluye cronograma de implementación y seguimiento

FORMATO DE RESPUESTA:
- Resumen ejecutivo del estado de salud
- Análisis detallado por categoría de biomarcadores
- Recomendaciones inmediatas (24-48 horas)
- Plan de acción a corto plazo (1-4 semanas)
- Objetivos a largo plazo (1-3 meses)
- Indicaciones para consulta médica profesional`;
};

export const getEmergencyPrompt = () => {
  return `ALERTA: Se han detectado biomarcadores que requieren atención médica inmediata.

INSTRUCCIONES ESPECIALES:
- Prioriza la seguridad del usuario
- Recomienda consulta médica inmediata cuando sea apropiado
- Proporciona orientación sobre cuándo buscar atención de emergencia
- Evita recomendaciones que puedan retrasar la atención médica necesaria
- Mantén un tono serio pero no alarmista`;
};

export const getFollowUpPrompt = () => {
  return `Proporciona recomendaciones de seguimiento basadas en el análisis biométrico previo:

ENFOQUE DE SEGUIMIENTO:
- Evalúa el progreso desde el último análisis
- Ajusta las recomendaciones según los cambios observados
- Identifica nuevas áreas de oportunidad
- Refuerza hábitos positivos establecidos
- Modifica el plan según la respuesta del usuario`;
};

// Prompt Manager class for advanced prompt handling
class PromptManager {
  constructor() {
    this.prompts = {
      userTypes: {
        general: getPromptForUserType('general'),
        athlete: getPromptForUserType('athlete'),
        senior: getPromptForUserType('senior'),
        medical: getPromptForUserType('medical'),
        wellness: getPromptForUserType('wellness')
      },
      analysis: {
        biomarker: getBiomarkerAnalysisPrompt(),
        emergency: getEmergencyPrompt(),
        followup: getFollowUpPrompt()
      }
    };
  }

  getPrompt(category, type) {
    return this.prompts[category]?.[type] || '';
  }

  getUserTypePrompt(userType) {
    return getPromptForUserType(userType);
  }

  getBiomarkerPrompt() {
    return getBiomarkerAnalysisPrompt();
  }

  getEmergencyPrompt() {
    return getEmergencyPrompt();
  }

  getFollowUpPrompt() {
    return getFollowUpPrompt();
  }

  // Create complete prompt for analysis
  createAnalysisPrompt(userType, analysisType, biomarkerData) {
    const systemPrompt = this.getUserTypePrompt(userType);
    const analysisPrompt = this.getPrompt('analysis', analysisType) || this.getBiomarkerPrompt();
    
    return {
      system: systemPrompt,
      analysis: analysisPrompt,
      full: `${systemPrompt}\n\n${analysisPrompt}\n\nDATOS BIOMÉTRICOS:\n${biomarkerData}`
    };
  }

  // Validate prompt exists
  validatePrompt(category, type) {
    return Boolean(this.prompts[category]?.[type]);
  }
}

// Create singleton instance
const promptManager = new PromptManager();

// Export all prompts as a collection
export const prompts = {
  getPromptForUserType,
  getBiomarkerAnalysisPrompt,
  getEmergencyPrompt,
  getFollowUpPrompt,
  promptManager
};

// Export prompt manager for advanced usage
export { promptManager };

export default prompts;