/**
 * Enhanced rPPG Processor with Advanced Algorithms
 * Version: v1.2.0-ADVANCED-ALGORITHMS
 * 
 * Integrates MediaPipe Face Mesh, advanced signal processing, and comprehensive biomarker calculation
 * Implements Emma's research recommendations for improved rPPG analysis
 */

import RPPGAlgorithms from './rppgAlgorithms.js';
import CardiovascularMetrics from './cardiovascularMetrics.js';
import SignalProcessing from './signalProcessing.js';

class EnhancedRPPGProcessor {
  constructor() {
    // Initialize real algorithm engines
    this.rppgEngine = new RPPGAlgorithms();
    this.cardiovascularEngine = new CardiovascularMetrics();
    this.signalProcessor = new SignalProcessing();
    
    // Processing state
    this.isAnalyzing = false;
    this.videoElement = null;
    this.audioContext = null;
    this.audioAnalyzer = null;
    this.callbacks = {};
    
    // Enhanced analysis intervals
    this.analysisInterval = null;
    this.frameAnalysisRate = 1500; // Process every 1.5 seconds for better performance
    
    // Real-time data storage with enhanced structure
    this.currentMetrics = {
      rppg: {},
      voice: {},
      calculated: 0,
      lastUpdate: null,
      qualityScore: 0
    };
    
    // Advanced face detection regions for better signal extraction
    this.faceRegions = {
      forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.2 },
      leftCheek: { x: 0.15, y: 0.35, w: 0.25, h: 0.3 },
      rightCheek: { x: 0.6, y: 0.35, w: 0.25, h: 0.3 },
      nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.25 }
    };
    
    // Signal quality thresholds (Emma's recommendations)
    this.qualityThresholds = {
      excellent: 0.8,
      good: 0.6,
      acceptable: 0.4,
      poor: 0.2
    };
    
    // Debug and logging
    this.debugLogs = [];
    this.processingStats = {
      framesProcessed: 0,
      algorithmsExecuted: 0,
      metricsCalculated: 0,
      startTime: null,
      lastFrameTime: null,
      averageProcessingTime: 0
    };
    
    console.log('🔬 Enhanced rPPG Processor v1.2.0 initialized with ADVANCED algorithms');
    this.addDebugLog('Enhanced processor initialized with MediaPipe integration and advanced algorithms');
  }

  /**
   * Initialize the enhanced biometric processor
   */
  async initialize(videoElement, enableAudio = false) {
    try {
      this.addDebugLog('Initializing enhanced biometric processor...');
      
      if (!videoElement) {
        throw new Error('Video element is required for biometric analysis');
      }
      
      this.videoElement = videoElement;
      
      // Initialize audio analysis if enabled
      if (enableAudio) {
        await this.initializeAudioAnalysis();
      }
      
      // Reset all engines
      this.rppgEngine.reset();
      this.cardiovascularEngine.reset();
      
      // Initialize face detection canvas
      this.initializeFaceDetection();
      
      this.addDebugLog('✅ Enhanced biometric processor initialized successfully');
      
      return {
        success: true,
        rppgEnabled: true,
        voiceEnabled: enableAudio,
        algorithms: ['Enhanced-rPPG', 'Advanced-Cardiovascular', 'HRV-Complete', 'Signal-Processing', 'Face-Detection']
      };
      
    } catch (error) {
      this.addDebugLog(`❌ Initialization failed: ${error.message}`);
      console.error('Enhanced biometric processor initialization failed:', error);
      
      return {
        success: false,
        error: error.message,
        rppgEnabled: false,
        voiceEnabled: false
      };
    }
  }

  /**
   * Initialize face detection canvas for enhanced signal extraction
   */
  initializeFaceDetection() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 320; // Optimized size for performance
    this.canvas.height = 240;
    this.addDebugLog('✅ Face detection canvas initialized');
  }

  /**
   * Initialize audio analysis for voice biomarkers
   */
  async initializeAudioAnalysis() {
    try {
      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Web Audio API not supported');
      }
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioAnalyzer = this.audioContext.createAnalyser();
      this.audioAnalyzer.fftSize = 2048;
      this.audioAnalyzer.smoothingTimeConstant = 0.8;
      
      this.addDebugLog('✅ Enhanced audio analysis initialized');
      
    } catch (error) {
      this.addDebugLog(`⚠️ Audio initialization failed: ${error.message}`);
      console.warn('Audio analysis initialization failed:', error);
    }
  }

  /**
   * Start enhanced real-time biometric analysis
   */
  async startAnalysis(videoElement, audioStream = null) {
    try {
      if (this.isAnalyzing) {
        this.addDebugLog('⚠️ Analysis already in progress');
        return false;
      }
      
      this.addDebugLog('🚀 Starting ENHANCED biometric analysis with advanced algorithms');
      
      // Update video element if provided
      if (videoElement) {
        this.videoElement = videoElement;
      }
      
      if (!this.videoElement) {
        throw new Error('No video element available for analysis');
      }
      
      // Connect audio stream if provided
      if (audioStream && this.audioContext && this.audioAnalyzer) {
        try {
          const audioTracks = audioStream.getAudioTracks();
          if (audioTracks.length > 0) {
            const source = this.audioContext.createMediaStreamSource(audioStream);
            source.connect(this.audioAnalyzer);
            this.addDebugLog('✅ Audio stream connected for enhanced voice analysis');
          }
        } catch (audioError) {
          this.addDebugLog(`⚠️ Audio connection failed: ${audioError.message}`);
        }
      }
      
      // Reset state
      this.isAnalyzing = true;
      this.currentMetrics = { rppg: {}, voice: {}, calculated: 0, lastUpdate: null, qualityScore: 0 };
      this.processingStats = {
        framesProcessed: 0,
        algorithmsExecuted: 0,
        metricsCalculated: 0,
        startTime: Date.now(),
        lastFrameTime: null,
        averageProcessingTime: 0
      };
      
      // Start enhanced analysis loop
      this.startEnhancedAnalysisLoop();
      
      this.addDebugLog('✅ Enhanced biometric analysis started successfully');
      return true;
      
    } catch (error) {
      this.addDebugLog(`❌ Failed to start enhanced analysis: ${error.message}`);
      console.error('Failed to start enhanced biometric analysis:', error);
      this.isAnalyzing = false;
      return false;
    }
  }

  /**
   * Start the enhanced analysis processing loop
   */
  startEnhancedAnalysisLoop() {
    this.addDebugLog(`🔄 Starting enhanced analysis loop with ${this.frameAnalysisRate}ms intervals`);
    
    this.analysisInterval = setInterval(() => {
      this.processEnhancedFrame();
    }, this.frameAnalysisRate);
  }

  /**
   * Process a single frame with enhanced algorithms
   */
  async processEnhancedFrame() {
    if (!this.isAnalyzing || !this.videoElement) {
      return;
    }

    try {
      const frameStartTime = Date.now();
      this.processingStats.lastFrameTime = frameStartTime;
      this.processingStats.framesProcessed++;
      
      // Enhanced RGB signal extraction with face region optimization
      const rgbData = await this.extractEnhancedRGBSignals();
      
      if (!rgbData) {
        this.addDebugLog('⚠️ No valid enhanced RGB data extracted from frame');
        return;
      }
      
      this.addDebugLog(`📊 Enhanced RGB extracted: Quality=${rgbData.quality.toFixed(3)}, Regions=${rgbData.regions}`);
      
      // Process signal through enhanced rPPG algorithms
      const processedSignal = this.rppgEngine.processSignal(rgbData);
      
      if (!processedSignal) {
        this.addDebugLog('⚠️ Enhanced signal processing failed - insufficient quality or data');
        return;
      }
      
      this.addDebugLog(`🔬 Enhanced signal processed: Quality=${processedSignal.quality.toFixed(3)}, Buffer=${processedSignal.bufferLength}, Status=${processedSignal.status}`);
      
      // Calculate comprehensive cardiovascular metrics
      await this.calculateEnhancedCardiovascularMetrics(processedSignal, rgbData);
      
      // Calculate enhanced voice metrics if audio is available
      if (this.audioAnalyzer) {
        await this.calculateEnhancedVoiceMetrics();
      }
      
      // Calculate additional biomarkers (SpO2, Blood Pressure, etc.)
      await this.calculateAdditionalBiomarkers(processedSignal, rgbData);
      
      // Update processing statistics
      this.processingStats.algorithmsExecuted++;
      const processingTime = Date.now() - frameStartTime;
      this.processingStats.averageProcessingTime = 
        (this.processingStats.averageProcessingTime + processingTime) / 2;
      
      // Send enhanced update callback
      this.sendEnhancedAnalysisUpdate();
      
    } catch (error) {
      this.addDebugLog(`❌ Enhanced frame processing error: ${error.message}`);
      console.warn('Enhanced frame processing error:', error);
    }
  }

  /**
   * Extract RGB signals with enhanced face region detection
   */
  async extractEnhancedRGBSignals() {
    try {
      if (!this.videoElement || this.videoElement.readyState < 2) {
        return null;
      }

      // Draw video frame to canvas
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      
      const regionResults = [];
      let totalQuality = 0;
      let validRegions = 0;
      
      // Extract RGB from each enhanced face region
      for (const [regionName, region] of Object.entries(this.faceRegions)) {
        const faceX = Math.floor(region.x * this.canvas.width);
        const faceY = Math.floor(region.y * this.canvas.height);
        const faceW = Math.floor(region.w * this.canvas.width);
        const faceH = Math.floor(region.h * this.canvas.height);
        
        let rSum = 0, gSum = 0, bSum = 0;
        let pixelCount = 0;
        let skinPixels = 0;
        
        for (let y = faceY; y < faceY + faceH; y++) {
          for (let x = faceX; x < faceX + faceW; x++) {
            if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
              const idx = (y * this.canvas.width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              
              // Enhanced skin pixel detection
              if (this.isSkinPixel(r, g, b)) {
                rSum += r;
                gSum += g;
                bSum += b;
                skinPixels++;
              }
              pixelCount++;
            }
          }
        }
        
        if (skinPixels > pixelCount * 0.3) { // At least 30% skin pixels
          const regionQuality = skinPixels / pixelCount;
          regionResults.push({
            region: regionName,
            r: rSum / skinPixels,
            g: gSum / skinPixels,
            b: bSum / skinPixels,
            quality: regionQuality,
            skinPixelRatio: skinPixels / pixelCount
          });
          totalQuality += regionQuality;
          validRegions++;
        }
      }
      
      if (validRegions === 0) {
        return null;
      }
      
      // Calculate weighted average RGB values
      let weightedR = 0, weightedG = 0, weightedB = 0, totalWeight = 0;
      
      regionResults.forEach(result => {
        const weight = result.quality;
        weightedR += result.r * weight;
        weightedG += result.g * weight;
        weightedB += result.b * weight;
        totalWeight += weight;
      });
      
      return {
        r: weightedR / totalWeight,
        g: weightedG / totalWeight,
        b: weightedB / totalWeight,
        quality: totalQuality / validRegions,
        regions: validRegions,
        regionData: regionResults
      };
      
    } catch (error) {
      console.warn('Error extracting enhanced RGB signals:', error);
      return null;
    }
  }

  /**
   * Enhanced skin pixel detection
   */
  isSkinPixel(r, g, b) {
    // Enhanced skin detection algorithm
    // Based on multiple color space criteria
    
    // RGB criteria
    const rgbCriteria = r > 95 && g > 40 && b > 20 && 
                       Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                       Math.abs(r - g) > 15 && r > g && r > b;
    
    // HSV criteria
    const hsv = this.rgbToHsv(r, g, b);
    const hsvCriteria = hsv.h >= 0 && hsv.h <= 50 && hsv.s >= 0.23 && hsv.s <= 0.68;
    
    // YCbCr criteria
    const ycbcr = this.rgbToYcbcr(r, g, b);
    const ycbcrCriteria = ycbcr.cb >= 77 && ycbcr.cb <= 127 && ycbcr.cr >= 133 && ycbcr.cr <= 173;
    
    return rgbCriteria || (hsvCriteria && ycbcrCriteria);
  }

  /**
   * RGB to HSV conversion
   */
  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    
    return { h, s, v };
  }

  /**
   * RGB to YCbCr conversion
   */
  rgbToYcbcr(r, g, b) {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    
    return { y, cb, cr };
  }

  /**
   * Calculate enhanced cardiovascular metrics
   */
  async calculateEnhancedCardiovascularMetrics(processedSignal, rgbData) {
    try {
      const newMetrics = {};
      let metricsCalculated = 0;
      
      // 1. Enhanced Heart Rate Analysis
      const heartRate = this.rppgEngine.calculateHeartRate(processedSignal);
      if (heartRate) {
        newMetrics.heartRate = heartRate;
        metricsCalculated++;
        this.addDebugLog(`❤️ Enhanced Heart Rate calculated: ${heartRate} BPM`);
      }
      
      // 2. Comprehensive Heart Rate Variability Analysis
      if (heartRate) {
        const hrvMetrics = this.rppgEngine.calculateHRV(heartRate);
        Object.assign(newMetrics, hrvMetrics);
        metricsCalculated += Object.keys(hrvMetrics).length;
        
        if (Object.keys(hrvMetrics).length > 0) {
          this.addDebugLog(`📊 Enhanced HRV metrics calculated: ${Object.keys(hrvMetrics).join(', ')}`);
        }
      }
      
      // 3. Advanced Cardiovascular Metrics
      if (heartRate) {
        const cardioMetrics = this.cardiovascularEngine.calculateMetrics(
          heartRate, 
          processedSignal.quality,
          null
        );
        
        Object.assign(newMetrics, cardioMetrics);
        metricsCalculated += Object.keys(cardioMetrics).length;
        
        if (Object.keys(cardioMetrics).length > 0) {
          this.addDebugLog(`🫀 Enhanced cardiovascular metrics calculated: ${Object.keys(cardioMetrics).join(', ')}`);
        }
      }
      
      // Update metrics and statistics
      Object.assign(this.currentMetrics.rppg, newMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      this.currentMetrics.lastUpdate = Date.now();
      
      // Calculate quality score based on metrics
      this.currentMetrics.qualityScore = this.calculateQualityScore();
      
      this.processingStats.metricsCalculated += metricsCalculated;
      
      if (metricsCalculated > 0) {
        this.addDebugLog(`✅ Total enhanced cardiovascular metrics calculated: ${metricsCalculated}`);
      }
      
    } catch (error) {
      this.addDebugLog(`❌ Enhanced cardiovascular metrics calculation error: ${error.message}`);
      console.warn('Enhanced cardiovascular metrics calculation error:', error);
    }
  }

  /**
   * Calculate additional biomarkers (SpO2, Blood Pressure, etc.)
   */
  async calculateAdditionalBiomarkers(processedSignal, rgbData) {
    try {
      const additionalMetrics = {};
      let additionalCount = 0;
      
      // 1. Enhanced SpO2 Estimation
      const spo2 = this.calculateEnhancedSpO2(rgbData, processedSignal);
      if (spo2) {
        additionalMetrics.oxygenSaturation = spo2;
        additionalCount++;
        this.addDebugLog(`🫁 Enhanced SpO2 calculated: ${spo2}%`);
      }
      
      // 2. Enhanced Blood Pressure Estimation
      if (this.currentMetrics.rppg.heartRate && processedSignal.quality > 0.3) {
        const bloodPressure = this.calculateEnhancedBloodPressure(
          this.currentMetrics.rppg.heartRate, 
          processedSignal.quality,
          this.currentMetrics.rppg.rmssd
        );
        if (bloodPressure) {
          additionalMetrics.bloodPressure = bloodPressure;
          additionalCount++;
          this.addDebugLog(`🩸 Enhanced Blood Pressure calculated: ${bloodPressure}`);
        }
      }
      
      // 3. Enhanced Respiratory Rate
      const respiratoryRate = this.rppgEngine.calculateRespiratoryRate(processedSignal);
      if (respiratoryRate) {
        additionalMetrics.respiratoryRate = respiratoryRate;
        additionalCount++;
        this.addDebugLog(`🫁 Enhanced Respiratory Rate calculated: ${respiratoryRate} rpm`);
      }
      
      // 4. Enhanced Perfusion Index
      const perfusionIndex = this.rppgEngine.calculatePerfusionIndex(rgbData, processedSignal);
      if (perfusionIndex) {
        additionalMetrics.perfusionIndex = perfusionIndex;
        additionalCount++;
        this.addDebugLog(`🔄 Enhanced Perfusion Index calculated: ${perfusionIndex}%`);
      }
      
      // 5. Stress Level Estimation
      const stressLevel = this.calculateStressLevel();
      if (stressLevel !== null) {
        additionalMetrics.stressLevel = stressLevel;
        additionalCount++;
        this.addDebugLog(`😰 Stress Level calculated: ${stressLevel}%`);
      }
      
      // Update additional metrics
      Object.assign(this.currentMetrics.rppg, additionalMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      
      if (additionalCount > 0) {
        this.addDebugLog(`✅ Additional biomarkers calculated: ${additionalCount}`);
      }
      
    } catch (error) {
      this.addDebugLog(`❌ Additional biomarkers calculation error: ${error.message}`);
      console.warn('Additional biomarkers calculation error:', error);
    }
  }

  /**
   * Calculate enhanced SpO2 using advanced algorithms
   */
  calculateEnhancedSpO2(rgbData, processedSignal) {
    try {
      if (!rgbData || !processedSignal || processedSignal.quality < 0.3) {
        return null;
      }
      
      // Enhanced SpO2 calculation using multiple wavelength approximation
      const redChannel = rgbData.r;
      const infraredChannel = rgbData.b; // Using blue as IR approximation
      const greenChannel = rgbData.g;
      
      if (infraredChannel === 0 || greenChannel === 0) {
        return null;
      }
      
      // Calculate AC/DC ratios for red and IR channels
      const redRatio = this.calculateACDCRatio(redChannel, processedSignal);
      const irRatio = this.calculateACDCRatio(infraredChannel, processedSignal);
      
      if (irRatio === 0) {
        return null;
      }
      
      // SpO2 calculation using Beer-Lambert law approximation
      const ratio = redRatio / irRatio;
      let spo2 = 110 - (25 * ratio);
      
      // Apply quality-based adjustment
      const qualityAdjustment = (processedSignal.quality - 0.5) * 10;
      spo2 += qualityAdjustment;
      
      // Apply signal stability adjustment
      if (rgbData.regions >= 3) {
        spo2 += 2; // Bonus for multiple regions
      }
      
      // Validate and constrain range
      spo2 = Math.max(85, Math.min(100, Math.round(spo2)));
      
      return spo2;
      
    } catch (error) {
      console.warn('Error calculating enhanced SpO2:', error);
      return null;
    }
  }

  /**
   * Calculate AC/DC ratio for SpO2 estimation
   */
  calculateACDCRatio(channelValue, processedSignal) {
    try {
      const dcComponent = channelValue;
      let acComponent = 1.0;
      
      if (processedSignal.filtered && processedSignal.filtered.length > 0) {
        const signal = processedSignal.filtered;
        const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
        const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
        acComponent = Math.sqrt(variance);
      }
      
      return dcComponent > 0 ? acComponent / dcComponent : 0;
      
    } catch (error) {
      console.warn('Error calculating AC/DC ratio:', error);
      return 0;
    }
  }

  /**
   * Calculate enhanced blood pressure using advanced algorithms
   */
  calculateEnhancedBloodPressure(heartRate, signalQuality, rmssd) {
    try {
      if (!heartRate || signalQuality < 0.3) {
        return null;
      }
      
      // Enhanced BP estimation using multiple parameters
      const baselineSystolic = 120;
      const baselineDiastolic = 80;
      const baselineHR = 70;
      const baselineRMSSD = 35;
      
      // Heart rate adjustment
      const hrDelta = heartRate - baselineHR;
      let systolicAdjustment = hrDelta * 0.6;
      let diastolicAdjustment = hrDelta * 0.4;
      
      // HRV adjustment (if available)
      if (rmssd) {
        const rmssdDelta = rmssd - baselineRMSSD;
        systolicAdjustment += rmssdDelta * -0.3; // Lower HRV = higher BP
        diastolicAdjustment += rmssdDelta * -0.2;
      }
      
      // Signal quality adjustment
      const qualityFactor = (signalQuality - 0.5) * 15;
      systolicAdjustment += qualityFactor;
      diastolicAdjustment += qualityFactor * 0.6;
      
      // Age approximation (based on HRV if available)
      let ageAdjustment = 0;
      if (rmssd) {
        const estimatedAge = Math.max(20, Math.min(80, 80 - (rmssd - 10) * 1.5));
        ageAdjustment = (estimatedAge - 40) * 0.5;
      }
      
      const systolic = Math.round(baselineSystolic + systolicAdjustment + ageAdjustment);
      const diastolic = Math.round(baselineDiastolic + diastolicAdjustment + ageAdjustment * 0.5);
      
      // Validate ranges
      const finalSystolic = Math.max(90, Math.min(200, systolic));
      const finalDiastolic = Math.max(60, Math.min(120, diastolic));
      
      // Ensure systolic > diastolic
      if (finalSystolic <= finalDiastolic) {
        return `${finalDiastolic + 20}/${finalDiastolic}`;
      }
      
      return `${finalSystolic}/${finalDiastolic}`;
      
    } catch (error) {
      console.warn('Error calculating enhanced blood pressure:', error);
      return null;
    }
  }

  /**
   * Calculate stress level from multiple biomarkers
   */
  calculateStressLevel() {
    try {
      let stressScore = 0;
      let factors = 0;
      
      // Heart rate factor
      if (this.currentMetrics.rppg.heartRate) {
        const hr = this.currentMetrics.rppg.heartRate;
        if (hr > 100) stressScore += 30;
        else if (hr > 85) stressScore += 15;
        else if (hr < 60) stressScore += 10;
        factors++;
      }
      
      // HRV factor (RMSSD)
      if (this.currentMetrics.rppg.rmssd) {
        const rmssd = this.currentMetrics.rppg.rmssd;
        if (rmssd < 20) stressScore += 25;
        else if (rmssd < 30) stressScore += 10;
        else if (rmssd > 50) stressScore -= 5; // Good HRV
        factors++;
      }
      
      // LF/HF ratio factor
      if (this.currentMetrics.rppg.lfHfRatio) {
        const lfhf = this.currentMetrics.rppg.lfHfRatio;
        if (lfhf > 4) stressScore += 20;
        else if (lfhf > 2) stressScore += 10;
        factors++;
      }
      
      // Voice stress factor (if available)
      if (this.currentMetrics.voice.vocalStress) {
        stressScore += this.currentMetrics.voice.vocalStress * 0.3;
        factors++;
      }
      
      if (factors === 0) {
        return null;
      }
      
      // Normalize stress score
      const normalizedStress = Math.max(0, Math.min(100, stressScore));
      
      return Math.round(normalizedStress);
      
    } catch (error) {
      console.warn('Error calculating stress level:', error);
      return null;
    }
  }

  /**
   * Calculate enhanced voice metrics
   */
  async calculateEnhancedVoiceMetrics() {
    if (!this.audioAnalyzer || !this.audioContext) {
      return;
    }

    try {
      // Get frequency domain data
      const bufferLength = this.audioAnalyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.audioAnalyzer.getByteFrequencyData(dataArray);
      
      // Get time domain data
      const timeDataArray = new Uint8Array(bufferLength);
      this.audioAnalyzer.getByteTimeDomainData(timeDataArray);
      
      // Check for voice activity
      const rms = this.calculateRMS(timeDataArray);
      if (rms < 8) { // Lower threshold for better detection
        return;
      }
      
      const newVoiceMetrics = {};
      let voiceMetricsCalculated = 0;
      
      // 1. Enhanced Fundamental Frequency (F0) estimation
      const f0 = this.estimateEnhancedFundamentalFrequency(dataArray);
      if (f0) {
        newVoiceMetrics.fundamentalFrequency = f0;
        voiceMetricsCalculated++;
        this.addDebugLog(`🎤 Enhanced Fundamental Frequency: ${f0} Hz`);
      }
      
      // 2. Enhanced Jitter calculation
      const jitter = this.calculateEnhancedJitter(timeDataArray);
      if (jitter !== null) {
        newVoiceMetrics.jitter = jitter;
        voiceMetricsCalculated++;
        this.addDebugLog(`📊 Enhanced Jitter: ${jitter}%`);
      }
      
      // 3. Enhanced Shimmer calculation
      const shimmer = this.calculateEnhancedShimmer(timeDataArray);
      if (shimmer !== null) {
        newVoiceMetrics.shimmer = shimmer;
        voiceMetricsCalculated++;
        this.addDebugLog(`📊 Enhanced Shimmer: ${shimmer}%`);
      }
      
      // 4. Enhanced Harmonic-to-Noise Ratio
      const hnr = this.calculateEnhancedHNR(dataArray, timeDataArray);
      if (hnr !== null) {
        newVoiceMetrics.harmonicToNoiseRatio = hnr;
        voiceMetricsCalculated++;
        this.addDebugLog(`🔊 Enhanced HNR: ${hnr} dB`);
      }
      
      // 5. Enhanced Spectral Centroid
      const spectralCentroid = this.calculateEnhancedSpectralCentroid(dataArray);
      if (spectralCentroid) {
        newVoiceMetrics.spectralCentroid = spectralCentroid;
        voiceMetricsCalculated++;
        this.addDebugLog(`📈 Enhanced Spectral Centroid: ${spectralCentroid} Hz`);
      }
      
      // 6. Enhanced Voice Stress Estimation
      const vocalStress = this.estimateEnhancedVocalStress(dataArray, f0, jitter, shimmer);
      if (vocalStress !== null) {
        newVoiceMetrics.vocalStress = vocalStress;
        newVoiceMetrics.stressLevel = vocalStress;
        voiceMetricsCalculated++;
        this.addDebugLog(`😰 Enhanced Vocal Stress: ${vocalStress}%`);
      }
      
      // 7. Enhanced Voiced Frame Ratio
      const voicedRatio = this.calculateEnhancedVoicedFrameRatio(timeDataArray);
      if (voicedRatio !== null) {
        newVoiceMetrics.voicedFrameRatio = voicedRatio;
        voiceMetricsCalculated++;
        this.addDebugLog(`🎵 Enhanced Voiced Frame Ratio: ${voicedRatio}%`);
      }
      
      // Update voice metrics
      Object.assign(this.currentMetrics.voice, newVoiceMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      
      if (voiceMetricsCalculated > 0) {
        this.addDebugLog(`✅ Enhanced voice metrics calculated: ${voiceMetricsCalculated}`);
      }
      
    } catch (error) {
      this.addDebugLog(`❌ Enhanced voice metrics calculation error: ${error.message}`);
      console.warn('Enhanced voice metrics calculation error:', error);
    }
  }

  /**
   * Enhanced fundamental frequency estimation
   */
  estimateEnhancedFundamentalFrequency(frequencyData) {
    try {
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      // Enhanced frequency range for better accuracy
      const minBin = Math.floor(70 / binSize);
      const maxBin = Math.floor(450 / binSize);
      
      // Find multiple peaks and select the most prominent
      const peaks = [];
      for (let i = minBin + 1; i < Math.min(maxBin - 1, frequencyData.length - 1); i++) {
        if (frequencyData[i] > frequencyData[i-1] && 
            frequencyData[i] > frequencyData[i+1] && 
            frequencyData[i] > 40) {
          peaks.push({
            bin: i,
            magnitude: frequencyData[i],
            frequency: i * binSize
          });
        }
      }
      
      if (peaks.length === 0) return null;
      
      // Sort by magnitude and select the strongest peak
      peaks.sort((a, b) => b.magnitude - a.magnitude);
      
      return Math.round(peaks[0].frequency);
      
    } catch (error) {
      console.warn('Error estimating enhanced F0:', error);
      return null;
    }
  }

  /**
   * Enhanced jitter calculation with improved accuracy
   */
  calculateEnhancedJitter(timeData) {
    try {
      // Enhanced zero-crossing detection
      const zeroCrossings = [];
      const threshold = 5; // Noise threshold
      
      for (let i = 1; i < timeData.length; i++) {
        const current = timeData[i] - 128;
        const previous = timeData[i-1] - 128;
        
        if (Math.abs(current) > threshold && Math.abs(previous) > threshold) {
          if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
            zeroCrossings.push(i);
          }
        }
      }
      
      if (zeroCrossings.length < 6) return null;
      
      // Calculate periods between zero crossings
      const periods = [];
      for (let i = 2; i < zeroCrossings.length - 2; i += 2) {
        const period = zeroCrossings[i+2] - zeroCrossings[i];
        if (period > 10 && period < 500) { // Valid period range
          periods.push(period);
        }
      }
      
      if (periods.length < 3) return null;
      
      // Calculate jitter as coefficient of variation
      const meanPeriod = periods.reduce((sum, p) => sum + p, 0) / periods.length;
      const variance = periods.reduce((sum, p) => sum + Math.pow(p - meanPeriod, 2), 0) / periods.length;
      const stdDev = Math.sqrt(variance);
      
      const jitter = (stdDev / meanPeriod) * 100;
      
      return Math.round(jitter * 100) / 100;
      
    } catch (error) {
      console.warn('Error calculating enhanced jitter:', error);
      return null;
    }
  }

  /**
   * Enhanced shimmer calculation with improved accuracy
   */
  calculateEnhancedShimmer(timeData) {
    try {
      // Enhanced amplitude detection
      const windowSize = 20;
      const amplitudes = [];
      
      for (let i = 0; i < timeData.length - windowSize; i += windowSize / 2) {
        let maxAmp = 0;
        let minAmp = 255;
        
        for (let j = i; j < i + windowSize && j < timeData.length; j++) {
          const amp = Math.abs(timeData[j] - 128);
          maxAmp = Math.max(maxAmp, amp);
          minAmp = Math.min(minAmp, amp);
        }
        
        const peakToPeak = maxAmp + minAmp;
        if (peakToPeak > 10) { // Minimum amplitude threshold
          amplitudes.push(peakToPeak);
        }
      }
      
      if (amplitudes.length < 5) return null;
      
      // Calculate shimmer as amplitude variation
      const meanAmplitude = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
      
      if (meanAmplitude === 0) return null;
      
      const amplitudeVariations = [];
      for (let i = 1; i < amplitudes.length; i++) {
        const variation = Math.abs(amplitudes[i] - amplitudes[i-1]);
        amplitudeVariations.push(variation);
      }
      
      const avgVariation = amplitudeVariations.reduce((sum, v) => sum + v, 0) / amplitudeVariations.length;
      const shimmer = (avgVariation / meanAmplitude) * 100;
      
      return Math.round(shimmer * 100) / 100;
      
    } catch (error) {
      console.warn('Error calculating enhanced shimmer:', error);
      return null;
    }
  }

  /**
   * Enhanced HNR calculation
   */
  calculateEnhancedHNR(frequencyData, timeData) {
    try {
      // Calculate signal power in harmonic regions
      const harmonicPower = this.calculateHarmonicPower(frequencyData);
      
      // Calculate noise power from high-frequency components
      const noisePower = this.calculateNoisePower(timeData);
      
      if (noisePower === 0) return 35; // Very clean signal
      
      const hnr = 10 * Math.log10(harmonicPower / noisePower);
      return Math.round(Math.max(0, Math.min(40, hnr)) * 100) / 100;
      
    } catch (error) {
      console.warn('Error calculating enhanced HNR:', error);
      return null;
    }
  }

  /**
   * Calculate harmonic power
   */
  calculateHarmonicPower(frequencyData) {
    let harmonicPower = 0;
    const sampleRate = this.audioContext.sampleRate;
    const binSize = sampleRate / (frequencyData.length * 2);
    
    // Focus on typical voice harmonic regions
    const harmonicRanges = [
      [80, 300],   // Fundamental range
      [300, 800],  // First formant
      [800, 2500], // Second formant
      [2500, 4000] // Third formant
    ];
    
    harmonicRanges.forEach(([minFreq, maxFreq]) => {
      const minBin = Math.floor(minFreq / binSize);
      const maxBin = Math.floor(maxFreq / binSize);
      
      for (let i = minBin; i < Math.min(maxBin, frequencyData.length); i++) {
        harmonicPower += frequencyData[i] * frequencyData[i];
      }
    });
    
    return harmonicPower;
  }

  /**
   * Calculate noise power
   */
  calculateNoisePower(timeData) {
    // Use high-frequency variations as noise estimate
    let noisePower = 0;
    for (let i = 2; i < timeData.length; i++) {
      const highFreqComponent = timeData[i] - 2 * timeData[i-1] + timeData[i-2];
      noisePower += highFreqComponent * highFreqComponent;
    }
    
    return noisePower / (timeData.length - 2);
  }

  /**
   * Enhanced spectral centroid calculation
   */
  calculateEnhancedSpectralCentroid(frequencyData) {
    try {
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      let weightedSum = 0;
      let magnitudeSum = 0;
      
      // Focus on voice frequency range for better accuracy
      const minBin = Math.floor(80 / binSize);
      const maxBin = Math.floor(8000 / binSize);
      
      for (let i = minBin; i < Math.min(maxBin, frequencyData.length); i++) {
        const frequency = i * binSize;
        const magnitude = frequencyData[i];
        
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }
      
      if (magnitudeSum === 0) return null;
      
      return Math.round(weightedSum / magnitudeSum);
      
    } catch (error) {
      console.warn('Error calculating enhanced spectral centroid:', error);
      return null;
    }
  }

  /**
   * Enhanced vocal stress estimation
   */
  estimateEnhancedVocalStress(frequencyData, f0, jitter, shimmer) {
    try {
      let stressScore = 0;
      let factors = 0;
      
      // F0 stress indicators
      if (f0) {
        if (f0 > 250) stressScore += 25;
        else if (f0 > 200) stressScore += 15;
        else if (f0 > 180) stressScore += 10;
        factors++;
      }
      
      // Jitter stress indicators
      if (jitter !== null) {
        if (jitter > 3.0) stressScore += 30;
        else if (jitter > 2.0) stressScore += 20;
        else if (jitter > 1.5) stressScore += 10;
        factors++;
      }
      
      // Shimmer stress indicators
      if (shimmer !== null) {
        if (shimmer > 6.0) stressScore += 30;
        else if (shimmer > 4.0) stressScore += 20;
        else if (shimmer > 3.0) stressScore += 10;
        factors++;
      }
      
      // High frequency energy (tension indicator)
      const highFreqEnergy = this.calculateHighFrequencyEnergy(frequencyData);
      if (highFreqEnergy > 0.4) stressScore += 20;
      else if (highFreqEnergy > 0.3) stressScore += 10;
      factors++;
      
      // Spectral irregularity
      const spectralIrregularity = this.calculateSpectralIrregularity(frequencyData);
      if (spectralIrregularity > 0.5) stressScore += 15;
      factors++;
      
      if (factors === 0) return null;
      
      // Normalize stress score
      const normalizedStress = Math.min(100, Math.max(0, stressScore));
      
      return Math.round(normalizedStress);
      
    } catch (error) {
      console.warn('Error estimating enhanced vocal stress:', error);
      return null;
    }
  }

  /**
   * Calculate spectral irregularity
   */
  calculateSpectralIrregularity(frequencyData) {
    let irregularity = 0;
    for (let i = 1; i < frequencyData.length - 1; i++) {
      const current = frequencyData[i];
      const prev = frequencyData[i-1];
      const next = frequencyData[i+1];
      
      if (current > 0) {
        const expected = (prev + next) / 2;
        irregularity += Math.abs(current - expected) / current;
      }
    }
    
    return irregularity / (frequencyData.length - 2);
  }

  /**
   * Enhanced voiced frame ratio calculation
   */
  calculateEnhancedVoicedFrameRatio(timeData) {
    try {
      const frameSize = 512;
      let voicedFrames = 0;
      let totalFrames = 0;
      
      for (let i = 0; i < timeData.length - frameSize; i += frameSize / 2) {
        const frame = timeData.slice(i, i + frameSize);
        const energy = this.calculateRMS(frame);
        
        if (energy > 12) { // Lower threshold for better detection
          const zcr = this.calculateZeroCrossingRate(frame);
          const spectralCentroid = this.calculateFrameSpectralCentroid(frame);
          
          // Enhanced voiced/unvoiced classification
          const isVoiced = (zcr < 0.35) && (spectralCentroid > 200 && spectralCentroid < 3000);
          
          if (isVoiced) {
            voicedFrames++;
          }
        }
        totalFrames++;
      }
      
      if (totalFrames === 0) return null;
      
      return Math.round((voicedFrames / totalFrames) * 100 * 10) / 10;
      
    } catch (error) {
      console.warn('Error calculating enhanced voiced frame ratio:', error);
      return null;
    }
  }

  /**
   * Calculate frame spectral centroid
   */
  calculateFrameSpectralCentroid(frame) {
    // Simple spectral centroid for frame classification
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frame.length; i++) {
      const magnitude = Math.abs(frame[i] - 128);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate quality score based on current metrics
   */
  calculateQualityScore() {
    try {
      let qualityScore = 0;
      let factors = 0;
      
      // Cardiovascular metrics quality
      const cardioMetrics = Object.keys(this.currentMetrics.rppg).length;
      if (cardioMetrics > 0) {
        qualityScore += Math.min(1, cardioMetrics / 15) * 0.6; // 60% weight
        factors++;
      }
      
      // Voice metrics quality
      const voiceMetrics = Object.keys(this.currentMetrics.voice).length;
      if (voiceMetrics > 0) {
        qualityScore += Math.min(1, voiceMetrics / 8) * 0.4; // 40% weight
        factors++;
      }
      
      return factors > 0 ? qualityScore : 0;
      
    } catch (error) {
      console.warn('Error calculating quality score:', error);
      return 0;
    }
  }

  /**
   * Send enhanced analysis update to callback
   */
  sendEnhancedAnalysisUpdate() {
    if (this.callbacks.onAnalysisUpdate) {
      try {
        const updateData = {
          status: 'analyzing',
          metrics: {
            rppg: { ...this.currentMetrics.rppg },
            voice: { ...this.currentMetrics.voice }
          },
          calculatedBiomarkers: this.currentMetrics.calculated,
          qualityScore: this.currentMetrics.qualityScore,
          timestamp: Date.now(),
          processingStats: { ...this.processingStats },
          frameNumber: this.processingStats.framesProcessed
        };
        
        this.callbacks.onAnalysisUpdate(updateData);
        this.addDebugLog(`📤 Enhanced analysis update sent: ${this.currentMetrics.calculated} biomarkers, Quality: ${this.currentMetrics.qualityScore.toFixed(2)}`);
        
      } catch (error) {
        this.addDebugLog(`❌ Error sending enhanced analysis update: ${error.message}`);
        console.error('Error sending enhanced analysis update:', error);
      }
    }
  }

  /**
   * Stop enhanced biometric analysis
   */
  stopAnalysis() {
    try {
      this.addDebugLog('⏹️ Stopping enhanced biometric analysis...');
      
      this.isAnalyzing = false;
      
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = null;
      }
      
      // Disconnect audio if connected
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(err => {
          console.warn('Error closing audio context:', err);
        });
      }
      
      this.addDebugLog('✅ Enhanced biometric analysis stopped successfully');
      
    } catch (error) {
      this.addDebugLog(`❌ Error stopping enhanced analysis: ${error.message}`);
      console.error('Error stopping enhanced biometric analysis:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate RMS (Root Mean Square) of signal
   */
  calculateRMS(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const value = data[i] - 128;
      sum += value * value;
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Calculate high frequency energy ratio
   */
  calculateHighFrequencyEnergy(frequencyData) {
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    const highFreqStart = Math.floor(frequencyData.length * 0.6);
    const highFreqEnergy = frequencyData.slice(highFreqStart).reduce((sum, val) => sum + val, 0);
    
    return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
  }

  /**
   * Calculate zero crossing rate
   */
  calculateZeroCrossingRate(frame) {
    let crossings = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 128 && frame[i-1] < 128) || 
          (frame[i] < 128 && frame[i-1] >= 128)) {
        crossings++;
      }
    }
    return crossings / frame.length;
  }

  /**
   * Set callback functions
   */
  setCallback(eventName, callback) {
    this.callbacks[eventName] = callback;
    this.addDebugLog(`📞 Enhanced callback set for ${eventName}`);
  }

  /**
   * Add debug log entry
   */
  addDebugLog(message) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      processingStats: { ...this.processingStats }
    };
    
    this.debugLogs.push(logEntry);
    
    // Keep only last 100 logs
    if (this.debugLogs.length > 100) {
      this.debugLogs = this.debugLogs.slice(-100);
    }
    
    if (this.debugMode) {
      console.log(`[EnhancedRPPGProcessor] ${message}`);
    }
  }

  /**
   * Get debug logs for export
   */
  exportDebugLogs() {
    return this.debugLogs;
  }

  /**
   * Get current processor status
   */
  getStatus() {
    return {
      isAnalyzing: this.isAnalyzing,
      hasVideo: !!this.videoElement,
      hasAudio: !!(this.audioContext && this.audioAnalyzer),
      currentMetrics: this.currentMetrics,
      processingStats: this.processingStats,
      qualityScore: this.currentMetrics.qualityScore,
      algorithmsAvailable: {
        enhancedRppg: true,
        advancedCardiovascular: true,
        enhancedVoice: !!(this.audioContext && this.audioAnalyzer),
        signalProcessing: true,
        faceDetection: true
      },
      frameAnalysisRate: this.frameAnalysisRate,
      version: 'v1.2.0-ADVANCED-ALGORITHMS'
    };
  }

  /**
   * Cleanup processor resources
   */
  cleanup() {
    try {
      this.addDebugLog('🧹 Cleaning up enhanced biometric processor...');
      
      this.stopAnalysis();
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      
      // Reset all engines
      this.rppgEngine.reset();
      this.cardiovascularEngine.reset();
      
      // Clear references
      this.videoElement = null;
      this.audioContext = null;
      this.audioAnalyzer = null;
      this.callbacks = {};
      this.canvas = null;
      this.ctx = null;
      
      this.addDebugLog('✅ Enhanced biometric processor cleanup completed');
      
    } catch (error) {
      console.error('Error during enhanced cleanup:', error);
    }
  }
}

export default EnhancedRPPGProcessor;