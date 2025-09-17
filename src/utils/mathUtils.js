/**
 * Mathematical Utilities for Biometric Analysis
 * Provides core mathematical functions for signal processing and statistical analysis
 */

/**
 * Butterworth Filter Implementation
 * Digital filter for signal processing in biometric analysis
 */
export class ButterworthFilter {
  constructor(order = 4, cutoffFreq = 0.1, type = 'lowpass') {
    this.order = order;
    this.cutoffFreq = cutoffFreq;
    this.type = type;
    this.coefficients = this.calculateCoefficients();
    this.history = [];
  }

  calculateCoefficients() {
    // Simplified Butterworth filter coefficients calculation
    const wc = Math.tan((Math.PI * this.cutoffFreq) / 2);
    const k1 = Math.sqrt(2) * wc;
    const k2 = wc * wc;
    
    const a0 = k2 + k1 + 1;
    const a1 = (2 * (k2 - 1)) / a0;
    const a2 = (k2 - k1 + 1) / a0;
    const b0 = k2 / a0;
    const b1 = 2 * b0;
    const b2 = b0;
    
    return { a1, a2, b0, b1, b2 };
  }

  filter(input) {
    if (this.history.length < 2) {
      this.history.push({ input: input, output: input });
      return input;
    }

    const { a1, a2, b0, b1, b2 } = this.coefficients;
    
    const output = b0 * input + 
                   b1 * this.history[this.history.length - 1].input + 
                   b2 * this.history[this.history.length - 2].input -
                   a1 * this.history[this.history.length - 1].output -
                   a2 * this.history[this.history.length - 2].output;

    this.history.push({ input: input, output: output });
    
    // Keep only last 10 samples for efficiency
    if (this.history.length > 10) {
      this.history.shift();
    }

    return output;
  }

  reset() {
    this.history = [];
  }
}

/**
 * FFT Processor for Spectral Analysis
 */
export class FFTProcessor {
  constructor() {
    this.windowFunctions = {
      hamming: (n, N) => 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1)),
      hanning: (n, N) => 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1))),
      blackman: (n, N) => 0.42 - 0.5 * Math.cos(2 * Math.PI * n / (N - 1)) + 0.08 * Math.cos(4 * Math.PI * n / (N - 1))
    };
  }

  /**
   * Fast Fourier Transform implementation
   */
  fft(signal) {
    const N = signal.length;
    if (N <= 1) return signal;

    // Ensure power of 2
    const paddedN = Math.pow(2, Math.ceil(Math.log2(N)));
    const paddedSignal = [...signal];
    while (paddedSignal.length < paddedN) {
      paddedSignal.push(0);
    }

    return this.fftRecursive(paddedSignal.map(x => ({ real: x, imag: 0 })));
  }

  fftRecursive(x) {
    const N = x.length;
    if (N <= 1) return x;

    // Divide
    const even = [];
    const odd = [];
    for (let i = 0; i < N; i++) {
      if (i % 2 === 0) {
        even.push(x[i]);
      } else {
        odd.push(x[i]);
      }
    }

    // Conquer
    const evenFFT = this.fftRecursive(even);
    const oddFFT = this.fftRecursive(odd);

    // Combine
    const result = new Array(N);
    for (let k = 0; k < N / 2; k++) {
      const angle = -2 * Math.PI * k / N;
      const twiddle = {
        real: Math.cos(angle),
        imag: Math.sin(angle)
      };

      const oddTerm = {
        real: twiddle.real * oddFFT[k].real - twiddle.imag * oddFFT[k].imag,
        imag: twiddle.real * oddFFT[k].imag + twiddle.imag * oddFFT[k].real
      };

      result[k] = {
        real: evenFFT[k].real + oddTerm.real,
        imag: evenFFT[k].imag + oddTerm.imag
      };

      result[k + N / 2] = {
        real: evenFFT[k].real - oddTerm.real,
        imag: evenFFT[k].imag - oddTerm.imag
      };
    }

    return result;
  }

  /**
   * Calculate Power Spectral Density
   */
  calculatePSD(signal, windowType = 'hamming') {
    const N = signal.length;
    const windowFunction = this.windowFunctions[windowType];
    
    // Apply window function
    const windowedSignal = signal.map((val, i) => val * windowFunction(i, N));
    
    // Perform FFT
    const fftResult = this.fft(windowedSignal);
    
    // Calculate power spectral density
    const psd = fftResult.slice(0, Math.floor(N / 2)).map(complex => {
      return (complex.real * complex.real + complex.imag * complex.imag) / N;
    });

    return psd;
  }

  /**
   * Apply window function to signal
   */
  applyWindow(signal, windowType = 'hamming') {
    const N = signal.length;
    const windowFunction = this.windowFunctions[windowType];
    
    return signal.map((val, i) => val * windowFunction(i, N));
  }
}

/**
 * Peak Detection Algorithm
 */
export class PeakDetector {
  constructor(minHeight = 0, minDistance = 1, threshold = 0) {
    this.minHeight = minHeight;
    this.minDistance = minDistance;
    this.threshold = threshold;
  }

  /**
   * Find peaks in signal
   */
  findPeaks(signal) {
    const peaks = [];
    const N = signal.length;

    for (let i = 1; i < N - 1; i++) {
      // Check if current point is a local maximum
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        // Check minimum height requirement
        if (signal[i] >= this.minHeight) {
          // Check minimum distance requirement
          if (peaks.length === 0 || i - peaks[peaks.length - 1] >= this.minDistance) {
            peaks.push(i);
          }
        }
      }
    }

    return peaks;
  }

  /**
   * Find peaks with prominence calculation
   */
  findPeaksWithProminence(signal) {
    const peaks = this.findPeaks(signal);
    const peaksWithProminence = [];

    for (const peak of peaks) {
      const prominence = this.calculateProminence(signal, peak);
      peaksWithProminence.push({
        index: peak,
        value: signal[peak],
        prominence: prominence
      });
    }

    return peaksWithProminence;
  }

  /**
   * Calculate peak prominence
   */
  calculateProminence(signal, peakIndex) {
    const peakValue = signal[peakIndex];
    let leftMin = peakValue;
    let rightMin = peakValue;

    // Find minimum to the left
    for (let i = peakIndex - 1; i >= 0; i--) {
      leftMin = Math.min(leftMin, signal[i]);
    }

    // Find minimum to the right
    for (let i = peakIndex + 1; i < signal.length; i++) {
      rightMin = Math.min(rightMin, signal[i]);
    }

    return peakValue - Math.max(leftMin, rightMin);
  }
}

/**
 * Statistical Analysis Functions
 */
export class StatisticalAnalysis {
  /**
   * Calculate mean of array
   */
  mean(data) {
    return data.length > 0 ? data.reduce((sum, val) => sum + val, 0) / data.length : 0;
  }

  /**
   * Calculate median of array
   */
  median(data) {
    if (data.length === 0) return 0;
    
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * Calculate standard deviation
   */
  standardDeviation(data) {
    if (data.length < 2) return 0;
    
    const meanVal = this.mean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - meanVal, 2), 0) / data.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate variance
   */
  variance(data) {
    if (data.length < 2) return 0;
    
    const meanVal = this.mean(data);
    return data.reduce((sum, val) => sum + Math.pow(val - meanVal, 2), 0) / data.length;
  }

  /**
   * Calculate RMSSD (Root Mean Square of Successive Differences)
   */
  calculateRMSSD(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    
    const differences = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      differences.push(Math.pow(rrIntervals[i] - rrIntervals[i - 1], 2));
    }
    
    return Math.sqrt(this.mean(differences));
  }

  /**
   * Calculate SDNN (Standard Deviation of NN intervals)
   */
  calculateSDNN(rrIntervals) {
    return this.standardDeviation(rrIntervals);
  }

  /**
   * Calculate pNN50 (Percentage of NN50 intervals)
   */
  calculatePNN50(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    
    let nn50Count = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 50) {
        nn50Count++;
      }
    }
    
    return (nn50Count / (rrIntervals.length - 1)) * 100;
  }

  /**
   * Calculate correlation coefficient between two arrays
   */
  correlation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      
      numerator += dx * dy;
      denominatorX += dx * dx;
      denominatorY += dy * dy;
    }
    
    const denominator = Math.sqrt(denominatorX * denominatorY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate percentile
   */
  percentile(data, p) {
    if (data.length === 0) return 0;
    
    const sorted = [...data].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    
    if (Number.isInteger(index)) {
      return sorted[index];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
  }

  /**
   * Calculate interquartile range
   */
  interquartileRange(data) {
    const q1 = this.percentile(data, 25);
    const q3 = this.percentile(data, 75);
    return q3 - q1;
  }

  /**
   * Detect outliers using IQR method
   */
  detectOutliers(data) {
    const q1 = this.percentile(data, 25);
    const q3 = this.percentile(data, 75);
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.map((value, index) => ({
      index,
      value,
      isOutlier: value < lowerBound || value > upperBound
    })).filter(item => item.isOutlier);
  }

  /**
   * Calculate moving average
   */
  movingAverage(data, windowSize) {
    if (windowSize >= data.length) return [this.mean(data)];
    
    const result = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize);
      result.push(this.mean(window));
    }
    
    return result;
  }

  /**
   * Calculate exponential moving average
   */
  exponentialMovingAverage(data, alpha = 0.1) {
    if (data.length === 0) return [];
    
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    
    return result;
  }
}

/**
 * Signal Processing Utilities
 */
export class SignalProcessor {
  /**
   * Normalize signal to range [0, 1]
   */
  normalize(signal) {
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const range = max - min;
    
    if (range === 0) return signal.map(() => 0);
    
    return signal.map(val => (val - min) / range);
  }

  /**
   * Standardize signal (z-score normalization)
   */
  standardize(signal) {
    const stats = new StatisticalAnalysis();
    const mean = stats.mean(signal);
    const std = stats.standardDeviation(signal);
    
    if (std === 0) return signal.map(() => 0);
    
    return signal.map(val => (val - mean) / std);
  }

  /**
   * Remove DC component (mean) from signal
   */
  removeDC(signal) {
    const stats = new StatisticalAnalysis();
    const mean = stats.mean(signal);
    return signal.map(val => val - mean);
  }

  /**
   * Apply bandpass filter
   */
  bandpassFilter(signal, lowFreq, highFreq, sampleRate) {
    // Simplified bandpass filter implementation
    const lowpass = new ButterworthFilter(4, highFreq / (sampleRate / 2), 'lowpass');
    const highpass = new ButterworthFilter(4, lowFreq / (sampleRate / 2), 'highpass');
    
    // Apply lowpass then highpass
    const lowpassResult = signal.map(sample => lowpass.filter(sample));
    lowpass.reset();
    
    const result = lowpassResult.map(sample => highpass.filter(sample));
    highpass.reset();
    
    return result;
  }

  /**
   * Interpolate missing values
   */
  interpolate(signal, method = 'linear') {
    const result = [...signal];
    
    for (let i = 0; i < result.length; i++) {
      if (isNaN(result[i]) || result[i] === null || result[i] === undefined) {
        if (method === 'linear') {
          // Find previous and next valid values
          let prevIndex = i - 1;
          let nextIndex = i + 1;
          
          while (prevIndex >= 0 && (isNaN(result[prevIndex]) || result[prevIndex] === null)) {
            prevIndex--;
          }
          
          while (nextIndex < result.length && (isNaN(result[nextIndex]) || result[nextIndex] === null)) {
            nextIndex++;
          }
          
          if (prevIndex >= 0 && nextIndex < result.length) {
            // Linear interpolation
            const prevVal = result[prevIndex];
            const nextVal = result[nextIndex];
            const ratio = (i - prevIndex) / (nextIndex - prevIndex);
            result[i] = prevVal + ratio * (nextVal - prevVal);
          } else if (prevIndex >= 0) {
            result[i] = result[prevIndex];
          } else if (nextIndex < result.length) {
            result[i] = result[nextIndex];
          } else {
            result[i] = 0;
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Smooth signal using moving average
   */
  smooth(signal, windowSize = 5) {
    const stats = new StatisticalAnalysis();
    return stats.movingAverage(signal, windowSize);
  }

  /**
   * Detect signal quality
   */
  assessSignalQuality(signal) {
    const stats = new StatisticalAnalysis();
    
    // Calculate signal-to-noise ratio approximation
    const mean = stats.mean(signal);
    const std = stats.standardDeviation(signal);
    const snr = mean !== 0 ? 20 * Math.log10(Math.abs(mean) / std) : 0;
    
    // Detect outliers
    const outliers = stats.detectOutliers(signal);
    const outlierRatio = outliers.length / signal.length;
    
    // Calculate stability (coefficient of variation)
    const stability = mean !== 0 ? std / Math.abs(mean) : 1;
    
    // Overall quality score (0-1)
    let qualityScore = 1;
    if (snr < 10) qualityScore -= 0.3;
    if (outlierRatio > 0.1) qualityScore -= 0.3;
    if (stability > 0.5) qualityScore -= 0.2;
    
    return {
      snr: snr,
      outlierRatio: outlierRatio,
      stability: stability,
      qualityScore: Math.max(0, qualityScore)
    };
  }
}

/**
 * Utility Functions
 */
export const MathUtils = {
  /**
   * Linear interpolation
   */
  lerp: (a, b, t) => a + t * (b - a),

  /**
   * Clamp value between min and max
   */
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),

  /**
   * Map value from one range to another
   */
  map: (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  },

  /**
   * Convert degrees to radians
   */
  degToRad: (degrees) => degrees * Math.PI / 180,

  /**
   * Convert radians to degrees
   */
  radToDeg: (radians) => radians * 180 / Math.PI,

  /**
   * Calculate distance between two points
   */
  distance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),

  /**
   * Generate array of numbers
   */
  range: (start, end, step = 1) => {
    const result = [];
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
    return result;
  },

  /**
   * Generate array of zeros
   */
  zeros: (length) => new Array(length).fill(0),

  /**
   * Generate array of ones
   */
  ones: (length) => new Array(length).fill(1),

  /**
   * Generate array with random values
   */
  random: (length, min = 0, max = 1) => {
    return new Array(length).fill().map(() => Math.random() * (max - min) + min);
  }
};

// Export all classes and utilities
export default {
  ButterworthFilter,
  FFTProcessor,
  PeakDetector,
  StatisticalAnalysis,
  SignalProcessor,
  MathUtils
};