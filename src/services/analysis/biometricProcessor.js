/**
 * Enhanced Biometric Processor with Complete Voice Analysis Integration
 * Version: v1.1.15-COMPLETE-VOICE-INTEGRATION
 * 
 * This is the main biometric processing engine that integrates all real algorithms
 * for cardiovascular analysis, complete voice analysis, and comprehensive biometric evaluation.
 */

import RPPGAlgorithms from './rppgAlgorithms.js';
import CardiovascularMetrics from './cardiovascularMetrics.js';
import SignalProcessing from './signalProcessing.js';
import VoiceAnalysis from './voiceAnalysis.js';
import AudioProcessor from './audioProcessor.js';

class BiometricProcessor {
  constructor() {
    // Initialize real algorithm engines
    this.rppgEngine = new RPPGAlgorithms();
    this.cardiovascularEngine = new CardiovascularMetrics();
    this.signalProcessor = new SignalProcessing();
    this.voiceAnalyzer = new VoiceAnalysis();
    this.audioProcessor = new AudioProcessor();
    
    // Processing state
    this.isAnalyzing = false;
    this.videoElement = null;
    this.audioStream = null;
    this.callbacks = {};
    
    // Analysis intervals and timers
    this.analysisInterval = null;
    this.frameAnalysisRate = 2000; // Process every 2 seconds
    
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
      voiceBiomarkersExtracted: 0,
      startTime: null,
      lastFrameTime: null
    };
    
    console.log('🔬 Enhanced Biometric Processor v1.1.15 initialized with COMPLETE voice integration');
    this.addDebugLog('Processor initialized with real rPPG, cardiovascular, and complete voice analysis algorithms');
  }

  /**
   * Initialize the biometric processor with video and audio elements
   */
  async initialize(videoElement, enableAudio = false) {
    try {
      this.addDebugLog('Initializing biometric processor with complete voice analysis...');
      
      if (!videoElement) {
        throw new Error('Video element is required for biometric analysis');
      }
      
      this.videoElement = videoElement;
      
      // Initialize audio analysis if enabled
      if (enableAudio) {
        const audioInitResult = await this.initializeCompleteAudioAnalysis();
        if (!audioInitResult.success) {
          this.addDebugLog(`⚠️ Audio initialization failed: ${audioInitResult.error}`);
        }
      }
      
      // Reset all engines
      this.rppgEngine.reset();
      this.cardiovascularEngine.reset();
      this.voiceAnalyzer.reset();
      
      this.addDebugLog('✅ Biometric processor initialized successfully with complete voice analysis');
      
      return {
        success: true,
        rppgEnabled: true,
        voiceEnabled: enableAudio,
        algorithms: ['rPPG-Calibrated', 'Cardiovascular', 'HRV', 'CompleteVoiceAnalysis', 'SignalProcessing']
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
   * Initialize complete audio analysis system
   */
  async initializeCompleteAudioAnalysis() {
    try {
      // Initialize audio processor
      const audioInitResult = await this.audioProcessor.initialize();
      if (!audioInitResult.success) {
        throw new Error(`Audio processor initialization failed: ${audioInitResult.error}`);
      }
      
      // Set up voice biomarker callback
      this.audioProcessor.setCallback('onVoiceBiomarkers', (biomarkers) => {
        this.handleVoiceBiomarkers(biomarkers);
      });
      
      this.addDebugLog('✅ Complete audio analysis system initialized');
      
      return {
        success: true,
        sampleRate: audioInitResult.sampleRate,
        bufferSize: audioInitResult.bufferSize
      };
      
    } catch (error) {
      this.addDebugLog(`❌ Complete audio analysis initialization failed: ${error.message}`);
      console.error('Complete audio analysis initialization failed:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start real-time biometric analysis with complete voice processing
   */
  async startAnalysis(videoElement, audioStream = null) {
    try {
      if (this.isAnalyzing) {
        this.addDebugLog('⚠️ Analysis already in progress');
        return false;
      }
      
      this.addDebugLog('🚀 Starting REAL biometric analysis with COMPLETE voice processing');
      
      // Update video element if provided
      if (videoElement) {
        this.videoElement = videoElement;
      }
      
      if (!this.videoElement) {
        throw new Error('No video element available for analysis');
      }
      
      // Connect audio stream for complete voice analysis
      if (audioStream) {
        this.audioStream = audioStream;
        const audioConnectResult = await this.audioProcessor.connectAudioStream(audioStream);
        
        if (audioConnectResult.success) {
          // Start voice biomarker processing
          this.audioProcessor.startProcessing();
          this.addDebugLog('✅ Complete voice analysis started');
        } else {
          this.addDebugLog(`⚠️ Audio connection failed: ${audioConnectResult.error}`);
        }
      }
      
      // Reset state
      this.isAnalyzing = true;
      this.currentMetrics = { rppg: {}, voice: {}, calculated: 0, lastUpdate: null };
      this.processingStats = {
        framesProcessed: 0,
        algorithmsExecuted: 0,
        metricsCalculated: 0,
        voiceBiomarkersExtracted: 0,
        startTime: Date.now(),
        lastFrameTime: null
      };
      
      // Start analysis loop
      this.startAnalysisLoop();
      
      this.addDebugLog('✅ Real biometric analysis with complete voice processing started successfully');
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
      
      // Process signal through calibrated rPPG algorithms
      const processedSignal = this.rppgEngine.processSignal(rgbData);
      
      if (!processedSignal) {
        this.addDebugLog('⚠️ Signal processing failed - insufficient quality or data');
        return;
      }
      
      this.addDebugLog(`🔬 Signal processed: Quality=${processedSignal.quality.toFixed(2)}, Buffer=${processedSignal.bufferLength}`);
      
      // Calculate cardiovascular metrics
      await this.calculateCardiovascularMetrics(processedSignal, rgbData);
      
      // Voice metrics are handled by the audio processor callback
      // No need to process them here as they're processed in real-time
      
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
   * Calculate comprehensive cardiovascular metrics using calibrated algorithms
   */
  async calculateCardiovascularMetrics(processedSignal, rgbData) {
    try {
      const newMetrics = {};
      let metricsCalculated = 0;
      
      // 1. Heart Rate Analysis (Calibrated)
      const heartRate = this.rppgEngine.calculateHeartRate(processedSignal);
      if (heartRate) {
        newMetrics.heartRate = heartRate;
        metricsCalculated++;
        this.addDebugLog(`❤️ Heart Rate calculated: ${heartRate} BPM`);
      }
      
      // 2. Heart Rate Variability Analysis (Enhanced)
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
      
      // 4. Blood Pressure Estimation (Calibrated)
      if (heartRate && processedSignal.quality > 0.4) {
        const bloodPressure = this.rppgEngine.estimateBloodPressure(heartRate, processedSignal.quality);
        if (bloodPressure) {
          newMetrics.bloodPressure = bloodPressure;
          metricsCalculated++;
          this.addDebugLog(`🩸 Blood Pressure estimated: ${bloodPressure}`);
        }
      }
      
      // 5. SpO2 Estimation (Calibrated)
      const spo2 = this.rppgEngine.estimateSpO2(rgbData);
      if (spo2) {
        newMetrics.oxygenSaturation = spo2;
        metricsCalculated++;
        this.addDebugLog(`🫁 SpO2 estimated: ${spo2}%`);
      }
      
      // 6. Respiratory Rate (Calibrated)
      const respiratoryRate = this.rppgEngine.calculateRespiratoryRate(processedSignal);
      if (respiratoryRate) {
        newMetrics.respiratoryRate = respiratoryRate;
        metricsCalculated++;
        this.addDebugLog(`🫁 Respiratory Rate calculated: ${respiratoryRate} rpm`);
      }
      
      // 7. Perfusion Index (Enhanced)
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
   * Handle voice biomarkers from audio processor
   */
  handleVoiceBiomarkers(biomarkers) {
    try {
      this.addDebugLog(`🎤 Voice biomarkers received: ${Object.keys(biomarkers).length} metrics`);
      
      // Filter out processing info for metrics
      const { processingInfo, ...voiceMetrics } = biomarkers;
      
      // Update voice metrics
      Object.assign(this.currentMetrics.voice, voiceMetrics);
      this.currentMetrics.calculated = Object.keys(this.currentMetrics.rppg).length + Object.keys(this.currentMetrics.voice).length;
      this.currentMetrics.lastUpdate = Date.now();
      
      // Update statistics
      this.processingStats.voiceBiomarkersExtracted += Object.keys(voiceMetrics).length;
      
      // Log individual voice biomarkers
      Object.entries(voiceMetrics).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          this.addDebugLog(`🎤 ${key}: ${value}`);
        }
      });
      
      this.addDebugLog(`✅ Voice biomarkers integrated: ${Object.keys(voiceMetrics).length} metrics`);
      
    } catch (error) {
      this.addDebugLog(`❌ Voice biomarkers handling error: ${error.message}`);
      console.warn('Voice biomarkers handling error:', error);
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
      
      // Stop audio processing
      if (this.audioProcessor) {
        this.audioProcessor.stopProcessing();
      }
      
      this.addDebugLog('✅ Biometric analysis stopped successfully');
      
    } catch (error) {
      this.addDebugLog(`❌ Error stopping analysis: ${error.message}`);
      console.error('Error stopping biometric analysis:', error);
    }
  }

  /**
   * Get current audio levels and voice activity
   */
  getAudioStatus() {
    if (!this.audioProcessor) return null;
    
    try {
      const audioLevels = this.audioProcessor.getAudioLevels();
      const voiceActivity = this.audioProcessor.detectVoiceActivity();
      
      return {
        levels: audioLevels,
        voiceActivity: voiceActivity,
        processingStatus: this.audioProcessor.getStatus()
      };
      
    } catch (error) {
      this.addDebugLog(`❌ Error getting audio status: ${error.message}`);
      return null;
    }
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
      hasAudio: !!this.audioStream,
      currentMetrics: this.currentMetrics,
      processingStats: this.processingStats,
      algorithmsAvailable: {
        rppg: true,
        cardiovascular: true,
        voiceComplete: true,
        signalProcessing: true
      },
      frameAnalysisRate: this.frameAnalysisRate,
      audioProcessorStatus: this.audioProcessor?.getStatus() || null,
      voiceAnalyzerStatus: this.voiceAnalyzer?.getStatus() || null
    };
  }

  /**
   * Cleanup processor resources
   */
  cleanup() {
    try {
      this.addDebugLog('🧹 Cleaning up biometric processor...');
      
      this.stopAnalysis();
      
      // Cleanup audio processor
      if (this.audioProcessor) {
        this.audioProcessor.cleanup();
      }
      
      // Reset all engines
      this.rppgEngine.reset();
      this.cardiovascularEngine.reset();
      this.voiceAnalyzer.reset();
      
      // Clear references
      this.videoElement = null;
      this.audioStream = null;
      this.callbacks = {};
      
      this.addDebugLog('✅ Biometric processor cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default BiometricProcessor;