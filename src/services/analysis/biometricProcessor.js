/**
 * Enhanced Biometric Processor with Real rPPG Algorithms
 * Version: v1.1.13-REAL-ALGORITHMS-INTEGRATED
 * 
 * This is the main biometric processing engine that integrates all real algorithms
 * for cardiovascular analysis, voice analysis, and comprehensive biometric evaluation.
 */

import RPPGAlgorithms from './rppgAlgorithms.js';
import CardiovascularMetrics from './cardiovascularMetrics.js';
import SignalProcessing from './signalProcessing.js';

class BiometricProcessor {
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
    
    // Analysis intervals and timers
    this.analysisInterval = null;
    this.frameAnalysisRate = 2000; // Process every 2 seconds (improved from 500ms)
    
    // Real-time data storage
    this.currentMetrics = {
      rppg: {},
      voice: {},
      calculated: 0,
      lastUpdate: null
    };
    
    // Debug and logging
    this.debugLogs = [];
    this.processingStats = {
      framesProcessed: 0,
      algorithmsExecuted: 0,
      metricsCalculated: 0,
      startTime: null,
      lastFrameTime: null
    };
    
    console.log('🔬 Enhanced Biometric Processor v1.1.13 initialized with REAL algorithms');
    this.addDebugLog('Processor initialized with real rPPG and cardiovascular algorithms');
  }

  /**
   * Initialize the biometric processor with video and audio elements
   */
  async initialize(videoElement, enableAudio = false) {
    try {
      this.addDebugLog('Initializing biometric processor...');
      
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
      
      this.addDebugLog('✅ Biometric processor initialized successfully');
      
      return {
        success: true,
        rppgEnabled: true,
        voiceEnabled: enableAudio,
        algorithms: ['rPPG', 'Cardiovascular', 'HRV', 'SignalProcessing']
      };
      
    } catch (error) {
      this.addDebugLog(`❌ Initialization failed: ${error.message}`);
      console.error('Biometric processor initialization failed:', error);
      
      return {
        success: false,
        error: error.message,
        rppgEnabled: false,
        voiceEnabled: false
      };
    }
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
      
      this.addDebugLog('✅ Audio analysis initialized');
      
    } catch (error) {
      this.addDebugLog(`⚠️ Audio initialization failed: ${error.message}`);
      console.warn('Audio analysis initialization failed:', error);
    }
  }

  /**
   * Start real-time biometric analysis
   */
  async startAnalysis(videoElement, audioStream = null) {
    try {
      if (this.isAnalyzing) {
        this.addDebugLog('⚠️ Analysis already in progress');
        return false;
      }
      
      this.addDebugLog('🚀 Starting REAL biometric analysis with algorithms');
      
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
            this.addDebugLog('✅ Audio stream connected for voice analysis');
          }
        } catch (audioError) {
          this.addDebugLog(`⚠️ Audio connection failed: ${audioError.message}`);
        }
      }
      
      // Reset state
      this.isAnalyzing = true;
      this.currentMetrics = { rppg: {}, voice: {}, calculated: 0, lastUpdate: null };
      this.processingStats = {
        framesProcessed: 0,
        algorithmsExecuted: 0,
        metricsCalculated: 0,
        startTime: Date.now(),
        lastFrameTime: null
      };
      
      // Start analysis loop
      this.startAnalysisLoop();
      
      this.addDebugLog('✅ Real biometric analysis started successfully');
      return true;
      
    } catch (error) {
      this.addDebugLog(`❌ Failed to start analysis: ${error.message}`);
      console.error('Failed to start biometric analysis:', error);
      this.isAnalyzing = false;
      return false;
    }
  }

  /**
   * Start the main analysis processing loop
   */
  startAnalysisLoop() {
    this.addDebugLog(`🔄 Starting analysis loop with ${this.frameAnalysisRate}ms intervals`);
    
    this.analysisInterval = setInterval(() => {
      this.processFrame();
    }, this.frameAnalysisRate);
  }

  /**
   * Process a single frame for biometric analysis
   */
  async processFrame() {
    if (!this.isAnalyzing || !this.videoElement) {
      return;
    }

    try {
      this.processingStats.lastFrameTime = Date.now();
      this.processingStats.framesProcessed++;
      
      // Extract RGB signals from video frame
      const rgbData = this.rppgEngine.extractRGBSignals(this.videoElement);
      
      if (!rgbData) {
        this.addDebugLog('⚠️ No valid RGB data extracted from frame');
        return;
      }
      
      this.addDebugLog(`📊 RGB extracted: R=${rgbData.r.toFixed(1)}, G=${rgbData.g.toFixed(1)}, B=${rgbData.b.toFixed(1)}, Quality=${rgbData.quality.toFixed(2)}`);
      
      // Process signal through rPPG algorithms
      const processedSignal = this.rppgEngine.processSignal(rgbData);
      
      if (!processedSignal) {
        this.addDebugLog('⚠️ Signal processing failed - insufficient quality or data');
        return;
      }
      
      this.addDebugLog(`🔬 Signal processed: Quality=${processedSignal.quality.toFixed(2)}, Buffer=${processedSignal.bufferLength}`);
      
      // Calculate cardiovascular metrics
      await this.calculateCardiovascularMetrics(processedSignal, rgbData);
      
      // Calculate voice metrics if audio is available
      if (this.audioAnalyzer) {
        await this.calculateVoiceMetrics();
      }
      
      // Update processing statistics
      this.processingStats.algorithmsExecuted++;
      
      // Send update callback
      this.sendAnalysisUpdate();
      
    } catch (error) {
      this.addDebugLog(`❌ Frame processing error: ${error.message}`);
      console.warn('Frame processing error:', error);
    }
  }

  /**
   * Calculate comprehensive cardiovascular metrics using real algorithms
   */
  async calculateCardiovascularMetrics(processedSignal, rgbData) {
    try {
      const newMetrics = {};
      let metricsCalculated = 0;
      
      // 1. Heart Rate Analysis
      const heartRate = this.rppgEngine.calculateHeartRate(processedSignal);
      if (heartRate) {
        newMetrics.heartRate = heartRate;
        metricsCalculated++;
        this.addDebugLog(`❤️ Heart Rate calculated: ${heartRate} BPM`);
      }
      
      // 2. Heart Rate Variability Analysis
      if (heartRate) {
        const hrvMetrics = this.rppgEngine.calculateHRV(heartRate);
        Object.assign(newMetrics, hrvMetrics);
        metricsCalculated += Object.keys(hrvMetrics).length;
        
        if (Object.keys(hrvMetrics).length > 0) {
          this.addDebugLog(`📊 HRV metrics calculated: ${Object.keys(hrvMetrics).join(', ')}`);
        }
      }
      
      // 3. Advanced Cardiovascular Metrics
      if (heartRate) {
        const cardioMetrics = this.cardiovascularEngine.calculateMetrics(
          heartRate, 
          processedSignal.quality,
          null // Let it generate RR intervals
        );
        
        // Merge cardiovascular metrics
        Object.assign(newMetrics, cardioMetrics);
        metricsCalculated += Object.keys(cardioMetrics).length;
        
        if (Object.keys(cardioMetrics).length > 0) {
          this.addDebugLog(`🫀 Cardiovascular metrics calculated: ${Object.keys(cardioMetrics).join(', ')}`);
        }
      }
      
      // 4. Blood Pressure Estimation
      if (heartRate && processedSignal.quality > 0.4) {
        const bloodPressure = this.rppgEngine.estimateBloodPressure(heartRate, processedSignal.quality);
        if (bloodPressure) {
          newMetrics.bloodPressure = bloodPressure;
          metricsCalculated++;
          this.addDebugLog(`🩸 Blood Pressure estimated: ${bloodPressure}`);
        }
      }
      
      // 5. SpO2 Estimation
      const spo2 = this.rppgEngine.estimateSpO2(rgbData);
      if (spo2) {
        newMetrics.oxygenSaturation = spo2;
        metricsCalculated++;
        this.addDebugLog(`🫁 SpO2 estimated: ${spo2}%`);
      }
      
      // 6. Respiratory Rate
      const respiratoryRate = this.rppgEngine.calculateRespiratoryRate(processedSignal);
      if (respiratoryRate) {
        newMetrics.respiratoryRate = respiratoryRate;
        metricsCalculated++;
        this.addDebugLog(`🫁 Respiratory Rate calculated: ${respiratoryRate} rpm`);
      }
      
      // 7. Perfusion Index
      const perfusionIndex = this.rppgEngine.calculatePerfusionIndex(rgbData, processedSignal);
      if (perfusionIndex) {
        newMetrics.perfusionIndex = perfusionIndex;
        metricsCalculated++;
        this.addDebugLog(`🔄 Perfusion Index calculated: ${perfusionIndex}%`);
      }
      
      // Update metrics and statistics
      Object.assign(this.currentMetrics.rppg, newMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      this.currentMetrics.lastUpdate = Date.now();
      
      this.processingStats.metricsCalculated += metricsCalculated;
      
      if (metricsCalculated > 0) {
        this.addDebugLog(`✅ Total cardiovascular metrics calculated this frame: ${metricsCalculated}`);
      }
      
    } catch (error) {
      this.addDebugLog(`❌ Cardiovascular metrics calculation error: ${error.message}`);
      console.warn('Cardiovascular metrics calculation error:', error);
    }
  }

  /**
   * Calculate voice biomarkers from audio analysis
   */
  async calculateVoiceMetrics() {
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
      
      // Check if there's actual voice activity
      const rms = this.calculateRMS(timeDataArray);
      if (rms < 10) { // Threshold for voice activity
        return; // No significant audio signal
      }
      
      const newVoiceMetrics = {};
      let voiceMetricsCalculated = 0;
      
      // 1. Fundamental Frequency (F0) estimation
      const f0 = this.estimateFundamentalFrequency(dataArray);
      if (f0) {
        newVoiceMetrics.fundamentalFrequency = f0;
        voiceMetricsCalculated++;
        this.addDebugLog(`🎤 Fundamental Frequency: ${f0} Hz`);
      }
      
      // 2. Jitter calculation (frequency variation)
      const jitter = this.calculateJitter(timeDataArray);
      if (jitter !== null) {
        newVoiceMetrics.jitter = jitter;
        voiceMetricsCalculated++;
        this.addDebugLog(`📊 Jitter: ${jitter}%`);
      }
      
      // 3. Shimmer calculation (amplitude variation)
      const shimmer = this.calculateShimmer(timeDataArray);
      if (shimmer !== null) {
        newVoiceMetrics.shimmer = shimmer;
        voiceMetricsCalculated++;
        this.addDebugLog(`📊 Shimmer: ${shimmer}%`);
      }
      
      // 4. Harmonic-to-Noise Ratio
      const hnr = this.calculateHNR(dataArray, timeDataArray);
      if (hnr !== null) {
        newVoiceMetrics.harmonicToNoiseRatio = hnr;
        voiceMetricsCalculated++;
        this.addDebugLog(`🔊 HNR: ${hnr} dB`);
      }
      
      // 5. Spectral Centroid
      const spectralCentroid = this.calculateSpectralCentroid(dataArray);
      if (spectralCentroid) {
        newVoiceMetrics.spectralCentroid = spectralCentroid;
        voiceMetricsCalculated++;
        this.addDebugLog(`📈 Spectral Centroid: ${spectralCentroid} Hz`);
      }
      
      // 6. Voice Stress Estimation
      const vocalStress = this.estimateVocalStress(dataArray, f0, jitter, shimmer);
      if (vocalStress !== null) {
        newVoiceMetrics.vocalStress = vocalStress;
        newVoiceMetrics.stressLevel = vocalStress; // Alias for compatibility
        voiceMetricsCalculated++;
        this.addDebugLog(`😰 Vocal Stress: ${vocalStress}%`);
      }
      
      // 7. Voiced Frame Ratio
      const voicedRatio = this.calculateVoicedFrameRatio(timeDataArray);
      if (voicedRatio !== null) {
        newVoiceMetrics.voicedFrameRatio = voicedRatio;
        voiceMetricsCalculated++;
        this.addDebugLog(`🎵 Voiced Frame Ratio: ${voicedRatio}%`);
      }
      
      // Update voice metrics
      Object.assign(this.currentMetrics.voice, newVoiceMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      
      if (voiceMetricsCalculated > 0) {
        this.addDebugLog(`✅ Voice metrics calculated this frame: ${voiceMetricsCalculated}`);
      }
      
    } catch (error) {
      this.addDebugLog(`❌ Voice metrics calculation error: ${error.message}`);
      console.warn('Voice metrics calculation error:', error);
    }
  }

  /**
   * Send analysis update to callback
   */
  sendAnalysisUpdate() {
    if (this.callbacks.onAnalysisUpdate) {
      try {
        const updateData = {
          status: 'analyzing',
          metrics: {
            rppg: { ...this.currentMetrics.rppg },
            voice: { ...this.currentMetrics.voice }
          },
          calculatedBiomarkers: this.currentMetrics.calculated,
          timestamp: Date.now(),
          processingStats: { ...this.processingStats }
        };
        
        this.callbacks.onAnalysisUpdate(updateData);
        this.addDebugLog(`📤 Analysis update sent: ${this.currentMetrics.calculated} biomarkers`);
        
      } catch (error) {
        this.addDebugLog(`❌ Error sending analysis update: ${error.message}`);
        console.error('Error sending analysis update:', error);
      }
    }
  }

  /**
   * Stop biometric analysis
   */
  stopAnalysis() {
    try {
      this.addDebugLog('⏹️ Stopping biometric analysis...');
      
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
      
      this.addDebugLog('✅ Biometric analysis stopped successfully');
      
    } catch (error) {
      this.addDebugLog(`❌ Error stopping analysis: ${error.message}`);
      console.error('Error stopping biometric analysis:', error);
    }
  }

  // ==================== VOICE ANALYSIS ALGORITHMS ====================

  /**
   * Estimate fundamental frequency (F0) from frequency spectrum
   */
  estimateFundamentalFrequency(frequencyData) {
    try {
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      // Find peak in typical voice frequency range (80-400 Hz)
      const minBin = Math.floor(80 / binSize);
      const maxBin = Math.floor(400 / binSize);
      
      let maxMagnitude = 0;
      let peakBin = minBin;
      
      for (let i = minBin; i < Math.min(maxBin, frequencyData.length); i++) {
        if (frequencyData[i] > maxMagnitude) {
          maxMagnitude = frequencyData[i];
          peakBin = i;
        }
      }
      
      if (maxMagnitude > 50) { // Threshold for valid voice signal
        return Math.round(peakBin * binSize);
      }
      
      return null;
      
    } catch (error) {
      console.warn('Error estimating F0:', error);
      return null;
    }
  }

  /**
   * Calculate jitter (frequency variation)
   */
  calculateJitter(timeData) {
    try {
      // Simplified jitter calculation based on zero-crossing variations
      const zeroCrossings = [];
      
      for (let i = 1; i < timeData.length; i++) {
        if ((timeData[i] >= 128 && timeData[i-1] < 128) || 
            (timeData[i] < 128 && timeData[i-1] >= 128)) {
          zeroCrossings.push(i);
        }
      }
      
      if (zeroCrossings.length < 3) return null;
      
      const periods = [];
      for (let i = 1; i < zeroCrossings.length - 1; i += 2) {
        periods.push(zeroCrossings[i+1] - zeroCrossings[i-1]);
      }
      
      if (periods.length < 2) return null;
      
      const meanPeriod = periods.reduce((sum, p) => sum + p, 0) / periods.length;
      const periodVariations = periods.map(p => Math.abs(p - meanPeriod));
      const avgVariation = periodVariations.reduce((sum, v) => sum + v, 0) / periodVariations.length;
      
      return Math.round((avgVariation / meanPeriod) * 100 * 100) / 100; // Percentage with 2 decimals
      
    } catch (error) {
      console.warn('Error calculating jitter:', error);
      return null;
    }
  }

  /**
   * Calculate shimmer (amplitude variation)
   */
  calculateShimmer(timeData) {
    try {
      // Calculate local amplitude variations
      const windowSize = 10;
      const amplitudes = [];
      
      for (let i = 0; i < timeData.length - windowSize; i += windowSize) {
        let maxAmp = 0;
        for (let j = i; j < i + windowSize; j++) {
          const amp = Math.abs(timeData[j] - 128);
          if (amp > maxAmp) maxAmp = amp;
        }
        amplitudes.push(maxAmp);
      }
      
      if (amplitudes.length < 3) return null;
      
      const meanAmplitude = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
      
      if (meanAmplitude === 0) return null;
      
      const amplitudeVariations = amplitudes.map(a => Math.abs(a - meanAmplitude));
      const avgVariation = amplitudeVariations.reduce((sum, v) => sum + v, 0) / amplitudeVariations.length;
      
      return Math.round((avgVariation / meanAmplitude) * 100 * 100) / 100; // Percentage with 2 decimals
      
    } catch (error) {
      console.warn('Error calculating shimmer:', error);
      return null;
    }
  }

  /**
   * Calculate Harmonic-to-Noise Ratio
   */
  calculateHNR(frequencyData, timeData) {
    try {
      // Estimate signal power (harmonics) vs noise power
      const signalPower = this.calculateRMS(frequencyData);
      const noisePower = this.estimateNoisePower(timeData);
      
      if (noisePower === 0) return 30; // Very clean signal
      
      const hnr = 20 * Math.log10(signalPower / noisePower);
      return Math.round(hnr * 100) / 100;
      
    } catch (error) {
      console.warn('Error calculating HNR:', error);
      return null;
    }
  }

  /**
   * Calculate spectral centroid
   */
  calculateSpectralCentroid(frequencyData) {
    try {
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      let weightedSum = 0;
      let magnitudeSum = 0;
      
      for (let i = 0; i < frequencyData.length; i++) {
        const frequency = i * binSize;
        const magnitude = frequencyData[i];
        
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }
      
      if (magnitudeSum === 0) return null;
      
      return Math.round(weightedSum / magnitudeSum);
      
    } catch (error) {
      console.warn('Error calculating spectral centroid:', error);
      return null;
    }
  }

  /**
   * Estimate vocal stress from multiple voice parameters
   */
  estimateVocalStress(frequencyData, f0, jitter, shimmer) {
    try {
      let stressScore = 0;
      
      // High F0 can indicate stress (especially for males)
      if (f0 && f0 > 200) stressScore += 20;
      else if (f0 && f0 > 150) stressScore += 10;
      
      // High jitter indicates stress
      if (jitter && jitter > 2.0) stressScore += 25;
      else if (jitter && jitter > 1.0) stressScore += 15;
      
      // High shimmer indicates stress
      if (shimmer && shimmer > 5.0) stressScore += 25;
      else if (shimmer && shimmer > 3.0) stressScore += 15;
      
      // High frequency energy can indicate tension
      const highFreqEnergy = this.calculateHighFrequencyEnergy(frequencyData);
      if (highFreqEnergy > 0.3) stressScore += 15;
      
      return Math.min(100, Math.max(0, stressScore));
      
    } catch (error) {
      console.warn('Error estimating vocal stress:', error);
      return null;
    }
  }

  /**
   * Calculate voiced frame ratio
   */
  calculateVoicedFrameRatio(timeData) {
    try {
      const frameSize = 256;
      let voicedFrames = 0;
      let totalFrames = 0;
      
      for (let i = 0; i < timeData.length - frameSize; i += frameSize) {
        const frame = timeData.slice(i, i + frameSize);
        const energy = this.calculateRMS(frame);
        
        // Simple voiced/unvoiced classification based on energy and zero-crossings
        if (energy > 15) {
          const zcr = this.calculateZeroCrossingRate(frame);
          if (zcr < 0.3) { // Lower ZCR typically indicates voiced speech
            voicedFrames++;
          }
        }
        totalFrames++;
      }
      
      if (totalFrames === 0) return null;
      
      return Math.round((voicedFrames / totalFrames) * 100 * 10) / 10;
      
    } catch (error) {
      console.warn('Error calculating voiced frame ratio:', error);
      return null;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate RMS (Root Mean Square) of signal
   */
  calculateRMS(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const value = data[i] - 128; // Center around 0
      sum += value * value;
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Estimate noise power in signal
   */
  estimateNoisePower(timeData) {
    // Use high-frequency components as noise estimate
    const filtered = this.signalProcessor.movingAverage(Array.from(timeData), 5);
    const noise = timeData.map((val, i) => Math.abs(val - filtered[i]));
    return this.calculateRMS(noise);
  }

  /**
   * Calculate high frequency energy ratio
   */
  calculateHighFrequencyEnergy(frequencyData) {
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    const highFreqStart = Math.floor(frequencyData.length * 0.7);
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
    this.addDebugLog(`📞 Callback set for ${eventName}`);
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
      console.log(`[BiometricProcessor] ${message}`);
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
      algorithmsAvailable: {
        rppg: true,
        cardiovascular: true,
        voice: !!(this.audioContext && this.audioAnalyzer),
        signalProcessing: true
      },
      frameAnalysisRate: this.frameAnalysisRate
    };
  }

  /**
   * Cleanup processor resources
   */
  cleanup() {
    try {
      this.addDebugLog('🧹 Cleaning up biometric processor...');
      
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
      
      this.addDebugLog('✅ Biometric processor cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default BiometricProcessor;