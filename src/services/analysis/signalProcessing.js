/**
 * Signal Processing Utilities for Biometric Analysis
 * Version: v1.1.13-SIGNAL-PROCESSING
 * 
 * This module provides signal processing utilities for cardiovascular
 * and respiratory signal analysis from rPPG data.
 */

class SignalProcessing {
  constructor() {
    this.debugMode = true;
    console.log('📊 Signal Processing utilities initialized');
  }

  /**
   * Normalize signal to zero mean and unit variance
   */
  normalizeSignal(signal) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
      const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
      const std = Math.sqrt(variance);
      
      if (std === 0) return signal.map(() => 0);
      
      return signal.map(val => (val - mean) / std);
      
    } catch (error) {
      console.warn('Error normalizing signal:', error);
      return signal;
    }
  }

  /**
   * Remove trend from signal using detrending
   */
  detrendSignal(signal) {
    if (!signal || signal.length < 3) return signal;
    
    try {
      const n = signal.length;
      const detrended = [];
      
      // Simple linear detrending
      const x = Array.from({length: n}, (_, i) => i);
      const slope = this.calculateSlope(x, signal);
      const intercept = this.calculateIntercept(x, signal, slope);
      
      for (let i = 0; i < n; i++) {
        const trend = slope * i + intercept;
        detrended[i] = signal[i] - trend;
      }
      
      return detrended;
      
    } catch (error) {
      console.warn('Error detrending signal:', error);
      return signal;
    }
  }

  /**
   * Apply moving average filter
   */
  movingAverage(signal, windowSize = 5) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const filtered = [];
      const halfWindow = Math.floor(windowSize / 2);
      
      for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        let count = 0;
        
        for (let j = Math.max(0, i - halfWindow); j <= Math.min(signal.length - 1, i + halfWindow); j++) {
          sum += signal[j];
          count++;
        }
        
        filtered[i] = sum / count;
      }
      
      return filtered;
      
    } catch (error) {
      console.warn('Error applying moving average:', error);
      return signal;
    }
  }

  /**
   * Apply median filter for noise reduction
   */
  medianFilter(signal, windowSize = 5) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const filtered = [];
      const halfWindow = Math.floor(windowSize / 2);
      
      for (let i = 0; i < signal.length; i++) {
        const window = [];
        
        for (let j = Math.max(0, i - halfWindow); j <= Math.min(signal.length - 1, i + halfWindow); j++) {
          window.push(signal[j]);
        }
        
        window.sort((a, b) => a - b);
        filtered[i] = window[Math.floor(window.length / 2)];
      }
      
      return filtered;
      
    } catch (error) {
      console.warn('Error applying median filter:', error);
      return signal;
    }
  }

  /**
   * Butterworth bandpass filter implementation
   */
  butterworthBandpass(signal, lowCutoff, highCutoff, sampleRate, order = 2) {
    if (!signal || signal.length === 0) return [];
    
    try {
      // Simplified Butterworth filter - real implementation would use proper coefficients
      const nyquist = sampleRate / 2;
      const low = lowCutoff / nyquist;
      const high = highCutoff / nyquist;
      
      // Apply cascaded biquad filters
      let filtered = [...signal];
      
      for (let stage = 0; stage < order; stage++) {
        filtered = this.biquadFilter(filtered, low, high);
      }
      
      return filtered;
      
    } catch (error) {
      console.warn('Error applying Butterworth filter:', error);
      return signal;
    }
  }

  /**
   * Biquad filter implementation
   */
  biquadFilter(signal, lowFreq, highFreq) {
    if (!signal || signal.length < 3) return signal;
    
    try {
      const filtered = [...signal];
      
      // Simple IIR filter coefficients (simplified)
      const a1 = -1.8;
      const a2 = 0.8;
      const b0 = 0.1;
      const b1 = 0.0;
      const b2 = -0.1;
      
      for (let i = 2; i < signal.length; i++) {
        filtered[i] = b0 * signal[i] + b1 * signal[i-1] + b2 * signal[i-2] -
                     a1 * filtered[i-1] - a2 * filtered[i-2];
      }
      
      return filtered;
      
    } catch (error) {
      console.warn('Error in biquad filter:', error);
      return signal;
    }
  }

  /**
   * Peak detection using adaptive threshold
   */
  detectPeaks(signal, minDistance = 10, threshold = 0.3) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const peaks = [];
      const normalizedSignal = this.normalizeSignal(signal);
      
      for (let i = minDistance; i < normalizedSignal.length - minDistance; i++) {
        let isPeak = true;
        
        // Check if current point is higher than threshold
        if (normalizedSignal[i] < threshold) continue;
        
        // Check if it's a local maximum
        for (let j = i - minDistance; j <= i + minDistance; j++) {
          if (j !== i && normalizedSignal[j] >= normalizedSignal[i]) {
            isPeak = false;
            break;
          }
        }
        
        if (isPeak) {
          peaks.push({
            index: i,
            value: normalizedSignal[i],
            originalValue: signal[i]
          });
        }
      }
      
      return peaks;
      
    } catch (error) {
      console.warn('Error detecting peaks:', error);
      return [];
    }
  }

  /**
   * Calculate signal quality metrics
   */
  calculateSignalQuality(signal) {
    if (!signal || signal.length === 0) {
      return { quality: 0, snr: 0, stability: 0 };
    }
    
    try {
      // Signal-to-Noise Ratio estimation
      const snr = this.estimateSNR(signal);
      
      // Signal stability (inverse of coefficient of variation)
      const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
      const std = Math.sqrt(signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length);
      const stability = mean !== 0 ? 1 / (std / Math.abs(mean)) : 0;
      
      // Overall quality score
      const quality = Math.min(1, (snr / 10 + Math.min(stability, 1)) / 2);
      
      return {
        quality: Math.round(quality * 100) / 100,
        snr: Math.round(snr * 100) / 100,
        stability: Math.round(stability * 100) / 100
      };
      
    } catch (error) {
      console.warn('Error calculating signal quality:', error);
      return { quality: 0, snr: 0, stability: 0 };
    }
  }

  /**
   * Estimate Signal-to-Noise Ratio
   */
  estimateSNR(signal) {
    if (!signal || signal.length < 10) return 0;
    
    try {
      // Use high-frequency components as noise estimate
      const smoothed = this.movingAverage(signal, 5);
      const noise = signal.map((val, i) => val - smoothed[i]);
      
      const signalPower = smoothed.reduce((sum, val) => sum + val * val, 0) / smoothed.length;
      const noisePower = noise.reduce((sum, val) => sum + val * val, 0) / noise.length;
      
      if (noisePower === 0) return 100; // Perfect signal
      
      const snr = 10 * Math.log10(signalPower / noisePower);
      return Math.max(0, snr);
      
    } catch (error) {
      console.warn('Error estimating SNR:', error);
      return 0;
    }
  }

  /**
   * Cross-correlation for signal alignment
   */
  crossCorrelation(signal1, signal2, maxLag = 50) {
    if (!signal1 || !signal2 || signal1.length === 0 || signal2.length === 0) {
      return [];
    }
    
    try {
      const correlation = [];
      const minLength = Math.min(signal1.length, signal2.length);
      
      for (let lag = -maxLag; lag <= maxLag; lag++) {
        let sum = 0;
        let count = 0;
        
        for (let i = 0; i < minLength; i++) {
          const j = i + lag;
          if (j >= 0 && j < signal2.length) {
            sum += signal1[i] * signal2[j];
            count++;
          }
        }
        
        correlation.push(count > 0 ? sum / count : 0);
      }
      
      return correlation;
      
    } catch (error) {
      console.warn('Error calculating cross-correlation:', error);
      return [];
    }
  }

  /**
   * Autocorrelation for period detection
   */
  autocorrelation(signal, maxLag = 100) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const autocorr = [];
      const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
      const centeredSignal = signal.map(val => val - mean);
      
      for (let lag = 0; lag <= Math.min(maxLag, signal.length - 1); lag++) {
        let sum = 0;
        
        for (let i = 0; i < signal.length - lag; i++) {
          sum += centeredSignal[i] * centeredSignal[i + lag];
        }
        
        autocorr.push(sum / (signal.length - lag));
      }
      
      // Normalize by zero-lag value
      if (autocorr[0] !== 0) {
        return autocorr.map(val => val / autocorr[0]);
      }
      
      return autocorr;
      
    } catch (error) {
      console.warn('Error calculating autocorrelation:', error);
      return [];
    }
  }

  /**
   * Spectral analysis using periodogram
   */
  periodogram(signal, sampleRate = 30) {
    if (!signal || signal.length === 0) return { frequencies: [], power: [] };
    
    try {
      const N = signal.length;
      const frequencies = [];
      const power = [];
      
      // Calculate frequency bins
      for (let k = 0; k < Math.floor(N/2); k++) {
        frequencies.push(k * sampleRate / N);
      }
      
      // Calculate power spectrum using DFT
      for (let k = 0; k < frequencies.length; k++) {
        let real = 0, imag = 0;
        
        for (let n = 0; n < N; n++) {
          const angle = -2 * Math.PI * k * n / N;
          real += signal[n] * Math.cos(angle);
          imag += signal[n] * Math.sin(angle);
        }
        
        const magnitude = Math.sqrt(real * real + imag * imag);
        power.push(magnitude * magnitude / N);
      }
      
      return { frequencies, power };
      
    } catch (error) {
      console.warn('Error calculating periodogram:', error);
      return { frequencies: [], power: [] };
    }
  }

  /**
   * Welch's method for power spectral density
   */
  welchPSD(signal, windowSize = 64, overlap = 0.5, sampleRate = 30) {
    if (!signal || signal.length < windowSize) {
      return this.periodogram(signal, sampleRate);
    }
    
    try {
      const step = Math.floor(windowSize * (1 - overlap));
      const numWindows = Math.floor((signal.length - windowSize) / step) + 1;
      
      let avgPower = null;
      let frequencies = null;
      
      for (let w = 0; w < numWindows; w++) {
        const start = w * step;
        const end = start + windowSize;
        const window = signal.slice(start, end);
        
        // Apply Hanning window
        const windowed = this.applyHanningWindow(window);
        
        const { frequencies: freq, power } = this.periodogram(windowed, sampleRate);
        
        if (!avgPower) {
          avgPower = [...power];
          frequencies = [...freq];
        } else {
          for (let i = 0; i < power.length; i++) {
            avgPower[i] += power[i];
          }
        }
      }
      
      // Average the power spectra
      if (avgPower) {
        avgPower = avgPower.map(p => p / numWindows);
      }
      
      return { frequencies: frequencies || [], power: avgPower || [] };
      
    } catch (error) {
      console.warn('Error in Welch PSD:', error);
      return this.periodogram(signal, sampleRate);
    }
  }

  /**
   * Apply Hanning window to signal
   */
  applyHanningWindow(signal) {
    if (!signal || signal.length === 0) return [];
    
    try {
      const N = signal.length;
      const windowed = [];
      
      for (let i = 0; i < N; i++) {
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
        windowed[i] = signal[i] * window;
      }
      
      return windowed;
      
    } catch (error) {
      console.warn('Error applying Hanning window:', error);
      return signal;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate slope for linear regression
   */
  calculateSlope(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Calculate intercept for linear regression
   */
  calculateIntercept(x, y, slope) {
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    return meanY - slope * meanX;
  }

  /**
   * Get processing status and statistics
   */
  getStatus() {
    return {
      debugMode: this.debugMode,
      availableMethods: [
        'normalizeSignal',
        'detrendSignal',
        'movingAverage',
        'medianFilter',
        'butterworthBandpass',
        'detectPeaks',
        'calculateSignalQuality',
        'crossCorrelation',
        'autocorrelation',
        'periodogram',
        'welchPSD'
      ]
    };
  }
}

export default SignalProcessing;