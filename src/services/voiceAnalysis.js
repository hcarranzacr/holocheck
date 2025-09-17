// Real Voice Analysis Service
// Analyzes audio for health indicators including stress, respiratory patterns, and vocal biomarkers

export class VoiceAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.audioContext = null;
    this.analyzer = null;
    this.microphone = null;
    this.processor = null;
    this.isRecording = false;
    
    // Analysis parameters
    this.sampleRate = 44100;
    this.fftSize = 2048;
    this.bufferLength = 1024;
    
    // Audio data buffers
    this.audioBuffer = [];
    this.frequencyData = new Uint8Array(this.bufferLength);
    this.timeData = new Uint8Array(this.bufferLength);
    
    // Analysis results
    this.fundamentalFrequency = 0;
    this.voiceStress = 0;
    this.respiratoryRate = 0;
    this.voiceQuality = 0;
    
    // Processing state
    this.frameCount = 0;
    this.startTime = null;
    this.analysisHistory = [];
  }

  // Initialize voice analysis system
  async initialize(audioStream) {
    try {
      console.log('[VoiceAnalysis] Initializing voice analysis system...');
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyzer node
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = this.fftSize;
      this.analyzer.smoothingTimeConstant = 0.3;
      
      // Create microphone source
      this.microphone = this.audioContext.createMediaStreamSource(audioStream);
      
      // Create script processor for real-time analysis
      this.processor = this.audioContext.createScriptProcessor(this.bufferLength, 1, 1);
      
      // Connect audio nodes
      this.microphone.connect(this.analyzer);
      this.analyzer.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      // Set up real-time processing
      this.processor.onaudioprocess = (event) => {
        this.processAudioFrame(event);
      };
      
      this.isInitialized = true;
      console.log('[VoiceAnalysis] System initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[VoiceAnalysis] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Start voice recording and analysis
  startRecording() {
    if (!this.isInitialized) {
      console.error('[VoiceAnalysis] System not initialized');
      return false;
    }
    
    try {
      this.isRecording = true;
      this.startTime = Date.now();
      this.frameCount = 0;
      this.audioBuffer = [];
      this.analysisHistory = [];
      
      console.log('[VoiceAnalysis] Recording started');
      return true;
    } catch (error) {
      console.error('[VoiceAnalysis] Failed to start recording:', error);
      return false;
    }
  }

  // Stop voice recording
  stopRecording() {
    this.isRecording = false;
    console.log('[VoiceAnalysis] Recording stopped');
    
    // Perform final analysis
    return this.getFinalAnalysis();
  }

  // Process audio frame in real-time
  processAudioFrame(event) {
    if (!this.isRecording) return;
    
    try {
      // Get frequency and time domain data
      this.analyzer.getByteFrequencyData(this.frequencyData);
      this.analyzer.getByteTimeDomainData(this.timeData);
      
      // Store audio data
      const inputBuffer = event.inputBuffer.getChannelData(0);
      this.audioBuffer.push(...inputBuffer);
      
      // Perform real-time analysis every 10 frames
      if (this.frameCount % 10 === 0) {
        this.performRealTimeAnalysis();
      }
      
      this.frameCount++;
    } catch (error) {
      console.error('[VoiceAnalysis] Frame processing error:', error);
    }
  }

  // Perform real-time voice analysis
  performRealTimeAnalysis() {
    try {
      // Analyze fundamental frequency (pitch)
      const f0 = this.calculateFundamentalFrequency();
      
      // Analyze voice stress indicators
      const stress = this.calculateVoiceStress();
      
      // Analyze respiratory patterns
      const respiratory = this.calculateRespiratoryRate();
      
      // Calculate voice quality metrics
      const quality = this.calculateVoiceQuality();
      
      // Update current values
      this.fundamentalFrequency = f0;
      this.voiceStress = stress;
      this.respiratoryRate = respiratory;
      this.voiceQuality = quality;
      
      // Store in history
      this.analysisHistory.push({
        timestamp: Date.now(),
        f0,
        stress,
        respiratory,
        quality,
        amplitude: this.calculateAmplitude()
      });
      
      // Keep history manageable
      if (this.analysisHistory.length > 100) {
        this.analysisHistory.shift();
      }
      
    } catch (error) {
      console.error('[VoiceAnalysis] Real-time analysis error:', error);
    }
  }

  // Calculate fundamental frequency (F0)
  calculateFundamentalFrequency() {
    try {
      // Find the dominant frequency in the voice range (80-300 Hz)
      const voiceRangeStart = Math.floor(80 * this.fftSize / this.sampleRate);
      const voiceRangeEnd = Math.floor(300 * this.fftSize / this.sampleRate);
      
      let maxAmplitude = 0;
      let dominantFreqIndex = 0;
      
      for (let i = voiceRangeStart; i < voiceRangeEnd && i < this.frequencyData.length; i++) {
        if (this.frequencyData[i] > maxAmplitude) {
          maxAmplitude = this.frequencyData[i];
          dominantFreqIndex = i;
        }
      }
      
      // Convert index to frequency
      const frequency = dominantFreqIndex * this.sampleRate / this.fftSize;
      
      return frequency > 80 && frequency < 300 ? frequency : 0;
    } catch (error) {
      console.error('[VoiceAnalysis] F0 calculation error:', error);
      return 0;
    }
  }

  // Calculate voice stress indicators
  calculateVoiceStress() {
    try {
      // Analyze high-frequency content (stress typically increases HF energy)
      const highFreqStart = Math.floor(1000 * this.fftSize / this.sampleRate);
      const highFreqEnd = Math.floor(4000 * this.fftSize / this.sampleRate);
      
      let highFreqEnergy = 0;
      let totalEnergy = 0;
      
      for (let i = 0; i < this.frequencyData.length; i++) {
        const energy = this.frequencyData[i] * this.frequencyData[i];
        totalEnergy += energy;
        
        if (i >= highFreqStart && i < highFreqEnd) {
          highFreqEnergy += energy;
        }
      }
      
      // Calculate stress ratio
      const stressRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
      
      // Analyze jitter (frequency variation)
      const jitter = this.calculateJitter();
      
      // Combine metrics for stress score (0-100)
      const stressScore = Math.min(100, (stressRatio * 50) + (jitter * 50));
      
      return stressScore;
    } catch (error) {
      console.error('[VoiceAnalysis] Stress calculation error:', error);
      return 0;
    }
  }

  // Calculate jitter (frequency instability)
  calculateJitter() {
    if (this.analysisHistory.length < 5) return 0;
    
    try {
      // Get recent F0 values
      const recentF0 = this.analysisHistory.slice(-5).map(h => h.f0).filter(f => f > 0);
      
      if (recentF0.length < 3) return 0;
      
      // Calculate F0 variation
      const mean = recentF0.reduce((sum, f) => sum + f, 0) / recentF0.length;
      const variance = recentF0.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / recentF0.length;
      const jitter = Math.sqrt(variance) / mean;
      
      return Math.min(1, jitter * 10); // Normalize to 0-1
    } catch (error) {
      console.error('[VoiceAnalysis] Jitter calculation error:', error);
      return 0;
    }
  }

  // Calculate respiratory rate from voice patterns
  calculateRespiratoryRate() {
    try {
      if (this.analysisHistory.length < 20) return 0;
      
      // Analyze amplitude variations that correspond to breathing
      const amplitudes = this.analysisHistory.slice(-20).map(h => h.amplitude);
      
      // Find breathing cycles (low-frequency amplitude modulation)
      const breathingCycles = this.findBreathingCycles(amplitudes);
      
      // Convert to breaths per minute
      const timeSpan = 20 * 0.1; // 20 frames * 0.1 seconds per frame
      const respiratoryRate = (breathingCycles / timeSpan) * 60;
      
      return Math.max(0, Math.min(40, respiratoryRate)); // Normal range: 12-20 bpm
    } catch (error) {
      console.error('[VoiceAnalysis] Respiratory rate calculation error:', error);
      return 0;
    }
  }

  // Find breathing cycles in amplitude data
  findBreathingCycles(amplitudes) {
    let cycles = 0;
    let lastPeak = -1;
    const minCycleDistance = 3; // Minimum frames between breathing cycles
    
    for (let i = 1; i < amplitudes.length - 1; i++) {
      // Find local maxima
      if (amplitudes[i] > amplitudes[i-1] && amplitudes[i] > amplitudes[i+1]) {
        if (lastPeak === -1 || i - lastPeak >= minCycleDistance) {
          cycles++;
          lastPeak = i;
        }
      }
    }
    
    return cycles;
  }

  // Calculate voice quality metrics
  calculateVoiceQuality() {
    try {
      // Analyze harmonic-to-noise ratio
      const hnr = this.calculateHNR();
      
      // Analyze spectral centroid (brightness)
      const spectralCentroid = this.calculateSpectralCentroid();
      
      // Combine metrics for overall quality score
      const qualityScore = (hnr * 0.7) + (spectralCentroid * 0.3);
      
      return Math.max(0, Math.min(100, qualityScore));
    } catch (error) {
      console.error('[VoiceAnalysis] Quality calculation error:', error);
      return 0;
    }
  }

  // Calculate Harmonic-to-Noise Ratio
  calculateHNR() {
    try {
      // Simple HNR estimation based on spectral peaks
      let harmonicEnergy = 0;
      let noiseEnergy = 0;
      
      for (let i = 1; i < this.frequencyData.length; i++) {
        const current = this.frequencyData[i];
        const prev = this.frequencyData[i-1];
        
        // Peaks indicate harmonic content
        if (current > prev && current > this.frequencyData[Math.min(i+1, this.frequencyData.length-1)]) {
          harmonicEnergy += current * current;
        } else {
          noiseEnergy += current * current;
        }
      }
      
      const hnr = harmonicEnergy / (noiseEnergy + 1);
      return Math.min(100, hnr * 10);
    } catch (error) {
      console.error('[VoiceAnalysis] HNR calculation error:', error);
      return 0;
    }
  }

  // Calculate spectral centroid
  calculateSpectralCentroid() {
    try {
      let weightedSum = 0;
      let magnitudeSum = 0;
      
      for (let i = 0; i < this.frequencyData.length; i++) {
        const frequency = i * this.sampleRate / this.fftSize;
        const magnitude = this.frequencyData[i];
        
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }
      
      const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
      
      // Normalize to 0-100 scale
      return Math.min(100, centroid / 50);
    } catch (error) {
      console.error('[VoiceAnalysis] Spectral centroid calculation error:', error);
      return 0;
    }
  }

  // Calculate current amplitude
  calculateAmplitude() {
    try {
      let sum = 0;
      for (let i = 0; i < this.timeData.length; i++) {
        const sample = (this.timeData[i] - 128) / 128; // Convert to -1 to 1 range
        sum += sample * sample;
      }
      return Math.sqrt(sum / this.timeData.length);
    } catch (error) {
      console.error('[VoiceAnalysis] Amplitude calculation error:', error);
      return 0;
    }
  }

  // Get current real-time analysis results
  getCurrentAnalysis() {
    return {
      fundamentalFrequency: Math.round(this.fundamentalFrequency * 10) / 10,
      voiceStress: Math.round(this.voiceStress),
      respiratoryRate: Math.round(this.respiratoryRate * 10) / 10,
      voiceQuality: Math.round(this.voiceQuality),
      amplitude: Math.round(this.calculateAmplitude() * 100),
      isRecording: this.isRecording,
      duration: this.startTime ? (Date.now() - this.startTime) / 1000 : 0
    };
  }

  // Get final analysis after recording stops
  getFinalAnalysis() {
    if (this.analysisHistory.length === 0) {
      return {
        success: false,
        error: 'No analysis data available'
      };
    }
    
    try {
      // Calculate averages and trends
      const avgF0 = this.analysisHistory.reduce((sum, h) => sum + h.f0, 0) / this.analysisHistory.length;
      const avgStress = this.analysisHistory.reduce((sum, h) => sum + h.stress, 0) / this.analysisHistory.length;
      const avgRespiratory = this.analysisHistory.reduce((sum, h) => sum + h.respiratory, 0) / this.analysisHistory.length;
      const avgQuality = this.analysisHistory.reduce((sum, h) => sum + h.quality, 0) / this.analysisHistory.length;
      
      // Calculate variability metrics
      const f0Variability = this.calculateVariability(this.analysisHistory.map(h => h.f0));
      const stressVariability = this.calculateVariability(this.analysisHistory.map(h => h.stress));
      
      return {
        success: true,
        duration: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
        averages: {
          fundamentalFrequency: Math.round(avgF0 * 10) / 10,
          voiceStress: Math.round(avgStress),
          respiratoryRate: Math.round(avgRespiratory * 10) / 10,
          voiceQuality: Math.round(avgQuality)
        },
        variability: {
          pitchStability: Math.round((1 - f0Variability) * 100),
          stressConsistency: Math.round((1 - stressVariability) * 100)
        },
        dataPoints: this.analysisHistory.length,
        recommendations: this.generateRecommendations(avgStress, avgQuality, f0Variability)
      };
    } catch (error) {
      console.error('[VoiceAnalysis] Final analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate variability metric
  calculateVariability(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0;
  }

  // Generate health recommendations based on voice analysis
  generateRecommendations(stress, quality, variability) {
    const recommendations = [];
    
    if (stress > 70) {
      recommendations.push('Niveles de estrés vocal elevados - considera técnicas de relajación');
    }
    
    if (quality < 50) {
      recommendations.push('Calidad vocal baja - mantente hidratado y evita forzar la voz');
    }
    
    if (variability > 0.3) {
      recommendations.push('Inestabilidad vocal detectada - consulta con un especialista si persiste');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Parámetros vocales dentro del rango normal');
    }
    
    return recommendations;
  }

  // Clean up resources
  cleanup() {
    try {
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
      
      if (this.analyzer) {
        this.analyzer.disconnect();
        this.analyzer = null;
      }
      
      if (this.microphone) {
        this.microphone.disconnect();
        this.microphone = null;
      }
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      this.isInitialized = false;
      this.isRecording = false;
      
      console.log('[VoiceAnalysis] Cleanup completed');
    } catch (error) {
      console.error('[VoiceAnalysis] Cleanup error:', error);
    }
  }

  // Reset analysis state
  reset() {
    this.audioBuffer = [];
    this.analysisHistory = [];
    this.frameCount = 0;
    this.startTime = null;
    this.fundamentalFrequency = 0;
    this.voiceStress = 0;
    this.respiratoryRate = 0;
    this.voiceQuality = 0;
    
    console.log('[VoiceAnalysis] Analysis state reset');
  }
}

// Create singleton instance
export const voiceAnalysis = new VoiceAnalysisService();

export default voiceAnalysis;