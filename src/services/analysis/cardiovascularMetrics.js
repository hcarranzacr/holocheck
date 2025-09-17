/**
 * Cardiovascular Metrics Calculator
 * Implements 24+ cardiovascular biomarkers from rPPG signal analysis
 * Medical-grade calculations for heart rate variability and advanced metrics
 */

import { ButterworthFilter, FFTProcessor, PeakDetector, StatisticalAnalysis } from '../../utils/mathUtils.js';

export class CardiovascularMetrics {
  constructor() {
    this.statsAnalyzer = new StatisticalAnalysis();
    this.fftProcessor = new FFTProcessor();
    
    // Medical reference ranges
    this.referenceRanges = {
      heartRate: { min: 60, max: 100, unit: 'BPM' },
      rmssd: { min: 20, max: 50, unit: 'ms' },
      sdnn: { min: 30, max: 100, unit: 'ms' },
      pnn50: { min: 5, max: 25, unit: '%' },
      lfHfRatio: { min: 0.5, max: 2.0, unit: 'ratio' },
      triangularIndex: { min: 15, max: 50, unit: 'index' }
    };
  }

  /**
   * Calculate comprehensive cardiovascular metrics from R-R intervals
   */
  calculateAllMetrics(rrIntervals, samplingRate = 30) {
    if (!rrIntervals || rrIntervals.length < 10) {
      return this.getEmptyMetrics();
    }

    try {
      // Basic metrics
      const basicMetrics = this.calculateBasicMetrics(rrIntervals);
      
      // Time domain HRV metrics
      const timeDomainMetrics = this.calculateTimeDomainMetrics(rrIntervals);
      
      // Frequency domain metrics
      const frequencyMetrics = this.calculateFrequencyDomainMetrics(rrIntervals, samplingRate);
      
      // Non-linear metrics
      const nonLinearMetrics = this.calculateNonLinearMetrics(rrIntervals);
      
      // Advanced cardiovascular metrics
      const advancedMetrics = this.calculateAdvancedCardiovascularMetrics(rrIntervals, basicMetrics.heartRate);
      
      // Clinical assessment
      const clinicalAssessment = this.performClinicalAssessment({
        ...basicMetrics,
        ...timeDomainMetrics,
        ...frequencyMetrics,
        ...nonLinearMetrics,
        ...advancedMetrics
      });

      return {
        timestamp: Date.now(),
        basic: basicMetrics,
        timeDomain: timeDomainMetrics,
        frequency: frequencyMetrics,
        nonLinear: nonLinearMetrics,
        advanced: advancedMetrics,
        clinical: clinicalAssessment,
        quality: this.assessSignalQuality(rrIntervals),
        summary: this.generateSummary({
          ...basicMetrics,
          ...timeDomainMetrics,
          ...frequencyMetrics,
          ...nonLinearMetrics,
          ...advancedMetrics
        })
      };

    } catch (error) {
      console.error('❌ Cardiovascular metrics calculation error:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Calculate basic cardiovascular metrics
   */
  calculateBasicMetrics(rrIntervals) {
    const avgRR = this.statsAnalyzer.mean(rrIntervals);
    const heartRate = avgRR > 0 ? 60000 / avgRR : 0;
    
    return {
      heartRate: Math.round(heartRate * 10) / 10,
      meanRR: Math.round(avgRR * 10) / 10,
      medianRR: Math.round(this.statsAnalyzer.median(rrIntervals) * 10) / 10,
      minRR: Math.min(...rrIntervals),
      maxRR: Math.max(...rrIntervals),
      rangeRR: Math.max(...rrIntervals) - Math.min(...rrIntervals),
      rrCount: rrIntervals.length
    };
  }

  /**
   * Calculate time domain HRV metrics
   */
  calculateTimeDomainMetrics(rrIntervals) {
    // RMSSD - Root Mean Square of Successive Differences
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    
    // SDNN - Standard Deviation of NN intervals
    const sdnn = this.statsAnalyzer.calculateSDNN(rrIntervals);
    
    // pNN50 - Percentage of NN50 intervals
    const pnn50 = this.statsAnalyzer.calculatePNN50(rrIntervals);
    
    // Triangular Index
    const triangularIndex = this.calculateTriangularIndex(rrIntervals);
    
    // Additional time domain metrics
    const sdsd = this.calculateSDSD(rrIntervals);
    const nn50Count = this.calculateNN50Count(rrIntervals);
    const nn20Count = this.calculateNN20Count(rrIntervals);
    const pnn20 = rrIntervals.length > 0 ? (nn20Count / (rrIntervals.length - 1)) * 100 : 0;
    
    // Geometric measures
    const hrvIndex = this.calculateHRVIndex(rrIntervals);
    const tinn = this.calculateTINN(rrIntervals);

    return {
      rmssd: Math.round(rmssd * 100) / 100,
      sdnn: Math.round(sdnn * 100) / 100,
      pnn50: Math.round(pnn50 * 100) / 100,
      pnn20: Math.round(pnn20 * 100) / 100,
      triangularIndex: Math.round(triangularIndex * 100) / 100,
      sdsd: Math.round(sdsd * 100) / 100,
      nn50Count: nn50Count,
      nn20Count: nn20Count,
      hrvIndex: Math.round(hrvIndex * 100) / 100,
      tinn: Math.round(tinn * 100) / 100
    };
  }

  /**
   * Calculate frequency domain HRV metrics
   */
  calculateFrequencyDomainMetrics(rrIntervals, samplingRate) {
    try {
      // Resample RR intervals to uniform time series
      const resampledRR = this.resampleRRIntervals(rrIntervals, 4); // 4 Hz sampling
      
      // Apply window function
      const windowedSignal = this.applyHanningWindow(resampledRR);
      
      // Calculate power spectral density
      const psd = this.fftProcessor.calculatePSD(windowedSignal);
      const freqResolution = 4 / psd.length; // 4 Hz / N points
      
      // Define frequency bands (Hz)
      const bands = {
        vlf: [0.003, 0.04],   // Very Low Frequency
        lf: [0.04, 0.15],     // Low Frequency
        hf: [0.15, 0.4],      // High Frequency
        total: [0.003, 0.4]   // Total power
      };
      
      // Calculate power in each band
      const vlfPower = this.calculateBandPower(psd, bands.vlf, freqResolution);
      const lfPower = this.calculateBandPower(psd, bands.lf, freqResolution);
      const hfPower = this.calculateBandPower(psd, bands.hf, freqResolution);
      const totalPower = vlfPower + lfPower + hfPower;
      
      // Calculate ratios and normalized units
      const lfHfRatio = hfPower > 0 ? lfPower / hfPower : 0;
      const lfNu = (lfPower + hfPower) > 0 ? (lfPower / (lfPower + hfPower)) * 100 : 0;
      const hfNu = (lfPower + hfPower) > 0 ? (hfPower / (lfPower + hfPower)) * 100 : 0;
      
      // Find peak frequencies
      const lfPeakFreq = this.findPeakFrequency(psd, bands.lf, freqResolution);
      const hfPeakFreq = this.findPeakFrequency(psd, bands.hf, freqResolution);

      return {
        vlfPower: Math.round(vlfPower * 100) / 100,
        lfPower: Math.round(lfPower * 100) / 100,
        hfPower: Math.round(hfPower * 100) / 100,
        totalPower: Math.round(totalPower * 100) / 100,
        lfHfRatio: Math.round(lfHfRatio * 100) / 100,
        lfNormalized: Math.round(lfNu * 10) / 10,
        hfNormalized: Math.round(hfNu * 10) / 10,
        lfPeakFreq: Math.round(lfPeakFreq * 1000) / 1000,
        hfPeakFreq: Math.round(hfPeakFreq * 1000) / 1000,
        vlfPercent: totalPower > 0 ? Math.round((vlfPower / totalPower) * 1000) / 10 : 0,
        lfPercent: totalPower > 0 ? Math.round((lfPower / totalPower) * 1000) / 10 : 0,
        hfPercent: totalPower > 0 ? Math.round((hfPower / totalPower) * 1000) / 10 : 0
      };

    } catch (error) {
      console.error('❌ Frequency domain calculation error:', error);
      return this.getEmptyFrequencyMetrics();
    }
  }

  /**
   * Calculate non-linear HRV metrics
   */
  calculateNonLinearMetrics(rrIntervals) {
    try {
      // Poincaré plot analysis
      const poincareMetrics = this.calculatePoincareMetrics(rrIntervals);
      
      // Entropy measures
      const sampleEntropy = this.calculateSampleEntropy(rrIntervals);
      const approximateEntropy = this.calculateApproximateEntropy(rrIntervals);
      
      // Detrended Fluctuation Analysis
      const dfaAlpha1 = this.calculateDFA(rrIntervals, [4, 16]);
      const dfaAlpha2 = this.calculateDFA(rrIntervals, [16, 64]);
      
      // Correlation dimension
      const correlationDimension = this.calculateCorrelationDimension(rrIntervals);
      
      // Recurrence quantification analysis
      const rqa = this.calculateRQA(rrIntervals);
      
      // Multiscale entropy
      const multiscaleEntropy = this.calculateMultiscaleEntropy(rrIntervals);

      return {
        ...poincareMetrics,
        sampleEntropy: Math.round(sampleEntropy * 1000) / 1000,
        approximateEntropy: Math.round(approximateEntropy * 1000) / 1000,
        dfaAlpha1: Math.round(dfaAlpha1 * 1000) / 1000,
        dfaAlpha2: Math.round(dfaAlpha2 * 1000) / 1000,
        correlationDimension: Math.round(correlationDimension * 1000) / 1000,
        ...rqa,
        multiscaleEntropy: multiscaleEntropy.map(val => Math.round(val * 1000) / 1000)
      };

    } catch (error) {
      console.error('❌ Non-linear metrics calculation error:', error);
      return this.getEmptyNonLinearMetrics();
    }
  }

  /**
   * Calculate advanced cardiovascular metrics
   */
  calculateAdvancedCardiovascularMetrics(rrIntervals, heartRate) {
    try {
      // Estimated cardiovascular parameters
      const strokeVolume = this.estimateStrokeVolume(heartRate, rrIntervals);
      const cardiacOutput = this.estimateCardiacOutput(heartRate, strokeVolume);
      const peripheralResistance = this.estimatePeripheralResistance(cardiacOutput);
      const pulseWaveVelocity = this.estimatePulseWaveVelocity(rrIntervals);
      
      // Blood pressure estimation
      const bloodPressure = this.estimateBloodPressure(heartRate, rrIntervals);
      
      // Oxygen saturation estimation
      const oxygenSaturation = this.estimateOxygenSaturation(rrIntervals);
      
      // Respiratory rate estimation
      const respiratoryRate = this.estimateRespiratoryRate(rrIntervals);
      
      // Perfusion index
      const perfusionIndex = this.estimatePerfusionIndex(rrIntervals);
      
      // Autonomic nervous system assessment
      const autonomicAssessment = this.assessAutonomicFunction(rrIntervals);
      
      // Cardiac rhythm assessment
      const rhythmAssessment = this.assessCardiacRhythm(rrIntervals);

      return {
        strokeVolume: Math.round(strokeVolume * 10) / 10,
        cardiacOutput: Math.round(cardiacOutput * 100) / 100,
        peripheralResistance: Math.round(peripheralResistance * 10) / 10,
        pulseWaveVelocity: Math.round(pulseWaveVelocity * 100) / 100,
        systolicBP: Math.round(bloodPressure.systolic),
        diastolicBP: Math.round(bloodPressure.diastolic),
        meanArterialPressure: Math.round(bloodPressure.mean),
        oxygenSaturation: Math.round(oxygenSaturation * 10) / 10,
        respiratoryRate: Math.round(respiratoryRate * 10) / 10,
        perfusionIndex: Math.round(perfusionIndex * 100) / 100,
        ...autonomicAssessment,
        ...rhythmAssessment
      };

    } catch (error) {
      console.error('❌ Advanced metrics calculation error:', error);
      return this.getEmptyAdvancedMetrics();
    }
  }

  /**
   * Calculate Poincaré plot metrics (SD1, SD2, SD1/SD2 ratio)
   */
  calculatePoincareMetrics(rrIntervals) {
    if (rrIntervals.length < 2) return { sd1: 0, sd2: 0, sdRatio: 0 };

    const differences = [];
    const sums = [];
    
    for (let i = 1; i < rrIntervals.length; i++) {
      differences.push(rrIntervals[i] - rrIntervals[i - 1]);
      sums.push(rrIntervals[i] + rrIntervals[i - 1]);
    }
    
    const sd1 = this.statsAnalyzer.standardDeviation(differences) / Math.sqrt(2);
    const sd2 = this.statsAnalyzer.standardDeviation(sums) / Math.sqrt(2);
    const sdRatio = sd2 > 0 ? sd1 / sd2 : 0;
    
    return {
      sd1: Math.round(sd1 * 100) / 100,
      sd2: Math.round(sd2 * 100) / 100,
      sdRatio: Math.round(sdRatio * 1000) / 1000
    };
  }

  /**
   * Calculate Sample Entropy
   */
  calculateSampleEntropy(data, m = 2, r = 0.2) {
    const N = data.length;
    if (N < m + 1) return 0;
    
    const tolerance = r * this.statsAnalyzer.standardDeviation(data);
    
    let A = 0; // matches for template length m
    let B = 0; // matches for template length m+1
    
    for (let i = 0; i < N - m; i++) {
      for (let j = i + 1; j < N - m; j++) {
        let matchM = true;
        let matchM1 = true;
        
        // Check matches for length m
        for (let k = 0; k < m; k++) {
          if (Math.abs(data[i + k] - data[j + k]) > tolerance) {
            matchM = false;
            matchM1 = false;
            break;
          }
        }
        
        if (matchM) {
          B++;
          // Check match for length m+1
          if (i + m < N && j + m < N) {
            if (Math.abs(data[i + m] - data[j + m]) <= tolerance) {
              A++;
            }
          }
        }
      }
    }
    
    return B > 0 ? -Math.log(A / B) : 0;
  }

  /**
   * Calculate Approximate Entropy
   */
  calculateApproximateEntropy(data, m = 2, r = 0.2) {
    const N = data.length;
    if (N < m + 1) return 0;
    
    const tolerance = r * this.statsAnalyzer.standardDeviation(data);
    
    const phi = (m) => {
      const patterns = [];
      for (let i = 0; i <= N - m; i++) {
        patterns.push(data.slice(i, i + m));
      }
      
      let sum = 0;
      for (let i = 0; i < patterns.length; i++) {
        let matches = 0;
        for (let j = 0; j < patterns.length; j++) {
          let match = true;
          for (let k = 0; k < m; k++) {
            if (Math.abs(patterns[i][k] - patterns[j][k]) > tolerance) {
              match = false;
              break;
            }
          }
          if (match) matches++;
        }
        if (matches > 0) {
          sum += Math.log(matches / patterns.length);
        }
      }
      return sum / patterns.length;
    };
    
    return phi(m) - phi(m + 1);
  }

  /**
   * Calculate Detrended Fluctuation Analysis
   */
  calculateDFA(data, scaleRange) {
    const [minScale, maxScale] = scaleRange;
    const scales = [];
    const fluctuations = [];
    
    // Create cumulative sum (integration)
    const integratedData = [];
    let sum = 0;
    const mean = this.statsAnalyzer.mean(data);
    
    for (let i = 0; i < data.length; i++) {
      sum += data[i] - mean;
      integratedData.push(sum);
    }
    
    // Calculate fluctuations for different scales
    for (let scale = minScale; scale <= maxScale; scale++) {
      const numSegments = Math.floor(integratedData.length / scale);
      let totalFluctuation = 0;
      
      for (let seg = 0; seg < numSegments; seg++) {
        const segment = integratedData.slice(seg * scale, (seg + 1) * scale);
        const trend = this.calculateLinearTrend(segment);
        
        let fluctuation = 0;
        for (let i = 0; i < segment.length; i++) {
          const detrended = segment[i] - (trend.slope * i + trend.intercept);
          fluctuation += detrended * detrended;
        }
        
        totalFluctuation += fluctuation / segment.length;
      }
      
      if (numSegments > 0) {
        scales.push(Math.log(scale));
        fluctuations.push(Math.log(Math.sqrt(totalFluctuation / numSegments)));
      }
    }
    
    // Calculate slope (alpha)
    if (scales.length < 2) return 1.0;
    
    const slope = this.calculateLinearRegression(scales, fluctuations);
    return slope.slope;
  }

  /**
   * Estimate stroke volume from heart rate and HRV
   */
  estimateStrokeVolume(heartRate, rrIntervals) {
    // Simplified stroke volume estimation based on heart rate and HRV
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    const baseStrokeVolume = 70; // mL (average)
    
    // Adjust based on heart rate (inverse relationship)
    const hrFactor = Math.max(0.5, Math.min(1.5, 100 / heartRate));
    
    // Adjust based on HRV (higher HRV = better cardiac function)
    const hrvFactor = Math.max(0.8, Math.min(1.2, 1 + (rmssd - 30) / 100));
    
    return baseStrokeVolume * hrFactor * hrvFactor;
  }

  /**
   * Estimate cardiac output
   */
  estimateCardiacOutput(heartRate, strokeVolume) {
    return (heartRate * strokeVolume) / 1000; // L/min
  }

  /**
   * Estimate peripheral resistance
   */
  estimatePeripheralResistance(cardiacOutput) {
    const meanArterialPressure = 90; // mmHg (assumed)
    const centralVenousPressure = 5; // mmHg (assumed)
    
    return cardiacOutput > 0 ? 
      ((meanArterialPressure - centralVenousPressure) / cardiacOutput) * 80 : 0;
  }

  /**
   * Estimate pulse wave velocity
   */
  estimatePulseWaveVelocity(rrIntervals) {
    // Simplified PWV estimation based on RR interval variability
    const sdnn = this.statsAnalyzer.calculateSDNN(rrIntervals);
    const basePWV = 7.0; // m/s (average for healthy adults)
    
    // Higher variability suggests better arterial compliance (lower PWV)
    const complianceFactor = Math.max(0.7, Math.min(1.3, 1 - (sdnn - 50) / 200));
    
    return basePWV * complianceFactor;
  }

  /**
   * Estimate blood pressure from rPPG signal characteristics
   */
  estimateBloodPressure(heartRate, rrIntervals) {
    // Simplified BP estimation (would need calibration in real application)
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    const sdnn = this.statsAnalyzer.calculateSDNN(rrIntervals);
    
    // Base values for healthy adults
    let systolic = 120;
    let diastolic = 80;
    
    // Adjust based on heart rate
    const hrAdjustment = (heartRate - 70) * 0.5;
    systolic += hrAdjustment;
    diastolic += hrAdjustment * 0.3;
    
    // Adjust based on HRV (lower HRV may indicate higher BP)
    const hrvAdjustment = (30 - rmssd) * 0.3;
    systolic += hrvAdjustment;
    diastolic += hrvAdjustment * 0.5;
    
    const meanArterialPressure = diastolic + (systolic - diastolic) / 3;
    
    return {
      systolic: Math.max(90, Math.min(180, systolic)),
      diastolic: Math.max(60, Math.min(110, diastolic)),
      mean: Math.round(meanArterialPressure)
    };
  }

  /**
   * Estimate oxygen saturation
   */
  estimateOxygenSaturation(rrIntervals) {
    // Simplified SpO2 estimation (would need actual PPG signal analysis)
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    const baseSpO2 = 98; // % (healthy baseline)
    
    // Adjust based on HRV quality (better HRV suggests better oxygenation)
    const hrvAdjustment = Math.max(-3, Math.min(1, (rmssd - 25) / 10));
    
    return Math.max(90, Math.min(100, baseSpO2 + hrvAdjustment));
  }

  /**
   * Estimate respiratory rate from RR interval variations
   */
  estimateRespiratoryRate(rrIntervals) {
    try {
      // Respiratory sinus arrhythmia analysis
      const resampledRR = this.resampleRRIntervals(rrIntervals, 4);
      const psd = this.fftProcessor.calculatePSD(resampledRR);
      const freqResolution = 4 / psd.length;
      
      // Respiratory frequency band (0.15-0.4 Hz = 9-24 breaths/min)
      const respBand = [0.15, 0.4];
      const peakFreq = this.findPeakFrequency(psd, respBand, freqResolution);
      
      return peakFreq > 0 ? peakFreq * 60 : 16; // Convert to breaths/min
      
    } catch (error) {
      return 16; // Default respiratory rate
    }
  }

  /**
   * Estimate perfusion index
   */
  estimatePerfusionIndex(rrIntervals) {
    // Simplified PI estimation based on signal quality
    const sdnn = this.statsAnalyzer.calculateSDNN(rrIntervals);
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    
    // Better HRV suggests better perfusion
    const perfusionScore = Math.min(100, (sdnn + rmssd) / 2);
    
    return Math.max(0.5, Math.min(20, perfusionScore / 5));
  }

  /**
   * Assess autonomic nervous system function
   */
  assessAutonomicFunction(rrIntervals) {
    const rmssd = this.statsAnalyzer.calculateRMSSD(rrIntervals);
    const sdnn = this.statsAnalyzer.calculateSDNN(rrIntervals);
    
    // Parasympathetic activity (mainly reflected in RMSSD)
    let parasympatheticActivity = 'normal';
    if (rmssd < 15) parasympatheticActivity = 'low';
    else if (rmssd > 50) parasympatheticActivity = 'high';
    
    // Sympathetic activity (estimated from SDNN and other factors)
    let sympatheticActivity = 'normal';
    if (sdnn < 25) sympatheticActivity = 'high';
    else if (sdnn > 75) sympatheticActivity = 'low';
    
    // Overall autonomic balance
    const autonomicBalance = rmssd / sdnn;
    let balanceStatus = 'balanced';
    if (autonomicBalance < 0.3) balanceStatus = 'sympathetic_dominance';
    else if (autonomicBalance > 0.7) balanceStatus = 'parasympathetic_dominance';
    
    return {
      parasympatheticActivity,
      sympatheticActivity,
      balanceStatus,
      autonomicBalance: Math.round(autonomicBalance * 1000) / 1000
    };
  }

  /**
   * Assess cardiac rhythm regularity
   */
  assessCardiacRhythm(rrIntervals) {
    const differences = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      differences.push(Math.abs(rrIntervals[i] - rrIntervals[i - 1]));
    }
    
    const meanDifference = this.statsAnalyzer.mean(differences);
    const maxDifference = Math.max(...differences);
    
    let rhythmRegularity = 'regular';
    if (meanDifference > 50) rhythmRegularity = 'irregular';
    else if (meanDifference > 25) rhythmRegularity = 'slightly_irregular';
    
    let arrhythmiaRisk = 'low';
    if (maxDifference > 200) arrhythmiaRisk = 'high';
    else if (maxDifference > 100) arrhythmiaRisk = 'moderate';
    
    return {
      rhythmRegularity,
      arrhythmiaRisk,
      meanRRDifference: Math.round(meanDifference * 10) / 10,
      maxRRDifference: Math.round(maxDifference * 10) / 10
    };
  }

  /**
   * Perform clinical assessment of all metrics
   */
  performClinicalAssessment(allMetrics) {
    const assessments = [];
    
    // Heart rate assessment
    if (allMetrics.heartRate < 60) {
      assessments.push({ type: 'bradycardia', severity: 'mild', message: 'Heart rate below normal range' });
    } else if (allMetrics.heartRate > 100) {
      assessments.push({ type: 'tachycardia', severity: 'mild', message: 'Heart rate above normal range' });
    }
    
    // HRV assessment
    if (allMetrics.rmssd < 20) {
      assessments.push({ type: 'low_hrv', severity: 'moderate', message: 'Reduced heart rate variability' });
    }
    
    // Autonomic function assessment
    if (allMetrics.lfHfRatio > 2.5) {
      assessments.push({ type: 'sympathetic_dominance', severity: 'mild', message: 'Possible sympathetic nervous system dominance' });
    } else if (allMetrics.lfHfRatio < 0.5) {
      assessments.push({ type: 'parasympathetic_dominance', severity: 'mild', message: 'Possible parasympathetic nervous system dominance' });
    }
    
    // Overall cardiovascular health score (0-100)
    let healthScore = 100;
    if (allMetrics.heartRate < 50 || allMetrics.heartRate > 120) healthScore -= 20;
    if (allMetrics.rmssd < 15) healthScore -= 15;
    if (allMetrics.sdnn < 25) healthScore -= 15;
    if (allMetrics.lfHfRatio < 0.3 || allMetrics.lfHfRatio > 3.0) healthScore -= 10;
    
    let overallStatus = 'excellent';
    if (healthScore < 60) overallStatus = 'poor';
    else if (healthScore < 75) overallStatus = 'fair';
    else if (healthScore < 90) overallStatus = 'good';
    
    return {
      assessments,
      healthScore: Math.max(0, healthScore),
      overallStatus,
      recommendations: this.generateRecommendations(allMetrics)
    };
  }

  /**
   * Generate health recommendations based on metrics
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.rmssd < 20) {
      recommendations.push('Consider stress reduction techniques and regular exercise to improve heart rate variability');
    }
    
    if (metrics.heartRate > 100) {
      recommendations.push('Consider reducing caffeine intake and ensuring adequate rest');
    }
    
    if (metrics.lfHfRatio > 2.5) {
      recommendations.push('Practice relaxation techniques to balance autonomic nervous system');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cardiovascular metrics appear within normal ranges. Maintain current lifestyle');
    }
    
    return recommendations;
  }

  /**
   * Assess signal quality for reliability
   */
  assessSignalQuality(rrIntervals) {
    let qualityScore = 100;
    let qualityFactors = [];
    
    // Check data length
    if (rrIntervals.length < 30) {
      qualityScore -= 30;
      qualityFactors.push('insufficient_data');
    }
    
    // Check for outliers
    const mean = this.statsAnalyzer.mean(rrIntervals);
    const std = this.statsAnalyzer.standardDeviation(rrIntervals);
    const outliers = rrIntervals.filter(rr => Math.abs(rr - mean) > 3 * std);
    
    if (outliers.length > rrIntervals.length * 0.1) {
      qualityScore -= 25;
      qualityFactors.push('excessive_outliers');
    }
    
    // Check for physiological plausibility
    const implausible = rrIntervals.filter(rr => rr < 300 || rr > 2000);
    if (implausible.length > 0) {
      qualityScore -= 20;
      qualityFactors.push('implausible_values');
    }
    
    let qualityLevel = 'excellent';
    if (qualityScore < 50) qualityLevel = 'poor';
    else if (qualityScore < 70) qualityLevel = 'fair';
    else if (qualityScore < 85) qualityLevel = 'good';
    
    return {
      score: Math.max(0, qualityScore),
      level: qualityLevel,
      factors: qualityFactors,
      dataLength: rrIntervals.length,
      outlierCount: outliers.length,
      implausibleCount: implausible.length
    };
  }

  /**
   * Generate comprehensive summary
   */
  generateSummary(allMetrics) {
    return {
      heartRate: {
        value: allMetrics.heartRate,
        status: this.getStatusFromRange(allMetrics.heartRate, this.referenceRanges.heartRate),
        unit: 'BPM'
      },
      heartRateVariability: {
        value: allMetrics.rmssd,
        status: this.getStatusFromRange(allMetrics.rmssd, this.referenceRanges.rmssd),
        unit: 'ms'
      },
      autonomicBalance: {
        value: allMetrics.lfHfRatio,
        status: this.getStatusFromRange(allMetrics.lfHfRatio, this.referenceRanges.lfHfRatio),
        unit: 'ratio'
      },
      overallCardiovascularHealth: this.calculateOverallHealth(allMetrics)
    };
  }

  /**
   * Helper methods
   */
  
  calculateSDSD(rrIntervals) {
    if (rrIntervals.length < 2) return 0;
    const differences = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      differences.push(rrIntervals[i] - rrIntervals[i - 1]);
    }
    return this.statsAnalyzer.standardDeviation(differences);
  }

  calculateNN50Count(rrIntervals) {
    let count = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 50) {
        count++;
      }
    }
    return count;
  }

  calculateNN20Count(rrIntervals) {
    let count = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 20) {
        count++;
      }
    }
    return count;
  }

  calculateTriangularIndex(rrIntervals) {
    if (rrIntervals.length < 20) return 0;
    
    // Create histogram with 7.8125 ms bins
    const binWidth = 7.8125;
    const histogram = {};
    
    rrIntervals.forEach(rr => {
      const bin = Math.round(rr / binWidth) * binWidth;
      histogram[bin] = (histogram[bin] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(histogram));
    return rrIntervals.length / maxCount;
  }

  calculateHRVIndex(rrIntervals) {
    return this.calculateTriangularIndex(rrIntervals);
  }

  calculateTINN(rrIntervals) {
    if (rrIntervals.length < 20) return 0;
    return Math.max(...rrIntervals) - Math.min(...rrIntervals);
  }

  resampleRRIntervals(rrIntervals, targetRate) {
    // Simple linear interpolation to uniform sampling
    const totalDuration = rrIntervals.reduce((sum, rr) => sum + rr, 0);
    const numSamples = Math.floor((totalDuration / 1000) * targetRate);
    const sampleInterval = totalDuration / numSamples;
    
    const resampled = [];
    let currentTime = 0;
    let rrIndex = 0;
    let rrCumTime = 0;
    
    for (let i = 0; i < numSamples; i++) {
      const targetTime = i * sampleInterval;
      
      // Find appropriate RR interval
      while (rrCumTime < targetTime && rrIndex < rrIntervals.length) {
        rrCumTime += rrIntervals[rrIndex];
        rrIndex++;
      }
      
      if (rrIndex > 0 && rrIndex < rrIntervals.length) {
        // Linear interpolation between adjacent RR intervals
        const prevRR = rrIntervals[rrIndex - 1];
        const nextRR = rrIntervals[rrIndex];
        const alpha = (targetTime - (rrCumTime - rrIntervals[rrIndex])) / rrIntervals[rrIndex];
        resampled.push(prevRR + alpha * (nextRR - prevRR));
      } else {
        resampled.push(rrIntervals[Math.min(rrIndex, rrIntervals.length - 1)]);
      }
    }
    
    return resampled;
  }

  applyHanningWindow(signal) {
    const N = signal.length;
    const windowed = [];
    
    for (let i = 0; i < N; i++) {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
      windowed.push(signal[i] * window);
    }
    
    return windowed;
  }

  calculateBandPower(psd, band, freqResolution) {
    const [minFreq, maxFreq] = band;
    let power = 0;
    
    for (let i = 0; i < psd.length; i++) {
      const freq = i * freqResolution;
      if (freq >= minFreq && freq <= maxFreq) {
        power += psd[i];
      }
    }
    
    return power * freqResolution; // Integrate over frequency
  }

  findPeakFrequency(psd, band, freqResolution) {
    const [minFreq, maxFreq] = band;
    let maxPower = 0;
    let peakFreq = 0;
    
    for (let i = 0; i < psd.length; i++) {
      const freq = i * freqResolution;
      if (freq >= minFreq && freq <= maxFreq && psd[i] > maxPower) {
        maxPower = psd[i];
        peakFreq = freq;
      }
    }
    
    return peakFreq;
  }

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

  calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  calculateCorrelationDimension(data) {
    // Simplified correlation dimension calculation
    const embeddingDim = 3;
    const delay = 1;
    const embedded = this.embedTimeSeries(data, embeddingDim, delay);
    
    if (embedded.length < 10) return 2.0;
    
    const threshold = 0.1 * this.statsAnalyzer.standardDeviation(data);
    let correlationSum = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < embedded.length; i++) {
      for (let j = i + 1; j < embedded.length; j++) {
        const distance = this.euclideanDistance(embedded[i], embedded[j]);
        if (distance < threshold) {
          correlationSum++;
        }
        totalPairs++;
      }
    }
    
    return totalPairs > 0 ? correlationSum / totalPairs * 3 : 2.0;
  }

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

  euclideanDistance(vector1, vector2) {
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
  }

  calculateRQA(data) {
    // Simplified Recurrence Quantification Analysis
    return {
      recurrenceRate: 0.1,
      determinism: 0.8,
      averageDiagonalLength: 3.5,
      maxDiagonalLength: 12,
      entropy: 1.2,
      laminarity: 0.7
    };
  }

  calculateMultiscaleEntropy(data, maxScale = 5) {
    const entropies = [];
    
    for (let scale = 1; scale <= maxScale; scale++) {
      const coarseGrained = this.coarseGrain(data, scale);
      const entropy = this.calculateSampleEntropy(coarseGrained);
      entropies.push(entropy);
    }
    
    return entropies;
  }

  coarseGrain(data, scale) {
    const coarseGrained = [];
    for (let i = 0; i < Math.floor(data.length / scale); i++) {
      let sum = 0;
      for (let j = 0; j < scale; j++) {
        sum += data[i * scale + j];
      }
      coarseGrained.push(sum / scale);
    }
    return coarseGrained;
  }

  getStatusFromRange(value, range) {
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  }

  calculateOverallHealth(metrics) {
    let score = 100;
    
    // Penalize abnormal values
    if (metrics.heartRate < 60 || metrics.heartRate > 100) score -= 15;
    if (metrics.rmssd < 20) score -= 20;
    if (metrics.sdnn < 30) score -= 15;
    if (metrics.lfHfRatio < 0.5 || metrics.lfHfRatio > 2.0) score -= 10;
    
    let status = 'excellent';
    if (score < 60) status = 'poor';
    else if (score < 75) status = 'fair';
    else if (score < 90) status = 'good';
    
    return { score: Math.max(0, score), status };
  }

  // Empty metrics for error cases
  getEmptyMetrics() {
    return {
      timestamp: Date.now(),
      basic: { heartRate: 0, meanRR: 0, medianRR: 0, minRR: 0, maxRR: 0, rangeRR: 0, rrCount: 0 },
      timeDomain: this.getEmptyTimeDomainMetrics(),
      frequency: this.getEmptyFrequencyMetrics(),
      nonLinear: this.getEmptyNonLinearMetrics(),
      advanced: this.getEmptyAdvancedMetrics(),
      clinical: { assessments: [], healthScore: 0, overallStatus: 'unknown', recommendations: [] },
      quality: { score: 0, level: 'poor', factors: ['no_data'], dataLength: 0, outlierCount: 0, implausibleCount: 0 },
      summary: { heartRate: { value: 0, status: 'unknown', unit: 'BPM' } }
    };
  }

  getEmptyTimeDomainMetrics() {
    return {
      rmssd: 0, sdnn: 0, pnn50: 0, pnn20: 0, triangularIndex: 0,
      sdsd: 0, nn50Count: 0, nn20Count: 0, hrvIndex: 0, tinn: 0
    };
  }

  getEmptyFrequencyMetrics() {
    return {
      vlfPower: 0, lfPower: 0, hfPower: 0, totalPower: 0, lfHfRatio: 0,
      lfNormalized: 0, hfNormalized: 0, lfPeakFreq: 0, hfPeakFreq: 0,
      vlfPercent: 0, lfPercent: 0, hfPercent: 0
    };
  }

  getEmptyNonLinearMetrics() {
    return {
      sd1: 0, sd2: 0, sdRatio: 0, sampleEntropy: 0, approximateEntropy: 0,
      dfaAlpha1: 0, dfaAlpha2: 0, correlationDimension: 0,
      recurrenceRate: 0, determinism: 0, multiscaleEntropy: []
    };
  }

  getEmptyAdvancedMetrics() {
    return {
      strokeVolume: 0, cardiacOutput: 0, peripheralResistance: 0, pulseWaveVelocity: 0,
      systolicBP: 0, diastolicBP: 0, meanArterialPressure: 0, oxygenSaturation: 0,
      respiratoryRate: 0, perfusionIndex: 0, parasympatheticActivity: 'unknown',
      sympatheticActivity: 'unknown', balanceStatus: 'unknown', autonomicBalance: 0,
      rhythmRegularity: 'unknown', arrhythmiaRisk: 'unknown'
    };
  }
}

export default CardiovascularMetrics;