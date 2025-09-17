// OpenAI Service for Real AI Analysis
// Integrates with configured prompts for Personal, Company, and Insurance analysis

// Secure API key configuration - uses environment variables or localStorage
const getOpenAIApiKey = () => {
  // Priority: Environment variable > localStorage > Settings panel
  return import.meta.env.VITE_OPENAI_API_KEY || 
         localStorage.getItem('holocheck_openai_key') || 
         null;
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

import { promptManager, processPromptWithData } from './openaiPrompts';

// OpenAI API Configuration
const DEFAULT_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};

// Main function to analyze with OpenAI
export const analyzeWithOpenAI = async (promptType, data, analysisType = 'personal') => {
  try {
    console.log(`[OpenAI] Starting ${analysisType} analysis...`);
    
    // Get API key securely
    const apiKey = getOpenAIApiKey();
    
    // Validate API key
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('OpenAI API key no configurada. Ve a Configuración para agregar tu API key.');
    }

    // Process prompt with data using prompt manager
    const processedPrompt = processPromptWithData(promptType, data);
    console.log(`[OpenAI] Processed prompt length: ${processedPrompt.length} characters`);

    // Prepare request payload
    const payload = {
      ...DEFAULT_CONFIG,
      messages: [
        {
          role: 'system',
          content: 'Eres un especialista en análisis de salud biométrica y medicina preventiva. Proporciona análisis detallados, precisos y accionables basados en los datos proporcionados.'
        },
        {
          role: 'user',
          content: processedPrompt
        }
      ]
    };

    console.log(`[OpenAI] Making API request to ${OPENAI_API_URL}`);

    // Make API request
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log(`[OpenAI] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[OpenAI] API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(`[OpenAI] Analysis completed successfully`);

    // Extract and return the analysis
    const analysis = result.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('No analysis content received from OpenAI');
    }

    // Increment usage statistics
    promptManager.incrementUsage(promptType);

    // Return structured response
    return {
      success: true,
      analysis: analysis,
      type: analysisType,
      promptType: promptType,
      timestamp: new Date().toISOString(),
      usage: result.usage,
      model: result.model,
      data: data
    };

  } catch (error) {
    console.error('[OpenAI] Analysis failed:', error);
    
    return {
      success: false,
      error: error.message,
      type: analysisType,
      promptType: promptType,
      timestamp: new Date().toISOString(),
      data: data
    };
  }
};

// Specific analysis functions for each pillar
export const analyzePersonalHealth = async (biometricData) => {
  console.log('[OpenAI] Starting personal health analysis...');
  
  const data = {
    biomarcadores: JSON.stringify(biometricData.metrics || {}, null, 2),
    edad: biometricData.age || 'No especificada',
    genero: biometricData.gender || 'No especificado',
    historialMedico: biometricData.medicalHistory || 'No disponible',
    factoresRiesgo: Array.isArray(biometricData.riskFactors) 
      ? biometricData.riskFactors.join(', ') 
      : 'No identificados'
  };

  return await analyzeWithOpenAI('personal', data, 'personal');
};

export const analyzeCompanyHealth = async (employeeData) => {
  console.log('[OpenAI] Starting company health analysis...');
  
  const data = {
    datosEmpleados: JSON.stringify(employeeData.aggregatedMetrics || {}, null, 2),
    departamento: employeeData.department || 'General',
    tamanoEmpresa: employeeData.companySize || 'No especificado',
    industria: employeeData.industry || 'No especificada',
    metricas: JSON.stringify(employeeData.kpis || {}, null, 2)
  };

  return await analyzeWithOpenAI('company', data, 'company');
};

export const analyzeInsuranceRisk = async (riskProfile) => {
  console.log('[OpenAI] Starting insurance risk analysis...');
  
  const data = {
    perfilRiesgo: JSON.stringify(riskProfile.profile || {}, null, 2),
    historialMedico: riskProfile.medicalHistory || 'No disponible',
    biomarcadores: JSON.stringify(riskProfile.biometrics || {}, null, 2),
    edad: riskProfile.age || 'No especificada',
    ocupacion: riskProfile.occupation || 'No especificada'
  };

  return await analyzeWithOpenAI('insurance', data, 'insurance');
};

// Test OpenAI connection
export const testOpenAIConnection = async () => {
  try {
    console.log('[OpenAI] Testing API connection...');
    
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('API key no configurada o inválida');
    }
    
    const testPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Responde con "Conexión exitosa" si recibes este mensaje.'
        }
      ],
      max_tokens: 10
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Test Failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('[OpenAI] Connection test successful');
    
    return {
      success: true,
      message: 'Conexión con OpenAI establecida correctamente',
      response: result.choices[0]?.message?.content,
      model: result.model
    };

  } catch (error) {
    console.error('[OpenAI] Connection test failed:', error);
    
    return {
      success: false,
      message: 'Error de conexión con OpenAI',
      error: error.message
    };
  }
};

// Get available models
export const getAvailableModels = () => {
  return [
    { id: 'gpt-4', name: 'GPT-4', description: 'Modelo más avanzado, mejor para análisis complejos' },
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Versión optimizada de GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Rápido y eficiente para análisis básicos' }
  ];
};

// Update model configuration
export const updateModelConfig = (newConfig) => {
  Object.assign(DEFAULT_CONFIG, newConfig);
  localStorage.setItem('holocheck_openai_config', JSON.stringify(DEFAULT_CONFIG));
  console.log('[OpenAI] Model configuration updated:', newConfig);
};

// Load saved configuration
export const loadModelConfig = () => {
  try {
    const saved = localStorage.getItem('holocheck_openai_config');
    if (saved) {
      const config = JSON.parse(saved);
      Object.assign(DEFAULT_CONFIG, config);
      console.log('[OpenAI] Configuration loaded from storage');
    }
  } catch (error) {
    console.warn('[OpenAI] Failed to load saved configuration:', error);
  }
  return DEFAULT_CONFIG;
};

// Check if API key is configured
export const isApiKeyConfigured = () => {
  const apiKey = getOpenAIApiKey();
  return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
};

// Initialize configuration on import
loadModelConfig();

export default {
  analyzeWithOpenAI,
  analyzePersonalHealth,
  analyzeCompanyHealth,
  analyzeInsuranceRisk,
  testOpenAIConnection,
  getAvailableModels,
  updateModelConfig,
  loadModelConfig,
  isApiKeyConfigured
};