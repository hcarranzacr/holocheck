// OpenAI Prompts Configuration Service
// Prompts especializados configurables para diferentes tipos de análisis

export const DEFAULT_PROMPTS = {
  personal: {
    id: 'personal',
    name: 'Análisis Personal de Salud',
    description: 'Recomendaciones individuales basadas en biomarcadores personales',
    variables: ['biomarcadores', 'edad', 'genero', 'historialMedico', 'factoresRiesgo'],
    prompt: `Eres un especialista en medicina preventiva y análisis de biomarcadores digitales. 

Analiza los siguientes datos biométricos de un individuo:

BIOMARCADORES:
{biomarcadores}

INFORMACIÓN PERSONAL:
- Edad: {edad}
- Género: {genero}
- Historial médico: {historialMedico}
- Factores de riesgo: {factoresRiesgo}

Por favor, proporciona un análisis completo que incluya:

1. EVALUACIÓN DE SALUD ACTUAL:
   - Estado cardiovascular basado en rPPG
   - Niveles de estrés y bienestar mental
   - Indicadores metabólicos y respiratorios
   - Evaluación de riesgo general (bajo/medio/alto)

2. RECOMENDACIONES PERSONALIZADAS:
   - Cambios en estilo de vida específicos
   - Ejercicios y actividades recomendadas
   - Modificaciones dietéticas sugeridas
   - Técnicas de manejo del estrés

3. PLAN DE SEGUIMIENTO:
   - Frecuencia de monitoreo recomendada
   - Métricas clave a vigilar
   - Señales de alerta a considerar
   - Cuándo consultar a un profesional de la salud

4. PREVENCIÓN ESPECÍFICA:
   - Factores de riesgo identificados
   - Medidas preventivas prioritarias
   - Recursos y herramientas útiles

Presenta la información de manera clara, empática y accionable, priorizando la prevención y el bienestar integral.`
  },

  company: {
    id: 'company',
    name: 'Análisis Empresarial de Salud',
    description: 'Análisis de conglomerados y métricas organizacionales de bienestar',
    variables: ['datosEmpleados', 'departamento', 'tamanoEmpresa', 'industria', 'metricas'],
    prompt: `Eres un consultor especializado en salud ocupacional y analytics empresarial.

Analiza los siguientes datos agregados de salud de empleados:

DATOS POBLACIONALES:
{datosEmpleados}

CONTEXTO ORGANIZACIONAL:
- Departamento/Área: {departamento}
- Tamaño de empresa: {tamanoEmpresa}
- Industria: {industria}
- Métricas adicionales: {metricas}

Proporciona un análisis integral que incluya:

1. ANÁLISIS DE CONGLOMERADOS:
   - Segmentación de empleados por perfil de riesgo
   - Identificación de patrones de salud por departamento
   - Correlaciones entre bienestar y productividad
   - Grupos de alto, medio y bajo riesgo

2. MÉTRICAS ORGANIZACIONALES:
   - Índice de bienestar general de la empresa
   - Comparación con benchmarks de la industria
   - Tendencias temporales y estacionales
   - Impacto en ausentismo y rotación

3. RECOMENDACIONES ESTRATÉGICAS:
   - Programas de bienestar específicos por grupo
   - Intervenciones preventivas prioritarias
   - Políticas de salud ocupacional sugeridas
   - Inversiones en infraestructura de bienestar

4. PLAN DE IMPLEMENTACIÓN:
   - Fases de implementación de programas
   - KPIs y métricas de seguimiento
   - Presupuesto estimado y ROI esperado
   - Timeline de implementación

5. ANÁLISIS DE RIESGO EMPRESARIAL:
   - Factores de riesgo organizacional
   - Impacto potencial en operaciones
   - Estrategias de mitigación
   - Preparación para contingencias

Enfócate en insights accionables que mejoren tanto el bienestar de los empleados como los resultados empresariales.`
  },

  insurance: {
    id: 'insurance',
    name: 'Evaluación Actuarial de Riesgo',
    description: 'Análisis de riesgo para compañías aseguradoras basado en biomarcadores',
    variables: ['perfilRiesgo', 'historialMedico', 'biomarcadores', 'edad', 'ocupacion'],
    prompt: `Eres un actuario especializado en seguros de salud y evaluación de riesgo basada en biomarcadores digitales.

Evalúa el siguiente perfil para análisis actuarial:

PERFIL DE RIESGO:
{perfilRiesgo}

DATOS BIOMÉTRICOS:
{biomarcadores}

INFORMACIÓN COMPLEMENTARIA:
- Historial médico: {historialMedico}
- Edad: {edad}
- Ocupación: {ocupacion}

Proporciona una evaluación actuarial completa que incluya:

1. CLASIFICACIÓN DE RIESGO:
   - Categoría de riesgo (Preferido/Estándar/Subestándar)
   - Score de riesgo numérico (1-100)
   - Factores de riesgo principales identificados
   - Comparación con población estándar

2. ANÁLISIS DE SINIESTRALIDAD:
   - Probabilidad de reclamaciones a corto plazo (1-2 años)
   - Riesgo de enfermedades crónicas a mediano plazo (3-5 años)
   - Expectativa de costos médicos anuales
   - Factores que podrían aumentar/disminuir el riesgo

3. RECOMENDACIONES DE PRICING:
   - Multiplicador de prima sugerido
   - Exclusiones o limitaciones recomendadas
   - Período de espera sugerido para condiciones preexistentes
   - Descuentos por programas de bienestar

4. ESTRATEGIAS DE MITIGACIÓN:
   - Programas de prevención recomendados
   - Incentivos para mejora de salud
   - Monitoreo continuo sugerido
   - Intervenciones preventivas costo-efectivas

5. ANÁLISIS DE PORTAFOLIO:
   - Impacto en diversificación de riesgo
   - Contribución al pool de riesgo general
   - Recomendaciones de retención/reaseguro
   - Estrategias de gestión de cartera

6. CONSIDERACIONES REGULATORIAS:
   - Cumplimiento con normativas locales
   - Aspectos de privacidad y protección de datos
   - Documentación requerida
   - Procesos de apelación

Presenta el análisis de manera técnica pero clara, con justificaciones basadas en evidencia científica y mejores prácticas actuariales.`
  }
};

// Clase para gestión de prompts
export class PromptManager {
  constructor() {
    this.prompts = this.loadPrompts();
  }

  // Cargar prompts desde localStorage o usar defaults
  loadPrompts() {
    try {
      const saved = localStorage.getItem('holocheck_prompts');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge con defaults para asegurar que todos los prompts existan
        return { ...DEFAULT_PROMPTS, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading saved prompts, using defaults:', error);
    }
    return { ...DEFAULT_PROMPTS };
  }

  // Guardar prompts en localStorage
  savePrompts() {
    try {
      localStorage.setItem('holocheck_prompts', JSON.stringify(this.prompts));
      return true;
    } catch (error) {
      console.error('Error saving prompts:', error);
      return false;
    }
  }

  // Obtener prompt por tipo
  getPrompt(type) {
    return this.prompts[type] || DEFAULT_PROMPTS[type];
  }

  // Actualizar prompt
  updatePrompt(type, promptData) {
    if (this.prompts[type]) {
      this.prompts[type] = { ...this.prompts[type], ...promptData };
      return this.savePrompts();
    }
    return false;
  }

  // Restaurar prompt a default
  resetPrompt(type) {
    if (DEFAULT_PROMPTS[type]) {
      this.prompts[type] = { ...DEFAULT_PROMPTS[type] };
      return this.savePrompts();
    }
    return false;
  }

  // Validar variables en prompt
  validatePrompt(promptText, requiredVariables) {
    const errors = [];
    
    // Verificar que todas las variables requeridas estén presentes
    requiredVariables.forEach(variable => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      if (!regex.test(promptText)) {
        errors.push(`Variable requerida faltante: {${variable}}`);
      }
    });

    // Verificar variables no reconocidas
    const variableRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = variableRegex.exec(promptText)) !== null) {
      const variable = match[1];
      if (!requiredVariables.includes(variable)) {
        errors.push(`Variable no reconocida: {${variable}}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Procesar prompt con datos
  processPrompt(type, data) {
    const prompt = this.getPrompt(type);
    if (!prompt) {
      throw new Error(`Prompt type '${type}' not found`);
    }

    let processedPrompt = prompt.prompt;
    
    // Reemplazar variables con datos
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedPrompt = processedPrompt.replace(regex, data[key] || '[No disponible]');
    });

    return processedPrompt;
  }

  // Exportar configuración
  exportConfig() {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      prompts: this.prompts
    };
  }

  // Importar configuración
  importConfig(config) {
    try {
      if (config.prompts) {
        this.prompts = { ...DEFAULT_PROMPTS, ...config.prompts };
        return this.savePrompts();
      }
      return false;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }

  // Obtener estadísticas de uso
  getUsageStats() {
    const stats = JSON.parse(localStorage.getItem('holocheck_prompt_stats') || '{}');
    return {
      personal: stats.personal || 0,
      company: stats.company || 0,
      insurance: stats.insurance || 0
    };
  }

  // Incrementar contador de uso
  incrementUsage(type) {
    const stats = this.getUsageStats();
    stats[type] = (stats[type] || 0) + 1;
    localStorage.setItem('holocheck_prompt_stats', JSON.stringify(stats));
  }
}

// Instancia global del manager
export const promptManager = new PromptManager();

// Funciones de utilidad
export const getPromptByType = (type) => promptManager.getPrompt(type);
export const processPromptWithData = (type, data) => promptManager.processPrompt(type, data);
export const validatePromptVariables = (promptText, variables) => promptManager.validatePrompt(promptText, variables);

export default promptManager;