/**
 * Audio Processing Module for Voice Biomarker Extraction
 * Version: v1.1.15-AUDIO-PROCESSING
 * 
 * Handles real-time audio capture, preprocessing, and integration
 * with voice analysis algorithms for biomarker extraction.
 */

import VoiceAnalysis from './voiceAnalysis.js';

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.analyzerNode = null;
    this.sourceNode = null;
    this.voiceAnalyzer = new VoiceAnalysis();
    
    // Audio processing parameters
    this.sampleRate = 44100;
    this.bufferSize = 4096;
    this.fftSize = 2048;
    
    // Real-time audio buffers
    this.audioBuffer = [];
    this.maxBufferLength = this.sampleRate * 5; // 5 seconds of audio
    
    // Processing state
    this.isProcessing = false;
    this.lastProcessTime = 0;
    this.processInterval = 2000; // Process every 2 seconds
    
    // Callbacks
    this.callbacks = {};
    
    console.log('🎤 Audio Processor v1.1.15 initialized');
  }

  /**
   * Initialize audio processing with microphone access
   */
  async initialize() {
    try {
      // Check for Web Audio API support
      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Web Audio API not supported in this browser');
      }

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.sampleRate = this.audioContext.sampleRate;
      
      // Update voice analyzer sample rate
      this.voiceAnalyzer.sampleRate = this.sampleRate;
      
      console.log(`🎤 Audio context initialized - Sample Rate: ${this.sampleRate} Hz`);
      
      return {
        success: true,
        sampleRate: this.sampleRate,
        bufferSize: this.bufferSize
      };
      
    } catch (error) {
      console.error('Audio processor initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Connect audio stream for processing
   */
  async connectAudioStream(mediaStream) {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create source node from media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(mediaStream);
      
      // Create analyzer node
      this.analyzerNode = this.audioContext.createAnalyser();
      this.analyzerNode.fftSize = this.fftSize;
      this.analyzerNode.smoothingTimeConstant = 0.8;
      
      // Create script processor for real-time analysis
      this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
      
      // Connect audio nodes
      this.sourceNode.connect(this.analyzerNode);
      this.analyzerNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
      
      // Set up audio processing callback
      this.scriptProcessor.onaudioprocess = (event) => {
        this.processAudioData(event.inputBuffer);
      };
      
      console.log('🎤 Audio stream connected successfully');
      
      return {
        success: true,
        connected: true
      };
      
    } catch (error) {
      console.error('Audio stream connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start real-time voice biomarker processing
   */
  startProcessing() {
    try {
      if (this.isProcessing) {
        console.warn('Audio processing already started');
        return false;
      }

      this.isProcessing = true;
      this.lastProcessTime = Date.now();
      this.audioBuffer = [];
      
      console.log('🎤 Voice biomarker processing started');
      
      return true;
      
    } catch (error) {
      console.error('Failed to start audio processing:', error);
      return false;
    }
  }

  /**
   * Stop voice biomarker processing
   */
  stopProcessing() {
    try {
      this.isProcessing = false;
      
      // Disconnect audio nodes
      if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      }
      
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      
      if (this.analyzerNode) {
        this.analyzerNode.disconnect();
        this.analyzerNode = null;
      }
      
      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      console.log('🎤 Voice biomarker processing stopped');
      
    } catch (error) {
      console.error('Error stopping audio processing:', error);
    }
  }

  /**
   * Process incoming audio data
   */
  processAudioData(inputBuffer) {
    if (!this.isProcessing) return;

    try {
      // Get audio data from input buffer
      const audioData = inputBuffer.getChannelData(0);
      
      // Add to circular buffer
      this.audioBuffer.push(...audioData);
      
      // Maintain buffer size
      if (this.audioBuffer.length > this.maxBufferLength) {
        this.audioBuffer = this.audioBuffer.slice(-this.maxBufferLength);
      }
      
      // Process voice biomarkers at regular intervals
      const currentTime = Date.now();
      if (currentTime - this.lastProcessTime >= this.processInterval) {
        this.extractVoiceBiomarkers();
        this.lastProcessTime = currentTime;
      }
      
    } catch (error) {
      console.error('Audio data processing error:', error);
    }
  }

  /**
   * Extract voice biomarkers from accumulated audio data
   */
  extractVoiceBiomarkers() {
    try {
      if (this.audioBuffer.length < this.sampleRate) {
        return; // Need at least 1 second of audio
      }

      // Use the most recent 3 seconds of audio for analysis
      const analysisLength = Math.min(this.sampleRate * 3, this.audioBuffer.length);
      const analysisData = this.audioBuffer.slice(-analysisLength);
      
      // Extract voice biomarkers using voice analyzer
      const voiceBiomarkers = this.voiceAnalyzer.analyzeVoice(analysisData, this.sampleRate);
      
      if (voiceBiomarkers) {
        // Add processing metadata
        const processedBiomarkers = {
          ...voiceBiomarkers,
          processingInfo: {
            sampleRate: this.sampleRate,
            bufferLength: analysisData.length,
            durationSeconds: analysisData.length / this.sampleRate,
            timestamp: Date.now()
          }
        };
        
        // Send biomarkers via callback
        this.sendVoiceBiomarkers(processedBiomarkers);
        
        console.log(`🎤 Voice biomarkers extracted: ${Object.keys(voiceBiomarkers).length} metrics`);
      }
      
    } catch (error) {
      console.error('Voice biomarker extraction error:', error);
    }
  }

  /**
   * Get real-time frequency and time domain data
   */
  getRealtimeAudioData() {
    if (!this.analyzerNode) return null;

    try {
      // Get frequency domain data
      const frequencyData = new Uint8Array(this.analyzerNode.frequencyBinCount);
      this.analyzerNode.getByteFrequencyData(frequencyData);
      
      // Get time domain data
      const timeData = new Uint8Array(this.analyzerNode.frequencyBinCount);
      this.analyzerNode.getByteTimeDomainData(timeData);
      
      return {
        frequency: frequencyData,
        time: timeData,
        sampleRate: this.sampleRate,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error getting realtime audio data:', error);
      return null;
    }
  }

  /**
   * Analyze current audio for voice activity
   */
  detectVoiceActivity() {
    if (!this.analyzerNode) return null;

    try {
      const timeData = new Uint8Array(this.analyzerNode.frequencyBinCount);
      this.analyzerNode.getByteTimeDomainData(timeData);
      
      // Convert to float array
      const floatData = Array.from(timeData).map(val => (val - 128) / 128);
      
      // Use voice analyzer for activity detection
      const voiceActivity = this.voiceAnalyzer.detectVoiceActivity(floatData);
      
      return {
        ...voiceActivity,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Voice activity detection error:', error);
      return null;
    }
  }

  /**
   * Get current audio levels and quality metrics
   */
  getAudioLevels() {
    if (!this.analyzerNode) return null;

    try {
      const timeData = new Uint8Array(this.analyzerNode.frequencyBinCount);
      this.analyzerNode.getByteTimeDomainData(timeData);
      
      const frequencyData = new Uint8Array(this.analyzerNode.frequencyBinCount);
      this.analyzerNode.getByteFrequencyData(frequencyData);
      
      // Calculate RMS level
      const floatData = Array.from(timeData).map(val => (val - 128) / 128);
      const rms = Math.sqrt(floatData.reduce((sum, val) => sum + val * val, 0) / floatData.length);
      
      // Calculate peak level
      const peak = Math.max(...floatData.map(Math.abs));
      
      // Calculate average frequency magnitude
      const avgFrequency = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
      
      // Calculate signal-to-noise ratio estimate
      const sortedFreq = Array.from(frequencyData).sort((a, b) => a - b);
      const noiseFloor = sortedFreq[Math.floor(sortedFreq.length * 0.1)]; // 10th percentile as noise
      const signalPeak = Math.max(...frequencyData);
      const snr = signalPeak > 0 ? 20 * Math.log10(signalPeak / (noiseFloor + 1)) : 0;
      
      return {
        rms: Math.round(rms * 1000) / 1000,
        peak: Math.round(peak * 1000) / 1000,
        avgFrequency: Math.round(avgFrequency),
        snr: Math.round(snr * 10) / 10,
        quality: this.assessAudioQuality(rms, snr),
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Audio levels calculation error:', error);
      return null;
    }
  }

  /**
   * Assess audio quality based on levels and SNR
   */
  assessAudioQuality(rms, snr) {
    let quality = 'Poor';
    
    if (rms > 0.01 && snr > 20) {
      quality = 'Excellent';
    } else if (rms > 0.005 && snr > 15) {
      quality = 'Good';
    } else if (rms > 0.002 && snr > 10) {
      quality = 'Fair';
    }
    
    return quality;
  }

  /**
   * Send voice biomarkers via callback
   */
  sendVoiceBiomarkers(biomarkers) {
    if (this.callbacks.onVoiceBiomarkers) {
      try {
        this.callbacks.onVoiceBiomarkers(biomarkers);
      } catch (error) {
        console.error('Error in voice biomarkers callback:', error);
      }
    }
  }

  /**
   * Set callback functions
   */
  setCallback(eventName, callback) {
    this.callbacks[eventName] = callback;
    console.log(`🎤 Audio processor callback set for ${eventName}`);
  }

  /**
   * Process audio file for offline analysis
   */
  async processAudioFile(audioFile) {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      // Read audio file
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Get audio data
      const audioData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Analyze with voice analyzer
      const voiceBiomarkers = this.voiceAnalyzer.analyzeVoice(audioData, sampleRate);
      
      if (voiceBiomarkers) {
        return {
          success: true,
          biomarkers: voiceBiomarkers,
          fileInfo: {
            duration: audioBuffer.duration,
            sampleRate: sampleRate,
            channels: audioBuffer.numberOfChannels,
            length: audioBuffer.length
          }
        };
      } else {
        return {
          success: false,
          error: 'No voice biomarkers could be extracted from the file'
        };
      }
      
    } catch (error) {
      console.error('Audio file processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      hasAudioContext: !!this.audioContext,
      hasAnalyzer: !!this.analyzerNode,
      hasSource: !!this.sourceNode,
      sampleRate: this.sampleRate,
      bufferSize: this.bufferSize,
      bufferLength: this.audioBuffer.length,
      maxBufferLength: this.maxBufferLength,
      processInterval: this.processInterval,
      voiceAnalyzerStatus: this.voiceAnalyzer.getStatus(),
      audioContextState: this.audioContext?.state || 'not-initialized'
    };
  }

  /**
   * Reset audio processor
   */
  reset() {
    try {
      this.stopProcessing();
      this.audioBuffer = [];
      this.voiceAnalyzer.reset();
      this.lastProcessTime = 0;
      
      console.log('🔄 Audio Processor reset');
      
    } catch (error) {
      console.error('Audio processor reset error:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    try {
      this.stopProcessing();
      this.callbacks = {};
      
      console.log('🧹 Audio Processor cleanup completed');
      
    } catch (error) {
      console.error('Audio processor cleanup error:', error);
    }
  }
}

export default AudioProcessor;