/**
 * Voice Analysis Engine for Biometric Assessment
 * Extracts 12+ voice biomarkers for stress, emotion, and respiratory analysis
 * Implements real-time audio processing and feature extraction
 */

export class VoiceAnalysisEngine {
  constructor() {
    this.isInitialized = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.sampleRate = 44100;
    
    // Voice analysis parameters
    this.frameSize = 2048;
    this.hopSize = 512;
    this.windowFunction = 'hamming';
    
    // Feature buffers
    this.f0Buffer = []; // Fundamental frequency
    this.intensityBuffer = [];
    this.spectralBuffer = [];
    this.mfccBuffer = [];
    
    // Analysis results
    this.voiceMetrics = {
      fundamentalFrequency: 0,
      jitter: 0,
      shimmer: 0,
      harmonicToNoiseRatio: 0,
      spectralCentroid: 0,
      spectralBandwidth: 0,
      spectralRolloff: 0,
      zeroCrossingRate: 0,
      mfccCoefficients: [],
      voicedFrameRatio: 0,
      speechRate: 0,
      pauseDuration: 0
    };
    
    this.emotionalState = {
      stress: 0,
      arousal: 0,
      valence: 0,
      confidence: 0
    };
    
    this.respiratoryMetrics = {
      breathingRate: 0,
      breathDepth: 0,
      breathingPattern: 'normal',
      irregularity: 0
    };
    
    this.bufferSize = 300; // 10 seconds of features at ~30fps
    this.lastAnalysisTime = 0;
    this.analysisInterval = 1000; // Analyze every 1 second
  }

  /**
   * Initialize voice analysis engine
   */
  async initialize() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate
        } 
      });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.sampleRate
      });
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.frameSize;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      // Initialize data arrays
      this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
      this.timeDataArray = new Float32Array(this.analyser.fftSize);
      
      this.isInitialized = true;
      console.log('✅ Voice analysis engine initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize voice analysis:', error);
      return false;
    }
  }

  /**
   * Process audio frame and extract voice features
   */
  processAudioFrame() {
    if (!this.isInitialized || !this.analyser) return null;

    try {
      // Get frequency domain data
      this.analyser.getFloatFrequencyData(this.dataArray);
      
      // Get time domain data
      this.analyser.getFloatTimeDomainData(this.timeDataArray);
      
      // Extract voice features
      const features = this.extractVoiceFeatures(this.timeDataArray, this.dataArray);
      
      if (features) {
        // Update feature buffers
        this.updateFeatureBuffers(features);
        
        // Analyze if we have enough data
        if (this.f0Buffer.length >= 30) { // 1 second of data
          return this.analyzeVoiceMetrics();
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Audio frame processing error:', error);
      return null;
    }
  }

  /**
   * Extract comprehensive voice features from audio data
   */
  extractVoiceFeatures(timeData, freqData) {
    try {
      // Fundamental frequency (F0) estimation using autocorrelation
      const f0 = this.estimateFundamentalFrequency(timeData);
      
      // Intensity (RMS energy)
      const intensity = this.calculateRMSEnergy(timeData);
      
      // Spectral features
      const spectralFeatures = this.extractSpectralFeatures(freqData);
      
      // MFCC coefficients
      const mfccCoeffs = this.calculateMFCC(freqData);
      
      // Voice activity detection
      const isVoiced = this.detectVoiceActivity(timeData, f0, intensity);
      
      return {
        f0: f0,
        intensity: intensity,
        spectralCentroid: spectralFeatures.centroid,
        spectralBandwidth: spectralFeatures.bandwidth,
        spectralRolloff: spectralFeatures.rolloff,
        zeroCrossingRate: this.calculateZeroCrossingRate(timeData),
        mfcc: mfccCoeffs,
        isVoiced: isVoiced,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('❌ Feature extraction error:', error);
      return null;
    }
  }

  /**
   * Estimate fundamental frequency using autocorrelation
   */
  estimateFundamentalFrequency(timeData) {
    const minF0 = 50;  // 50 Hz minimum
    const maxF0 = 500; // 500 Hz maximum
    
    const minPeriod = Math.floor(this.sampleRate / maxF0);
    const maxPeriod = Math.floor(this.sampleRate / minF0);
    
    // Calculate autocorrelation
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = 0; i < timeData.length - period; i++) {
        correlation += timeData[i] * timeData[i + period];
        count++;
      }
      
      if (count > 0) {
        correlation /= count;
        
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }
    
    return bestPeriod > 0 ? this.sampleRate / bestPeriod : 0;
  }

  /**
   * Calculate RMS energy (intensity)
   */
  calculateRMSEnergy(timeData) {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  }

  /**
   * Extract spectral features from frequency domain data
   */
  extractSpectralFeatures(freqData) {
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / freqData.length;
    
    // Convert to linear magnitude
    const magnitude = freqData.map(db => Math.pow(10, db / 20));
    
    // Calculate spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < magnitude.length; i++) {
      const freq = i * binWidth;
      weightedSum += freq * magnitude[i];
      magnitudeSum += magnitude[i];
    }
    
    const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    // Calculate spectral bandwidth
    let varianceSum = 0;
    for (let i = 0; i < magnitude.length; i++) {
      const freq = i * binWidth;
      varianceSum += Math.pow(freq - centroid, 2) * magnitude[i];
    }
    
    const bandwidth = magnitudeSum > 0 ? Math.sqrt(varianceSum / magnitudeSum) : 0;
    
    // Calculate spectral rolloff (95% of energy)
    const totalEnergy = magnitude.reduce((sum, mag) => sum + mag * mag, 0);
    const rolloffThreshold = 0.95 * totalEnergy;
    
    let cumulativeEnergy = 0;
    let rolloff = 0;
    
    for (let i = 0; i < magnitude.length; i++) {
      cumulativeEnergy += magnitude[i] * magnitude[i];
      if (cumulativeEnergy >= rolloffThreshold) {
        rolloff = i * binWidth;
        break;
      }
    }
    
    return {
      centroid: centroid,
      bandwidth: bandwidth,
      rolloff: rolloff
    };
  }

  /**
   * Calculate MFCC coefficients
   */
  calculateMFCC(freqData, numCoeffs = 13) {
    // Simplified MFCC calculation
    const melFilters = this.createMelFilterBank(freqData.length, numCoeffs);
    const mfcc = [];
    
    // Convert to linear magnitude
    const magnitude = freqData.map(db => Math.max(Math.pow(10, db / 20), 1e-10));
    
    // Apply mel filter bank
    for (let i = 0; i < numCoeffs; i++) {
      let filterOutput = 0;
      for (let j = 0; j < magnitude.length; j++) {
        filterOutput += magnitude[j] * melFilters[i][j];
      }
      
      // Log and DCT
      mfcc.push(Math.log(filterOutput + 1e-10));
    }
    
    // Apply DCT (simplified)
    const dctCoeffs = [];
    for (let i = 0; i < numCoeffs; i++) {
      let sum = 0;
      for (let j = 0; j < mfcc.length; j++) {
        sum += mfcc[j] * Math.cos((Math.PI * i * (j + 0.5)) / mfcc.length);
      }
      dctCoeffs.push(sum);
    }
    
    return dctCoeffs;
  }

  /**
   * Create mel filter bank
   */
  createMelFilterBank(fftSize, numFilters) {
    const melFilters = [];
    const nyquist = this.sampleRate / 2;
    
    // Mel scale conversion
    const melMax = 2595 * Math.log10(1 + nyquist / 700);
    const melPoints = [];
    
    for (let i = 0; i <= numFilters + 1; i++) {
      const mel = (i * melMax) / (numFilters + 1);
      const freq = 700 * (Math.pow(10, mel / 2595) - 1);
      melPoints.push(Math.floor((fftSize * freq) / nyquist));
    }
    
    // Create triangular filters
    for (let i = 1; i <= numFilters; i++) {
      const filter = new Array(fftSize).fill(0);
      
      const left = melPoints[i - 1];
      const center = melPoints[i];
      const right = melPoints[i + 1];
      
      // Left slope
      for (let j = left; j < center; j++) {
        filter[j] = (j - left) / (center - left);
      }
      
      // Right slope
      for (let j = center; j < right; j++) {
        filter[j] = (right - j) / (right - center);
      }
      
      melFilters.push(filter);
    }
    
    return melFilters;
  }

  /**
   * Calculate zero crossing rate
   */
  calculateZeroCrossingRate(timeData) {
    let crossings = 0;
    
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] >= 0) !== (timeData[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / timeData.length;
  }

  /**
   * Detect voice activity
   */
  detectVoiceActivity(timeData, f0, intensity) {
    const intensityThreshold = 0.01;
    const f0Threshold = 50;
    const zcr = this.calculateZeroCrossingRate(timeData);
    const zcrThreshold = 0.3;
    
    return intensity > intensityThreshold && 
           f0 > f0Threshold && 
           zcr < zcrThreshold;
  }

  /**
   * Update feature buffers
   */
  updateFeatureBuffers(features) {
    // Add new features
    this.f0Buffer.push(features.f0);
    this.intensityBuffer.push(features.intensity);
    this.spectralBuffer.push({
      centroid: features.spectralCentroid,
      bandwidth: features.spectralBandwidth,
      rolloff: features.spectralRolloff,
      zcr: features.zeroCrossingRate
    });
    this.mfccBuffer.push(features.mfcc);
    
    // Maintain buffer size
    if (this.f0Buffer.length > this.bufferSize) {
      this.f0Buffer.shift();
      this.intensityBuffer.shift();
      this.spectralBuffer.shift();
      this.mfccBuffer.shift();
    }
  }

  /**
   * Analyze voice metrics from buffered features
   */
  analyzeVoiceMetrics() {
    try {
      // Calculate jitter (F0 variability)
      const jitter = this.calculateJitter(this.f0Buffer);
      
      // Calculate shimmer (amplitude variability)
      const shimmer = this.calculateShimmer(this.intensityBuffer);
      
      // Calculate harmonic-to-noise ratio
      const hnr = this.calculateHNR(this.f0Buffer, this.intensityBuffer);
      
      // Calculate average spectral features
      const avgSpectral = this.calculateAverageSpectralFeatures();
      
      // Calculate voice metrics
      const voicedFrames = this.f0Buffer.filter(f0 => f0 > 50).length;
      const voicedRatio = voicedFrames / this.f0Buffer.length;
      
      // Update voice metrics
      this.voiceMetrics = {
        fundamentalFrequency: this.calculateMean(this.f0Buffer.filter(f0 => f0 > 50)),
        jitter: jitter,
        shimmer: shimmer,
        harmonicToNoiseRatio: hnr,
        spectralCentroid: avgSpectral.centroid,
        spectralBandwidth: avgSpectral.bandwidth,
        spectralRolloff: avgSpectral.rolloff,
        zeroCrossingRate: avgSpectral.zcr,
        mfccCoefficients: this.calculateAverageMFCC(),
        voicedFrameRatio: voicedRatio,
        speechRate: this.calculateSpeechRate(),
        pauseDuration: this.calculatePauseDuration()
      };
      
      // Analyze emotional state
      this.analyzeEmotionalState();
      
      // Analyze respiratory patterns
      this.analyzeRespiratoryPatterns();
      
      return {
        timestamp: Date.now(),
        voiceMetrics: this.voiceMetrics,
        emotionalState: this.emotionalState,
        respiratoryMetrics: this.respiratoryMetrics
      };
      
    } catch (error) {
      console.error('❌ Voice metrics analysis error:', error);
      return null;
    }
  }

  /**
   * Calculate jitter (F0 variability)
   */
  calculateJitter(f0Buffer) {
    const validF0 = f0Buffer.filter(f0 => f0 > 50);
    if (validF0.length < 3) return 0;
    
    let jitterSum = 0;
    for (let i = 1; i < validF0.length; i++) {
      jitterSum += Math.abs(validF0[i] - validF0[i - 1]);
    }
    
    const meanF0 = this.calculateMean(validF0);
    return meanF0 > 0 ? (jitterSum / (validF0.length - 1)) / meanF0 : 0;
  }

  /**
   * Calculate shimmer (amplitude variability)
   */
  calculateShimmer(intensityBuffer) {
    if (intensityBuffer.length < 3) return 0;
    
    let shimmerSum = 0;
    for (let i = 1; i < intensityBuffer.length; i++) {
      if (intensityBuffer[i] > 0 && intensityBuffer[i - 1] > 0) {
        shimmerSum += Math.abs(Math.log(intensityBuffer[i] / intensityBuffer[i - 1]));
      }
    }
    
    return shimmerSum / (intensityBuffer.length - 1);
  }

  /**
   * Calculate harmonic-to-noise ratio
   */
  calculateHNR(f0Buffer, intensityBuffer) {
    const validF0 = f0Buffer.filter(f0 => f0 > 50);
    const validIntensity = intensityBuffer.filter(intensity => intensity > 0.001);
    
    if (validF0.length === 0 || validIntensity.length === 0) return 0;
    
    const harmonicPower = this.calculateMean(validIntensity);
    const noisePower = this.calculateStandardDeviation(validIntensity);
    
    return noisePower > 0 ? 20 * Math.log10(harmonicPower / noisePower) : 0;
  }

  /**
   * Calculate average spectral features
   */
  calculateAverageSpectralFeatures() {
    if (this.spectralBuffer.length === 0) {
      return { centroid: 0, bandwidth: 0, rolloff: 0, zcr: 0 };
    }
    
    return {
      centroid: this.calculateMean(this.spectralBuffer.map(s => s.centroid)),
      bandwidth: this.calculateMean(this.spectralBuffer.map(s => s.bandwidth)),
      rolloff: this.calculateMean(this.spectralBuffer.map(s => s.rolloff)),
      zcr: this.calculateMean(this.spectralBuffer.map(s => s.zcr))
    };
  }

  /**
   * Calculate average MFCC coefficients
   */
  calculateAverageMFCC() {
    if (this.mfccBuffer.length === 0) return [];
    
    const numCoeffs = this.mfccBuffer[0].length;
    const avgMFCC = [];
    
    for (let i = 0; i < numCoeffs; i++) {
      const coeffValues = this.mfccBuffer.map(mfcc => mfcc[i]);
      avgMFCC.push(this.calculateMean(coeffValues));
    }
    
    return avgMFCC;
  }

  /**
   * Calculate speech rate
   */
  calculateSpeechRate() {
    const voicedFrames = this.f0Buffer.filter(f0 => f0 > 50).length;
    const timeSpan = this.f0Buffer.length / 30; // Assuming ~30fps
    
    return timeSpan > 0 ? voicedFrames / timeSpan : 0;
  }

  /**
   * Calculate pause duration
   */
  calculatePauseDuration() {
    let pauseFrames = 0;
    let inPause = false;
    
    for (const f0 of this.f0Buffer) {
      if (f0 <= 50) {
        if (!inPause) {
          inPause = true;
        }
        pauseFrames++;
      } else {
        inPause = false;
      }
    }
    
    return pauseFrames / 30; // Convert to seconds
  }

  /**
   * Analyze emotional state from voice features
   */
  analyzeEmotionalState() {
    // Stress indicators
    const highF0Variance = this.calculateStandardDeviation(this.f0Buffer) > 20;
    const highJitter = this.voiceMetrics.jitter > 0.01;
    const highShimmer = this.voiceMetrics.shimmer > 0.1;
    const highSpectralCentroid = this.voiceMetrics.spectralCentroid > 2000;
    
    let stressScore = 0;
    if (highF0Variance) stressScore += 0.25;
    if (highJitter) stressScore += 0.25;
    if (highShimmer) stressScore += 0.25;
    if (highSpectralCentroid) stressScore += 0.25;
    
    // Arousal (activation level)
    const avgF0 = this.voiceMetrics.fundamentalFrequency;
    const avgIntensity = this.calculateMean(this.intensityBuffer);
    const speechRate = this.voiceMetrics.speechRate;
    
    let arousalScore = 0;
    if (avgF0 > 150) arousalScore += 0.33;
    if (avgIntensity > 0.1) arousalScore += 0.33;
    if (speechRate > 5) arousalScore += 0.34;
    
    // Valence (positive/negative emotion)
    const f0Range = Math.max(...this.f0Buffer) - Math.min(...this.f0Buffer);
    const voicedRatio = this.voiceMetrics.voicedFrameRatio;
    
    let valenceScore = 0.5; // Neutral baseline
    if (f0Range > 100) valenceScore += 0.2; // More expressive
    if (voicedRatio > 0.7) valenceScore += 0.2; // More voiced
    if (this.voiceMetrics.harmonicToNoiseRatio > 10) valenceScore += 0.1; // Clearer voice
    
    // Confidence based on signal quality
    const confidence = Math.min(1, this.voiceMetrics.voicedFrameRatio * 
                                   (this.voiceMetrics.harmonicToNoiseRatio / 20));
    
    this.emotionalState = {
      stress: Math.min(1, stressScore),
      arousal: Math.min(1, arousalScore),
      valence: Math.min(1, Math.max(0, valenceScore)),
      confidence: confidence
    };
  }

  /**
   * Analyze respiratory patterns from voice
   */
  analyzeRespiratoryPatterns() {
    // Detect breathing from pause patterns and intensity variations
    const pauseIndices = [];
    const intensityVariations = [];
    
    // Find pause segments
    for (let i = 0; i < this.f0Buffer.length; i++) {
      if (this.f0Buffer[i] <= 50) {
        pauseIndices.push(i);
      }
    }
    
    // Analyze intensity variations (breathing depth)
    for (let i = 1; i < this.intensityBuffer.length; i++) {
      intensityVariations.push(Math.abs(this.intensityBuffer[i] - this.intensityBuffer[i - 1]));
    }
    
    // Estimate breathing rate from pause patterns
    const pauseGroups = this.groupConsecutiveIndices(pauseIndices);
    const breathingRate = pauseGroups.length > 0 ? (pauseGroups.length * 60) / (this.f0Buffer.length / 30) : 0;
    
    // Estimate breath depth from intensity variations
    const breathDepth = this.calculateMean(intensityVariations);
    
    // Analyze breathing pattern regularity
    const pauseDurations = pauseGroups.map(group => group.length);
    const breathingIrregularity = pauseDurations.length > 1 ? 
      this.calculateStandardDeviation(pauseDurations) / this.calculateMean(pauseDurations) : 0;
    
    // Classify breathing pattern
    let breathingPattern = 'normal';
    if (breathingRate > 20) breathingPattern = 'rapid';
    else if (breathingRate < 12) breathingPattern = 'slow';
    else if (breathingIrregularity > 0.3) breathingPattern = 'irregular';
    
    this.respiratoryMetrics = {
      breathingRate: Math.max(0, breathingRate),
      breathDepth: breathDepth,
      breathingPattern: breathingPattern,
      irregularity: breathingIrregularity
    };
  }

  /**
   * Group consecutive indices
   */
  groupConsecutiveIndices(indices) {
    if (indices.length === 0) return [];
    
    const groups = [];
    let currentGroup = [indices[0]];
    
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) {
        currentGroup.push(indices[i]);
      } else {
        if (currentGroup.length > 3) { // Minimum pause length
          groups.push(currentGroup);
        }
        currentGroup = [indices[i]];
      }
    }
    
    if (currentGroup.length > 3) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  /**
   * Calculate mean of array
   */
  calculateMean(array) {
    return array.length > 0 ? array.reduce((sum, val) => sum + val, 0) / array.length : 0;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(array) {
    if (array.length < 2) return 0;
    
    const mean = this.calculateMean(array);
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get comprehensive voice analysis
   */
  getVoiceAnalysis() {
    const currentTime = Date.now();
    
    // Only analyze if enough time has passed
    if (currentTime - this.lastAnalysisTime < this.analysisInterval) {
      return null;
    }
    
    this.lastAnalysisTime = currentTime;
    
    if (this.f0Buffer.length < 30) {
      return {
        status: 'insufficient_data',
        message: 'Collecting voice data...',
        progress: Math.round((this.f0Buffer.length / 30) * 100)
      };
    }
    
    const analysis = this.analyzeVoiceMetrics();
    
    if (!analysis) {
      return {
        status: 'analysis_failed',
        message: 'Voice analysis failed'
      };
    }
    
    return {
      status: 'success',
      timestamp: analysis.timestamp,
      voiceMetrics: analysis.voiceMetrics,
      emotionalState: analysis.emotionalState,
      respiratoryMetrics: analysis.respiratoryMetrics
    };
  }

  /**
   * Reset analysis state
   */
  reset() {
    this.f0Buffer = [];
    this.intensityBuffer = [];
    this.spectralBuffer = [];
    this.mfccBuffer = [];
    this.lastAnalysisTime = 0;
    
    this.voiceMetrics = {
      fundamentalFrequency: 0,
      jitter: 0,
      shimmer: 0,
      harmonicToNoiseRatio: 0,
      spectralCentroid: 0,
      spectralBandwidth: 0,
      spectralRolloff: 0,
      zeroCrossingRate: 0,
      mfccCoefficients: [],
      voicedFrameRatio: 0,
      speechRate: 0,
      pauseDuration: 0
    };
    
    console.log('🔄 Voice analysis reset');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.reset();
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.isInitialized = false;
    
    console.log('🧹 Voice analysis engine cleaned up');
  }
}

export default VoiceAnalysisEngine;