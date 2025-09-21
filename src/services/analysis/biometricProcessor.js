/**
 * HoloCheck Biometric Processor v1.1.9-DETAILED-LOGS
 * REAL rPPG Analysis Engine with COMPREHENSIVE STEP-BY-STEP LOGGING
 * 
 * ENHANCED LOGGING FEATURES:
 * - Detailed frame-by-frame processing logs
 * - Biomarker calculation step tracking
 * - Memory usage monitoring
 * - Performance metrics
 * - UI callback detailed logging
 * - Export functionality for complete analysis
 */

class BiometricProcessor {
  constructor() {
    this.videoElement = null;
    this.audioContext = null;
    this.audioAnalyser = null;
    this.isAnalyzing = false;
    
    // Real signal buffers - NO fallback data
    this.signalBuffer = [];
    this.peakBuffer = [];
    this.rrIntervals = [];
    this.frameRate = 30;
    this.bufferMaxSize = 900; // 30 seconds at 30fps
    
    // Current real metrics - null when not calculable
    this.currentMetrics = {
      rppg: {},
      voice: {}
    };
    
    // Callbacks
    this.callbacks = {};
    
    // Analysis state
    this.analysisStartTime = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    
    // ENHANCED: Comprehensive logging system
    this.debugLogs = [];
    this.maxLogs = 2000; // Increased for detailed logging
    this.sessionId = this.generateSessionId();
    
    // Performance monitoring
    this.performanceMetrics = {
      frameProcessingTimes: [],
      biomarkerCalculationTimes: [],
      memoryUsage: [],
      callbackTimes: []
    };
    
    // Detailed step tracking
    this.stepTracker = {
      currentStep: 'initialization',
      stepStartTime: Date.now(),
      stepsCompleted: [],
      errors: []
    };
    
    this.addDetailedLog('🔬 BiometricProcessor v1.1.9-DETAILED-LOGS initialized', 'INIT', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      version: 'v1.1.9-DETAILED-LOGS'
    });
  }

  /**
   * Generate unique session ID for tracking
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ENHANCED: Add comprehensive debug log with detailed metadata
   */
  addDetailedLog(message, category = 'INFO', data = null, step = null) {
    const timestamp = new Date().toISOString();
    const performanceNow = performance.now();
    
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sessionId: this.sessionId,
      timestamp,
      performanceTime: performanceNow,
      category,
      step: step || this.stepTracker.currentStep,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : null,
      frameCount: this.frameCount,
      memoryUsage: this.getMemoryUsage(),
      stackTrace: category === 'ERROR' ? new Error().stack : null
    };
    
    this.debugLogs.push(logEntry);
    
    // Keep only recent logs to prevent memory issues
    if (this.debugLogs.length > this.maxLogs) {
      this.debugLogs = this.debugLogs.slice(-this.maxLogs);
    }
    
    // Enhanced console output with color coding
    const timeStr = new Date().toLocaleTimeString('es-ES', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
    
    const categoryColors = {
      'INIT': '\x1b[36m', // Cyan
      'FRAME': '\x1b[32m', // Green  
      'SIGNAL': '\x1b[33m', // Yellow
      'CALC': '\x1b[35m', // Magenta
      'CALLBACK': '\x1b[34m', // Blue
      'ERROR': '\x1b[31m', // Red
      'SUCCESS': '\x1b[92m', // Bright Green
      'WARNING': '\x1b[93m', // Bright Yellow
      'MEMORY': '\x1b[96m', // Bright Cyan
      'PERFORMANCE': '\x1b[95m' // Bright Magenta
    };
    
    const color = categoryColors[category] || '\x1b[37m'; // White default
    const reset = '\x1b[0m';
    
    console.log(`${color}[${timeStr}] [${category}] [${step || 'GENERAL'}] ${message}${reset}`, data || '');
    
    // Track step completion
    if (step && !this.stepTracker.stepsCompleted.includes(step)) {
      this.stepTracker.stepsCompleted.push(step);
    }
  }

  /**
   * Get current memory usage estimation
   */
  getMemoryUsage() {
    return {
      signalBufferSize: this.signalBuffer.length,
      peakBufferSize: this.peakBuffer.length,
      rrIntervalsSize: this.rrIntervals.length,
      debugLogsSize: this.debugLogs.length,
      estimatedMemoryKB: Math.round(
        (this.signalBuffer.length * 8 + 
         this.debugLogs.length * 200 + 
         this.rrIntervals.length * 8) / 1024
      )
    };
  }

  /**
   * ENHANCED: Export comprehensive debug logs with analysis summary
   */
  exportDebugLogs() {
    try {
      this.addDetailedLog('📁 Starting comprehensive log export...', 'INIT', null, 'LOG_EXPORT');
      
      const exportData = {
        sessionInfo: {
          sessionId: this.sessionId,
          exportTimestamp: new Date().toISOString(),
          version: 'v1.1.9-DETAILED-LOGS',
          totalLogs: this.debugLogs.length,
          analysisStatus: this.isAnalyzing ? 'ACTIVE' : 'STOPPED'
        },
        
        analysisMetrics: {
          totalFramesProcessed: this.frameCount,
          currentBufferSize: this.signalBuffer.length,
          calculatedBiomarkers: Object.keys(this.currentMetrics.rppg || {}).length,
          voiceBiomarkers: Object.keys(this.currentMetrics.voice || {}).length,
          stepsCompleted: this.stepTracker.stepsCompleted,
          errors: this.stepTracker.errors
        },
        
        performanceMetrics: this.performanceMetrics,
        
        memoryUsage: this.getMemoryUsage(),
        
        detailedLogs: this.debugLogs,
        
        biomarkerResults: {
          rppg: this.currentMetrics.rppg || {},
          voice: this.currentMetrics.voice || {}
        },
        
        systemInfo: {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          url: window.location.href
        }
      };
      
      // Create formatted log content
      const logContent = [
        '='.repeat(100),
        'HOLOCHECK COMPREHENSIVE DEBUG LOG EXPORT',
        `Session ID: ${this.sessionId}`,
        `Export Time: ${new Date().toISOString()}`,
        `Version: v1.1.9-DETAILED-LOGS`,
        `Total Logs: ${this.debugLogs.length}`,
        `Analysis Status: ${this.isAnalyzing ? 'ACTIVE' : 'STOPPED'}`,
        '='.repeat(100),
        '',
        '📊 ANALYSIS SUMMARY:',
        `- Frames Processed: ${this.frameCount}`,
        `- Buffer Size: ${this.signalBuffer.length}`,
        `- rPPG Biomarkers: ${Object.keys(this.currentMetrics.rppg || {}).length}`,
        `- Voice Biomarkers: ${Object.keys(this.currentMetrics.voice || {}).length}`,
        `- Steps Completed: ${this.stepTracker.stepsCompleted.join(', ')}`,
        `- Memory Usage: ${this.getMemoryUsage().estimatedMemoryKB} KB`,
        '',
        '🔬 BIOMARKER RESULTS:',
        JSON.stringify(this.currentMetrics, null, 2),
        '',
        '📋 DETAILED LOGS:',
        '='.repeat(100),
        '',
        ...this.debugLogs.map(log => 
          `[${log.timestamp}] [${log.category}] [${log.step}] ${log.message}${log.data ? ` | DATA: ${log.data}` : ''}`
        ),
        '',
        '='.repeat(100),
        'END OF LOG EXPORT',
        '='.repeat(100)
      ].join('\n');
      
      // Export as JSON for programmatic analysis
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `holocheck-detailed-analysis-${this.sessionId}-${Date.now()}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      
      // Export as text for human reading
      const textBlob = new Blob([logContent], { type: 'text/plain' });
      const textUrl = URL.createObjectURL(textBlob);
      const textLink = document.createElement('a');
      textLink.href = textUrl;
      textLink.download = `holocheck-detailed-logs-${this.sessionId}-${Date.now()}.log`;
      document.body.appendChild(textLink);
      textLink.click();
      document.body.removeChild(textLink);
      URL.revokeObjectURL(textUrl);
      
      this.addDetailedLog('✅ Comprehensive logs exported successfully', 'SUCCESS', {
        totalLogs: this.debugLogs.length,
        fileTypes: ['JSON', 'TXT'],
        sessionId: this.sessionId
      }, 'LOG_EXPORT');
      
    } catch (error) {
      this.addDetailedLog('❌ Error during log export', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'LOG_EXPORT');
    }
  }

  /**
   * ENHANCED: Initialize with comprehensive logging
   */
  async initialize(videoElement, enableAudio = false) {
    try {
      this.stepTracker.currentStep = 'INITIALIZATION';
      this.addDetailedLog('🚀 Starting processor initialization...', 'INIT', {
        enableAudio,
        videoElementProvided: !!videoElement
      }, 'INITIALIZATION');
      
      this.videoElement = videoElement;
      
      // Detailed video element analysis
      const videoAnalysis = {
        exists: !!videoElement,
        readyState: videoElement?.readyState,
        videoWidth: videoElement?.videoWidth,
        videoHeight: videoElement?.videoHeight,
        currentTime: videoElement?.currentTime,
        duration: videoElement?.duration,
        paused: videoElement?.paused,
        ended: videoElement?.ended,
        muted: videoElement?.muted,
        srcObject: !!videoElement?.srcObject
      };
      
      this.addDetailedLog('📹 Video element detailed analysis', 'INIT', videoAnalysis, 'VIDEO_VALIDATION');
      
      // Initialize audio context if needed
      if (enableAudio) {
        this.addDetailedLog('🎤 Initializing audio context...', 'INIT', null, 'AUDIO_INIT');
        await this.initializeAudio();
      }
      
      const result = {
        success: true,
        rppgEnabled: !!this.videoElement,
        voiceEnabled: !!this.audioContext,
        message: 'Processor initialized - REAL analysis only',
        sessionId: this.sessionId,
        videoAnalysis
      };
      
      this.addDetailedLog('✅ Processor initialization completed', 'SUCCESS', result, 'INITIALIZATION');
      return result;
      
    } catch (error) {
      this.stepTracker.errors.push({
        step: 'INITIALIZATION',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.addDetailedLog('❌ Processor initialization failed', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'INITIALIZATION');
      
      return {
        success: false,
        error: error.message,
        sessionId: this.sessionId
      };
    }
  }

  /**
   * ENHANCED: Initialize audio with detailed logging
   */
  async initializeAudio() {
    try {
      this.stepTracker.currentStep = 'AUDIO_INITIALIZATION';
      this.addDetailedLog('🎤 Creating audio context...', 'INIT', null, 'AUDIO_CONTEXT');
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = 2048;
      
      const audioConfig = {
        sampleRate: this.audioContext.sampleRate,
        fftSize: this.audioAnalyser.fftSize,
        frequencyBinCount: this.audioAnalyser.frequencyBinCount,
        state: this.audioContext.state
      };
      
      this.addDetailedLog('✅ Audio context created successfully', 'SUCCESS', audioConfig, 'AUDIO_CONTEXT');
      
    } catch (error) {
      this.stepTracker.errors.push({
        step: 'AUDIO_INITIALIZATION',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.addDetailedLog('❌ Audio initialization failed', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'AUDIO_INITIALIZATION');
      throw error;
    }
  }

  /**
   * ENHANCED: Start analysis with comprehensive step tracking
   */
  async startAnalysis(videoElement, audioStream = null) {
    try {
      this.stepTracker.currentStep = 'ANALYSIS_START';
      this.addDetailedLog('🚀 [STEP 1] Starting comprehensive biometric analysis...', 'INIT', {
        hasVideo: !!videoElement,
        hasAudio: !!audioStream,
        sessionId: this.sessionId
      }, 'ANALYSIS_START');
      
      // Comprehensive video status analysis
      const videoStatus = {
        exists: !!videoElement,
        readyState: videoElement?.readyState,
        readyStateText: this.getReadyStateText(videoElement?.readyState),
        videoWidth: videoElement?.videoWidth,
        videoHeight: videoElement?.videoHeight,
        currentTime: videoElement?.currentTime,
        duration: videoElement?.duration,
        paused: videoElement?.paused,
        ended: videoElement?.ended,
        muted: videoElement?.muted,
        volume: videoElement?.volume,
        playbackRate: videoElement?.playbackRate,
        srcObject: !!videoElement?.srcObject
      };
      
      this.addDetailedLog('📹 Comprehensive video status analysis', 'INIT', videoStatus, 'VIDEO_STATUS');
      
      this.videoElement = videoElement || this.videoElement;
      this.isAnalyzing = true;
      this.analysisStartTime = Date.now();
      this.frameCount = 0;
      
      // Reset all data structures with logging
      this.addDetailedLog('🔄 Resetting analysis data structures...', 'INIT', null, 'DATA_RESET');
      
      this.signalBuffer = [];
      this.peakBuffer = [];
      this.rrIntervals = [];
      this.currentMetrics = { rppg: {}, voice: {} };
      
      // Reset performance metrics
      this.performanceMetrics = {
        frameProcessingTimes: [],
        biomarkerCalculationTimes: [],
        memoryUsage: [],
        callbackTimes: []
      };
      
      this.addDetailedLog('✅ Data structures reset completed', 'SUCCESS', {
        buffersCleared: ['signalBuffer', 'peakBuffer', 'rrIntervals'],
        metricsReset: true,
        performanceMetricsReset: true
      }, 'DATA_RESET');
      
      // Connect audio stream with detailed logging
      if (audioStream && this.audioContext) {
        this.addDetailedLog('🎤 Connecting audio stream...', 'INIT', {
          streamId: audioStream.id,
          audioTracks: audioStream.getAudioTracks().length,
          streamActive: audioStream.active
        }, 'AUDIO_CONNECT');
        
        const source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.audioAnalyser);
        
        this.addDetailedLog('✅ Audio stream connected successfully', 'SUCCESS', {
          sourceConnected: true,
          analyserConnected: true
        }, 'AUDIO_CONNECT');
      }
      
      // Start analysis loop with detailed initialization
      this.addDetailedLog('🔄 Starting analysis loop...', 'INIT', null, 'LOOP_START');
      this.startDetailedAnalysisLoop();
      
      this.addDetailedLog('✅ [STEP 1] Analysis started successfully', 'SUCCESS', {
        sessionId: this.sessionId,
        startTime: this.analysisStartTime,
        videoReady: !!this.videoElement,
        audioReady: !!this.audioContext
      }, 'ANALYSIS_START');
      
      return true;
      
    } catch (error) {
      this.stepTracker.errors.push({
        step: 'ANALYSIS_START',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.addDetailedLog('❌ [STEP 1] Analysis start failed', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'ANALYSIS_START');
      
      this.isAnalyzing = false;
      return false;
    }
  }

  /**
   * Get human-readable ready state text
   */
  getReadyStateText(readyState) {
    const states = {
      0: 'HAVE_NOTHING',
      1: 'HAVE_METADATA', 
      2: 'HAVE_CURRENT_DATA',
      3: 'HAVE_FUTURE_DATA',
      4: 'HAVE_ENOUGH_DATA'
    };
    return states[readyState] || 'UNKNOWN';
  }

  /**
   * ENHANCED: Detailed analysis loop with comprehensive frame tracking
   */
  startDetailedAnalysisLoop() {
    let frameCounter = 0;
    let lastLogTime = 0;
    
    const processFrame = () => {
      if (!this.isAnalyzing) {
        this.addDetailedLog('⏹️ Analysis stopped, exiting loop', 'INFO', {
          totalFramesProcessed: frameCounter,
          sessionDuration: Date.now() - this.analysisStartTime
        }, 'LOOP_EXIT');
        return;
      }
      
      frameCounter++;
      const frameStartTime = performance.now();
      
      try {
        // Log every 30 frames (1 second) with detailed metrics
        if (frameCounter % 30 === 0) {
          const memoryUsage = this.getMemoryUsage();
          this.performanceMetrics.memoryUsage.push({
            timestamp: Date.now(),
            ...memoryUsage
          });
          
          this.addDetailedLog(`🔄 Frame processing milestone`, 'FRAME', {
            frameNumber: frameCounter,
            framesPerSecond: 30,
            sessionDuration: Date.now() - this.analysisStartTime,
            memoryUsage,
            bufferStatus: {
              signalBuffer: this.signalBuffer.length,
              maxBuffer: this.bufferMaxSize,
              fillPercentage: Math.round((this.signalBuffer.length / this.bufferMaxSize) * 100)
            }
          }, 'FRAME_MILESTONE');
        }
        
        // Extract rPPG signal with detailed logging
        this.stepTracker.currentStep = 'SIGNAL_EXTRACTION';
        const signalExtractionStart = performance.now();
        const signalValue = this.extractDetailedRPPGSignal(frameCounter);
        const signalExtractionTime = performance.now() - signalExtractionStart;
        
        if (signalValue !== null) {
          this.signalBuffer.push(signalValue);
          
          // Log signal addition every 15 frames
          if (frameCounter % 15 === 0) {
            this.addDetailedLog('📈 Signal successfully added to buffer', 'SIGNAL', {
              frameNumber: frameCounter,
              signalValue: Math.round(signalValue * 100) / 100,
              bufferLength: this.signalBuffer.length,
              extractionTimeMs: Math.round(signalExtractionTime * 100) / 100,
              bufferFillPercentage: Math.round((this.signalBuffer.length / this.bufferMaxSize) * 100)
            }, 'SIGNAL_ADDITION');
          }
          
          // Maintain buffer size with logging
          if (this.signalBuffer.length > this.bufferMaxSize) {
            const removedValue = this.signalBuffer.shift();
            this.addDetailedLog('🗑️ Buffer size limit reached, removing oldest value', 'MEMORY', {
              removedValue: Math.round(removedValue * 100) / 100,
              newBufferSize: this.signalBuffer.length,
              maxSize: this.bufferMaxSize
            }, 'BUFFER_MANAGEMENT');
          }
          
          this.frameCount++;
          
          // Calculate biomarkers when sufficient data available
          if (this.signalBuffer.length >= 30) {
            if (frameCounter % 30 === 0) {
              this.addDetailedLog('🧮 Sufficient data available, starting biomarker calculation', 'CALC', {
                bufferSize: this.signalBuffer.length,
                requiredSize: 30,
                frameNumber: frameCounter
              }, 'BIOMARKER_TRIGGER');
            }
            
            this.stepTracker.currentStep = 'BIOMARKER_CALCULATION';
            const calcStart = performance.now();
            this.calculateDetailedBiomarkers(frameCounter);
            const calcTime = performance.now() - calcStart;
            
            this.performanceMetrics.biomarkerCalculationTimes.push({
              timestamp: Date.now(),
              calculationTimeMs: calcTime,
              frameNumber: frameCounter
            });
          }
        } else {
          // Log failed signal extraction with details
          if (frameCounter % 60 === 0) {
            this.addDetailedLog('⚠️ Signal extraction failed', 'WARNING', {
              frameNumber: frameCounter,
              extractionTimeMs: Math.round(signalExtractionTime * 100) / 100,
              consecutiveFailures: this.getConsecutiveFailures(),
              videoStatus: this.getVideoStatus()
            }, 'SIGNAL_FAILURE');
          }
        }
        
        // Process voice with detailed logging
        if (this.audioAnalyser) {
          this.stepTracker.currentStep = 'VOICE_PROCESSING';
          const voiceStart = performance.now();
          this.processDetailedVoiceFrame(frameCounter);
          const voiceTime = performance.now() - voiceStart;
          
          if (frameCounter % 45 === 0) {
            this.addDetailedLog('🎤 Voice frame processed', 'FRAME', {
              frameNumber: frameCounter,
              processingTimeMs: Math.round(voiceTime * 100) / 100
            }, 'VOICE_PROCESSING');
          }
        }
        
        // Track frame processing performance
        const frameProcessingTime = performance.now() - frameStartTime;
        this.performanceMetrics.frameProcessingTimes.push({
          timestamp: Date.now(),
          frameNumber: frameCounter,
          processingTimeMs: frameProcessingTime
        });
        
        // Keep performance arrays manageable
        if (this.performanceMetrics.frameProcessingTimes.length > 300) {
          this.performanceMetrics.frameProcessingTimes = 
            this.performanceMetrics.frameProcessingTimes.slice(-200);
        }
        
        // Continue loop
        requestAnimationFrame(processFrame);
        
      } catch (error) {
        this.stepTracker.errors.push({
          step: this.stepTracker.currentStep,
          error: error.message,
          frameNumber: frameCounter,
          timestamp: new Date().toISOString()
        });
        
        this.addDetailedLog('❌ Frame processing error', 'ERROR', { 
          frameNumber: frameCounter,
          error: error.message,
          stack: error.stack,
          currentStep: this.stepTracker.currentStep
        }, 'FRAME_ERROR');
        
        requestAnimationFrame(processFrame);
      }
    };
    
    this.addDetailedLog('🔄 Detailed analysis loop started', 'SUCCESS', {
      sessionId: this.sessionId,
      startTime: Date.now()
    }, 'LOOP_START');
    
    processFrame();
  }

  /**
   * Get consecutive signal extraction failures count
   */
  getConsecutiveFailures() {
    // Simple implementation - could be enhanced
    return this.signalBuffer.length === 0 ? 'Unknown' : 0;
  }

  /**
   * Get current video status for debugging
   */
  getVideoStatus() {
    const video = this.videoElement;
    return {
      exists: !!video,
      readyState: video?.readyState,
      readyStateText: this.getReadyStateText(video?.readyState),
      paused: video?.paused,
      currentTime: video?.currentTime,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight
    };
  }

  /**
   * ENHANCED: Extract rPPG signal with comprehensive logging
   */
  extractDetailedRPPGSignal(frameNumber) {
    try {
      this.addDetailedLog(`🔍 [STEP 2] Starting signal extraction for frame ${frameNumber}`, 'SIGNAL', null, 'SIGNAL_START');
      
      const video = this.videoElement;
      
      // Comprehensive video validation with detailed logging
      const videoValidation = {
        exists: !!video,
        readyState: video?.readyState,
        readyStateText: this.getReadyStateText(video?.readyState),
        videoWidth: video?.videoWidth,
        videoHeight: video?.videoHeight,
        currentTime: video?.currentTime,
        paused: video?.paused,
        ended: video?.ended
      };
      
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        this.addDetailedLog('❌ [STEP 2] Video validation failed', 'ERROR', {
          frameNumber,
          validation: videoValidation,
          reason: !video ? 'No video element' : 
                  video.readyState < 2 ? 'Video not ready' : 
                  'Invalid video dimensions'
        }, 'VIDEO_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ Video validation passed', 'SUCCESS', videoValidation, 'VIDEO_VALIDATION');
      
      // Canvas creation and setup with logging
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = Math.min(video.videoWidth, 320);
      canvas.height = Math.min(video.videoHeight, 240);
      
      const canvasInfo = {
        originalWidth: video.videoWidth,
        originalHeight: video.videoHeight,
        scaledWidth: canvas.width,
        scaledHeight: canvas.height,
        scalingFactor: canvas.width / video.videoWidth
      };
      
      if (canvas.width === 0 || canvas.height === 0) {
        this.addDetailedLog('❌ Invalid canvas dimensions', 'ERROR', {
          frameNumber,
          canvasInfo,
          reason: 'Zero width or height'
        }, 'CANVAS_SETUP');
        return null;
      }
      
      this.addDetailedLog('📐 Canvas setup completed', 'SUCCESS', canvasInfo, 'CANVAS_SETUP');
      
      // Frame drawing with error handling
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        this.addDetailedLog('🖼️ Frame drawn to canvas successfully', 'SUCCESS', {
          frameNumber,
          imageDataLength: data.length,
          expectedLength: canvas.width * canvas.height * 4
        }, 'FRAME_DRAWING');
        
      } catch (drawError) {
        this.addDetailedLog('❌ Frame drawing failed', 'ERROR', {
          frameNumber,
          error: drawError.message,
          canvasInfo
        }, 'FRAME_DRAWING');
        return null;
      }
      
      // ROI (Region of Interest) definition with detailed logging
      const roiStartX = Math.floor(canvas.width * 0.35);
      const roiEndX = Math.floor(canvas.width * 0.65);
      const roiStartY = Math.floor(canvas.height * 0.2);
      const roiEndY = Math.floor(canvas.height * 0.5);
      
      const roiInfo = {
        startX: roiStartX,
        endX: roiEndX,
        startY: roiStartY,
        endY: roiEndY,
        width: roiEndX - roiStartX,
        height: roiEndY - roiStartY,
        totalPixels: (roiEndX - roiStartX) * (roiEndY - roiStartY),
        coveragePercentage: Math.round(((roiEndX - roiStartX) * (roiEndY - roiStartY)) / (canvas.width * canvas.height) * 100)
      };
      
      this.addDetailedLog('🎯 ROI (Region of Interest) defined', 'SIGNAL', roiInfo, 'ROI_DEFINITION');
      
      // RGB extraction with detailed pixel analysis
      let totalR = 0, totalG = 0, totalB = 0;
      let pixelCount = 0;
      let skinPixelCount = 0;
      let brightnessSum = 0;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Extract RGB values from ROI with skin detection
      for (let y = roiStartY; y < roiEndY; y += 2) {
        for (let x = roiStartX; x < roiEndX; x += 2) {
          const index = (y * canvas.width + x) * 4;
          if (index < data.length - 3) {
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3;
            
            pixelCount++;
            brightnessSum += brightness;
            
            // Skin detection criteria with detailed logging
            if (r > 60 && g > 40 && b > 20) {
              totalR += r;
              totalG += g;
              totalB += b;
              skinPixelCount++;
            }
          }
        }
      }
      
      const pixelAnalysis = {
        totalPixelsProcessed: pixelCount,
        skinPixelsDetected: skinPixelCount,
        skinPixelPercentage: pixelCount > 0 ? Math.round((skinPixelCount / pixelCount) * 100) : 0,
        averageBrightness: pixelCount > 0 ? Math.round(brightnessSum / pixelCount) : 0,
        requiredSkinPixels: 100
      };
      
      if (skinPixelCount < 100) {
        this.addDetailedLog('❌ Insufficient skin pixels detected', 'ERROR', {
          frameNumber,
          pixelAnalysis,
          reason: 'Below minimum threshold for reliable signal'
        }, 'SKIN_DETECTION');
        return null;
      }
      
      this.addDetailedLog('✅ Sufficient skin pixels detected', 'SUCCESS', pixelAnalysis, 'SKIN_DETECTION');
      
      // Calculate average RGB values
      const avgR = totalR / skinPixelCount;
      const avgG = totalG / skinPixelCount;
      const avgB = totalB / skinPixelCount;
      
      // Use green channel for rPPG (most sensitive to blood volume changes)
      const signalValue = avgG;
      
      const signalAnalysis = {
        avgRed: Math.round(avgR * 100) / 100,
        avgGreen: Math.round(avgG * 100) / 100,
        avgBlue: Math.round(avgB * 100) / 100,
        signalValue: Math.round(signalValue * 100) / 100,
        signalChannel: 'GREEN',
        skinPixelsUsed: skinPixelCount
      };
      
      this.addDetailedLog('📊 RGB signal analysis completed', 'SUCCESS', signalAnalysis, 'SIGNAL_ANALYSIS');
      
      // Signal validation with detailed criteria
      const validationCriteria = {
        minValue: 20,
        maxValue: 240,
        actualValue: signalValue,
        isValid: signalValue >= 20 && signalValue <= 240
      };
      
      if (!validationCriteria.isValid) {
        this.addDetailedLog('❌ Signal validation failed', 'ERROR', {
          frameNumber,
          validationCriteria,
          reason: signalValue < 20 ? 'Signal too weak' : 'Signal too strong'
        }, 'SIGNAL_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ [STEP 2] Signal extraction completed successfully', 'SUCCESS', {
        frameNumber,
        signalValue: Math.round(signalValue * 100) / 100,
        validationCriteria,
        pixelAnalysis
      }, 'SIGNAL_SUCCESS');
      
      return signalValue;
      
    } catch (error) {
      this.stepTracker.errors.push({
        step: 'SIGNAL_EXTRACTION',
        error: error.message,
        frameNumber,
        timestamp: new Date().toISOString()
      });
      
      this.addDetailedLog('❌ [STEP 2] Signal extraction error', 'ERROR', { 
        frameNumber,
        error: error.message,
        stack: error.stack 
      }, 'SIGNAL_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Calculate biomarkers with comprehensive step-by-step logging
   */
  calculateDetailedBiomarkers(frameNumber) {
    try {
      const calcStartTime = performance.now();
      this.addDetailedLog(`🧮 [STEP 3] Starting comprehensive biomarker calculation for frame ${frameNumber}`, 'CALC', null, 'BIOMARKER_START');
      
      const bufferAnalysis = {
        currentLength: this.signalBuffer.length,
        requiredMinimum: 30,
        maxCapacity: this.bufferMaxSize,
        fillPercentage: Math.round((this.signalBuffer.length / this.bufferMaxSize) * 100),
        last10Values: this.signalBuffer.slice(-10).map(v => Math.round(v * 100) / 100),
        signalRange: {
          min: Math.min(...this.signalBuffer),
          max: Math.max(...this.signalBuffer),
          mean: this.signalBuffer.reduce((a, b) => a + b, 0) / this.signalBuffer.length
        }
      };
      
      this.addDetailedLog('📈 Buffer analysis for biomarker calculation', 'CALC', bufferAnalysis, 'BUFFER_ANALYSIS');
      
      if (bufferAnalysis.currentLength < 30) {
        this.addDetailedLog('⚠️ Insufficient buffer for biomarker calculations', 'WARNING', {
          frameNumber,
          bufferAnalysis,
          reason: 'Need at least 30 samples for reliable calculations'
        }, 'BUFFER_INSUFFICIENT');
        return;
      }
      
      const calculatedMetrics = {};
      const calculationResults = {};
      const calculationTimes = {};
      
      // 1. PERFUSION INDEX - Detailed calculation
      this.addDetailedLog('🩸 [BIOMARKER 1/6] Calculating Perfusion Index...', 'CALC', null, 'PERFUSION_INDEX');
      const piStart = performance.now();
      const perfusionIndex = this.calculateDetailedPerfusionIndex();
      calculationTimes.perfusionIndex = performance.now() - piStart;
      
      if (perfusionIndex !== null) {
        calculatedMetrics.perfusionIndex = perfusionIndex;
        calculationResults.perfusionIndex = 'SUCCESS';
        this.addDetailedLog('✅ Perfusion Index calculated successfully', 'SUCCESS', { 
          value: perfusionIndex,
          calculationTimeMs: Math.round(calculationTimes.perfusionIndex * 100) / 100
        }, 'PERFUSION_INDEX');
      } else {
        calculationResults.perfusionIndex = 'FAILED';
        this.addDetailedLog('❌ Perfusion Index calculation failed', 'ERROR', {
          calculationTimeMs: Math.round(calculationTimes.perfusionIndex * 100) / 100
        }, 'PERFUSION_INDEX');
      }
      
      // 2. HEART RATE - Detailed calculation with peak analysis
      this.addDetailedLog('💓 [BIOMARKER 2/6] Calculating Heart Rate...', 'CALC', null, 'HEART_RATE');
      const hrStart = performance.now();
      const heartRate = this.calculateDetailedHeartRate();
      calculationTimes.heartRate = performance.now() - hrStart;
      
      if (heartRate !== null) {
        calculatedMetrics.heartRate = heartRate;
        calculationResults.heartRate = 'SUCCESS';
        this.addDetailedLog('✅ Heart Rate calculated successfully', 'SUCCESS', { 
          value: heartRate,
          unit: 'BPM',
          calculationTimeMs: Math.round(calculationTimes.heartRate * 100) / 100
        }, 'HEART_RATE');
        
        // 3. HRV METRICS - Only if we have heart rate
        this.addDetailedLog('📊 [BIOMARKER 3/6] Calculating HRV Metrics...', 'CALC', {
          rrIntervalsAvailable: this.rrIntervals.length
        }, 'HRV_METRICS');
        
        const hrvStart = performance.now();
        const hrv = this.calculateDetailedHRV();
        calculationTimes.hrv = performance.now() - hrvStart;
        
        if (hrv.rmssd) {
          calculatedMetrics.heartRateVariability = hrv.rmssd;
          calculatedMetrics.rmssd = hrv.rmssd;
          calculationResults.rmssd = 'SUCCESS';
          this.addDetailedLog('✅ RMSSD calculated', 'SUCCESS', { 
            value: hrv.rmssd,
            unit: 'ms'
          }, 'HRV_RMSSD');
        }
        
        if (hrv.sdnn) {
          calculatedMetrics.sdnn = hrv.sdnn;
          calculationResults.sdnn = 'SUCCESS';
          this.addDetailedLog('✅ SDNN calculated', 'SUCCESS', { 
            value: hrv.sdnn,
            unit: 'ms'
          }, 'HRV_SDNN');
        }
        
        if (hrv.pnn50) {
          calculatedMetrics.pnn50 = hrv.pnn50;
          calculationResults.pnn50 = 'SUCCESS';
          this.addDetailedLog('✅ pNN50 calculated', 'SUCCESS', { 
            value: hrv.pnn50,
            unit: '%'
          }, 'HRV_PNN50');
        }
        
        // 4. SpO2 - Oxygen Saturation estimation
        this.addDetailedLog('🫁 [BIOMARKER 4/6] Calculating Oxygen Saturation...', 'CALC', null, 'OXYGEN_SATURATION');
        const spo2Start = performance.now();
        const oxygenSaturation = this.calculateDetailedSpO2();
        calculationTimes.oxygenSaturation = performance.now() - spo2Start;
        
        if (oxygenSaturation !== null) {
          calculatedMetrics.oxygenSaturation = oxygenSaturation;
          calculationResults.oxygenSaturation = 'SUCCESS';
          this.addDetailedLog('✅ Oxygen Saturation calculated', 'SUCCESS', { 
            value: oxygenSaturation,
            unit: '%',
            calculationTimeMs: Math.round(calculationTimes.oxygenSaturation * 100) / 100
          }, 'OXYGEN_SATURATION');
        } else {
          calculationResults.oxygenSaturation = 'FAILED';
          this.addDetailedLog('❌ Oxygen Saturation calculation failed', 'ERROR', {
            calculationTimeMs: Math.round(calculationTimes.oxygenSaturation * 100) / 100
          }, 'OXYGEN_SATURATION');
        }
        
        // 5. Blood Pressure - Estimation based on HR and HRV
        this.addDetailedLog('🩸 [BIOMARKER 5/6] Calculating Blood Pressure...', 'CALC', {
          heartRate,
          hrvRmssd: hrv.rmssd
        }, 'BLOOD_PRESSURE');
        
        const bpStart = performance.now();
        const bloodPressure = this.calculateDetailedBloodPressure(heartRate, hrv.rmssd);
        calculationTimes.bloodPressure = performance.now() - bpStart;
        
        if (bloodPressure !== null) {
          calculatedMetrics.bloodPressure = bloodPressure;
          calculationResults.bloodPressure = 'SUCCESS';
          this.addDetailedLog('✅ Blood Pressure calculated', 'SUCCESS', { 
            value: bloodPressure,
            unit: 'mmHg',
            calculationTimeMs: Math.round(calculationTimes.bloodPressure * 100) / 100
          }, 'BLOOD_PRESSURE');
        } else {
          calculationResults.bloodPressure = 'FAILED';
          this.addDetailedLog('❌ Blood Pressure calculation failed', 'ERROR', {
            calculationTimeMs: Math.round(calculationTimes.bloodPressure * 100) / 100
          }, 'BLOOD_PRESSURE');
        }
        
      } else {
        calculationResults.heartRate = 'FAILED';
        this.addDetailedLog('❌ Heart Rate calculation failed - skipping dependent metrics', 'ERROR', {
          calculationTimeMs: Math.round(calculationTimes.heartRate * 100) / 100,
          skippedMetrics: ['HRV', 'SpO2', 'Blood Pressure']
        }, 'HEART_RATE');
      }
      
      // 6. RESPIRATORY RATE - Independent calculation
      this.addDetailedLog('🫁 [BIOMARKER 6/6] Calculating Respiratory Rate...', 'CALC', null, 'RESPIRATORY_RATE');
      const rrStart = performance.now();
      const respiratoryRate = this.calculateDetailedRespiratoryRate();
      calculationTimes.respiratoryRate = performance.now() - rrStart;
      
      if (respiratoryRate !== null) {
        calculatedMetrics.respiratoryRate = respiratoryRate;
        calculationResults.respiratoryRate = 'SUCCESS';
        this.addDetailedLog('✅ Respiratory Rate calculated', 'SUCCESS', { 
          value: respiratoryRate,
          unit: 'rpm',
          calculationTimeMs: Math.round(calculationTimes.respiratoryRate * 100) / 100
        }, 'RESPIRATORY_RATE');
      } else {
        calculationResults.respiratoryRate = 'FAILED';
        this.addDetailedLog('❌ Respiratory Rate calculation failed', 'ERROR', {
          calculationTimeMs: Math.round(calculationTimes.respiratoryRate * 100) / 100
        }, 'RESPIRATORY_RATE');
      }
      
      // Update metrics and generate summary
      this.currentMetrics.rppg = calculatedMetrics;
      const calculatedCount = Object.keys(calculatedMetrics).length;
      const totalCalculationTime = performance.now() - calcStartTime;
      
      const calculationSummary = {
        frameNumber,
        totalCalculated: calculatedCount,
        totalPossible: 6,
        successRate: Math.round((calculatedCount / 6) * 100),
        results: calculationResults,
        calculationTimes,
        totalTimeMs: Math.round(totalCalculationTime * 100) / 100,
        metrics: calculatedMetrics
      };
      
      this.addDetailedLog('📋 Biomarker calculation summary', 'SUCCESS', calculationSummary, 'BIOMARKER_SUMMARY');
      
      // Prepare callback data with detailed metadata
      const callbackData = {
        status: 'analyzing',
        metrics: {
          rppg: calculatedMetrics,
          voice: this.currentMetrics.voice || {}
        },
        calculatedBiomarkers: calculatedCount,
        timestamp: Date.now(),
        frameNumber,
        sessionId: this.sessionId,
        calculationSummary
      };
      
      this.addDetailedLog('📤 Preparing callback to UI', 'CALLBACK', {
        calculatedCount,
        metricsKeys: Object.keys(calculatedMetrics),
        hasVoiceData: Object.keys(this.currentMetrics.voice || {}).length > 0,
        callbackDataSize: JSON.stringify(callbackData).length
      }, 'CALLBACK_PREP');
      
      // Trigger callback with performance tracking
      const callbackStart = performance.now();
      this.triggerDetailedCallback('onAnalysisUpdate', callbackData);
      const callbackTime = performance.now() - callbackStart;
      
      this.performanceMetrics.callbackTimes.push({
        timestamp: Date.now(),
        callbackTimeMs: callbackTime,
        frameNumber,
        dataSize: JSON.stringify(callbackData).length
      });
      
      this.addDetailedLog('✅ [STEP 3] Biomarker calculation completed', 'SUCCESS', {
        frameNumber,
        totalTimeMs: Math.round(totalCalculationTime * 100) / 100,
        callbackTimeMs: Math.round(callbackTime * 100) / 100,
        calculatedCount
      }, 'BIOMARKER_COMPLETE');
      
    } catch (error) {
      this.stepTracker.errors.push({
        step: 'BIOMARKER_CALCULATION',
        error: error.message,
        frameNumber,
        timestamp: new Date().toISOString()
      });
      
      this.addDetailedLog('❌ [STEP 3] Biomarker calculation error', 'ERROR', { 
        frameNumber,
        error: error.message,
        stack: error.stack 
      }, 'BIOMARKER_ERROR');
    }
  }

  /**
   * ENHANCED: Calculate heart rate with detailed peak analysis logging
   */
  calculateDetailedHeartRate() {
    try {
      const bufferRequirement = {
        current: this.signalBuffer.length,
        required: 60,
        sufficient: this.signalBuffer.length >= 60
      };
      
      if (!bufferRequirement.sufficient) {
        this.addDetailedLog('⚠️ Insufficient buffer for heart rate calculation', 'WARNING', bufferRequirement, 'HR_BUFFER_CHECK');
        return null;
      }
      
      const signal = this.signalBuffer.slice(-60); // Last 2 seconds
      
      this.addDetailedLog('🔍 Starting peak detection for heart rate', 'CALC', {
        signalLength: signal.length,
        signalRange: {
          min: Math.min(...signal),
          max: Math.max(...signal),
          mean: signal.reduce((a, b) => a + b, 0) / signal.length
        }
      }, 'HR_PEAK_DETECTION');
      
      const peaks = this.detectDetailedPeaks(signal);
      
      const peakAnalysis = {
        peaksFound: peaks.length,
        peakPositions: peaks,
        requiredMinimum: 2,
        sufficient: peaks.length >= 2
      };
      
      this.addDetailedLog('📊 Peak detection results', 'CALC', peakAnalysis, 'HR_PEAK_RESULTS');
      
      if (!peakAnalysis.sufficient) {
        this.addDetailedLog('❌ Insufficient peaks for heart rate calculation', 'ERROR', peakAnalysis, 'HR_INSUFFICIENT_PEAKS');
        return null;
      }
      
      // Calculate intervals between peaks
      const intervals = [];
      for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i-1]);
      }
      
      if (intervals.length === 0) {
        this.addDetailedLog('❌ No valid intervals calculated', 'ERROR', null, 'HR_NO_INTERVALS');
        return null;
      }
      
      // Calculate average interval and heart rate
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const intervalInSeconds = avgInterval / this.frameRate;
      const heartRate = Math.round(60 / intervalInSeconds);
      
      const heartRateCalculation = {
        intervals,
        avgInterval,
        intervalInSeconds,
        calculatedHR: heartRate,
        frameRate: this.frameRate,
        validRange: '30-200 BPM'
      };
      
      this.addDetailedLog('💓 Heart rate calculation details', 'CALC', heartRateCalculation, 'HR_CALCULATION');
      
      // Validate heart rate range
      const validation = {
        value: heartRate,
        minValid: 30,
        maxValid: 200,
        isValid: heartRate >= 30 && heartRate <= 200
      };
      
      if (!validation.isValid) {
        this.addDetailedLog('❌ Heart rate out of valid physiological range', 'ERROR', validation, 'HR_VALIDATION');
        return null;
      }
      
      // Store RR intervals for HRV calculation
      this.rrIntervals = intervals.map(interval => (interval / this.frameRate) * 1000); // Convert to ms
      
      this.addDetailedLog('✅ Heart rate calculated successfully', 'SUCCESS', {
        heartRate,
        rrIntervalsStored: this.rrIntervals.length,
        validation
      }, 'HR_SUCCESS');
      
      return heartRate;
      
    } catch (error) {
      this.addDetailedLog('❌ Heart rate calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'HR_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Detect peaks with detailed analysis logging
   */
  detectDetailedPeaks(signal) {
    const peaks = [];
    const minPeakDistance = 10;
    
    // Calculate signal statistics
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    const std = Math.sqrt(variance);
    const threshold = mean + (std * 0.3);
    
    const peakDetectionParams = {
      signalLength: signal.length,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      threshold: Math.round(threshold * 100) / 100,
      minPeakDistance
    };
    
    this.addDetailedLog('🔍 Peak detection parameters calculated', 'CALC', peakDetectionParams, 'PEAK_PARAMS');
    
    let peakCandidates = 0;
    let rejectedByDistance = 0;
    
    for (let i = 1; i < signal.length - 1; i++) {
      const current = signal[i];
      const prev = signal[i - 1];
      const next = signal[i + 1];
      
      // Peak detection: current > neighbors AND above threshold
      if (current > prev && current > next && current > threshold) {
        peakCandidates++;
        
        // Check minimum distance from last peak
        if (peaks.length === 0 || (i - peaks[peaks.length - 1]) >= minPeakDistance) {
          peaks.push(i);
        } else {
          rejectedByDistance++;
        }
      }
    }
    
    const peakDetectionResults = {
      peaksFound: peaks.length,
      peakCandidates,
      rejectedByDistance,
      acceptanceRate: peakCandidates > 0 ? Math.round((peaks.length / peakCandidates) * 100) : 0
    };
    
    this.addDetailedLog('📊 Peak detection analysis completed', 'CALC', peakDetectionResults, 'PEAK_ANALYSIS');
    
    return peaks;
  }

  /**
   * ENHANCED: Calculate HRV with detailed metrics logging
   */
  calculateDetailedHRV() {
    const rrRequirement = {
      current: this.rrIntervals.length,
      required: 3,
      sufficient: this.rrIntervals.length >= 3
    };
    
    if (!rrRequirement.sufficient) {
      this.addDetailedLog('⚠️ Insufficient RR intervals for HRV calculation', 'WARNING', rrRequirement, 'HRV_RR_CHECK');
      return {};
    }
    
    const rr = this.rrIntervals.slice(); // Copy array
    const hrv = {};
    
    try {
      this.addDetailedLog('📊 Starting HRV metrics calculation', 'CALC', {
        rrIntervals: rr.length,
        rrRange: {
          min: Math.min(...rr),
          max: Math.max(...rr),
          mean: rr.reduce((a, b) => a + b, 0) / rr.length
        }
      }, 'HRV_START');
      
      // RMSSD - Root Mean Square of Successive Differences
      const diffs = [];
      for (let i = 1; i < rr.length; i++) {
        diffs.push(Math.pow(rr[i] - rr[i-1], 2));
      }
      
      if (diffs.length > 0) {
        hrv.rmssd = Math.round(Math.sqrt(diffs.reduce((a, b) => a + b, 0) / diffs.length));
        this.addDetailedLog('✅ RMSSD calculated', 'SUCCESS', {
          value: hrv.rmssd,
          unit: 'ms',
          differencesUsed: diffs.length
        }, 'HRV_RMSSD');
      }
      
      // SDNN - Standard Deviation of NN intervals
      const mean = rr.reduce((a, b) => a + b, 0) / rr.length;
      const variance = rr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rr.length;
      hrv.sdnn = Math.round(Math.sqrt(variance));
      
      this.addDetailedLog('✅ SDNN calculated', 'SUCCESS', {
        value: hrv.sdnn,
        unit: 'ms',
        mean: Math.round(mean),
        variance: Math.round(variance)
      }, 'HRV_SDNN');
      
      // pNN50 - Percentage of successive RR intervals that differ by more than 50ms
      let nn50Count = 0;
      for (let i = 1; i < rr.length; i++) {
        if (Math.abs(rr[i] - rr[i-1]) > 50) {
          nn50Count++;
        }
      }
      hrv.pnn50 = Math.round((nn50Count / (rr.length - 1)) * 100 * 10) / 10;
      
      this.addDetailedLog('✅ pNN50 calculated', 'SUCCESS', {
        value: hrv.pnn50,
        unit: '%',
        nn50Count,
        totalComparisons: rr.length - 1
      }, 'HRV_PNN50');
      
      const hrvSummary = {
        rrIntervals: rr.length,
        rmssd: hrv.rmssd,
        sdnn: hrv.sdnn,
        pnn50: hrv.pnn50,
        metricsCalculated: Object.keys(hrv).length
      };
      
      this.addDetailedLog('📊 HRV calculation summary', 'SUCCESS', hrvSummary, 'HRV_SUMMARY');
      
      return hrv;
      
    } catch (error) {
      this.addDetailedLog('❌ HRV calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'HRV_ERROR');
      return {};
    }
  }

  /**
   * ENHANCED: Calculate perfusion index with detailed analysis
   */
  calculateDetailedPerfusionIndex() {
    try {
      const bufferRequirement = {
        current: this.signalBuffer.length,
        required: 30,
        sufficient: this.signalBuffer.length >= 30
      };
      
      if (!bufferRequirement.sufficient) {
        this.addDetailedLog('⚠️ Insufficient buffer for perfusion index', 'WARNING', bufferRequirement, 'PI_BUFFER_CHECK');
        return null;
      }
      
      const signal = this.signalBuffer.slice(-30);
      const max = Math.max(...signal);
      const min = Math.min(...signal);
      const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
      
      const signalAnalysis = {
        sampleSize: signal.length,
        max: Math.round(max * 100) / 100,
        min: Math.round(min * 100) / 100,
        mean: Math.round(mean * 100) / 100,
        amplitude: Math.round((max - min) * 100) / 100
      };
      
      if (mean === 0) {
        this.addDetailedLog('❌ Mean signal is zero - cannot calculate perfusion index', 'ERROR', signalAnalysis, 'PI_ZERO_MEAN');
        return null;
      }
      
      const perfusionIndex = ((max - min) / mean) * 100;
      
      const piCalculation = {
        ...signalAnalysis,
        calculatedPI: Math.round(perfusionIndex * 10) / 10,
        formula: '((max - min) / mean) * 100'
      };
      
      this.addDetailedLog('🩸 Perfusion index calculation details', 'CALC', piCalculation, 'PI_CALCULATION');
      
      // Validation
      const validation = {
        value: perfusionIndex,
        minValid: 0.05,
        maxValid: 50,
        isValid: perfusionIndex >= 0.05 && perfusionIndex <= 50
      };
      
      if (!validation.isValid) {
        this.addDetailedLog('❌ Perfusion index out of valid physiological range', 'ERROR', validation, 'PI_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ Perfusion index calculated successfully', 'SUCCESS', {
        value: Math.round(perfusionIndex * 10) / 10,
        unit: '%',
        validation
      }, 'PI_SUCCESS');
      
      return Math.round(perfusionIndex * 10) / 10;
      
    } catch (error) {
      this.addDetailedLog('❌ Perfusion index calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'PI_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Calculate SpO2 with detailed analysis
   */
  calculateDetailedSpO2() {
    try {
      const bufferRequirement = {
        current: this.signalBuffer.length,
        required: 60,
        sufficient: this.signalBuffer.length >= 60
      };
      
      if (!bufferRequirement.sufficient) {
        this.addDetailedLog('⚠️ Insufficient buffer for SpO2 calculation', 'WARNING', bufferRequirement, 'SPO2_BUFFER_CHECK');
        return null;
      }
      
      const signal = this.signalBuffer.slice(-60);
      const variance = this.calculateSignalVariance(signal);
      
      const signalQuality = {
        sampleSize: signal.length,
        variance: Math.round(variance * 100) / 100,
        minRequiredVariance: 5,
        qualityCheck: variance >= 5
      };
      
      this.addDetailedLog('🫁 SpO2 signal quality analysis', 'CALC', signalQuality, 'SPO2_QUALITY');
      
      if (!signalQuality.qualityCheck) {
        this.addDetailedLog('❌ Signal too weak for SpO2 calculation', 'ERROR', signalQuality, 'SPO2_WEAK_SIGNAL');
        return null;
      }
      
      // Simplified SpO2 estimation (normally requires dual wavelength)
      const baseSpO2 = 97;
      const varianceEffect = Math.min(3, variance / 20);
      const spO2 = Math.round(baseSpO2 + varianceEffect);
      
      const spo2Calculation = {
        baseValue: baseSpO2,
        varianceEffect: Math.round(varianceEffect * 100) / 100,
        calculatedSpO2: spO2,
        method: 'Single wavelength estimation'
      };
      
      this.addDetailedLog('🫁 SpO2 calculation details', 'CALC', spo2Calculation, 'SPO2_CALCULATION');
      
      // Validation
      const validation = {
        value: spO2,
        minValid: 85,
        maxValid: 100,
        isValid: spO2 >= 85 && spO2 <= 100
      };
      
      if (!validation.isValid) {
        this.addDetailedLog('❌ SpO2 out of valid physiological range', 'ERROR', validation, 'SPO2_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ SpO2 calculated successfully', 'SUCCESS', {
        value: spO2,
        unit: '%',
        validation,
        note: 'Estimation based on single wavelength'
      }, 'SPO2_SUCCESS');
      
      return spO2;
      
    } catch (error) {
      this.addDetailedLog('❌ SpO2 calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'SPO2_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Calculate blood pressure with detailed analysis
   */
  calculateDetailedBloodPressure(heartRate, hrv) {
    try {
      if (!heartRate) {
        this.addDetailedLog('❌ Heart rate required for blood pressure calculation', 'ERROR', {
          heartRate,
          reason: 'No valid heart rate available'
        }, 'BP_HR_REQUIRED');
        return null;
      }
      
      this.addDetailedLog('🩸 Starting blood pressure calculation', 'CALC', {
        heartRate,
        hrv: hrv || 'Not available',
        method: 'HR and HRV based estimation'
      }, 'BP_START');
      
      // Base values
      let systolic = 120;
      let diastolic = 80;
      
      // Heart rate adjustments
      const hrAdjustments = {
        original: { systolic: 120, diastolic: 80 },
        heartRate,
        adjustments: {}
      };
      
      if (heartRate > 80) {
        const hrEffect = (heartRate - 80) * 0.5;
        systolic += hrEffect;
        diastolic += (heartRate - 80) * 0.3;
        hrAdjustments.adjustments.high_hr = {
          systolic_increase: hrEffect,
          diastolic_increase: (heartRate - 80) * 0.3
        };
      } else if (heartRate < 60) {
        const hrEffect = (60 - heartRate) * 0.3;
        systolic -= hrEffect;
        diastolic -= (60 - heartRate) * 0.2;
        hrAdjustments.adjustments.low_hr = {
          systolic_decrease: hrEffect,
          diastolic_decrease: (60 - heartRate) * 0.2
        };
      }
      
      // HRV adjustments
      if (hrv && hrv < 30) {
        systolic += 5;
        diastolic += 3;
        hrAdjustments.adjustments.low_hrv = {
          systolic_increase: 5,
          diastolic_increase: 3,
          reason: 'Low HRV may indicate higher BP'
        };
      }
      
      systolic = Math.round(systolic);
      diastolic = Math.round(diastolic);
      
      const bpCalculation = {
        ...hrAdjustments,
        final: { systolic, diastolic },
        formatted: `${systolic}/${diastolic}`
      };
      
      this.addDetailedLog('🩸 Blood pressure calculation details', 'CALC', bpCalculation, 'BP_CALCULATION');
      
      // Validation
      const validation = {
        systolic: {
          value: systolic,
          minValid: 90,
          maxValid: 200,
          isValid: systolic >= 90 && systolic <= 200
        },
        diastolic: {
          value: diastolic,
          minValid: 50,
          maxValid: 120,
          isValid: diastolic >= 50 && diastolic <= 120
        }
      };
      
      validation.overall = validation.systolic.isValid && validation.diastolic.isValid;
      
      if (!validation.overall) {
        this.addDetailedLog('❌ Blood pressure out of valid physiological range', 'ERROR', validation, 'BP_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ Blood pressure calculated successfully', 'SUCCESS', {
        value: `${systolic}/${diastolic}`,
        unit: 'mmHg',
        validation,
        note: 'Estimation based on HR and HRV'
      }, 'BP_SUCCESS');
      
      return `${systolic}/${diastolic}`;
      
    } catch (error) {
      this.addDetailedLog('❌ Blood pressure calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'BP_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Calculate respiratory rate with detailed analysis
   */
  calculateDetailedRespiratoryRate() {
    try {
      const bufferRequirement = {
        current: this.signalBuffer.length,
        required: 90,
        sufficient: this.signalBuffer.length >= 90
      };
      
      if (!bufferRequirement.sufficient) {
        this.addDetailedLog('⚠️ Insufficient buffer for respiratory rate', 'WARNING', bufferRequirement, 'RR_BUFFER_CHECK');
        return null;
      }
      
      const signal = this.signalBuffer.slice(-90);
      
      this.addDetailedLog('🫁 Starting respiratory rate calculation', 'CALC', {
        signalLength: signal.length,
        method: 'Low-pass filtered peak detection'
      }, 'RR_START');
      
      // Apply low-pass filter to extract respiratory component
      const filteredSignal = this.applyLowPassFilter(signal, 0.5); // 0.5 Hz cutoff
      
      this.addDetailedLog('🔧 Low-pass filter applied', 'CALC', {
        originalSignalLength: signal.length,
        filteredSignalLength: filteredSignal.length,
        cutoffFrequency: '0.5 Hz'
      }, 'RR_FILTER');
      
      // Detect respiratory peaks
      const respPeaks = this.detectDetailedPeaks(filteredSignal);
      
      const peakAnalysis = {
        peaksFound: respPeaks.length,
        requiredMinimum: 2,
        sufficient: respPeaks.length >= 2
      };
      
      this.addDetailedLog('🔍 Respiratory peak detection results', 'CALC', peakAnalysis, 'RR_PEAKS');
      
      if (!peakAnalysis.sufficient) {
        this.addDetailedLog('❌ Insufficient respiratory peaks', 'ERROR', peakAnalysis, 'RR_INSUFFICIENT_PEAKS');
        return null;
      }
      
      // Calculate respiratory intervals
      const respIntervals = [];
      for (let i = 1; i < respPeaks.length; i++) {
        respIntervals.push(respPeaks[i] - respPeaks[i-1]);
      }
      
      if (respIntervals.length === 0) {
        this.addDetailedLog('❌ No valid respiratory intervals', 'ERROR', null, 'RR_NO_INTERVALS');
        return null;
      }
      
      // Calculate average respiratory interval and rate
      const avgInterval = respIntervals.reduce((a, b) => a + b, 0) / respIntervals.length;
      const intervalInSeconds = avgInterval / this.frameRate;
      const respiratoryRate = Math.round(60 / intervalInSeconds);
      
      const rrCalculation = {
        intervals: respIntervals,
        avgInterval,
        intervalInSeconds,
        calculatedRR: respiratoryRate,
        frameRate: this.frameRate
      };
      
      this.addDetailedLog('🫁 Respiratory rate calculation details', 'CALC', rrCalculation, 'RR_CALCULATION');
      
      // Validation
      const validation = {
        value: respiratoryRate,
        minValid: 8,
        maxValid: 40,
        isValid: respiratoryRate >= 8 && respiratoryRate <= 40
      };
      
      if (!validation.isValid) {
        this.addDetailedLog('❌ Respiratory rate out of valid physiological range', 'ERROR', validation, 'RR_VALIDATION');
        return null;
      }
      
      this.addDetailedLog('✅ Respiratory rate calculated successfully', 'SUCCESS', {
        value: respiratoryRate,
        unit: 'rpm',
        validation
      }, 'RR_SUCCESS');
      
      return respiratoryRate;
      
    } catch (error) {
      this.addDetailedLog('❌ Respiratory rate calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'RR_ERROR');
      return null;
    }
  }

  /**
   * Apply simple low-pass filter
   */
  applyLowPassFilter(signal, cutoffFreq) {
    const alpha = 2 * Math.PI * cutoffFreq / this.frameRate;
    const filtered = [signal[0]];
    
    for (let i = 1; i < signal.length; i++) {
      filtered[i] = filtered[i-1] + alpha * (signal[i] - filtered[i-1]);
    }
    
    return filtered;
  }

  /**
   * Calculate signal variance
   */
  calculateSignalVariance(signal) {
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    return variance;
  }

  /**
   * ENHANCED: Process voice frame with detailed logging
   */
  processDetailedVoiceFrame(frameNumber) {
    try {
      if (!this.audioAnalyser) {
        return;
      }
      
      const bufferLength = this.audioAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.audioAnalyser.getByteFrequencyData(dataArray);
      
      const audioAnalysis = {
        frameNumber,
        bufferLength,
        sampleRate: this.audioContext.sampleRate,
        fftSize: this.audioAnalyser.fftSize
      };
      
      // Calculate basic voice metrics
      const voiceMetrics = this.calculateDetailedVoiceMetrics(dataArray, frameNumber);
      
      if (voiceMetrics) {
        this.currentMetrics.voice = voiceMetrics;
        
        this.addDetailedLog('🎤 Voice metrics calculated successfully', 'SUCCESS', {
          frameNumber,
          metricsCalculated: Object.keys(voiceMetrics).length,
          metrics: voiceMetrics
        }, 'VOICE_SUCCESS');
        
        // Trigger callback for voice metrics
        const callbackData = {
          status: 'analyzing',
          metrics: {
            rppg: this.currentMetrics.rppg || {},
            voice: voiceMetrics
          },
          calculatedBiomarkers: Object.keys(this.currentMetrics.rppg || {}).length + Object.keys(voiceMetrics).length,
          timestamp: Date.now(),
          frameNumber,
          sessionId: this.sessionId
        };
        
        this.triggerDetailedCallback('onAnalysisUpdate', callbackData);
      }
      
    } catch (error) {
      this.addDetailedLog('❌ Voice processing error', 'ERROR', { 
        frameNumber,
        error: error.message,
        stack: error.stack 
      }, 'VOICE_ERROR');
    }
  }

  /**
   * ENHANCED: Calculate voice biomarkers with detailed analysis
   */
  calculateDetailedVoiceMetrics(frequencyData, frameNumber) {
    try {
      // Calculate voice activity
      const totalEnergy = frequencyData.reduce((sum, value) => sum + value, 0);
      
      const energyAnalysis = {
        frameNumber,
        totalEnergy,
        requiredMinimum: 1000,
        hasVoiceActivity: totalEnergy >= 1000
      };
      
      this.addDetailedLog('🎤 Voice energy analysis', 'CALC', energyAnalysis, 'VOICE_ENERGY');
      
      if (!energyAnalysis.hasVoiceActivity) {
        this.addDetailedLog('⚠️ No significant voice activity detected', 'WARNING', energyAnalysis, 'VOICE_NO_ACTIVITY');
        return null;
      }
      
      const voiceMetrics = {};
      
      // Fundamental frequency estimation
      this.addDetailedLog('🎵 Calculating fundamental frequency...', 'CALC', null, 'VOICE_F0');
      const f0 = this.estimateDetailedFundamentalFrequency(frequencyData);
      if (f0) {
        voiceMetrics.fundamentalFrequency = f0;
        this.addDetailedLog('✅ Fundamental frequency calculated', 'SUCCESS', {
          value: f0,
          unit: 'Hz'
        }, 'VOICE_F0');
      }
      
      // Spectral centroid
      this.addDetailedLog('📊 Calculating spectral centroid...', 'CALC', null, 'VOICE_CENTROID');
      const spectralCentroid = this.calculateDetailedSpectralCentroid(frequencyData);
      if (spectralCentroid) {
        voiceMetrics.spectralCentroid = spectralCentroid;
        this.addDetailedLog('✅ Spectral centroid calculated', 'SUCCESS', {
          value: spectralCentroid,
          unit: 'Hz'
        }, 'VOICE_CENTROID');
      }
      
      // Voice activity ratio
      const voiceActivity = totalEnergy > 2000 ? 0.8 : 0.3;
      voiceMetrics.voicedFrameRatio = Math.round(voiceActivity * 100) / 100;
      
      this.addDetailedLog('✅ Voice activity ratio calculated', 'SUCCESS', {
        value: voiceMetrics.voicedFrameRatio,
        totalEnergy,
        threshold: 2000
      }, 'VOICE_ACTIVITY');
      
      const voiceSummary = {
        frameNumber,
        metricsCalculated: Object.keys(voiceMetrics).length,
        totalEnergy,
        metrics: voiceMetrics
      };
      
      this.addDetailedLog('🎤 Voice metrics calculation summary', 'SUCCESS', voiceSummary, 'VOICE_SUMMARY');
      
      return Object.keys(voiceMetrics).length > 0 ? voiceMetrics : null;
      
    } catch (error) {
      this.addDetailedLog('❌ Voice metrics calculation error', 'ERROR', { 
        frameNumber,
        error: error.message,
        stack: error.stack 
      }, 'VOICE_METRICS_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Estimate fundamental frequency with detailed analysis
   */
  estimateDetailedFundamentalFrequency(frequencyData) {
    try {
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      let maxValue = 0;
      let maxIndex = 0;
      
      const startBin = Math.floor(80 / binSize);
      const endBin = Math.floor(300 / binSize);
      
      const f0Analysis = {
        sampleRate,
        binSize: Math.round(binSize * 100) / 100,
        searchRange: {
          startFreq: 80,
          endFreq: 300,
          startBin,
          endBin
        }
      };
      
      for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
        if (frequencyData[i] > maxValue) {
          maxValue = frequencyData[i];
          maxIndex = i;
        }
      }
      
      f0Analysis.peakDetection = {
        maxValue,
        maxIndex,
        requiredMinimum: 50,
        sufficient: maxValue >= 50
      };
      
      this.addDetailedLog('🎵 F0 peak detection analysis', 'CALC', f0Analysis, 'F0_ANALYSIS');
      
      if (!f0Analysis.peakDetection.sufficient) {
        this.addDetailedLog('❌ No significant F0 peak found', 'ERROR', f0Analysis, 'F0_NO_PEAK');
        return null;
      }
      
      const f0 = maxIndex * binSize;
      const roundedF0 = Math.round(f0);
      
      this.addDetailedLog('✅ F0 calculated successfully', 'SUCCESS', {
        rawF0: Math.round(f0 * 100) / 100,
        roundedF0,
        maxValue,
        binIndex: maxIndex
      }, 'F0_SUCCESS');
      
      return roundedF0;
      
    } catch (error) {
      this.addDetailedLog('❌ F0 estimation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'F0_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Calculate spectral centroid with detailed analysis
   */
  calculateDetailedSpectralCentroid(frequencyData) {
    try {
      let weightedSum = 0;
      let magnitudeSum = 0;
      
      for (let i = 0; i < frequencyData.length; i++) {
        weightedSum += i * frequencyData[i];
        magnitudeSum += frequencyData[i];
      }
      
      const centroidAnalysis = {
        dataLength: frequencyData.length,
        weightedSum,
        magnitudeSum,
        hasMagnitude: magnitudeSum > 0
      };
      
      if (!centroidAnalysis.hasMagnitude) {
        this.addDetailedLog('❌ No magnitude for spectral centroid calculation', 'ERROR', centroidAnalysis, 'CENTROID_NO_MAGNITUDE');
        return null;
      }
      
      const sampleRate = this.audioContext.sampleRate;
      const binSize = sampleRate / (frequencyData.length * 2);
      
      const centroid = (weightedSum / magnitudeSum) * binSize;
      const roundedCentroid = Math.round(centroid);
      
      const centroidResult = {
        ...centroidAnalysis,
        sampleRate,
        binSize: Math.round(binSize * 100) / 100,
        rawCentroid: Math.round(centroid * 100) / 100,
        roundedCentroid
      };
      
      this.addDetailedLog('📊 Spectral centroid calculation details', 'CALC', centroidResult, 'CENTROID_CALCULATION');
      
      this.addDetailedLog('✅ Spectral centroid calculated successfully', 'SUCCESS', {
        value: roundedCentroid,
        unit: 'Hz'
      }, 'CENTROID_SUCCESS');
      
      return roundedCentroid;
      
    } catch (error) {
      this.addDetailedLog('❌ Spectral centroid calculation error', 'ERROR', { 
        error: error.message,
        stack: error.stack 
      }, 'CENTROID_ERROR');
      return null;
    }
  }

  /**
   * ENHANCED: Trigger callback with detailed logging
   */
  triggerDetailedCallback(event, data) {
    const callbackStart = performance.now();
    
    this.addDetailedLog(`🔔 Triggering callback: ${event}`, 'CALLBACK', {
      event,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      calculatedBiomarkers: data?.calculatedBiomarkers || 0,
      dataSize: data ? JSON.stringify(data).length : 0
    }, 'CALLBACK_TRIGGER');
    
    if (this.callbacks[event]) {
      try {
        this.callbacks[event](data);
        const callbackTime = performance.now() - callbackStart;
        
        this.addDetailedLog(`✅ Callback ${event} executed successfully`, 'SUCCESS', {
          executionTimeMs: Math.round(callbackTime * 100) / 100,
          dataTransferred: data ? JSON.stringify(data).length : 0
        }, 'CALLBACK_SUCCESS');
        
      } catch (error) {
        const callbackTime = performance.now() - callbackStart;
        
        this.addDetailedLog(`❌ Callback ${event} execution failed`, 'ERROR', { 
          error: error.message,
          stack: error.stack,
          executionTimeMs: Math.round(callbackTime * 100) / 100
        }, 'CALLBACK_ERROR');
      }
    } else {
      this.addDetailedLog(`⚠️ No callback registered for ${event}`, 'WARNING', {
        availableCallbacks: Object.keys(this.callbacks)
      }, 'CALLBACK_NOT_FOUND');
    }
  }

  /**
   * Stop analysis with detailed cleanup logging
   */
  stopAnalysis() {
    this.addDetailedLog('⏹️ Stopping biometric analysis...', 'INFO', {
      sessionId: this.sessionId,
      totalFramesProcessed: this.frameCount,
      sessionDuration: Date.now() - this.analysisStartTime,
      finalBufferSize: this.signalBuffer.length
    }, 'ANALYSIS_STOP');
    
    this.isAnalyzing = false;
    
    const stopSummary = {
      sessionId: this.sessionId,
      totalFrames: this.frameCount,
      totalLogs: this.debugLogs.length,
      stepsCompleted: this.stepTracker.stepsCompleted,
      errors: this.stepTracker.errors.length,
      finalMetrics: {
        rppg: Object.keys(this.currentMetrics.rppg || {}).length,
        voice: Object.keys(this.currentMetrics.voice || {}).length
      }
    };
    
    this.addDetailedLog('✅ Biometric analysis stopped', 'SUCCESS', stopSummary, 'ANALYSIS_STOPPED');
  }

  /**
   * Set callback function with logging
   */
  setCallback(event, callback) {
    this.callbacks[event] = callback;
    this.addDetailedLog(`📞 Callback registered for ${event}`, 'CALLBACK', {
      event,
      callbackType: typeof callback,
      totalCallbacks: Object.keys(this.callbacks).length
    }, 'CALLBACK_REGISTRATION');
  }

  /**
   * ENHANCED: Cleanup with comprehensive logging
   */
  cleanup() {
    this.addDetailedLog('🧹 Starting comprehensive cleanup...', 'INFO', {
      sessionId: this.sessionId,
      totalFramesProcessed: this.frameCount,
      totalLogs: this.debugLogs.length
    }, 'CLEANUP_START');
    
    this.stopAnalysis();
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.addDetailedLog('🎤 Audio context closed', 'SUCCESS', null, 'CLEANUP_AUDIO');
    }
    
    // Clear all buffers and data
    const dataCleared = {
      signalBuffer: this.signalBuffer.length,
      peakBuffer: this.peakBuffer.length,
      rrIntervals: this.rrIntervals.length,
      debugLogs: this.debugLogs.length,
      performanceMetrics: Object.keys(this.performanceMetrics).length
    };
    
    this.signalBuffer = [];
    this.peakBuffer = [];
    this.rrIntervals = [];
    this.currentMetrics = { rppg: {}, voice: {} };
    
    // Keep some logs for final export but clear performance data
    this.performanceMetrics = {
      frameProcessingTimes: [],
      biomarkerCalculationTimes: [],
      memoryUsage: [],
      callbackTimes: []
    };
    
    this.addDetailedLog('✅ Comprehensive cleanup completed', 'SUCCESS', {
      sessionId: this.sessionId,
      dataCleared,
      memoryFreed: 'All buffers and metrics cleared'
    }, 'CLEANUP_COMPLETE');
  }
}

export default BiometricProcessor;