/**
 * rPPG Analysis Service - Real-time remote photoplethysmography
 * Extracts heart rate and cardiovascular biomarkers from video frames
 */

// Simulate rPPG analysis (placeholder for actual implementation)
export const analyzeRPPGData = (inputData) => {
  const { signalQuality = 50, timestamp = Date.now() } = inputData || {};
  
  // Simulate heart rate calculation
  const baseHR = 70;
  const variation = (Math.random() - 0.5) * 20;
  const heartRate = Math.max(45, Math.min(180, baseHR + variation));
  
  // Simulate HRV calculation
  const hrv = 20 + Math.random() * 60; // 20-80ms typical range
  
  // Simulate blood pressure estimation
  const systolic = 110 + Math.random() * 30; // 110-140 mmHg
  const diastolic = 70 + Math.random() * 20;  // 70-90 mmHg
  
  // Simulate SpO2 estimation
  const spo2 = 95 + Math.random() * 5; // 95-100%
  
  // Calculate confidence based on signal quality
  const confidence = Math.min(100, signalQuality * 1.2);
  
  return {
    heartRate: Math.round(heartRate),
    hrv: Math.round(hrv),
    bloodPressure: {
      systolic: Math.round(systolic),
      diastolic: Math.round(diastolic)
    },
    spo2: Math.round(spo2 * 10) / 10,
    confidence: Math.round(confidence),
    signalQuality: Math.round(signalQuality),
    timestamp,
    analysis: {
      snr: signalQuality / 10, // Signal-to-noise ratio
      stability: Math.random() * 5, // BPM variation
      quality: signalQuality > 70 ? 'excellent' : signalQuality > 50 ? 'good' : 'poor'
    }
  };
};

// Extract ROI (Region of Interest) from video frame
export const extractFacialROI = (videoElement, faceDetection) => {
  if (!videoElement || !faceDetection) {
    return null;
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Draw video frame to canvas
  ctx.drawImage(videoElement, 0, 0);
  
  // Extract facial regions (forehead, cheeks)
  const { x, y, width, height } = faceDetection;
  
  // Forehead region (best for rPPG)
  const foreheadROI = ctx.getImageData(
    x + width * 0.2,
    y + height * 0.1,
    width * 0.6,
    height * 0.2
  );
  
  return {
    forehead: foreheadROI,
    face: { x, y, width, height },
    timestamp: Date.now()
  };
};

// Calculate average RGB values from ROI
export const calculateRGBAverage = (imageData) => {
  if (!imageData || !imageData.data) {
    return { r: 0, g: 0, b: 0 };
  }
  
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];     // Red
    g += data[i + 1]; // Green  
    b += data[i + 2]; // Blue
    pixelCount++;
  }
  
  return {
    r: r / pixelCount,
    g: g / pixelCount,
    b: b / pixelCount
  };
};

// Process rPPG signal from RGB time series
export const processRPPGSignal = (rgbTimeSeries, fps = 30) => {
  if (!rgbTimeSeries || rgbTimeSeries.length < 10) {
    return null;
  }
  
  // Use green channel (most sensitive to blood volume changes)
  const greenSignal = rgbTimeSeries.map(rgb => rgb.g);
  
  // Simple bandpass filter (0.75-3.5 Hz for 45-210 BPM)
  const filtered = bandpassFilter(greenSignal, fps, 0.75, 3.5);
  
  // Find dominant frequency using FFT
  const fft = simpleFFT(filtered);
  const dominantFreq = findDominantFrequency(fft, 0.75, 3.5);
  
  // Convert to BPM
  const bpm = dominantFreq * 60;
  
  // Calculate signal quality metrics
  const snr = calculateSNR(filtered);
  const confidence = Math.min(100, snr * 20);
  
  return {
    bpm: Math.round(bpm),
    confidence: Math.round(confidence),
    snr: Math.round(snr * 100) / 100,
    dominantFreq: Math.round(dominantFreq * 100) / 100
  };
};

// Validate rPPG requirements - NOW EXPORTED
export const validateRPPGRequirements = (videoTrack) => {
  if (!videoTrack) {
    return {
      valid: false,
      issues: ['No video track available'],
      rppgScore: 0
    };
  }
  
  const settings = videoTrack.getSettings();
  const issues = [];
  
  // Check resolution
  if (settings.width < 640 || settings.height < 480) {
    issues.push(`Resolution too low: ${settings.width}x${settings.height} (minimum 640x480)`);
  }
  
  // Check frame rate
  if (settings.frameRate < 15) {
    issues.push(`Frame rate too low: ${settings.frameRate}fps (minimum 15fps)`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    settings,
    rppgScore: calculateRPPGScore(settings)
  };
};

// Simple bandpass filter implementation
const bandpassFilter = (signal, fps, lowFreq, highFreq) => {
  // Simplified filter - in production use proper DSP library
  const filtered = [...signal];
  
  // Remove DC component (detrend)
  const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
  for (let i = 0; i < filtered.length; i++) {
    filtered[i] -= mean;
  }
  
  return filtered;
};

// Simple FFT implementation (placeholder)
const simpleFFT = (signal) => {
  // Simplified FFT - in production use proper FFT library
  const N = signal.length;
  const frequencies = [];
  
  for (let k = 0; k < N / 2; k++) {
    let real = 0, imag = 0;
    
    for (let n = 0; n < N; n++) {
      const angle = -2 * Math.PI * k * n / N;
      real += signal[n] * Math.cos(angle);
      imag += signal[n] * Math.sin(angle);
    }
    
    const magnitude = Math.sqrt(real * real + imag * imag);
    frequencies.push({ frequency: k / N, magnitude });
  }
  
  return frequencies;
};

// Find dominant frequency in FFT result
const findDominantFrequency = (fft, minFreq, maxFreq) => {
  let maxMagnitude = 0;
  let dominantFreq = 1.0; // Default 60 BPM
  
  fft.forEach(({ frequency, magnitude }) => {
    if (frequency >= minFreq && frequency <= maxFreq && magnitude > maxMagnitude) {
      maxMagnitude = magnitude;
      dominantFreq = frequency;
    }
  });
  
  return dominantFreq;
};

// Calculate Signal-to-Noise Ratio
const calculateSNR = (signal) => {
  if (signal.length === 0) return 0;
  
  const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
  const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
  const std = Math.sqrt(variance);
  
  // Simple SNR approximation
  return mean !== 0 ? Math.abs(mean / std) : 0;
};

// Calculate rPPG readiness score
const calculateRPPGScore = (settings) => {
  let score = 0;
  
  // Resolution scoring (0-40 points)
  const pixels = settings.width * settings.height;
  if (pixels >= 1920 * 1080) score += 40;
  else if (pixels >= 1280 * 720) score += 35;
  else if (pixels >= 640 * 480) score += 20;
  else score += 5;
  
  // Frame rate scoring (0-30 points)
  if (settings.frameRate >= 30) score += 30;
  else if (settings.frameRate >= 24) score += 25;
  else if (settings.frameRate >= 15) score += 15;
  else score += 5;
  
  // Facing mode scoring (0-20 points)
  if (settings.facingMode === 'user') score += 20;
  else score += 10;
  
  // Base quality (0-10 points)
  score += 10;
  
  return Math.min(100, score);
};

export default {
  analyzeRPPGData,
  extractFacialROI,
  calculateRGBAverage,
  processRPPGSignal,
  validateRPPGRequirements
};