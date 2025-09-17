/**
 * 🧮 MATHEMATICAL UTILITIES FOR rPPG ANALYSIS
 * Funciones matemáticas fundamentales para análisis biométrico
 * Versión: 1.0 - Fase 1 Implementación
 */

/**
 * Butterworth Filter Implementation
 * Filtro digital pasa-banda para señales rPPG
 */
export class ButterworthFilter {
  constructor(order = 4, lowFreq = 0.7, highFreq = 4.0, sampleRate = 30) {
    this.order = order;
    this.lowFreq = lowFreq;
    this.highFreq = highFreq;
    this.sampleRate = sampleRate;
    this.nyquist = sampleRate / 2;
    
    // Coeficientes del filtro
    this.coefficients = this.calculateCoefficients();
  }
  
  calculateCoefficients() {
    // Implementación simplificada Butterworth
    const lowNorm = this.lowFreq / this.nyquist;
    const highNorm = this.highFreq / this.nyquist;
    
    return {
      a: [1, -0.8, 0.64], // Coeficientes denominador
      b: [0.2, 0, -0.2]   // Coeficientes numerador
    };
  }
  
  apply(signal) {
    const filtered = new Array(signal.length);
    const { a, b } = this.coefficients;
    
    // Aplicar filtro IIR
    for (let i = 0; i < signal.length; i++) {
      let output = 0;
      
      // Parte FIR (numerador)
      for (let j = 0; j < b.length && i - j >= 0; j++) {
        output += b[j] * signal[i - j];
      }
      
      // Parte IIR (denominador)
      for (let j = 1; j < a.length && i - j >= 0; j++) {
        output -= a[j] * filtered[i - j];
      }
      
      filtered[i] = output;
    }
    
    return filtered;
  }
}

/**
 * Fast Fourier Transform Implementation
 * FFT para análisis espectral de señales biométricas
 */
export class FFTProcessor {
  constructor(size) {
    this.size = size;
    this.cosTable = new Array(size);
    this.sinTable = new Array(size);
    
    // Pre-calcular tablas trigonométricas
    for (let i = 0; i < size; i++) {
      this.cosTable[i] = Math.cos(2 * Math.PI * i / size);
      this.sinTable[i] = Math.sin(2 * Math.PI * i / size);
    }
  }
  
  forward(signal) {
    const n = signal.length;
    const real = new Array(n);
    const imag = new Array(n);
    
    // Copiar señal de entrada
    for (let i = 0; i < n; i++) {
      real[i] = signal[i];
      imag[i] = 0;
    }
    
    // FFT Cooley-Tukey
    this.fft(real, imag);
    
    return { real, imag };
  }
  
  fft(real, imag) {
    const n = real.length;
    
    // Bit-reversal permutation
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) {
        j ^= bit;
      }
      j ^= bit;
      
      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }
    
    // Cooley-Tukey FFT
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const step = n / len;
      
      for (let i = 0; i < n; i += len) {
        for (let j = 0; j < halfLen; j++) {
          const u = real[i + j];
          const v = imag[i + j];
          const w_real = this.cosTable[j * step];
          const w_imag = this.sinTable[j * step];
          const t_real = real[i + j + halfLen] * w_real - imag[i + j + halfLen] * w_imag;
          const t_imag = real[i + j + halfLen] * w_imag + imag[i + j + halfLen] * w_real;
          
          real[i + j] = u + t_real;
          imag[i + j] = v + t_imag;
          real[i + j + halfLen] = u - t_real;
          imag[i + j + halfLen] = v - t_imag;
        }
      }
    }
  }
  
  magnitude(fftResult) {
    const { real, imag } = fftResult;
    const magnitude = new Array(real.length);
    
    for (let i = 0; i < real.length; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    
    return magnitude;
  }
  
  powerSpectralDensity(signal, sampleRate = 30) {
    const fftResult = this.forward(signal);
    const magnitude = this.magnitude(fftResult);
    const n = signal.length;
    
    // Calcular PSD
    const psd = new Array(Math.floor(n / 2));
    const freqs = new Array(Math.floor(n / 2));
    
    for (let i = 0; i < psd.length; i++) {
      psd[i] = (magnitude[i] * magnitude[i]) / (sampleRate * n);
      freqs[i] = (i * sampleRate) / n;
    }
    
    return { psd, frequencies: freqs };
  }
}

/**
 * Peak Detection Algorithm
 * Detección de picos para análisis de intervalos R-R
 */
export class PeakDetector {
  constructor(minHeight = 0.3, minDistance = 15) {
    this.minHeight = minHeight;
    this.minDistance = minDistance;
  }
  
  findPeaks(signal) {
    const peaks = [];
    const n = signal.length;
    
    // Normalizar señal
    const normalized = this.normalize(signal);
    
    for (let i = 1; i < n - 1; i++) {
      // Verificar si es un máximo local
      if (normalized[i] > normalized[i - 1] && 
          normalized[i] > normalized[i + 1] &&
          normalized[i] > this.minHeight) {
        
        // Verificar distancia mínima con pico anterior
        if (peaks.length === 0 || 
            i - peaks[peaks.length - 1] >= this.minDistance) {
          peaks.push(i);
        }
      }
    }
    
    return peaks;
  }
  
  normalize(signal) {
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const range = max - min;
    
    return signal.map(value => (value - min) / range);
  }
  
  calculateRRIntervals(peaks, sampleRate = 30) {
    const intervals = [];
    
    for (let i = 1; i < peaks.length; i++) {
      const interval = (peaks[i] - peaks[i - 1]) / sampleRate * 1000; // ms
      intervals.push(interval);
    }
    
    return intervals;
  }
}

/**
 * Correlation Analysis
 * Análisis de correlación para extracción señal rPPG
 */
export class CorrelationAnalyzer {
  static autocorrelation(signal, maxLag = null) {
    const n = signal.length;
    maxLag = maxLag || Math.floor(n / 2);
    const result = new Array(maxLag);
    
    // Calcular media
    const mean = signal.reduce((sum, val) => sum + val, 0) / n;
    
    // Calcular autocorrelación
    for (let lag = 0; lag < maxLag; lag++) {
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n - lag; i++) {
        numerator += (signal[i] - mean) * (signal[i + lag] - mean);
        denominator += (signal[i] - mean) * (signal[i] - mean);
      }
      
      result[lag] = denominator > 0 ? numerator / denominator : 0;
    }
    
    return result;
  }
  
  static crossCorrelation(signal1, signal2) {
    const n = Math.min(signal1.length, signal2.length);
    const result = new Array(n);
    
    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += signal1[i] * signal2[i + lag];
      }
      result[lag] = sum / (n - lag);
    }
    
    return result;
  }
}

/**
 * Statistical Functions
 * Funciones estadísticas para análisis HRV
 */
export class StatisticalAnalysis {
  static mean(data) {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }
  
  static standardDeviation(data) {
    const mean = this.mean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }
  
  static rmssd(intervals) {
    if (intervals.length < 2) return 0;
    
    let sumSquaredDiffs = 0;
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i - 1];
      sumSquaredDiffs += diff * diff;
    }
    
    return Math.sqrt(sumSquaredDiffs / (intervals.length - 1));
  }
  
  static pnn50(intervals) {
    if (intervals.length < 2) return 0;
    
    let count = 0;
    for (let i = 1; i < intervals.length; i++) {
      if (Math.abs(intervals[i] - intervals[i - 1]) > 50) {
        count++;
      }
    }
    
    return (count / (intervals.length - 1)) * 100;
  }
  
  static triangularIndex(intervals) {
    // Histograma de intervalos RR
    const histogram = {};
    let max = 0;
    
    intervals.forEach(interval => {
      const bin = Math.round(interval / 7.8125); // 1/128 s bins
      histogram[bin] = (histogram[bin] || 0) + 1;
      max = Math.max(max, histogram[bin]);
    });
    
    return intervals.length / max;
  }
}

/**
 * Signal Quality Assessment
 * Evaluación de calidad de señal para validación
 */
export class SignalQuality {
  static assessQuality(signal) {
    const snr = this.calculateSNR(signal);
    const stability = this.calculateStability(signal);
    const artifacts = this.detectArtifacts(signal);
    
    return {
      snr,
      stability,
      artifacts,
      quality: this.overallQuality(snr, stability, artifacts)
    };
  }
  
  static calculateSNR(signal) {
    // Estimar SNR basado en varianza de la señal
    const mean = StatisticalAnalysis.mean(signal);
    const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
    const noise = Math.sqrt(variance) * 0.1; // Estimación ruido
    
    return 20 * Math.log10(Math.abs(mean) / noise);
  }
  
  static calculateStability(signal) {
    // Calcular estabilidad temporal
    const windowSize = Math.floor(signal.length / 10);
    const windows = [];
    
    for (let i = 0; i < signal.length - windowSize; i += windowSize) {
      const window = signal.slice(i, i + windowSize);
      windows.push(StatisticalAnalysis.mean(window));
    }
    
    const stability = 1 - StatisticalAnalysis.standardDeviation(windows) / StatisticalAnalysis.mean(windows);
    return Math.max(0, Math.min(1, stability));
  }
  
  static detectArtifacts(signal) {
    // Detectar artefactos por cambios abruptos
    let artifacts = 0;
    const threshold = StatisticalAnalysis.standardDeviation(signal) * 3;
    
    for (let i = 1; i < signal.length; i++) {
      if (Math.abs(signal[i] - signal[i - 1]) > threshold) {
        artifacts++;
      }
    }
    
    return artifacts / signal.length;
  }
  
  static overallQuality(snr, stability, artifacts) {
    // Combinar métricas en score de calidad
    const snrScore = Math.min(1, Math.max(0, (snr - 10) / 20)); // 10-30 dB range
    const stabilityScore = stability;
    const artifactScore = Math.max(0, 1 - artifacts * 10);
    
    return (snrScore + stabilityScore + artifactScore) / 3;
  }
}

/**
 * Utility Functions
 * Funciones de utilidad general
 */
export const MathUtils = {
  // Interpolación lineal
  linearInterpolation(x1, y1, x2, y2, x) {
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  },
  
  // Suavizado de señal (moving average)
  movingAverage(signal, windowSize = 5) {
    const smoothed = new Array(signal.length);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < signal.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(signal.length - 1, i + halfWindow); j++) {
        sum += signal[j];
        count++;
      }
      
      smoothed[i] = sum / count;
    }
    
    return smoothed;
  },
  
  // Normalización Z-score
  zScoreNormalization(signal) {
    const mean = StatisticalAnalysis.mean(signal);
    const std = StatisticalAnalysis.standardDeviation(signal);
    
    return signal.map(value => (value - mean) / std);
  },
  
  // Rango dinámico
  dynamicRange(signal) {
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    return max - min;
  }
};

// Exportar todas las clases y funciones
export {
  ButterworthFilter,
  FFTProcessor,
  PeakDetector,
  CorrelationAnalyzer,
  StatisticalAnalysis,
  SignalQuality
};