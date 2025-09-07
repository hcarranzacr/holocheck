// Biometric data processing and validation service
class BiometricService {
  constructor() {
    this.qualityThresholds = {
      image: {
        minWidth: 640,
        minHeight: 480,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
      },
      audio: {
        minDuration: 15, // seconds
        maxDuration: 60, // seconds
        sampleRate: 44100,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['audio/wav', 'audio/mp3', 'audio/webm']
      }
    };
  }

  validateImageQuality(file, imageElement) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      quality: 'good'
    };

    // File size check
    if (file.size > this.qualityThresholds.image.maxFileSize) {
      validation.isValid = false;
      validation.errors.push('La imagen es demasiado grande (máximo 5MB)');
    }

    // Format check
    if (!this.qualityThresholds.image.allowedFormats.includes(file.type)) {
      validation.isValid = false;
      validation.errors.push('Formato de imagen no soportado. Use JPG, PNG o WebP');
    }

    // Resolution check
    if (imageElement) {
      if (imageElement.naturalWidth < this.qualityThresholds.image.minWidth ||
          imageElement.naturalHeight < this.qualityThresholds.image.minHeight) {
        validation.isValid = false;
        validation.errors.push('Resolución muy baja (mínimo 640x480)');
      }
    }

    return validation;
  }

  validateAudioQuality(audioBlob, duration) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      quality: 'good'
    };

    // Duration check
    if (duration < this.qualityThresholds.audio.minDuration) {
      validation.isValid = false;
      validation.errors.push(`Grabación muy corta (mínimo ${this.qualityThresholds.audio.minDuration}s)`);
    }

    if (duration > this.qualityThresholds.audio.maxDuration) {
      validation.warnings.push(`Grabación larga, se procesarán los primeros ${this.qualityThresholds.audio.maxDuration}s`);
    }

    // File size check
    if (audioBlob.size > this.qualityThresholds.audio.maxFileSize) {
      validation.isValid = false;
      validation.errors.push('Audio demasiado grande (máximo 10MB)');
    }

    return validation;
  }

  async processImageForAnalysis(file) {
    try {
      // Convert to base64 for OpenAI
      const base64 = await this.fileToBase64(file);
      
      // Get image metadata
      const imageElement = await this.loadImage(file);
      const metadata = {
        width: imageElement.naturalWidth,
        height: imageElement.naturalHeight,
        size: file.size,
        type: file.type,
        lighting: this.assessLighting(imageElement),
        stability: 'good', // Would need motion detection for real assessment
        resolution: `${imageElement.naturalWidth}x${imageElement.naturalHeight}`
      };

      return {
        imageData: base64,
        metadata,
        validation: this.validateImageQuality(file, imageElement)
      };
    } catch (error) {
      throw new Error('Error procesando imagen: ' + error.message);
    }
  }

  async processAudioForAnalysis(audioBlob, duration) {
    try {
      const metadata = {
        duration,
        size: audioBlob.size,
        type: audioBlob.type,
        quality: this.assessAudioQuality(audioBlob),
        backgroundNoise: 'low' // Would need audio analysis for real assessment
      };

      return {
        audioData: audioBlob,
        metadata,
        validation: this.validateAudioQuality(audioBlob, duration)
      };
    } catch (error) {
      throw new Error('Error procesando audio: ' + error.message);
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  assessLighting(imageElement) {
    // Simplified lighting assessment
    // In a real implementation, this would analyze pixel brightness distribution
    return 'good';
  }

  assessAudioQuality(audioBlob) {
    // Simplified audio quality assessment
    // In a real implementation, this would analyze audio characteristics
    if (audioBlob.size < 100000) return 'poor';
    if (audioBlob.size < 500000) return 'fair';
    return 'good';
  }

  calculateRiskScore(selfieAnalysis, voiceAnalysis) {
    let totalScore = 0;
    let factors = 0;

    // Selfie risk factors
    if (selfieAnalysis?.overallAssessment?.healthScore) {
      totalScore += selfieAnalysis.overallAssessment.healthScore;
      factors++;
    }

    // Voice risk factors
    if (voiceAnalysis?.overallAssessment?.healthScore) {
      totalScore += voiceAnalysis.overallAssessment.healthScore;
      factors++;
    }

    const averageScore = factors > 0 ? totalScore / factors : 50;
    
    return {
      score: Math.round(averageScore),
      level: this.scoreToRiskLevel(averageScore),
      factors: {
        selfie: selfieAnalysis?.overallAssessment?.riskLevel || 'unknown',
        voice: voiceAnalysis?.overallAssessment?.riskLevel || 'unknown'
      }
    };
  }

  scoreToRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'moderate';
    return 'high';
  }

  generateRecommendations(integratedAnalysis) {
    const recommendations = [];
    
    if (integratedAnalysis.correlatedAnalysis.stressLevel === 'high') {
      recommendations.push({
        category: 'Manejo del Estrés',
        priority: 'high',
        actions: [
          'Practique técnicas de respiración profunda',
          'Considere actividades de relajación como yoga o meditación',
          'Evalúe su carga de trabajo y busque apoyo si es necesario'
        ]
      });
    }

    if (integratedAnalysis.correlatedAnalysis.fatigueLevel === 'high') {
      recommendations.push({
        category: 'Manejo de la Fatiga',
        priority: 'moderate',
        actions: [
          'Asegúrese de dormir 7-9 horas por noche',
          'Mantenga horarios regulares de sueño',
          'Evite cafeína 6 horas antes de dormir'
        ]
      });
    }

    return recommendations;
  }

  shouldRecommendMedicalConsultation(integratedAnalysis) {
    const highRiskFactors = [];

    if (integratedAnalysis.executiveSummary.riskLevel === 'high') {
      highRiskFactors.push('Múltiples indicadores de riesgo elevado');
    }

    if (integratedAnalysis.correlatedAnalysis.mentalWellbeing === 'concerning') {
      highRiskFactors.push('Indicadores de bienestar mental que requieren atención');
    }

    return {
      recommended: highRiskFactors.length > 0,
      urgency: integratedAnalysis.executiveSummary.urgencyLevel,
      reasons: highRiskFactors
    };
  }
}

export default new BiometricService();