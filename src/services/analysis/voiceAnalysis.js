/**
 * Comprehensive Voice Analysis Module
 * Version: v1.1.15-VOICE-BIOMARKERS-COMPLETE
 * 
 * Complete implementation of voice biomarker extraction algorithms
 * including F0, Jitter, Shimmer, HNR, and advanced spectral analysis.
 */

class VoiceAnalysis {
  constructor() {
    this.sampleRate = 44100; // Standard audio sample rate
    this.frameSize = 2048;   // FFT frame size
    this.hopSize = 512;      // Hop size for overlapping analysis
    this.windowType = 'hamming';
    
    // Voice analysis parameters
    this.f0Range = { min: 50, max: 500 }; // Hz - covers male and female voices
    this.voiceThreshold = 0.1; // Minimum energy for voice activity
    
    // Buffers for temporal analysis
    this.audioBuffer = [];
    this.f0History = [];
    this.amplitudeHistory = [];
    
    console.log('🎤 Voice Analysis Module v1.1.15 initialized');
  }

  /**
   * Main voice analysis function - processes audio data and extracts all biomarkers
   */
  analyzeVoice(audioData, sampleRate = 44100) {
    try {
      this.sampleRate = sampleRate;
      
      // Validate input
      if (!audioData || audioData.length < this.frameSize) {
        return null;
      }
      
      // Convert to float array if needed
      const floatData = this.normalizeAudioData(audioData);
      
      // Check for voice activity
      const voiceActivity = this.detectVoiceActivity(floatData);
      if (!voiceActivity.hasVoice) {
        return null;
      }
      
      // Extract all voice biomarkers
      const biomarkers = {};
      
      // 1. Fundamental Frequency (F0)
      const f0Result = this.extractFundamentalFrequency(floatData);
      if (f0Result) {
        biomarkers.fundamentalFrequency = f0Result.f0;
        biomarkers.f0Confidence = f0Result.confidence;
      }
      
      // 2. Jitter (F0 variability)
      if (f0Result && f0Result.f0) {
        const jitter = this.calculateJitter(floatData, f0Result.f0);
        if (jitter !== null) {
          biomarkers.jitter = jitter;
        }
      }
      
      // 3. Shimmer (Amplitude variability)
      const shimmer = this.calculateShimmer(floatData);
      if (shimmer !== null) {
        biomarkers.shimmer = shimmer;
      }
      
      // 4. Harmonic-to-Noise Ratio (HNR)
      const hnr = this.calculateHNR(floatData, f0Result?.f0);
      if (hnr !== null) {
        biomarkers.harmonicToNoiseRatio = hnr;
      }
      
      // 5. Spectral features
      const spectralFeatures = this.extractSpectralFeatures(floatData);
      Object.assign(biomarkers, spectralFeatures);
      
      // 6. Voice quality metrics
      const qualityMetrics = this.calculateVoiceQuality(floatData, f0Result?.f0);
      Object.assign(biomarkers, qualityMetrics);
      
      // 7. Prosodic features
      const prosodicFeatures = this.extractProsodicFeatures(floatData);
      Object.assign(biomarkers, prosodicFeatures);
      
      return biomarkers;
      
    } catch (error) {
      console.error('Voice analysis error:', error);
      return null;
    }
  }

  /**
   * Normalize audio data to float array [-1, 1]
   */
  normalizeAudioData(audioData) {
    if (audioData instanceof Uint8Array) {
      // Convert from Uint8Array [0, 255] to float [-1, 1]
      return Array.from(audioData).map(val => (val - 128) / 128);
    } else if (audioData instanceof Float32Array || Array.isArray(audioData)) {
      // Ensure proper range [-1, 1]
      const maxVal = Math.max(...audioData.map(Math.abs));
      if (maxVal > 1) {
        return audioData.map(val => val / maxVal);
      }
      return Array.from(audioData);
    }
    return Array.from(audioData);
  }

  /**
   * Detect voice activity in audio signal
   */
  detectVoiceActivity(audioData) {
    try {
      // Calculate RMS energy
      const rms = this.calculateRMS(audioData);
      
      // Calculate zero-crossing rate
      const zcr = this.calculateZeroCrossingRate(audioData);
      
      // Voice activity detection thresholds
      const energyThreshold = 0.01;
      const zcrThreshold = 0.3;
      
      const hasVoice = rms > energyThreshold && zcr < zcrThreshold;
      
      return {
        hasVoice,
        energy: rms,
        zeroCrossingRate: zcr,
        confidence: hasVoice ? Math.min(1.0, rms / energyThreshold) : 0
      };
      
    } catch (error) {
      console.error('Voice activity detection error:', error);
      return { hasVoice: false, energy: 0, zeroCrossingRate: 0, confidence: 0 };
    }
  }

  /**
   * Extract fundamental frequency (F0) using autocorrelation method
   */
  extractFundamentalFrequency(audioData) {
    try {
      // Apply window function
      const windowedData = this.applyWindow(audioData, this.windowType);
      
      // Calculate autocorrelation
      const autocorr = this.autocorrelation(windowedData);
      
      // Find F0 using autocorrelation peak detection
      const minLag = Math.floor(this.sampleRate / this.f0Range.max);
      const maxLag = Math.floor(this.sampleRate / this.f0Range.min);
      
      let maxCorr = 0;
      let bestLag = minLag;
      
      for (let lag = minLag; lag <= Math.min(maxLag, autocorr.length - 1); lag++) {
        if (autocorr[lag] > maxCorr) {
          maxCorr = autocorr[lag];
          bestLag = lag;
        }
      }
      
      // Calculate F0 and confidence
      const f0 = this.sampleRate / bestLag;
      const confidence = maxCorr / autocorr[0]; // Normalized correlation
      
      // Validate F0 range and confidence
      if (f0 >= this.f0Range.min && f0 <= this.f0Range.max && confidence > 0.3) {
        // Add to history for temporal smoothing
        this.f0History.push(f0);
        if (this.f0History.length > 10) {
          this.f0History.shift();
        }
        
        // Apply temporal smoothing
        const smoothedF0 = this.temporalSmoothing(this.f0History);
        
        return {
          f0: Math.round(smoothedF0 * 10) / 10,
          confidence: Math.round(confidence * 100) / 100,
          rawF0: Math.round(f0 * 10) / 10
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('F0 extraction error:', error);
      return null;
    }
  }

  /**
   * Calculate Jitter (F0 variability)
   */
  calculateJitter(audioData, f0) {
    try {
      if (!f0 || f0 <= 0) return null;
      
      // Estimate period length
      const periodLength = Math.round(this.sampleRate / f0);
      
      if (periodLength >= audioData.length / 3) return null;
      
      // Extract periods
      const periods = [];
      for (let i = 0; i < audioData.length - periodLength * 2; i += periodLength) {
        const period = audioData.slice(i, i + periodLength);
        periods.push(period);
      }
      
      if (periods.length < 3) return null;
      
      // Calculate period lengths using cross-correlation
      const periodLengths = [];
      for (let i = 0; i < periods.length - 1; i++) {
        const correlation = this.crossCorrelation(periods[i], periods[i + 1]);
        const peakIndex = this.findPeak(correlation);
        if (peakIndex > 0) {
          periodLengths.push(peakIndex);
        }
      }
      
      if (periodLengths.length < 2) return null;
      
      // Calculate jitter as relative average perturbation
      const meanPeriod = periodLengths.reduce((sum, p) => sum + p, 0) / periodLengths.length;
      const absoluteJitter = periodLengths.reduce((sum, p) => sum + Math.abs(p - meanPeriod), 0) / periodLengths.length;
      
      const jitterPercent = (absoluteJitter / meanPeriod) * 100;
      
      return Math.round(jitterPercent * 100) / 100;
      
    } catch (error) {
      console.error('Jitter calculation error:', error);
      return null;
    }
  }

  /**
   * Calculate Shimmer (Amplitude variability)
   */
  calculateShimmer(audioData) {
    try {
      // Calculate local amplitude maxima
      const frameSize = Math.floor(this.sampleRate * 0.01); // 10ms frames
      const amplitudes = [];
      
      for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
        const frame = audioData.slice(i, i + frameSize);
        const amplitude = Math.max(...frame.map(Math.abs));
        amplitudes.push(amplitude);
      }
      
      if (amplitudes.length < 3) return null;
      
      // Add to history for temporal analysis
      this.amplitudeHistory.push(...amplitudes);
      if (this.amplitudeHistory.length > 50) {
        this.amplitudeHistory = this.amplitudeHistory.slice(-50);
      }
      
      // Calculate shimmer as relative average perturbation of amplitude
      const meanAmplitude = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
      
      if (meanAmplitude === 0) return null;
      
      const absoluteShimmer = amplitudes.reduce((sum, a) => sum + Math.abs(a - meanAmplitude), 0) / amplitudes.length;
      const shimmerPercent = (absoluteShimmer / meanAmplitude) * 100;
      
      return Math.round(shimmerPercent * 100) / 100;
      
    } catch (error) {
      console.error('Shimmer calculation error:', error);
      return null;
    }
  }

  /**
   * Calculate Harmonic-to-Noise Ratio (HNR)
   */
  calculateHNR(audioData, f0) {
    try {
      if (!f0 || f0 <= 0) {
        // Estimate HNR without F0 using spectral methods
        return this.estimateHNRSpectral(audioData);
      }
      
      // Calculate HNR using comb filtering method
      const periodLength = Math.round(this.sampleRate / f0);
      
      if (periodLength >= audioData.length / 2) return null;
      
      // Create harmonic comb filter
      const harmonicSignal = this.createHarmonicSignal(audioData, f0);
      const noiseSignal = audioData.map((val, i) => val - harmonicSignal[i]);
      
      // Calculate power of harmonic and noise components
      const harmonicPower = this.calculatePower(harmonicSignal);
      const noisePower = this.calculatePower(noiseSignal);
      
      if (noisePower === 0) return 30; // Very clean signal
      
      const hnr = 10 * Math.log10(harmonicPower / noisePower);
      
      return Math.round(hnr * 100) / 100;
      
    } catch (error) {
      console.error('HNR calculation error:', error);
      return null;
    }
  }

  /**
   * Extract spectral features
   */
  extractSpectralFeatures(audioData) {
    try {
      // Calculate FFT
      const spectrum = this.calculateFFT(audioData);
      const magnitude = spectrum.magnitude;
      
      // Spectral Centroid
      const spectralCentroid = this.calculateSpectralCentroid(magnitude);
      
      // Spectral Rolloff
      const spectralRolloff = this.calculateSpectralRolloff(magnitude, 0.85);
      
      // Spectral Flux
      const spectralFlux = this.calculateSpectralFlux(magnitude);
      
      // Mel-frequency Cepstral Coefficients (simplified)
      const mfcc = this.calculateMFCC(magnitude);
      
      return {
        spectralCentroid: Math.round(spectralCentroid),
        spectralRolloff: Math.round(spectralRolloff),
        spectralFlux: Math.round(spectralFlux * 1000) / 1000,
        mfccCoefficients: mfcc.slice(0, 5) // First 5 MFCC coefficients
      };
      
    } catch (error) {
      console.error('Spectral features extraction error:', error);
      return {};
    }
  }

  /**
   * Calculate voice quality metrics
   */
  calculateVoiceQuality(audioData, f0) {
    try {
      const features = {};
      
      // Voiced frame ratio
      const voicedRatio = this.calculateVoicedFrameRatio(audioData);
      if (voicedRatio !== null) {
        features.voicedFrameRatio = voicedRatio;
      }
      
      // Speech rate estimation
      const speechRate = this.estimateSpeechRate(audioData);
      if (speechRate !== null) {
        features.speechRate = speechRate;
      }
      
      // Vocal effort estimation
      const vocalEffort = this.estimateVocalEffort(audioData, f0);
      if (vocalEffort !== null) {
        features.vocalEffort = vocalEffort;
      }
      
      // Breathiness estimation
      const breathiness = this.estimateBreathiness(audioData);
      if (breathiness !== null) {
        features.breathiness = breathiness;
      }
      
      return features;
      
    } catch (error) {
      console.error('Voice quality calculation error:', error);
      return {};
    }
  }

  /**
   * Extract prosodic features
   */
  extractProsodicFeatures(audioData) {
    try {
      const features = {};
      
      // Vocal stress estimation
      const vocalStress = this.estimateVocalStress(audioData);
      if (vocalStress !== null) {
        features.vocalStress = vocalStress;
        features.stressLevel = vocalStress; // Alias for compatibility
      }
      
      // Emotional valence estimation
      const valence = this.estimateValence(audioData);
      if (valence !== null) {
        features.valence = valence;
      }
      
      // Arousal estimation
      const arousal = this.estimateArousal(audioData);
      if (arousal !== null) {
        features.arousal = arousal;
      }
      
      // Breathing pattern analysis
      const breathingPattern = this.analyzeBreathingPattern(audioData);
      if (breathingPattern) {
        features.breathingRate = breathingPattern.rate;
        features.breathingPattern = breathingPattern.pattern;
      }
      
      return features;
      
    } catch (error) {
      console.error('Prosodic features extraction error:', error);
      return {};
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Apply window function to audio data
   */
  applyWindow(data, windowType = 'hamming') {
    const N = data.length;
    const windowed = new Array(N);
    
    for (let n = 0; n < N; n++) {
      let window = 1;
      
      switch (windowType) {
        case 'hamming':
          window = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1));
          break;
        case 'hanning':
          window = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1));
          break;
        case 'blackman':
          window = 0.42 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1)) + 
                   0.08 * Math.cos(4 * Math.PI * n / (N - 1));
          break;
      }
      
      windowed[n] = data[n] * window;
    }
    
    return windowed;
  }

  /**
   * Calculate autocorrelation
   */
  autocorrelation(data) {
    const N = data.length;
    const result = new Array(N);
    
    for (let lag = 0; lag < N; lag++) {
      let sum = 0;
      for (let i = 0; i < N - lag; i++) {
        sum += data[i] * data[i + lag];
      }
      result[lag] = sum / (N - lag);
    }
    
    return result;
  }

  /**
   * Calculate cross-correlation
   */
  crossCorrelation(signal1, signal2) {
    const N = Math.min(signal1.length, signal2.length);
    const result = new Array(N);
    
    for (let lag = 0; lag < N; lag++) {
      let sum = 0;
      for (let i = 0; i < N - lag; i++) {
        sum += signal1[i] * signal2[i + lag];
      }
      result[lag] = sum / (N - lag);
    }
    
    return result;
  }

  /**
   * Calculate FFT (simplified implementation)
   */
  calculateFFT(data) {
    const N = data.length;
    const magnitude = new Array(Math.floor(N / 2));
    
    for (let k = 0; k < magnitude.length; k++) {
      let real = 0, imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += data[n] * Math.cos(angle);
        imag += data[n] * Math.sin(angle);
      }
      
      magnitude[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return { magnitude };
  }

  /**
   * Calculate spectral centroid
   */
  calculateSpectralCentroid(magnitude) {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < magnitude.length; i++) {
      const frequency = i * this.sampleRate / (2 * magnitude.length);
      weightedSum += frequency * magnitude[i];
      magnitudeSum += magnitude[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate spectral rolloff
   */
  calculateSpectralRolloff(magnitude, threshold = 0.85) {
    const totalEnergy = magnitude.reduce((sum, val) => sum + val, 0);
    const targetEnergy = totalEnergy * threshold;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < magnitude.length; i++) {
      cumulativeEnergy += magnitude[i];
      if (cumulativeEnergy >= targetEnergy) {
        return i * this.sampleRate / (2 * magnitude.length);
      }
    }
    
    return this.sampleRate / 2;
  }

  /**
   * Calculate RMS energy
   */
  calculateRMS(data) {
    const sum = data.reduce((acc, val) => acc + val * val, 0);
    return Math.sqrt(sum / data.length);
  }

  /**
   * Calculate zero-crossing rate
   */
  calculateZeroCrossingRate(data) {
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i-1] < 0) || (data[i] < 0 && data[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings / data.length;
  }

  /**
   * Calculate power of signal
   */
  calculatePower(data) {
    return data.reduce((sum, val) => sum + val * val, 0) / data.length;
  }

  /**
   * Find peak in array
   */
  findPeak(data) {
    let maxVal = data[0];
    let maxIdx = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] > maxVal) {
        maxVal = data[i];
        maxIdx = i;
      }
    }
    
    return maxIdx;
  }

  /**
   * Temporal smoothing using median filter
   */
  temporalSmoothing(values) {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  /**
   * Estimate HNR using spectral methods
   */
  estimateHNRSpectral(audioData) {
    try {
      const spectrum = this.calculateFFT(audioData);
      const magnitude = spectrum.magnitude;
      
      // Estimate harmonic peaks vs noise floor
      const peaks = this.findSpectralPeaks(magnitude);
      const noiseFloor = this.estimateNoiseFloor(magnitude, peaks);
      
      if (noiseFloor === 0) return 30;
      
      const avgPeakPower = peaks.reduce((sum, peak) => sum + magnitude[peak], 0) / peaks.length;
      const hnr = 10 * Math.log10(avgPeakPower / noiseFloor);
      
      return Math.max(0, Math.min(30, hnr));
      
    } catch (error) {
      console.error('Spectral HNR estimation error:', error);
      return null;
    }
  }

  /**
   * Create harmonic signal for HNR calculation
   */
  createHarmonicSignal(audioData, f0) {
    const N = audioData.length;
    const harmonicSignal = new Array(N).fill(0);
    const maxHarmonic = Math.floor(this.sampleRate / (2 * f0));
    
    for (let h = 1; h <= Math.min(maxHarmonic, 10); h++) {
      const freq = h * f0;
      const amplitude = 1 / h; // Decreasing amplitude for higher harmonics
      
      for (let n = 0; n < N; n++) {
        harmonicSignal[n] += amplitude * Math.sin(2 * Math.PI * freq * n / this.sampleRate);
      }
    }
    
    return harmonicSignal;
  }

  /**
   * Find spectral peaks
   */
  findSpectralPeaks(magnitude) {
    const peaks = [];
    const minPeakHeight = Math.max(...magnitude) * 0.1;
    
    for (let i = 1; i < magnitude.length - 1; i++) {
      if (magnitude[i] > magnitude[i-1] && 
          magnitude[i] > magnitude[i+1] && 
          magnitude[i] > minPeakHeight) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  /**
   * Estimate noise floor
   */
  estimateNoiseFloor(magnitude, peaks) {
    const peakSet = new Set(peaks);
    const noiseValues = magnitude.filter((_, i) => !peakSet.has(i));
    
    if (noiseValues.length === 0) return 0;
    
    return noiseValues.reduce((sum, val) => sum + val, 0) / noiseValues.length;
  }

  /**
   * Calculate voiced frame ratio
   */
  calculateVoicedFrameRatio(audioData) {
    try {
      const frameSize = Math.floor(this.sampleRate * 0.025); // 25ms frames
      const hopSize = Math.floor(frameSize / 2);
      let voicedFrames = 0;
      let totalFrames = 0;
      
      for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
        const frame = audioData.slice(i, i + frameSize);
        const energy = this.calculateRMS(frame);
        const zcr = this.calculateZeroCrossingRate(frame);
        
        // Simple voiced/unvoiced classification
        if (energy > 0.01 && zcr < 0.3) {
          voicedFrames++;
        }
        totalFrames++;
      }
      
      return totalFrames > 0 ? Math.round((voicedFrames / totalFrames) * 100 * 10) / 10 : null;
      
    } catch (error) {
      console.error('Voiced frame ratio calculation error:', error);
      return null;
    }
  }

  /**
   * Estimate speech rate
   */
  estimateSpeechRate(audioData) {
    try {
      // Simplified speech rate estimation based on energy envelope
      const frameSize = Math.floor(this.sampleRate * 0.01); // 10ms frames
      const energyEnvelope = [];
      
      for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
        const frame = audioData.slice(i, i + frameSize);
        energyEnvelope.push(this.calculateRMS(frame));
      }
      
      // Count syllables as energy peaks
      const syllableCount = this.countSyllables(energyEnvelope);
      const durationSeconds = audioData.length / this.sampleRate;
      
      return durationSeconds > 0 ? Math.round((syllableCount / durationSeconds) * 10) / 10 : null;
      
    } catch (error) {
      console.error('Speech rate estimation error:', error);
      return null;
    }
  }

  /**
   * Count syllables from energy envelope
   */
  countSyllables(energyEnvelope) {
    const threshold = Math.max(...energyEnvelope) * 0.3;
    let syllables = 0;
    let inSyllable = false;
    
    for (let i = 0; i < energyEnvelope.length; i++) {
      if (energyEnvelope[i] > threshold && !inSyllable) {
        syllables++;
        inSyllable = true;
      } else if (energyEnvelope[i] <= threshold) {
        inSyllable = false;
      }
    }
    
    return syllables;
  }

  /**
   * Estimate vocal stress
   */
  estimateVocalStress(audioData) {
    try {
      let stressScore = 0;
      
      // High frequency energy indicates tension
      const spectrum = this.calculateFFT(audioData);
      const highFreqEnergy = this.calculateHighFrequencyEnergy(spectrum.magnitude);
      if (highFreqEnergy > 0.3) stressScore += 25;
      
      // Spectral centroid shift
      const spectralCentroid = this.calculateSpectralCentroid(spectrum.magnitude);
      if (spectralCentroid > 2000) stressScore += 20;
      
      // Energy variability
      const energyVariability = this.calculateEnergyVariability(audioData);
      if (energyVariability > 0.5) stressScore += 15;
      
      // F0 variability (if available in history)
      if (this.f0History.length > 3) {
        const f0Variability = this.calculateVariability(this.f0History);
        if (f0Variability > 20) stressScore += 20;
      }
      
      return Math.min(100, Math.max(0, stressScore));
      
    } catch (error) {
      console.error('Vocal stress estimation error:', error);
      return null;
    }
  }

  /**
   * Calculate high frequency energy ratio
   */
  calculateHighFrequencyEnergy(magnitude) {
    const totalEnergy = magnitude.reduce((sum, val) => sum + val, 0);
    const highFreqStart = Math.floor(magnitude.length * 0.7);
    const highFreqEnergy = magnitude.slice(highFreqStart).reduce((sum, val) => sum + val, 0);
    
    return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
  }

  /**
   * Calculate energy variability
   */
  calculateEnergyVariability(audioData) {
    const frameSize = Math.floor(this.sampleRate * 0.025);
    const energies = [];
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      energies.push(this.calculateRMS(frame));
    }
    
    if (energies.length < 2) return 0;
    
    const mean = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / energies.length;
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }

  /**
   * Calculate variability of values
   */
  calculateVariability(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Estimate valence (emotional positivity)
   */
  estimateValence(audioData) {
    try {
      // Simplified valence estimation based on spectral features
      const spectrum = this.calculateFFT(audioData);
      const spectralCentroid = this.calculateSpectralCentroid(spectrum.magnitude);
      const spectralRolloff = this.calculateSpectralRolloff(spectrum.magnitude);
      
      // Higher spectral centroid and rolloff often indicate positive valence
      let valence = 50; // Neutral baseline
      
      if (spectralCentroid > 1500) valence += 20;
      if (spectralRolloff > 3000) valence += 15;
      
      // Energy consistency (stable energy indicates positive valence)
      const energyVariability = this.calculateEnergyVariability(audioData);
      if (energyVariability < 0.3) valence += 15;
      
      return Math.min(100, Math.max(0, valence));
      
    } catch (error) {
      console.error('Valence estimation error:', error);
      return null;
    }
  }

  /**
   * Estimate arousal (emotional activation)
   */
  estimateArousal(audioData) {
    try {
      let arousal = 50; // Neutral baseline
      
      // High energy indicates high arousal
      const rms = this.calculateRMS(audioData);
      if (rms > 0.1) arousal += 25;
      
      // High frequency content indicates arousal
      const spectrum = this.calculateFFT(audioData);
      const highFreqEnergy = this.calculateHighFrequencyEnergy(spectrum.magnitude);
      if (highFreqEnergy > 0.4) arousal += 20;
      
      // Speech rate affects arousal
      const speechRate = this.estimateSpeechRate(audioData);
      if (speechRate && speechRate > 5) arousal += 15;
      
      return Math.min(100, Math.max(0, arousal));
      
    } catch (error) {
      console.error('Arousal estimation error:', error);
      return null;
    }
  }

  /**
   * Analyze breathing pattern
   */
  analyzeBreathingPattern(audioData) {
    try {
      // Low-frequency analysis for breathing detection
      const frameSize = Math.floor(this.sampleRate * 0.1); // 100ms frames
      const energyEnvelope = [];
      
      for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
        const frame = audioData.slice(i, i + frameSize);
        energyEnvelope.push(this.calculateRMS(frame));
      }
      
      // Apply low-pass filter to isolate breathing
      const breathingSignal = this.lowPassFilter(energyEnvelope, 2); // 2 Hz cutoff
      
      // Count breathing cycles
      const breathingRate = this.countBreathingCycles(breathingSignal);
      
      // Classify breathing pattern
      const pattern = this.classifyBreathingPattern(breathingSignal);
      
      return {
        rate: breathingRate,
        pattern: pattern
      };
      
    } catch (error) {
      console.error('Breathing pattern analysis error:', error);
      return null;
    }
  }

  /**
   * Simple low-pass filter
   */
  lowPassFilter(signal, cutoffHz) {
    const alpha = cutoffHz / (cutoffHz + 10); // Simple RC filter approximation
    const filtered = [signal[0]];
    
    for (let i = 1; i < signal.length; i++) {
      filtered[i] = alpha * signal[i] + (1 - alpha) * filtered[i-1];
    }
    
    return filtered;
  }

  /**
   * Count breathing cycles
   */
  countBreathingCycles(breathingSignal) {
    const threshold = Math.max(...breathingSignal) * 0.5;
    let cycles = 0;
    let inBreath = false;
    
    for (let i = 0; i < breathingSignal.length; i++) {
      if (breathingSignal[i] > threshold && !inBreath) {
        cycles++;
        inBreath = true;
      } else if (breathingSignal[i] <= threshold) {
        inBreath = false;
      }
    }
    
    // Convert to breaths per minute
    const durationMinutes = breathingSignal.length * 0.1 / 60; // 100ms frames
    return durationMinutes > 0 ? Math.round(cycles / durationMinutes) : 0;
  }

  /**
   * Classify breathing pattern
   */
  classifyBreathingPattern(breathingSignal) {
    const variability = this.calculateVariability(breathingSignal);
    const mean = breathingSignal.reduce((sum, val) => sum + val, 0) / breathingSignal.length;
    
    if (variability / mean < 0.2) return 'Regular';
    if (variability / mean < 0.4) return 'Slightly Irregular';
    return 'Irregular';
  }

  /**
   * Calculate simplified MFCC coefficients
   */
  calculateMFCC(magnitude) {
    try {
      // Simplified MFCC calculation
      const melFilters = this.createMelFilterBank(magnitude.length);
      const melSpectrum = this.applyMelFilters(magnitude, melFilters);
      
      // Apply DCT to get cepstral coefficients
      const mfcc = this.discreteCosineTransform(melSpectrum.map(Math.log));
      
      return mfcc.slice(0, 13); // Return first 13 coefficients
      
    } catch (error) {
      console.error('MFCC calculation error:', error);
      return [];
    }
  }

  /**
   * Create mel filter bank (simplified)
   */
  createMelFilterBank(spectrumLength) {
    const numFilters = 26;
    const filters = [];
    
    for (let i = 0; i < numFilters; i++) {
      const filter = new Array(spectrumLength).fill(0);
      const center = Math.floor((i + 1) * spectrumLength / (numFilters + 1));
      const width = Math.floor(spectrumLength / numFilters);
      
      for (let j = Math.max(0, center - width); j < Math.min(spectrumLength, center + width); j++) {
        filter[j] = 1 - Math.abs(j - center) / width;
      }
      
      filters.push(filter);
    }
    
    return filters;
  }

  /**
   * Apply mel filters
   */
  applyMelFilters(magnitude, filters) {
    return filters.map(filter => 
      magnitude.reduce((sum, mag, i) => sum + mag * filter[i], 0)
    );
  }

  /**
   * Discrete Cosine Transform (simplified)
   */
  discreteCosineTransform(signal) {
    const N = signal.length;
    const dct = [];
    
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += signal[n] * Math.cos(Math.PI * k * (2 * n + 1) / (2 * N));
      }
      dct[k] = sum;
    }
    
    return dct;
  }

  /**
   * Calculate spectral flux
   */
  calculateSpectralFlux(magnitude) {
    if (!this.previousMagnitude) {
      this.previousMagnitude = magnitude;
      return 0;
    }
    
    let flux = 0;
    for (let i = 0; i < Math.min(magnitude.length, this.previousMagnitude.length); i++) {
      const diff = magnitude[i] - this.previousMagnitude[i];
      flux += Math.max(0, diff);
    }
    
    this.previousMagnitude = magnitude;
    return flux / magnitude.length;
  }

  /**
   * Estimate vocal effort
   */
  estimateVocalEffort(audioData, f0) {
    try {
      let effort = 50; // Neutral baseline
      
      // High energy indicates effort
      const rms = this.calculateRMS(audioData);
      if (rms > 0.2) effort += 25;
      
      // High F0 can indicate effort
      if (f0 && f0 > 250) effort += 20;
      
      // Spectral tilt (high frequency emphasis)
      const spectrum = this.calculateFFT(audioData);
      const spectralTilt = this.calculateSpectralTilt(spectrum.magnitude);
      if (spectralTilt > 0) effort += 15;
      
      return Math.min(100, Math.max(0, effort));
      
    } catch (error) {
      console.error('Vocal effort estimation error:', error);
      return null;
    }
  }

  /**
   * Calculate spectral tilt
   */
  calculateSpectralTilt(magnitude) {
    const lowFreqEnergy = magnitude.slice(0, Math.floor(magnitude.length * 0.3))
                                  .reduce((sum, val) => sum + val, 0);
    const highFreqEnergy = magnitude.slice(Math.floor(magnitude.length * 0.7))
                                   .reduce((sum, val) => sum + val, 0);
    
    return lowFreqEnergy > 0 ? (highFreqEnergy - lowFreqEnergy) / lowFreqEnergy : 0;
  }

  /**
   * Estimate breathiness
   */
  estimateBreathiness(audioData) {
    try {
      // Breathiness is characterized by noise in high frequencies
      const spectrum = this.calculateFFT(audioData);
      const highFreqNoise = this.estimateHighFrequencyNoise(spectrum.magnitude);
      const totalEnergy = spectrum.magnitude.reduce((sum, val) => sum + val, 0);
      
      if (totalEnergy === 0) return null;
      
      const breathiness = (highFreqNoise / totalEnergy) * 100;
      return Math.min(100, Math.max(0, Math.round(breathiness)));
      
    } catch (error) {
      console.error('Breathiness estimation error:', error);
      return null;
    }
  }

  /**
   * Estimate high frequency noise
   */
  estimateHighFrequencyNoise(magnitude) {
    const highFreqStart = Math.floor(magnitude.length * 0.8);
    return magnitude.slice(highFreqStart).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Reset analysis state
   */
  reset() {
    this.audioBuffer = [];
    this.f0History = [];
    this.amplitudeHistory = [];
    this.previousMagnitude = null;
    console.log('🔄 Voice Analysis Module reset');
  }

  /**
   * Get analysis status
   */
  getStatus() {
    return {
      sampleRate: this.sampleRate,
      frameSize: this.frameSize,
      f0Range: this.f0Range,
      historyLength: {
        f0: this.f0History.length,
        amplitude: this.amplitudeHistory.length
      },
      version: 'v1.1.15-VOICE-BIOMARKERS-COMPLETE'
    };
  }
}

export default VoiceAnalysis;