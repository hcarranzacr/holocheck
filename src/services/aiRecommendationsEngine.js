/**
 * AI Recommendations Engine - Version 1.1.0
 * Generates personalized health recommendations based on biomarker analysis
 * FIXED: Proper integration with openaiService and prompt system
 */

import { openaiService } from './openaiService.js';
import { getPromptForUserType, getBiomarkerAnalysisPrompt } from './openaiPrompts.js';

/**
 * Generate comprehensive AI recommendations based on biomarker analysis
 * FIXED: Uses proper prompt integration and fallback system
 */
export const generateAIRecommendations = async (biomarkerAnalysis) => {
  try {
    console.log('🤖 Generando recomendaciones AI con sistema de prompts integrado...');
    
    if (!biomarkerAnalysis || biomarkerAnalysis.status === 'error') {
      throw new Error('Invalid biomarker analysis data');
    }
    
    // Extract key metrics for analysis
    const keyMetrics = extractKeyMetrics(biomarkerAnalysis);
    
    // Create biomarker summary for AI analysis
    const biomarkerSummary = createBiomarkerSummary(keyMetrics, biomarkerAnalysis);
    
    // Determine user type based on biomarkers (could be enhanced with user input)
    const userType = determineUserType(keyMetrics);
    
    // Generate AI recommendations using proper prompt system
    console.log(`📋 Usando prompts para usuario tipo: ${userType}`);
    const aiRecommendations = await openaiService.generateRecommendations(
      biomarkerSummary, 
      userType, 
      'biomarker'
    );
    
    // Parse and structure the AI response
    const structuredRecommendations = parseAIRecommendations(aiRecommendations);
    
    // Generate additional analysis components
    const medicalSummary = generateMedicalSummary(keyMetrics);
    const riskAssessment = generateRiskAssessment(keyMetrics);
    
    const finalRecommendations = {
      timestamp: new Date().toISOString(),
      analysisId: biomarkerAnalysis.analysisId || `analysis_${Date.now()}`,
      
      // Executive summary
      summary: {
        overallScore: biomarkerAnalysis.scores?.overall || calculateOverallScore(keyMetrics),
        primaryConcerns: identifyPrimaryConcerns(keyMetrics),
        keyFindings: identifyKeyFindings(keyMetrics),
        riskLevel: determineRiskLevel(keyMetrics),
        userType: userType
      },
      
      // AI-generated recommendations (properly integrated with prompts)
      aiRecommendations: aiRecommendations,
      
      // Structured recommendations
      recommendations: structuredRecommendations,
      
      // Medical summary
      medicalSummary,
      
      // Risk assessment
      riskAssessment,
      
      // Detailed insights
      insights: {
        cardiovascular: generateCardiovascularInsights(keyMetrics),
        respiratory: generateRespiratoryInsights(keyMetrics),
        stress: generateStressInsights(keyMetrics),
        voice: generateVoiceInsights(keyMetrics)
      },
      
      // Personalized action plan
      actionPlan: generateActionPlan(keyMetrics, userType),
      
      // Follow-up recommendations
      followUp: generateFollowUpRecommendations(keyMetrics),
      
      status: 'completed'
    };
    
    console.log('✅ Recomendaciones AI generadas exitosamente con sistema de prompts');
    return finalRecommendations;
    
  } catch (error) {
    console.error('❌ Error generando recomendaciones AI:', error);
    
    // Use fallback system with prompt context
    return generateFallbackRecommendations(biomarkerAnalysis, error);
  }
};

/**
 * FIXED: Export the function that BiometricCapture.jsx expects
 */
export const generatePersonalizedRecommendations = generateAIRecommendations;

/**
 * Extract key metrics for analysis
 */
const extractKeyMetrics = (biomarkerAnalysis) => {
  return {
    heartRate: biomarkerAnalysis.heartRate || biomarkerAnalysis.cardiovascular?.heartRate || 0,
    hrv: biomarkerAnalysis.cardiovascular?.hrv || biomarkerAnalysis.hrv || 0,
    respiratoryRate: biomarkerAnalysis.respiratoryRate || biomarkerAnalysis.respiratory?.rate || 0,
    oxygenSaturation: biomarkerAnalysis.respiratory?.oxygenSaturation || 0,
    stressLevel: biomarkerAnalysis.stress?.level || biomarkerAnalysis.stressLevel || 0,
    voiceQuality: biomarkerAnalysis.voice?.quality || biomarkerAnalysis.voiceQuality || 0,
    systolicBP: biomarkerAnalysis.cardiovascular?.systolicBP || 0,
    diastolicBP: biomarkerAnalysis.cardiovascular?.diastolicBP || 0,
    overallScore: biomarkerAnalysis.scores?.overall || 0,
    cardiovascularScore: biomarkerAnalysis.scores?.cardiovascular || 0,
    respiratoryScore: biomarkerAnalysis.scores?.respiratory || 0,
    stressScore: biomarkerAnalysis.scores?.stress || 0,
    signalQuality: biomarkerAnalysis.signalQuality?.overall || 0
  };
};

/**
 * Create comprehensive biomarker summary for AI analysis
 */
const createBiomarkerSummary = (keyMetrics, fullAnalysis) => {
  return `ANÁLISIS BIOMÉTRICO COMPLETO

BIOMARCADORES CARDIOVASCULARES:
- Frecuencia Cardíaca: ${keyMetrics.heartRate} BPM
- Variabilidad Cardíaca (HRV): ${keyMetrics.hrv} ms
- Presión Arterial Estimada: ${keyMetrics.systolicBP}/${keyMetrics.diastolicBP} mmHg
- Score Cardiovascular: ${keyMetrics.cardiovascularScore}/100

BIOMARCADORES RESPIRATORIOS:
- Frecuencia Respiratoria: ${keyMetrics.respiratoryRate} resp/min
- Saturación de Oxígeno Estimada: ${keyMetrics.oxygenSaturation}%
- Score Respiratorio: ${keyMetrics.respiratoryScore}/100

BIOMARCADORES DE ESTRÉS Y VOZ:
- Nivel de Estrés Vocal: ${keyMetrics.stressLevel}%
- Calidad de Voz: ${keyMetrics.voiceQuality}%
- Carga Cognitiva: ${fullAnalysis.stress?.cognitiveLoad || 0}%
- Score de Estrés: ${keyMetrics.stressScore}/100

MÉTRICAS GENERALES:
- Score General de Salud: ${keyMetrics.overallScore}/100
- Calidad de Señal: ${keyMetrics.signalQuality}%
- Duración del Análisis: ${fullAnalysis.duration || 30} segundos
- Timestamp: ${new Date().toISOString()}

CONTEXTO ADICIONAL:
${fullAnalysis.rawData ? 'Datos completos de análisis disponibles' : 'Análisis básico completado'}
${keyMetrics.signalQuality > 80 ? 'Alta calidad de señal detectada' : 'Calidad de señal moderada'}`;
};

/**
 * Determine user type based on biomarkers
 */
const determineUserType = (keyMetrics) => {
  // Enhanced logic to determine user type
  if (keyMetrics.heartRate < 60 && keyMetrics.hrv > 40) {
    return 'athlete'; // Likely athlete with low resting HR and high HRV
  } else if (keyMetrics.stressLevel > 50 || keyMetrics.voiceQuality < 60) {
    return 'wellness'; // High stress or voice issues suggest wellness focus
  } else if (keyMetrics.overallScore < 60) {
    return 'medical'; // Low overall score suggests medical attention needed
  } else {
    return 'general'; // Default to general health recommendations
  }
};

/**
 * Parse AI recommendations into structured format
 */
const parseAIRecommendations = (aiResponse) => {
  try {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    let currentCategory = 'immediate';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('inmediata') || lowerLine.includes('24') || lowerLine.includes('48')) {
        currentCategory = 'immediate';
      } else if (lowerLine.includes('corto plazo') || lowerLine.includes('semana') || lowerLine.includes('1-4')) {
        currentCategory = 'shortTerm';
      } else if (lowerLine.includes('largo plazo') || lowerLine.includes('mes') || lowerLine.includes('1-3')) {
        currentCategory = 'longTerm';
      } else if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
        const recommendation = line.replace(/^[-•\d.]\s*/, '').trim();
        if (recommendation && recommendation.length > 10) {
          recommendations[currentCategory].push(recommendation);
        }
      }
    }
    
    return recommendations;
    
  } catch (error) {
    console.error('Error parsing AI recommendations:', error);
    return {
      immediate: ['Consulte con un profesional de la salud para interpretación de resultados'],
      shortTerm: ['Mantenga un registro de sus síntomas y métricas'],
      longTerm: ['Establezca un programa de monitoreo regular de salud']
    };
  }
};

/**
 * Generate fallback recommendations with prompt context
 */
const generateFallbackRecommendations = (biomarkerAnalysis, error) => {
  console.log('⚠️ Generando recomendaciones de fallback con contexto de prompts');
  
  const keyMetrics = extractKeyMetrics(biomarkerAnalysis);
  const userType = determineUserType(keyMetrics);
  
  // Use openaiService fallback which includes prompt context
  const fallbackText = openaiService.generateFallbackRecommendations(
    createBiomarkerSummary(keyMetrics, biomarkerAnalysis),
    userType
  );
  
  return {
    timestamp: new Date().toISOString(),
    analysisId: biomarkerAnalysis.analysisId || `fallback_${Date.now()}`,
    
    summary: {
      overallScore: keyMetrics.overallScore,
      primaryConcerns: identifyPrimaryConcerns(keyMetrics),
      keyFindings: ['Análisis completado con recomendaciones de fallback'],
      riskLevel: determineRiskLevel(keyMetrics),
      userType: userType
    },
    
    aiRecommendations: fallbackText,
    
    recommendations: parseAIRecommendations(fallbackText),
    
    medicalSummary: {
      findings: [`Análisis completado con limitaciones: ${error.message}`],
      overallAssessment: generateOverallAssessment(keyMetrics)
    },
    
    status: 'completed_fallback',
    error: error.message
  };
};

// Helper functions (simplified versions)
const calculateOverallScore = (metrics) => {
  let score = 100;
  if (metrics.heartRate > 100 || metrics.heartRate < 50) score -= 20;
  if (metrics.stressLevel > 50) score -= 15;
  if (metrics.voiceQuality < 70) score -= 10;
  return Math.max(0, Math.min(100, score));
};

const identifyPrimaryConcerns = (metrics) => {
  const concerns = [];
  if (metrics.heartRate > 100) concerns.push('Taquicardia');
  if (metrics.heartRate < 50) concerns.push('Bradicardia');
  if (metrics.stressLevel > 50) concerns.push('Estrés elevado');
  if (metrics.systolicBP > 140) concerns.push('Hipertensión');
  return concerns.length > 0 ? concerns : ['Ninguna preocupación mayor identificada'];
};

const identifyKeyFindings = (metrics) => {
  const findings = [];
  if (metrics.overallScore > 80) findings.push('Excelente estado de salud general');
  if (metrics.hrv > 40) findings.push('Muy buena variabilidad cardíaca');
  if (metrics.stressLevel < 20) findings.push('Bajo nivel de estrés');
  return findings.length > 0 ? findings : ['Análisis completado sin hallazgos destacables'];
};

const determineRiskLevel = (metrics) => {
  if (metrics.overallScore > 80) return 'low';
  if (metrics.overallScore > 60) return 'medium';
  return 'high';
};

const generateMedicalSummary = (metrics) => ({
  findings: [
    `Frecuencia cardíaca: ${metrics.heartRate} BPM`,
    `Nivel de estrés: ${metrics.stressLevel}%`,
    `Score general: ${metrics.overallScore}/100`
  ],
  overallAssessment: generateOverallAssessment(metrics)
});

const generateOverallAssessment = (metrics) => {
  if (metrics.overallScore > 85) {
    return 'Estado de salud excelente con todos los parámetros en rangos óptimos';
  } else if (metrics.overallScore > 70) {
    return 'Estado de salud bueno con algunos parámetros que requieren atención';
  } else if (metrics.overallScore > 50) {
    return 'Estado de salud moderado con varios parámetros que requieren mejora';
  } else {
    return 'Estado de salud que requiere atención médica y cambios significativos en el estilo de vida';
  }
};

const generateRiskAssessment = (metrics) => ({
  overallRisk: determineRiskLevel(metrics),
  risks: [],
  riskFactors: [],
  protectiveFactors: []
});

const generateCardiovascularInsights = (metrics) => [];
const generateRespiratoryInsights = (metrics) => [];
const generateStressInsights = (metrics) => [];
const generateVoiceInsights = (metrics) => [];

const generateActionPlan = (metrics, userType) => ({
  week1: ['Establecer rutina de monitoreo diario'],
  week2: ['Repetir análisis biométrico'],
  month1: ['Evaluación médica si hay indicadores de riesgo'],
  month3: ['Revisión completa de progreso']
});

const generateFollowUpRecommendations = (metrics) => [
  {
    timeframe: '2 semanas',
    action: 'Repetir análisis biométrico',
    priority: 'medium'
  }
];

export default {
  generateAIRecommendations,
  generatePersonalizedRecommendations
};