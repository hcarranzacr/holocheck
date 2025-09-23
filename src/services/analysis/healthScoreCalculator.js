/**
 * Health Score Calculator
 * Version: v1.2.0-HEALTH-SCORING
 * 
 * Calculates comprehensive health scores based on multiple biomarkers
 * Implements clinical guidelines and research-based scoring algorithms
 */

class HealthScoreCalculator {
  constructor() {
    // Clinical reference ranges and weights
    this.referenceRanges = {
      heartRate: { optimal: [60, 80], acceptable: [50, 100], weight: 0.15 },
      rmssd: { optimal: [30, 60], acceptable: [20, 80], weight: 0.12 },
      sdnn: { optimal: [35, 65], acceptable: [25, 80], weight: 0.10 },
      oxygenSaturation: { optimal: [97, 100], acceptable: [95, 100], weight: 0.15 },
      bloodPressureSystolic: { optimal: [110, 130], acceptable: [90, 140], weight: 0.12 },
      bloodPressureDiastolic: { optimal: [70, 85], acceptable: [60, 90], weight: 0.10 },
      respiratoryRate: { optimal: [12, 20], acceptable: [8, 25], weight: 0.08 },
      perfusionIndex: { optimal: [1.0, 5.0], acceptable: [0.5, 8.0], weight: 0.06 },
      stressLevel: { optimal: [0, 30], acceptable: [0, 50], weight: 0.12 }
    };

    // Voice biomarker ranges
    this.voiceRanges = {
      fundamentalFrequency: { 
        male: { optimal: [85, 180], acceptable: [70, 250] },
        female: { optimal: [165, 265], acceptable: [120, 350] },
        weight: 0.08
      },
      jitter: { optimal: [0, 1.5], acceptable: [0, 3.0], weight: 0.06 },
      shimmer: { optimal: [0, 3.0], acceptable: [0, 6.0], weight: 0.06 },
      vocalStress: { optimal: [0, 25], acceptable: [0, 50], weight: 0.10 }
    };

    console.log('🏥 Health Score Calculator v1.2.0 initialized');
  }

  /**
   * Calculate comprehensive health score from biomarkers
   */
  calculateHealthScore(biomarkers) {
    try {
      if (!biomarkers || typeof biomarkers !== 'object') {
        return null;
      }

      let totalScore = 0;
      let totalWeight = 0;
      let assessedBiomarkers = 0;
      const individualScores = {};

      // Assess cardiovascular biomarkers
      for (const [biomarker, ranges] of Object.entries(this.referenceRanges)) {
        const value = this.extractBiomarkerValue(biomarkers, biomarker);
        
        if (value !== null && value !== undefined) {
          const score = this.calculateBiomarkerScore(value, ranges);
          individualScores[biomarker] = {
            value: value,
            score: score,
            weight: ranges.weight,
            category: 'cardiovascular'
          };
          
          totalScore += score * ranges.weight;
          totalWeight += ranges.weight;
          assessedBiomarkers++;
        }
      }

      // Assess voice biomarkers
      for (const [biomarker, ranges] of Object.entries(this.voiceRanges)) {
        const value = this.extractBiomarkerValue(biomarkers, biomarker);
        
        if (value !== null && value !== undefined) {
          let score;
          
          if (biomarker === 'fundamentalFrequency') {
            // Gender-specific scoring for F0
            const gender = this.estimateGender(value);
            const genderRanges = ranges[gender];
            score = this.calculateBiomarkerScore(value, genderRanges);
          } else {
            score = this.calculateBiomarkerScore(value, ranges);
          }
          
          individualScores[biomarker] = {
            value: value,
            score: score,
            weight: ranges.weight,
            category: 'voice'
          };
          
          totalScore += score * ranges.weight;
          totalWeight += ranges.weight;
          assessedBiomarkers++;
        }
      }

      if (totalWeight === 0 || assessedBiomarkers === 0) {
        return null;
      }

      // Calculate weighted average
      const baseScore = (totalScore / totalWeight) * 100;

      // Apply completeness bonus (more biomarkers = more reliable score)
      const completenessBonus = Math.min(10, assessedBiomarkers * 0.5);
      
      // Apply consistency penalty (high variability in scores)
      const consistencyPenalty = this.calculateConsistencyPenalty(individualScores);
      
      // Final health score
      const finalScore = Math.max(0, Math.min(100, baseScore + completenessBonus - consistencyPenalty));

      return {
        score: Math.round(finalScore),
        level: this.scoreToHealthLevel(finalScore),
        confidence: this.calculateConfidence(assessedBiomarkers, totalWeight),
        assessedBiomarkers: assessedBiomarkers,
        individualScores: individualScores,
        breakdown: {
          baseScore: Math.round(baseScore),
          completenessBonus: Math.round(completenessBonus),
          consistencyPenalty: Math.round(consistencyPenalty)
        }
      };

    } catch (error) {
      console.error('Error calculating health score:', error);
      return null;
    }
  }

  /**
   * Extract biomarker value from data object
   */
  extractBiomarkerValue(biomarkers, biomarkerName) {
    // Handle blood pressure specially
    if (biomarkerName === 'bloodPressureSystolic' || biomarkerName === 'bloodPressureDiastolic') {
      const bp = biomarkers.bloodPressure;
      if (bp && typeof bp === 'string' && bp.includes('/')) {
        const [systolic, diastolic] = bp.split('/').map(v => parseInt(v.trim()));
        return biomarkerName === 'bloodPressureSystolic' ? systolic : diastolic;
      }
      return null;
    }

    // Direct mapping
    const directValue = biomarkers[biomarkerName];
    if (directValue !== null && directValue !== undefined && !isNaN(directValue)) {
      return parseFloat(directValue);
    }

    // Alternative names mapping
    const alternativeNames = {
      heartRate: ['hr', 'pulse', 'bpm'],
      rmssd: ['heartRateVariability', 'hrv'],
      oxygenSaturation: ['spo2', 'o2sat', 'spO2'],
      respiratoryRate: ['rr', 'breathingRate'],
      stressLevel: ['stress', 'vocalStress'],
      fundamentalFrequency: ['f0', 'pitch'],
      vocalStress: ['stressLevel', 'stress']
    };

    const alternatives = alternativeNames[biomarkerName] || [];
    for (const alt of alternatives) {
      const altValue = biomarkers[alt];
      if (altValue !== null && altValue !== undefined && !isNaN(altValue)) {
        return parseFloat(altValue);
      }
    }

    return null;
  }

  /**
   * Calculate score for individual biomarker
   */
  calculateBiomarkerScore(value, ranges) {
    if (!ranges || !ranges.optimal || !ranges.acceptable) {
      return 0.5; // Neutral score if no ranges defined
    }

    const [optimalMin, optimalMax] = ranges.optimal;
    const [acceptableMin, acceptableMax] = ranges.acceptable;

    // Perfect score if in optimal range
    if (value >= optimalMin && value <= optimalMax) {
      return 1.0;
    }

    // Partial score if in acceptable range
    if (value >= acceptableMin && value <= acceptableMax) {
      if (value < optimalMin) {
        // Below optimal range
        const distance = optimalMin - value;
        const maxDistance = optimalMin - acceptableMin;
        return 0.7 + 0.3 * (1 - distance / maxDistance);
      } else {
        // Above optimal range
        const distance = value - optimalMax;
        const maxDistance = acceptableMax - optimalMax;
        return 0.7 + 0.3 * (1 - distance / maxDistance);
      }
    }

    // Poor score if outside acceptable range
    if (value < acceptableMin) {
      const distance = acceptableMin - value;
      const penalty = Math.min(0.6, distance / acceptableMin);
      return Math.max(0.1, 0.4 - penalty);
    } else {
      const distance = value - acceptableMax;
      const penalty = Math.min(0.6, distance / acceptableMax);
      return Math.max(0.1, 0.4 - penalty);
    }
  }

  /**
   * Estimate gender from fundamental frequency
   */
  estimateGender(f0) {
    // Simple gender estimation based on F0
    // This is a rough approximation
    return f0 < 200 ? 'male' : 'female';
  }

  /**
   * Calculate consistency penalty based on score variability
   */
  calculateConsistencyPenalty(individualScores) {
    const scores = Object.values(individualScores).map(item => item.score);
    
    if (scores.length < 3) {
      return 0; // No penalty for few biomarkers
    }

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Penalty increases with higher standard deviation
    return Math.min(15, stdDev * 30); // Max 15 point penalty
  }

  /**
   * Calculate confidence level based on number of biomarkers and total weight
   */
  calculateConfidence(assessedBiomarkers, totalWeight) {
    // Base confidence on number of biomarkers
    let confidence = Math.min(0.9, assessedBiomarkers * 0.08); // Max 90% from count
    
    // Boost confidence based on total weight (importance of assessed biomarkers)
    confidence += Math.min(0.1, totalWeight * 0.1); // Max 10% boost from weight
    
    return Math.round(confidence * 100);
  }

  /**
   * Convert score to health level
   */
  scoreToHealthLevel(score) {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Buena';
    if (score >= 55) return 'Aceptable';
    if (score >= 40) return 'Regular';
    return 'Preocupante';
  }

  /**
   * Generate health recommendations based on individual biomarker scores
   */
  generateRecommendations(healthScoreResult) {
    if (!healthScoreResult || !healthScoreResult.individualScores) {
      return ['Análisis insuficiente para generar recomendaciones específicas.'];
    }

    const recommendations = [];
    const { individualScores } = healthScoreResult;

    // Analyze each biomarker for specific recommendations
    for (const [biomarker, data] of Object.entries(individualScores)) {
      if (data.score < 0.6) { // Poor score
        const recommendation = this.getBiomarkerRecommendation(biomarker, data.value, data.score);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    // General recommendations based on overall score
    if (healthScoreResult.score < 55) {
      recommendations.push('Considere consultar con un profesional de la salud para una evaluación más detallada.');
    }

    if (healthScoreResult.score >= 70) {
      recommendations.push('Mantenga sus hábitos saludables actuales y continúe con el monitoreo regular.');
    }

    // If no specific recommendations, provide general wellness advice
    if (recommendations.length === 0) {
      recommendations.push('Continúe con un estilo de vida saludable: ejercicio regular, alimentación balanceada y descanso adecuado.');
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Get specific recommendation for a biomarker
   */
  getBiomarkerRecommendation(biomarker, value, score) {
    const recommendations = {
      heartRate: {
        high: 'Considere técnicas de relajación y reduzca el consumo de cafeína para normalizar su frecuencia cardíaca.',
        low: 'Si experimenta fatiga, consulte con un médico sobre su frecuencia cardíaca baja.'
      },
      rmssd: {
        low: 'Mejore su variabilidad cardíaca con ejercicio regular, técnicas de respiración y manejo del estrés.'
      },
      oxygenSaturation: {
        low: 'Practique ejercicios de respiración profunda y considere evaluación médica si persiste.'
      },
      bloodPressureSystolic: {
        high: 'Reduzca el consumo de sal, mantenga un peso saludable y practique actividad física regular.',
        low: 'Manténgase hidratado y consulte si experimenta mareos frecuentes.'
      },
      stressLevel: {
        high: 'Implemente técnicas de manejo del estrés como meditación, yoga o ejercicio regular.'
      },
      vocalStress: {
        high: 'Practique técnicas de relajación vocal y considere reducir factores de estrés en su entorno.'
      }
    };

    const biomarkerRecs = recommendations[biomarker];
    if (!biomarkerRecs) return null;

    // Determine if value is high or low based on biomarker type
    if (biomarker === 'heartRate') {
      return value > 90 ? biomarkerRecs.high : biomarkerRecs.low;
    } else if (biomarker === 'bloodPressureSystolic') {
      return value > 140 ? biomarkerRecs.high : biomarkerRecs.low;
    } else if (['stressLevel', 'vocalStress'].includes(biomarker)) {
      return biomarkerRecs.high;
    } else {
      return biomarkerRecs.low || biomarkerRecs.high;
    }
  }

  /**
   * Calculate risk assessment based on health score
   */
  calculateRiskAssessment(healthScoreResult) {
    if (!healthScoreResult) {
      return {
        level: 'unknown',
        factors: [],
        urgency: 'low'
      };
    }

    const { score, individualScores } = healthScoreResult;
    const riskFactors = [];
    let urgency = 'low';

    // Identify high-risk biomarkers
    for (const [biomarker, data] of Object.entries(individualScores)) {
      if (data.score < 0.4) {
        riskFactors.push(`${biomarker}: valor preocupante`);
        
        // Check for urgent conditions
        if (['oxygenSaturation', 'bloodPressureSystolic'].includes(biomarker)) {
          urgency = 'high';
        } else if (['heartRate', 'stressLevel'].includes(biomarker)) {
          urgency = Math.max(urgency, 'moderate');
        }
      }
    }

    // Overall risk level
    let riskLevel;
    if (score >= 70) riskLevel = 'low';
    else if (score >= 55) riskLevel = 'moderate';
    else riskLevel = 'high';

    return {
      level: riskLevel,
      factors: riskFactors,
      urgency: urgency,
      score: score
    };
  }

  /**
   * Get health score status and interpretation
   */
  getHealthScoreStatus(score) {
    const interpretations = {
      'Excelente': {
        description: 'Sus biomarcadores indican un excelente estado de salud.',
        color: '#10B981',
        icon: '🟢'
      },
      'Buena': {
        description: 'Sus biomarcadores muestran un buen estado de salud general.',
        color: '#059669',
        icon: '🟢'
      },
      'Aceptable': {
        description: 'Sus biomarcadores están dentro de rangos aceptables.',
        color: '#F59E0B',
        icon: '🟡'
      },
      'Regular': {
        description: 'Algunos biomarcadores requieren atención y mejora.',
        color: '#EF4444',
        icon: '🟠'
      },
      'Preocupante': {
        description: 'Varios biomarcadores indican la necesidad de atención médica.',
        color: '#DC2626',
        icon: '🔴'
      }
    };

    const level = this.scoreToHealthLevel(score);
    return {
      level,
      score,
      ...interpretations[level]
    };
  }
}

export default HealthScoreCalculator;