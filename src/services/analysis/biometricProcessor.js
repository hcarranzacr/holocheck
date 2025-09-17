/**
 * Biometric Processor - Central Coordinator
 * Manages real-time rPPG and voice analysis integration
 * Provides unified interface for 36+ biomarkers analysis
 */

import RealTimeRPPG from '../rppg/realTimeRPPG.js';
import VoiceAnalysisEngine from '../voice/voiceAnalysisEngine.js';
import CardiovascularMetrics from './cardiovascularMetrics.js';

export class BiometricProcessor {
  constructor() {
    this.isInitialized = false;
    this.isAnalyzing = false;
    
    // Analysis engines
    this.rppgEngine = new RealTimeRPPG();
    this.voiceEngine = new VoiceAnalysisEngine();
    this.cardiovascularCalculator = new CardiovascularMetrics();
    
    // Analysis state
    this.analysisStartTime = null;
    this.lastAnalysisTime = 0;
    this.analysisInterval = 1000; // 1 second
    
    // Data storage
    this.analysisHistory = [];
    this.maxHistoryLength = 300; // 5 minutes at 1Hz
    
    // Current analysis results
    this.currentResults = {
      cardiovascular: null,
      voice: null,
      combined: null,
      timestamp: null
    };
    
    // Analysis configuration
    this.config = {
      enableRPPG: true,
      enableVoice: true,
      realTimeUpdates: true,
      analysisQuality: 'high', // 'low', 'medium', 'high'
      medicalMode: true
    };
    
    // Event callbacks
    this.callbacks = {
      onAnalysisUpdate: null,
      onAnalysisComplete: null,
      onError: null,
      onQualityChange: null
    };
  }

  /**
   * Initialize biometric processor with video and audio
   */
  async initialize(videoElement, enableVoice = true) {
    try {
      console.log('🔬 Initializing Biometric Processor...');
      
      // Initialize rPPG engine
      const rppgInitialized = await this.rppgEngine.initialize(videoElement);
      if (!rppgInitialized) {
        throw new Error('Failed to initialize rPPG engine');
      }
      
      // Initialize voice engine if enabled
      if (enableVoice && this.config.enableVoice) {
        const voiceInitialized = await this.voiceEngine.initialize();
        if (!voiceInitialized) {
          console.warn('⚠️ Voice analysis initialization failed, continuing with rPPG only');
          this.config.enableVoice = false;
        }
      } else {
        this.config.enableVoice = false;
      }
      
      this.isInitialized = true;
      console.log('✅ Biometric Processor initialized successfully');
      
      return {
        success: true,
        rppgEnabled: true,
        voiceEnabled: this.config.enableVoice,
        message: 'Biometric analysis ready'
      };
      
    } catch (error) {
      console.error('❌ Biometric Processor initialization failed:', error);
      this.triggerCallback('onError', { type: 'initialization_failed', error: error.message });
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to initialize biometric analysis'
      };
    }
  }

  /**
   * Start comprehensive biometric analysis
   */
  startAnalysis() {
    if (!this.isInitialized) {
      console.error('❌ Cannot start analysis: Processor not initialized');
      return false;
    }
    
    if (this.isAnalyzing) {
      console.warn('⚠️ Analysis already in progress');
      return true;
    }
    
    try {
      this.isAnalyzing = true;
      this.analysisStartTime = Date.now();
      this.lastAnalysisTime = 0;
      
      // Reset analysis history
      this.analysisHistory = [];
      
      // Start real-time analysis loop
      this.startAnalysisLoop();
      
      console.log('🚀 Biometric analysis started');
      this.triggerCallback('onAnalysisUpdate', {
        status: 'started',
        timestamp: this.analysisStartTime,
        message: 'Biometric analysis initiated'
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start analysis:', error);
      this.triggerCallback('onError', { type: 'analysis_start_failed', error: error.message });
      return false;
    }
  }

  /**
   * Stop biometric analysis
   */
  stopAnalysis() {
    if (!this.isAnalyzing) {
      console.warn('⚠️ No analysis in progress');
      return false;
    }
    
    try {
      this.isAnalyzing = false;
      
      // Stop analysis loop
      if (this.analysisLoopId) {
        clearInterval(this.analysisLoopId);
        this.analysisLoopId = null;
      }
      
      const analysisDuration = Date.now() - this.analysisStartTime;
      
      console.log('⏹️ Biometric analysis stopped');
      this.triggerCallback('onAnalysisComplete', {
        status: 'completed',
        duration: analysisDuration,
        totalSamples: this.analysisHistory.length,
        message: 'Analysis completed successfully'
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to stop analysis:', error);
      this.triggerCallback('onError', { type: 'analysis_stop_failed', error: error.message });
      return false;
    }
  }

  /**
   * Execute comprehensive biometric analysis
   */
  async executeAnalysis() {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Processor not initialized',
        message: 'Please initialize the biometric processor first'
      };
    }

    try {
      console.log('🔬 Executing comprehensive biometric analysis...');
      
      // Get current analysis results
      const cardiovascularAnalysis = this.rppgEngine.getCardiovascularAnalysis();
      const voiceAnalysis = this.config.enableVoice ? this.voiceEngine.getVoiceAnalysis() : null;
      
      if (!cardiovascularAnalysis || cardiovascularAnalysis.status !== 'success') {
        return {
          success: false,
          error: 'Insufficient cardiovascular data',
          message: 'Please ensure video capture is active and face is visible',
          progress: cardiovascularAnalysis?.progress || 0
        };
      }
      
      // Process comprehensive metrics
      const comprehensiveResults = await this.processComprehensiveMetrics(
        cardiovascularAnalysis,
        voiceAnalysis
      );
      
      // Generate medical report
      const medicalReport = this.generateMedicalReport(comprehensiveResults);
      
      // Store results
      this.currentResults = {
        cardiovascular: cardiovascularAnalysis,
        voice: voiceAnalysis,
        combined: comprehensiveResults,
        medical: medicalReport,
        timestamp: Date.now()
      };
      
      console.log('✅ Comprehensive biometric analysis completed');
      
      return {
        success: true,
        results: this.currentResults,
        biomarkerCount: this.countBiomarkers(comprehensiveResults),
        message: 'Comprehensive analysis completed successfully'
      };
      
    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error);
      this.triggerCallback('onError', { type: 'analysis_execution_failed', error: error.message });
      
      return {
        success: false,
        error: error.message,
        message: 'Analysis execution failed'
      };
    }
  }

  /**
   * Start real-time analysis loop
   */
  startAnalysisLoop() {
    this.analysisLoopId = setInterval(() => {
      this.performRealtimeAnalysis();
    }, this.analysisInterval);
  }

  /**
   * Perform real-time analysis iteration
   */
  async performRealtimeAnalysis() {
    if (!this.isAnalyzing || !this.isInitialized) return;
    
    try {
      const currentTime = Date.now();
      
      // Process rPPG frame
      const rppgResult = this.rppgEngine.processFrame();
      
      // Process voice frame
      const voiceResult = this.config.enableVoice ? this.voiceEngine.processAudioFrame() : null;
      
      // Update real-time metrics if we have new data
      if (rppgResult || voiceResult) {
        const realtimeMetrics = {
          timestamp: currentTime,
          rppg: rppgResult,
          voice: voiceResult,
          analysisTime: currentTime - this.analysisStartTime
        };
        
        // Add to history
        this.analysisHistory.push(realtimeMetrics);
        if (this.analysisHistory.length > this.maxHistoryLength) {
          this.analysisHistory.shift();
        }
        
        // Trigger real-time update callback
        if (this.config.realTimeUpdates) {
          this.triggerCallback('onAnalysisUpdate', {
            status: 'analyzing',
            metrics: realtimeMetrics,
            historyLength: this.analysisHistory.length,
            timestamp: currentTime
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Real-time analysis error:', error);
      this.triggerCallback('onError', { type: 'realtime_analysis_error', error: error.message });
    }
  }

  /**
   * Process comprehensive metrics from all sources
   */
  async processComprehensiveMetrics(cardiovascularData, voiceData) {
    const results = {
      timestamp: Date.now(),
      cardiovascularMetrics: {},
      voiceMetrics: {},
      fusedMetrics: {},
      qualityAssessment: {},
      clinicalAssessment: {}
    };
    
    // Process cardiovascular metrics (24+ variables)
    if (cardiovascularData && cardiovascularData.cardiovascularMetrics) {
      results.cardiovascularMetrics = {
        // Primary metrics
        heartRate: cardiovascularData.cardiovascularMetrics.heartRate,
        heartRateVariability: cardiovascularData.cardiovascularMetrics.heartRateVariability,
        signalQuality: cardiovascularData.cardiovascularMetrics.signalQuality,
        
        // Time domain HRV
        rmssd: cardiovascularData.cardiovascularMetrics.rmssd,
        pnn50: cardiovascularData.cardiovascularMetrics.pnn50,
        sdnn: cardiovascularData.cardiovascularMetrics.sdnn,
        triangularIndex: cardiovascularData.cardiovascularMetrics.triangularIndex,
        meanRR: cardiovascularData.cardiovascularMetrics.meanRR,
        medianRR: cardiovascularData.cardiovascularMetrics.medianRR,
        rangeRR: cardiovascularData.cardiovascularMetrics.rangeRR,
        
        // Frequency domain
        vlfPower: cardiovascularData.cardiovascularMetrics.vlfPower,
        lfPower: cardiovascularData.cardiovascularMetrics.lfPower,
        hfPower: cardiovascularData.cardiovascularMetrics.hfPower,
        totalPower: cardiovascularData.cardiovascularMetrics.totalPower,
        lfHfRatio: cardiovascularData.cardiovascularMetrics.lfHfRatio,
        lfNormalized: cardiovascularData.cardiovascularMetrics.lfNormalized,
        hfNormalized: cardiovascularData.cardiovascularMetrics.hfNormalized,
        
        // Non-linear metrics
        sd1: cardiovascularData.cardiovascularMetrics.sd1,
        sd2: cardiovascularData.cardiovascularMetrics.sd2,
        sdRatio: cardiovascularData.cardiovascularMetrics.sdRatio,
        sampleEntropy: cardiovascularData.cardiovascularMetrics.sampleEntropy,
        approximateEntropy: cardiovascularData.cardiovascularMetrics.approximateEntropy,
        dfaAlpha1: cardiovascularData.cardiovascularMetrics.dfaAlpha1,
        dfaAlpha2: cardiovascularData.cardiovascularMetrics.dfaAlpha2,
        correlationDimension: cardiovascularData.cardiovascularMetrics.correlationDimension,
        
        // Signal quality
        snr: cardiovascularData.cardiovascularMetrics.snr,
        stability: cardiovascularData.cardiovascularMetrics.stability,
        artifactLevel: cardiovascularData.cardiovascularMetrics.artifactLevel
      };
    }
    
    // Process voice metrics (12+ variables)
    if (voiceData && voiceData.voiceMetrics) {
      results.voiceMetrics = {
        // Basic acoustic features
        fundamentalFrequency: voiceData.voiceMetrics.fundamentalFrequency,
        jitter: voiceData.voiceMetrics.jitter,
        shimmer: voiceData.voiceMetrics.shimmer,
        harmonicToNoiseRatio: voiceData.voiceMetrics.harmonicToNoiseRatio,
        spectralCentroid: voiceData.voiceMetrics.spectralCentroid,
        spectralBandwidth: voiceData.voiceMetrics.spectralBandwidth,
        spectralRolloff: voiceData.voiceMetrics.spectralRolloff,
        zeroCrossingRate: voiceData.voiceMetrics.zeroCrossingRate,
        mfccCoefficients: voiceData.voiceMetrics.mfccCoefficients,
        voicedFrameRatio: voiceData.voiceMetrics.voicedFrameRatio,
        speechRate: voiceData.voiceMetrics.speechRate,
        pauseDuration: voiceData.voiceMetrics.pauseDuration,
        
        // Emotional state
        stress: voiceData.emotionalState?.stress || 0,
        arousal: voiceData.emotionalState?.arousal || 0,
        valence: voiceData.emotionalState?.valence || 0,
        emotionalConfidence: voiceData.emotionalState?.confidence || 0,
        
        // Respiratory metrics
        breathingRate: voiceData.respiratoryMetrics?.breathingRate || 0,
        breathDepth: voiceData.respiratoryMetrics?.breathDepth || 0,
        breathingPattern: voiceData.respiratoryMetrics?.breathingPattern || 'unknown',
        breathingIrregularity: voiceData.respiratoryMetrics?.irregularity || 0
      };
    }
    
    // Fuse cardiovascular and voice data
    results.fusedMetrics = this.fuseMultimodalData(
      results.cardiovascularMetrics,
      results.voiceMetrics
    );
    
    // Assess overall quality
    results.qualityAssessment = this.assessOverallQuality(
      cardiovascularData,
      voiceData
    );
    
    // Clinical assessment
    results.clinicalAssessment = this.performClinicalAssessment(results);
    
    return results;
  }

  /**
   * Fuse multimodal biometric data
   */
  fuseMultimodalData(cardiovascularMetrics, voiceMetrics) {
    const fusedMetrics = {};
    
    // Cross-validate heart rate if both sources available
    if (cardiovascularMetrics.heartRate && voiceMetrics.fundamentalFrequency) {
      const voiceBasedHR = this.estimateHRFromVoice(voiceMetrics.fundamentalFrequency);
      fusedMetrics.heartRateConsistency = this.calculateConsistency(
        cardiovascularMetrics.heartRate,
        voiceBasedHR
      );
      fusedMetrics.fusedHeartRate = this.weightedAverage([
        { value: cardiovascularMetrics.heartRate, weight: 0.8 },
        { value: voiceBasedHR, weight: 0.2 }
      ]);
    }
    
    // Combine stress indicators
    if (cardiovascularMetrics.lfHfRatio && voiceMetrics.stress) {
      const cardiovascularStress = this.normalizeStressFromLFHF(cardiovascularMetrics.lfHfRatio);
      fusedMetrics.combinedStressLevel = this.weightedAverage([
        { value: cardiovascularStress, weight: 0.6 },
        { value: voiceMetrics.stress, weight: 0.4 }
      ]);
    }
    
    // Respiratory rate fusion
    if (cardiovascularMetrics.respiratoryRate && voiceMetrics.breathingRate) {
      fusedMetrics.fusedRespiratoryRate = this.weightedAverage([
        { value: cardiovascularMetrics.respiratoryRate || 16, weight: 0.3 },
        { value: voiceMetrics.breathingRate, weight: 0.7 }
      ]);
    }
    
    // Overall autonomic state
    fusedMetrics.autonomicState = this.assessAutonomicState(
      cardiovascularMetrics,
      voiceMetrics
    );
    
    // Multimodal confidence score
    fusedMetrics.overallConfidence = this.calculateOverallConfidence(
      cardiovascularMetrics,
      voiceMetrics
    );
    
    return fusedMetrics;
  }

  /**
   * Assess overall signal quality
   */
  assessOverallQuality(cardiovascularData, voiceData) {
    let overallScore = 0;
    let componentCount = 0;
    const qualityFactors = [];
    
    // Cardiovascular quality
    if (cardiovascularData && cardiovascularData.cardiovascularMetrics) {
      const cvQuality = cardiovascularData.cardiovascularMetrics.signalQuality || 0;
      overallScore += cvQuality * 100;
      componentCount++;
      
      if (cvQuality < 0.7) {
        qualityFactors.push('low_cardiovascular_quality');
      }
    }
    
    // Voice quality
    if (voiceData && voiceData.voiceMetrics) {
      const voiceQuality = voiceData.voiceMetrics.voicedFrameRatio || 0;
      overallScore += voiceQuality * 100;
      componentCount++;
      
      if (voiceQuality < 0.6) {
        qualityFactors.push('low_voice_quality');
      }
    }
    
    const finalScore = componentCount > 0 ? overallScore / componentCount : 0;
    
    let qualityLevel = 'excellent';
    if (finalScore < 50) qualityLevel = 'poor';
    else if (finalScore < 70) qualityLevel = 'fair';
    else if (finalScore < 85) qualityLevel = 'good';
    
    return {
      overallScore: Math.round(finalScore),
      qualityLevel,
      qualityFactors,
      cardiovascularQuality: cardiovascularData?.cardiovascularMetrics?.signalQuality || 0,
      voiceQuality: voiceData?.voiceMetrics?.voicedFrameRatio || 0,
      recommendation: this.getQualityRecommendation(qualityLevel, qualityFactors)
    };
  }

  /**
   * Perform comprehensive clinical assessment
   */
  performClinicalAssessment(results) {
    const assessment = {
      overallHealth: 'unknown',
      riskFactors: [],
      recommendations: [],
      clinicalFlags: [],
      healthScore: 0
    };
    
    let healthScore = 100;
    
    // Cardiovascular assessment
    if (results.cardiovascularMetrics.heartRate) {
      const hr = results.cardiovascularMetrics.heartRate;
      
      if (hr < 50) {
        assessment.clinicalFlags.push('severe_bradycardia');
        assessment.riskFactors.push('Very low heart rate detected');
        healthScore -= 25;
      } else if (hr < 60) {
        assessment.clinicalFlags.push('bradycardia');
        assessment.riskFactors.push('Low heart rate detected');
        healthScore -= 10;
      } else if (hr > 120) {
        assessment.clinicalFlags.push('severe_tachycardia');
        assessment.riskFactors.push('Very high heart rate detected');
        healthScore -= 25;
      } else if (hr > 100) {
        assessment.clinicalFlags.push('tachycardia');
        assessment.riskFactors.push('Elevated heart rate detected');
        healthScore -= 10;
      }
    }
    
    // HRV assessment
    if (results.cardiovascularMetrics.rmssd) {
      const rmssd = results.cardiovascularMetrics.rmssd;
      
      if (rmssd < 15) {
        assessment.clinicalFlags.push('very_low_hrv');
        assessment.riskFactors.push('Significantly reduced heart rate variability');
        healthScore -= 20;
      } else if (rmssd < 25) {
        assessment.clinicalFlags.push('low_hrv');
        assessment.riskFactors.push('Reduced heart rate variability');
        healthScore -= 10;
      }
    }
    
    // Autonomic balance assessment
    if (results.cardiovascularMetrics.lfHfRatio) {
      const ratio = results.cardiovascularMetrics.lfHfRatio;
      
      if (ratio > 3.0) {
        assessment.clinicalFlags.push('sympathetic_dominance');
        assessment.riskFactors.push('Excessive sympathetic nervous system activity');
        healthScore -= 15;
      } else if (ratio < 0.3) {
        assessment.clinicalFlags.push('parasympathetic_dominance');
        assessment.riskFactors.push('Excessive parasympathetic nervous system activity');
        healthScore -= 10;
      }
    }
    
    // Voice-based stress assessment
    if (results.voiceMetrics.stress > 0.7) {
      assessment.clinicalFlags.push('high_vocal_stress');
      assessment.riskFactors.push('High stress levels detected in voice');
      healthScore -= 15;
    }
    
    // Generate recommendations
    assessment.recommendations = this.generateClinicalRecommendations(assessment.clinicalFlags);
    
    // Determine overall health status
    assessment.healthScore = Math.max(0, healthScore);
    
    if (healthScore >= 90) assessment.overallHealth = 'excellent';
    else if (healthScore >= 75) assessment.overallHealth = 'good';
    else if (healthScore >= 60) assessment.overallHealth = 'fair';
    else if (healthScore >= 40) assessment.overallHealth = 'poor';
    else assessment.overallHealth = 'critical';
    
    return assessment;
  }

  /**
   * Generate medical report
   */
  generateMedicalReport(comprehensiveResults) {
    const report = {
      reportId: this.generateReportId(),
      timestamp: Date.now(),
      patientInfo: {
        analysisDate: new Date().toISOString(),
        analysisDuration: this.analysisHistory.length,
        dataQuality: comprehensiveResults.qualityAssessment.qualityLevel
      },
      executiveSummary: this.generateExecutiveSummary(comprehensiveResults),
      cardiovascularFindings: this.generateCardiovascularFindings(comprehensiveResults.cardiovascularMetrics),
      voiceFindings: this.generateVoiceFindings(comprehensiveResults.voiceMetrics),
      clinicalAssessment: comprehensiveResults.clinicalAssessment,
      recommendations: comprehensiveResults.clinicalAssessment.recommendations,
      technicalDetails: {
        biomarkerCount: this.countBiomarkers(comprehensiveResults),
        analysisMethod: 'rPPG + Voice Analysis',
        signalQuality: comprehensiveResults.qualityAssessment,
        dataReliability: this.assessDataReliability(comprehensiveResults)
      }
    };
    
    return report;
  }

  /**
   * Helper methods
   */
  
  estimateHRFromVoice(f0) {
    // Simplified HR estimation from voice F0
    return Math.max(50, Math.min(150, f0 * 0.4 + 60));
  }

  calculateConsistency(value1, value2) {
    const diff = Math.abs(value1 - value2);
    const avg = (value1 + value2) / 2;
    return avg > 0 ? Math.max(0, 1 - diff / avg) : 0;
  }

  weightedAverage(values) {
    const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = values.reduce((sum, item) => sum + item.value * item.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  normalizeStressFromLFHF(lfhfRatio) {
    // Convert LF/HF ratio to stress score (0-1)
    return Math.max(0, Math.min(1, (lfhfRatio - 0.5) / 2.5));
  }

  assessAutonomicState(cvMetrics, voiceMetrics) {
    let state = 'balanced';
    
    if (cvMetrics.lfHfRatio > 2.5 || voiceMetrics.stress > 0.7) {
      state = 'sympathetic_dominance';
    } else if (cvMetrics.lfHfRatio < 0.5 && voiceMetrics.arousal < 0.3) {
      state = 'parasympathetic_dominance';
    }
    
    return state;
  }

  calculateOverallConfidence(cvMetrics, voiceMetrics) {
    let confidence = 0;
    let count = 0;
    
    if (cvMetrics.signalQuality !== undefined) {
      confidence += cvMetrics.signalQuality;
      count++;
    }
    
    if (voiceMetrics.emotionalConfidence !== undefined) {
      confidence += voiceMetrics.emotionalConfidence;
      count++;
    }
    
    return count > 0 ? confidence / count : 0;
  }

  getQualityRecommendation(qualityLevel, factors) {
    if (qualityLevel === 'poor') {
      return 'Improve lighting and ensure face is clearly visible. Check microphone quality.';
    } else if (qualityLevel === 'fair') {
      return 'Consider improving environmental conditions for better signal quality.';
    } else {
      return 'Signal quality is adequate for reliable analysis.';
    }
  }

  generateClinicalRecommendations(clinicalFlags) {
    const recommendations = [];
    
    if (clinicalFlags.includes('bradycardia') || clinicalFlags.includes('severe_bradycardia')) {
      recommendations.push('Consider consulting a cardiologist for low heart rate evaluation');
    }
    
    if (clinicalFlags.includes('tachycardia') || clinicalFlags.includes('severe_tachycardia')) {
      recommendations.push('Consider reducing caffeine intake and managing stress levels');
    }
    
    if (clinicalFlags.includes('low_hrv') || clinicalFlags.includes('very_low_hrv')) {
      recommendations.push('Consider stress reduction techniques and regular exercise to improve heart rate variability');
    }
    
    if (clinicalFlags.includes('sympathetic_dominance')) {
      recommendations.push('Practice relaxation techniques to balance autonomic nervous system');
    }
    
    if (clinicalFlags.includes('high_vocal_stress')) {
      recommendations.push('Consider stress management and vocal rest techniques');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cardiovascular and voice metrics appear within normal ranges');
    }
    
    return recommendations;
  }

  generateExecutiveSummary(results) {
    const hr = results.cardiovascularMetrics.heartRate || 0;
    const hrv = results.cardiovascularMetrics.rmssd || 0;
    const quality = results.qualityAssessment.qualityLevel;
    const health = results.clinicalAssessment.overallHealth;
    
    return `Comprehensive biometric analysis completed with ${quality} signal quality. ` +
           `Heart rate: ${hr} BPM, HRV: ${hrv}ms. ` +
           `Overall cardiovascular health assessed as ${health}. ` +
           `${results.clinicalAssessment.riskFactors.length} risk factors identified.`;
  }

  generateCardiovascularFindings(cvMetrics) {
    return {
      heartRate: {
        value: cvMetrics.heartRate,
        status: this.getHRStatus(cvMetrics.heartRate),
        unit: 'BPM'
      },
      heartRateVariability: {
        rmssd: cvMetrics.rmssd,
        sdnn: cvMetrics.sdnn,
        status: this.getHRVStatus(cvMetrics.rmssd)
      },
      autonomicBalance: {
        lfHfRatio: cvMetrics.lfHfRatio,
        status: this.getAutonomicStatus(cvMetrics.lfHfRatio)
      },
      signalQuality: cvMetrics.signalQuality
    };
  }

  generateVoiceFindings(voiceMetrics) {
    if (!voiceMetrics.fundamentalFrequency) {
      return { status: 'not_analyzed', message: 'Voice analysis not performed' };
    }
    
    return {
      fundamentalFrequency: voiceMetrics.fundamentalFrequency,
      voiceQuality: {
        jitter: voiceMetrics.jitter,
        shimmer: voiceMetrics.shimmer,
        hnr: voiceMetrics.harmonicToNoiseRatio
      },
      emotionalState: {
        stress: voiceMetrics.stress,
        arousal: voiceMetrics.arousal,
        valence: voiceMetrics.valence
      },
      respiratoryMetrics: {
        breathingRate: voiceMetrics.breathingRate,
        pattern: voiceMetrics.breathingPattern
      }
    };
  }

  countBiomarkers(results) {
    let count = 0;
    
    // Count cardiovascular biomarkers
    if (results.cardiovascularMetrics) {
      count += Object.keys(results.cardiovascularMetrics).length;
    }
    
    // Count voice biomarkers
    if (results.voiceMetrics && results.voiceMetrics.fundamentalFrequency) {
      count += Object.keys(results.voiceMetrics).length;
    }
    
    return count;
  }

  assessDataReliability(results) {
    const qualityScore = results.qualityAssessment.overallScore;
    
    if (qualityScore >= 85) return 'high';
    if (qualityScore >= 70) return 'medium';
    if (qualityScore >= 50) return 'low';
    return 'very_low';
  }

  getHRStatus(hr) {
    if (hr < 60) return 'low';
    if (hr > 100) return 'high';
    return 'normal';
  }

  getHRVStatus(rmssd) {
    if (rmssd < 20) return 'low';
    if (rmssd > 50) return 'high';
    return 'normal';
  }

  getAutonomicStatus(lfhfRatio) {
    if (lfhfRatio < 0.5) return 'parasympathetic_dominance';
    if (lfhfRatio > 2.0) return 'sympathetic_dominance';
    return 'balanced';
  }

  generateReportId() {
    return 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Event handling
   */
  
  setCallback(eventType, callback) {
    if (this.callbacks.hasOwnProperty(eventType)) {
      this.callbacks[eventType] = callback;
    }
  }

  triggerCallback(eventType, data) {
    if (this.callbacks[eventType] && typeof this.callbacks[eventType] === 'function') {
      try {
        this.callbacks[eventType](data);
      } catch (error) {
        console.error(`❌ Callback error for ${eventType}:`, error);
      }
    }
  }

  /**
   * Get current analysis status
   */
  getAnalysisStatus() {
    return {
      isInitialized: this.isInitialized,
      isAnalyzing: this.isAnalyzing,
      analysisStartTime: this.analysisStartTime,
      historyLength: this.analysisHistory.length,
      currentResults: this.currentResults,
      config: this.config
    };
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(maxEntries = 100) {
    return this.analysisHistory.slice(-maxEntries);
  }

  /**
   * Export analysis data
   */
  exportAnalysisData(format = 'json') {
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        analysisStartTime: this.analysisStartTime,
        totalSamples: this.analysisHistory.length,
        config: this.config
      },
      currentResults: this.currentResults,
      history: this.analysisHistory
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(exportData);
    }
    
    return exportData;
  }

  convertToCSV(data) {
    // Simplified CSV conversion
    const headers = ['timestamp', 'heartRate', 'hrv', 'stress', 'quality'];
    let csv = headers.join(',') + '\n';
    
    data.history.forEach(entry => {
      const row = [
        entry.timestamp,
        entry.rppg?.heartRate || '',
        entry.rppg?.heartRateVariability || '',
        entry.voice?.stress || '',
        entry.rppg?.confidence || ''
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Reset processor state
   */
  reset() {
    this.stopAnalysis();
    this.analysisHistory = [];
    this.currentResults = {
      cardiovascular: null,
      voice: null,
      combined: null,
      timestamp: null
    };
    
    if (this.rppgEngine) {
      this.rppgEngine.reset();
    }
    
    if (this.voiceEngine) {
      this.voiceEngine.reset();
    }
    
    console.log('🔄 Biometric processor reset');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.reset();
    
    if (this.rppgEngine) {
      this.rppgEngine.cleanup();
    }
    
    if (this.voiceEngine) {
      this.voiceEngine.cleanup();
    }
    
    this.isInitialized = false;
    console.log('🧹 Biometric processor cleaned up');
  }
}

export default BiometricProcessor;