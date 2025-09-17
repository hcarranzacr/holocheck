/**
 * Real-time rPPG Analysis Engine
 * Extracts cardiovascular signals from video frames using CHROM algorithm
 * Implements 24+ cardiovascular biomarkers from facial video analysis
 */

import { ButterworthFilter, FFTProcessor, PeakDetector, StatisticalAnalysis } from '../../utils/mathUtils.js';

export class RealTimeRPPG {
  constructor() {
    this.isInitialized = false;
    this.frameBuffer = [];
    this.rppgSignal = [];
    this.heartRateBuffer = [];
    this.maxBufferSize = 300; // 10 seconds at 30fps
    this.samplingRate = 30; // fps
    
    // Filters for signal processing
    this.bandpassFilter = new ButterworthFilter(0.7, 4.0, this.samplingRate);
    this.fftProcessor = new FFTProcessor();
    this.peakDetector = new PeakDetector();
    this.statsAnalyzer = new StatisticalAnalysis();
    
    // Face detection regions
    this.faceRegions = {
      forehead: { x: 0.3, y: 0.2, w: 0.4, h: 0.15 },
      leftCheek: { x: 0.15, y: 0.4, w: 0.2, h: 0.25 },
      rightCheek: { x: 0.65, y: 0.4, w: 0.2, h: 0.25 }
    };
    
    // Signal quality metrics
    this.signalQuality = {
      snr: 0,
      confidence: 0,
      stability: 0,
      artifactLevel: 0
    };
    
    this.lastAnalysisTime = 0;
    this.analysisInterval = 1000; // Analyze every 1 second
  }

  /**
   * Initialize rPPG engine with video element
   */
  async initialize(videoElement) {
    try {
      this.videoElement = videoElement;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      // Set canvas size to match video
      this.canvas.width = videoElement.videoWidth || 640;
      this.canvas.height = videoElement.videoHeight || 480;
      
      this.isInitialized = true;
      console.log('✅ Real-time rPPG engine initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize rPPG engine:', error);
      return false;
    }
  }

  /**
   * Process video frame and extract rPPG signal using CHROM algorithm
   */
  processFrame() {
    if (!this.isInitialized || !this.videoElement) return null;

    try {
      // Capture current frame
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Extract RGB values from face regions
      const rgbValues = this.extractFaceRGB(imageData);
      
      if (!rgbValues) return null;
      
      // Apply CHROM algorithm for rPPG signal extraction
      const rppgValue = this.chromAlgorithm(rgbValues);
      
      // Add to signal buffer
      this.rppgSignal.push(rppgValue);
      if (this.rppgSignal.length > this.maxBufferSize) {
        this.rppgSignal.shift();
      }
      
      // Process signal if we have enough data
      if (this.rppgSignal.length >= 90) { // 3 seconds of data
        return this.analyzeSignal();
      }
      
      return null;
    } catch (error) {
      console.error('❌ Frame processing error:', error);
      return null;
    }
  }

  /**
   * Extract RGB values from facial regions
   */
  extractFaceRGB(imageData) {
    const { data, width, height } = imageData;
    const regions = [];
    
    // Extract RGB from each face region
    Object.entries(this.faceRegions).forEach(([regionName, region]) => {
      const startX = Math.floor(region.x * width);
      const startY = Math.floor(region.y * height);
      const regionWidth = Math.floor(region.w * width);
      const regionHeight = Math.floor(region.h * height);
      
      let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;
      
      for (let y = startY; y < startY + regionHeight; y++) {
        for (let x = startX; x < startX + regionWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 4;
            totalR += data[index];
            totalG += data[index + 1];
            totalB += data[index + 2];
            pixelCount++;
          }
        }
      }
      
      if (pixelCount > 0) {
        regions.push({
          name: regionName,
          r: totalR / pixelCount,
          g: totalG / pixelCount,
          b: totalB / pixelCount
        });
      }
    });
    
    return regions.length > 0 ? regions : null;
  }

  /**
   * CHROM algorithm for rPPG signal extraction
   */
  chromAlgorithm(rgbRegions) {
    if (!rgbRegions || rgbRegions.length === 0) return 0;
    
    // Average RGB across all face regions
    let avgR = 0, avgG = 0, avgB = 0;
    rgbRegions.forEach(region => {
      avgR += region.r;
      avgG += region.g;
      avgB += region.b;
    });
    
    avgR /= rgbRegions.length;
    avgG /= rgbRegions.length;
    avgB /= rgbRegions.length;
    
    // Normalize RGB values
    const mean = (avgR + avgG + avgB) / 3;
    const normalizedR = avgR / mean;
    const normalizedG = avgG / mean;
    const normalizedB = avgB / mean;
    
    // CHROM algorithm: 3*R - 2*G
    const chromSignal = 3 * normalizedR - 2 * normalizedG;
    
    return chromSignal;
  }

  /**
   * Analyze rPPG signal and extract cardiovascular metrics
   */
  analyzeSignal() {
    if (this.rppgSignal.length < 90) return null;
    
    try {
      // Apply bandpass filter
      const filteredSignal = this.bandpassFilter.process([...this.rppgSignal]);
      
      // Detect peaks for heart rate calculation
      const peaks = this.peakDetector.findPeaks(filteredSignal, {
        minPeakHeight: 0.1,
        minPeakDistance: 15 // Minimum 0.5 seconds between peaks at 30fps
      });
      
      if (peaks.length < 2) return null;
      
      // Calculate heart rate from R-R intervals
      const rrIntervals = this.calculateRRIntervals(peaks);
      const heartRate = this.calculateHeartRate(rrIntervals);
      
      // Calculate HRV metrics
      const hrvMetrics = this.calculateHRVMetrics(rrIntervals);
      
      // Frequency domain analysis
      const frequencyMetrics = this.calculateFrequencyMetrics(filteredSignal);
      
      // Signal quality assessment
      this.assessSignalQuality(filteredSignal, peaks);
      
      // Non-linear analysis
      const nonLinearMetrics = this.calculateNonLinearMetrics(rrIntervals);
      
      return {
        timestamp: Date.now(),
        heartRate: Math.round(heartRate),
        confidence: this.signalQuality.confidence,
        signalQuality: this.signalQuality,
        timedomainMetrics: hrvMetrics,
        frequencyMetrics: frequencyMetrics,
        nonLinearMetrics: nonLinearMetrics,
        rawSignal: filteredSignal.slice(-30), // Last 1 second for display
        peaks: peaks
      };
      
    } catch (error) {
      console.error('❌ Signal analysis error:', error);
      return null;
    }
  }

  /**
   * Calculate R-R intervals from detected peaks
   */
  calculateRRIntervals(peaks) {
    const rrIntervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = (peaks[i] - peaks[i-1]) * (1000 / this.samplingRate); // Convert to ms
      if (interval > 300 && interval < 2000) { // Valid R-R interval range
        rrIntervals.push(interval);
      }
    }
    return rrIntervals;
  }

  /**
   * Calculate heart rate from R-R intervals
   */
  calculateHeartRate(rrIntervals) {
    if (rrIntervals.length === 0) return 0;
    
    const avgRRInterval = rrIntervals.reduce((sum, rr) => sum + rr, 0) / rrIntervals.length;
    return 60000 / avgRRInterval; // Convert to BPM
  }

  /**
   * Calculate comprehensive HRV metrics
   */
  calculateHRVMetrics(rrIntervals) {
    if (rrIntervals.length < 5) return {};
    
    return {
      // Time domain metrics
      rmssd: this.statsAnalyzer.calculateRMSSD(rrIntervals),
      pnn50: this.statsAnalyzer.calculatePNN50(rrIntervals),
      sdnn: this.statsAnalyzer.calculateSDNN(rrIntervals),
      triangularIndex: this.statsAnalyzer.calculateTriangularIndex(rrIntervals),
      
      // Additional time domain
      meanRR: rrIntervals.reduce((sum, rr) => sum + rr, 0) / rrIntervals.length,
      medianRR: this.statsAnalyzer.median(rrIntervals),
      modeRR: this.statsAnalyzer.mode(rrIntervals),
      rangeRR: Math.max(...rrIntervals) - Math.min(...rrIntervals),
      
      // Geometric measures
      hrv_index: this.calculateHRVIndex(rrIntervals),
      tinn: this.calculateTINN(rrIntervals)
    };
  }

  /**
   * Calculate frequency domain metrics
   */
  calculateFrequencyMetrics(signal) {
    const fftResult = this.fftProcessor.compute(signal);
    const psd = this.fftProcessor.calculatePSD(fftResult);
    
    // Define frequency bands
    const vlf_band = [0.0033, 0.04];   // Very Low Frequency
    const lf_band = [0.04, 0.15];      // Low Frequency
    const hf_band = [0.15, 0.4];       // High Frequency
    
    const vlf_power = this.calculateBandPower(psd, vlf_band);
    const lf_power = this.calculateBandPower(psd, lf_band);
    const hf_power = this.calculateBandPower(psd, hf_band);
    const total_power = vlf_power + lf_power + hf_power;
    
    return {
      vlf_power: vlf_power,
      lf_power: lf_power,
      hf_power: hf_power,
      total_power: total_power,
      lf_hf_ratio: lf_power / hf_power,
      lf_nu: (lf_power / (lf_power + hf_power)) * 100,
      hf_nu: (hf_power / (lf_power + hf_power)) * 100,
      peak_frequency: this.findPeakFrequency(psd)
    };
  }

  /**
   * Calculate non-linear HRV metrics
   */
  calculateNonLinearMetrics(rrIntervals) {
    if (rrIntervals.length < 10) return {};
    
    return {
      // Poincaré plot analysis
      sd1: this.calculateSD1(rrIntervals),
      sd2: this.calculateSD2(rrIntervals),
      sd_ratio: this.calculateSDRatio(rrIntervals),
      
      // Entropy measures
      sample_entropy: this.calculateSampleEntropy(rrIntervals),
      approximate_entropy: this.calculateApproximateEntropy(rrIntervals),
      
      // Detrended fluctuation analysis
      dfa_alpha1: this.calculateDFA(rrIntervals, [4, 16]),
      dfa_alpha2: this.calculateDFA(rrIntervals, [16, 64]),
      
      // Correlation dimension
      correlation_dimension: this.calculateCorrelationDimension(rrIntervals)
    };
  }

  /**
   * Assess signal quality metrics
   */
  assessSignalQuality(signal, peaks) {
    // Signal-to-noise ratio
    const snr = this.calculateSNR(signal);
    
    // Peak detection confidence
    const peakConfidence = peaks.length > 0 ? Math.min(peaks.length / 10, 1) : 0;
    
    // Signal stability (variance of recent values)
    const recentSignal = signal.slice(-30);
    const stability = 1 - (this.statsAnalyzer.variance(recentSignal) / 100);
    
    // Artifact detection (sudden changes)
    const artifactLevel = this.detectArtifacts(signal);
    
    this.signalQuality = {
      snr: Math.max(0, Math.min(1, snr / 20)), // Normalize to 0-1
      confidence: (peakConfidence + stability + (1 - artifactLevel)) / 3,
      stability: Math.max(0, Math.min(1, stability)),
      artifactLevel: artifactLevel
    };
  }

  /**
   * Calculate signal-to-noise ratio
   */
  calculateSNR(signal) {
    const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const signalPower = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
    const noisePower = this.estimateNoisePower(signal);
    
    return signalPower > 0 && noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;
  }

  /**
   * Estimate noise power in signal
   */
  estimateNoisePower(signal) {
    // Use high-frequency components as noise estimate
    const highFreqSignal = signal.map((val, i) => 
      i > 0 ? Math.abs(val - signal[i-1]) : 0
    );
    
    return highFreqSignal.reduce((sum, val) => sum + val * val, 0) / highFreqSignal.length;
  }

  /**
   * Detect artifacts in signal
   */
  detectArtifacts(signal) {
    let artifactCount = 0;
    const threshold = 3 * this.statsAnalyzer.standardDeviation(signal);
    
    for (let i = 1; i < signal.length; i++) {
      if (Math.abs(signal[i] - signal[i-1]) > threshold) {
        artifactCount++;
      }
    }
    
    return artifactCount / signal.length;
  }

  /**
   * Calculate band power for frequency analysis
   */
  calculateBandPower(psd, band) {
    const [minFreq, maxFreq] = band;
    const freqResolution = this.samplingRate / psd.length;
    
    let power = 0;
    for (let i = 0; i < psd.length; i++) {
      const freq = i * freqResolution;
      if (freq >= minFreq && freq <= maxFreq) {
        power += psd[i];
      }
    }
    
    return power;
  }

  /**
   * Find peak frequency in power spectral density
   */
  findPeakFrequency(psd) {
    let maxPower = 0;
    let peakIndex = 0;
    
    for (let i = 0; i < psd.length; i++) {
      if (psd[i] > maxPower) {
        maxPower = psd[i];
        peakIndex = i;
      }
    }
    
    return (peakIndex * this.samplingRate) / psd.length;
  }

  /**
   * Calculate Poincaré plot SD1
   */
  calculateSD1(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    
    const differences = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      differences.push(rrIntervals[i] - rrIntervals[i-1]);
    }
    
    return this.statsAnalyzer.standardDeviation(differences) / Math.sqrt(2);
  }

  /**
   * Calculate Poincaré plot SD2
   */
  calculateSD2(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    
    const sums = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      sums.push(rrIntervals[i] + rrIntervals[i-1]);
    }
    
    return this.statsAnalyzer.standardDeviation(sums) / Math.sqrt(2);
  }

  /**
   * Calculate SD1/SD2 ratio
   */
  calculateSDRatio(rrIntervals) {
    const sd1 = this.calculateSD1(rrIntervals);
    const sd2 = this.calculateSD2(rrIntervals);
    
    return sd2 > 0 ? sd1 / sd2 : 0;
  }

  /**
   * Calculate sample entropy
   */
  calculateSampleEntropy(data, m = 2, r = 0.2) {
    const N = data.length;
    const patterns = [];
    
    // This is a simplified implementation
    // Full implementation would require more complex pattern matching
    let matches = 0;
    let total = 0;
    
    for (let i = 0; i < N - m; i++) {
      for (let j = i + 1; j < N - m; j++) {
        let match = true;
        for (let k = 0; k < m; k++) {
          if (Math.abs(data[i + k] - data[j + k]) > r * this.statsAnalyzer.standardDeviation(data)) {
            match = false;
            break;
          }
        }
        if (match) matches++;
        total++;
      }
    }
    
    return total > 0 ? -Math.log(matches / total) : 0;
  }

  /**
   * Calculate approximate entropy
   */
  calculateApproximateEntropy(data, m = 2, r = 0.2) {
    // Simplified implementation of ApEn
    return this.calculateSampleEntropy(data, m, r) * 0.8; // Approximation
  }

  /**
   * Calculate Detrended Fluctuation Analysis
   */
  calculateDFA(data, scaleRange) {
    // Simplified DFA implementation
    const [minScale, maxScale] = scaleRange;
    let sumLogF = 0;
    let sumLogN = 0;
    let count = 0;
    
    for (let n = minScale; n <= maxScale; n += 2) {
      const fluctuation = this.calculateFluctuation(data, n);
      if (fluctuation > 0) {
        sumLogF += Math.log(fluctuation);
        sumLogN += Math.log(n);
        count++;
      }
    }
    
    return count > 0 ? sumLogF / sumLogN : 1.0;
  }

  /**
   * Calculate fluctuation for DFA
   */
  calculateFluctuation(data, windowSize) {
    if (data.length < windowSize * 2) return 0;
    
    let totalFluctuation = 0;
    let windowCount = 0;
    
    for (let i = 0; i <= data.length - windowSize; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      const trend = this.calculateLinearTrend(window);
      
      let fluctuation = 0;
      for (let j = 0; j < window.length; j++) {
        const detrended = window[j] - (trend.slope * j + trend.intercept);
        fluctuation += detrended * detrended;
      }
      
      totalFluctuation += Math.sqrt(fluctuation / window.length);
      windowCount++;
    }
    
    return windowCount > 0 ? totalFluctuation / windowCount : 0;
  }

  /**
   * Calculate linear trend for detrending
   */
  calculateLinearTrend(data) {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + val * i, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  /**
   * Calculate correlation dimension
   */
  calculateCorrelationDimension(data) {
    // Simplified correlation dimension calculation
    const embeddingDim = 3;
    const delays = [1, 2, 3];
    
    let totalCorrelation = 0;
    let count = 0;
    
    for (const delay of delays) {
      const embedded = this.embedTimeSeries(data, embeddingDim, delay);
      const correlation = this.calculateCorrelationSum(embedded);
      totalCorrelation += correlation;
      count++;
    }
    
    return count > 0 ? totalCorrelation / count : 2.0;
  }

  /**
   * Embed time series for phase space reconstruction
   */
  embedTimeSeries(data, dimension, delay) {
    const embedded = [];
    for (let i = 0; i <= data.length - dimension * delay; i++) {
      const vector = [];
      for (let j = 0; j < dimension; j++) {
        vector.push(data[i + j * delay]);
      }
      embedded.push(vector);
    }
    return embedded;
  }

  /**
   * Calculate correlation sum for embedded data
   */
  calculateCorrelationSum(embedded) {
    let correlationSum = 0;
    const threshold = 0.1;
    
    for (let i = 0; i < embedded.length; i++) {
      for (let j = i + 1; j < embedded.length; j++) {
        const distance = this.euclideanDistance(embedded[i], embedded[j]);
        if (distance < threshold) {
          correlationSum++;
        }
      }
    }
    
    const totalPairs = (embedded.length * (embedded.length - 1)) / 2;
    return totalPairs > 0 ? correlationSum / totalPairs : 0;
  }

  /**
   * Calculate Euclidean distance between vectors
   */
  euclideanDistance(vector1, vector2) {
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculate HRV Index
   */
  calculateHRVIndex(rrIntervals) {
    // Create histogram of RR intervals
    const binWidth = 7.8125; // Standard bin width in ms
    const histogram = {};
    
    rrIntervals.forEach(rr => {
      const bin = Math.floor(rr / binWidth) * binWidth;
      histogram[bin] = (histogram[bin] || 0) + 1;
    });
    
    // Find mode (most frequent bin)
    const maxCount = Math.max(...Object.values(histogram));
    
    return rrIntervals.length > 0 ? maxCount / rrIntervals.length : 0;
  }

  /**
   * Calculate TINN (Triangular Interpolation of NN interval histogram)
   */
  calculateTINN(rrIntervals) {
    if (rrIntervals.length < 20) return 0;
    
    const min = Math.min(...rrIntervals);
    const max = Math.max(...rrIntervals);
    
    // Simplified TINN calculation
    return max - min;
  }

  /**
   * Get comprehensive cardiovascular analysis
   */
  getCardiovascularAnalysis() {
    const currentTime = Date.now();
    
    // Only analyze if enough time has passed
    if (currentTime - this.lastAnalysisTime < this.analysisInterval) {
      return null;
    }
    
    this.lastAnalysisTime = currentTime;
    
    if (this.rppgSignal.length < 90) {
      return {
        status: 'insufficient_data',
        message: 'Collecting signal data...',
        progress: Math.round((this.rppgSignal.length / 90) * 100)
      };
    }
    
    const analysis = this.analyzeSignal();
    
    if (!analysis) {
      return {
        status: 'analysis_failed',
        message: 'Signal analysis failed',
        signalQuality: this.signalQuality
      };
    }
    
    return {
      status: 'success',
      timestamp: analysis.timestamp,
      cardiovascularMetrics: {
        // Primary metrics
        heartRate: analysis.heartRate,
        heartRateVariability: analysis.timedomainMetrics.rmssd,
        signalQuality: analysis.confidence,
        
        // Time domain HRV
        rmssd: analysis.timedomainMetrics.rmssd,
        pnn50: analysis.timedomainMetrics.pnn50,
        sdnn: analysis.timedomainMetrics.sdnn,
        triangularIndex: analysis.timedomainMetrics.triangularIndex,
        meanRR: analysis.timedomainMetrics.meanRR,
        medianRR: analysis.timedomainMetrics.medianRR,
        rangeRR: analysis.timedomainMetrics.rangeRR,
        
        // Frequency domain
        vlfPower: analysis.frequencyMetrics.vlf_power,
        lfPower: analysis.frequencyMetrics.lf_power,
        hfPower: analysis.frequencyMetrics.hf_power,
        totalPower: analysis.frequencyMetrics.total_power,
        lfHfRatio: analysis.frequencyMetrics.lf_hf_ratio,
        lfNormalized: analysis.frequencyMetrics.lf_nu,
        hfNormalized: analysis.frequencyMetrics.hf_nu,
        
        // Non-linear metrics
        sd1: analysis.nonLinearMetrics.sd1,
        sd2: analysis.nonLinearMetrics.sd2,
        sdRatio: analysis.nonLinearMetrics.sd_ratio,
        sampleEntropy: analysis.nonLinearMetrics.sample_entropy,
        approximateEntropy: analysis.nonLinearMetrics.approximate_entropy,
        dfaAlpha1: analysis.nonLinearMetrics.dfa_alpha1,
        dfaAlpha2: analysis.nonLinearMetrics.dfa_alpha2,
        correlationDimension: analysis.nonLinearMetrics.correlation_dimension,
        
        // Signal quality metrics
        snr: this.signalQuality.snr,
        stability: this.signalQuality.stability,
        artifactLevel: this.signalQuality.artifactLevel
      },
      rawData: {
        signal: analysis.rawSignal,
        peaks: analysis.peaks,
        signalLength: this.rppgSignal.length
      }
    };
  }

  /**
   * Reset analysis state
   */
  reset() {
    this.rppgSignal = [];
    this.heartRateBuffer = [];
    this.signalQuality = {
      snr: 0,
      confidence: 0,
      stability: 0,
      artifactLevel: 0
    };
    this.lastAnalysisTime = 0;
    console.log('🔄 rPPG analysis reset');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.reset();
    this.isInitialized = false;
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
    console.log('🧹 rPPG engine cleaned up');
  }
}

export default RealTimeRPPG;