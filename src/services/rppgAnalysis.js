// rPPG Analysis Service
class RPPGAnalysis {
  constructor() {
    this.isInitialized = false;
    this.isAnalyzing = false;
    this.canvas = null;
    this.context = null;
    this.frameBuffer = [];
    this.heartRateBuffer = [];
    this.lastFrameTime = 0;
    this.analysisInterval = null;
  }

  async initialize() {
    try {
      // Create canvas for frame processing
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.width = 640;
      this.canvas.height = 480;
      
      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('rPPG initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  reset() {
    this.frameBuffer = [];
    this.heartRateBuffer = [];
    this.lastFrameTime = 0;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  startAnalysis(videoElement) {
    if (!this.isInitialized || !videoElement) {
      return { success: false, error: 'Not initialized or no video element' };
    }

    this.isAnalyzing = true;
    this.reset();

    // Start frame processing
    this.analysisInterval = setInterval(() => {
      this.processFrame(videoElement, Date.now());
    }, 33); // ~30 FPS

    return { success: true };
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  processFrame(videoElement, timestamp) {
    if (!this.isInitialized || !videoElement || !this.isAnalyzing) {
      return { success: false, error: 'Not ready for processing' };
    }

    try {
      // Check if video is ready
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return { success: false, error: 'Video not ready' };
      }

      // Set canvas size to match video
      this.canvas.width = videoElement.videoWidth;
      this.canvas.height = videoElement.videoHeight;

      // Draw current frame to canvas
      this.context.drawImage(videoElement, 0, 0);

      // Extract face region (simplified - center region)
      const faceRegion = this.extractFaceRegion();
      
      // Calculate average RGB values
      const avgRGB = this.calculateAverageRGB(faceRegion);
      
      // Add to frame buffer
      this.frameBuffer.push({
        timestamp,
        rgb: avgRGB
      });

      // Keep buffer size manageable (last 10 seconds at 30fps = 300 frames)
      if (this.frameBuffer.length > 300) {
        this.frameBuffer.shift();
      }

      // Calculate heart rate if we have enough frames
      let heartRate = null;
      if (this.frameBuffer.length > 90) { // At least 3 seconds of data
        heartRate = this.calculateHeartRate();
      }

      return {
        success: true,
        heartRate,
        frameCount: this.frameBuffer.length,
        avgRGB
      };

    } catch (error) {
      console.error('Frame processing error:', error);
      return { success: false, error: error.message };
    }
  }

  extractFaceRegion() {
    // Extract center region of the frame (simplified face detection)
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const faceX = Math.floor(width * 0.3);
    const faceY = Math.floor(height * 0.2);
    const faceWidth = Math.floor(width * 0.4);
    const faceHeight = Math.floor(height * 0.5);

    return this.context.getImageData(faceX, faceY, faceWidth, faceHeight);
  }

  calculateAverageRGB(imageData) {
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];     // Red
      g += data[i + 1]; // Green
      b += data[i + 2]; // Blue
    }

    return {
      r: r / pixelCount,
      g: g / pixelCount,
      b: b / pixelCount
    };
  }

  calculateHeartRate() {
    if (this.frameBuffer.length < 90) return null;

    // Use green channel for PPG signal (most sensitive to blood volume changes)
    const greenSignal = this.frameBuffer.map(frame => frame.rgb.g);
    
    // Simple heart rate calculation (simplified)
    // In a real implementation, you would use FFT and proper signal processing
    const avgGreen = greenSignal.reduce((sum, val) => sum + val, 0) / greenSignal.length;
    const normalizedSignal = greenSignal.map(val => val - avgGreen);
    
    // Count peaks (simplified peak detection)
    let peaks = 0;
    for (let i = 1; i < normalizedSignal.length - 1; i++) {
      if (normalizedSignal[i] > normalizedSignal[i - 1] && 
          normalizedSignal[i] > normalizedSignal[i + 1] && 
          normalizedSignal[i] > 0.5) {
        peaks++;
      }
    }

    // Calculate BPM based on time window
    const timeWindow = (this.frameBuffer[this.frameBuffer.length - 1].timestamp - this.frameBuffer[0].timestamp) / 1000;
    const bpm = Math.round((peaks / timeWindow) * 60);

    // Clamp to reasonable heart rate range
    return Math.max(50, Math.min(150, bpm));
  }

  getCurrentMetrics() {
    if (!this.isAnalyzing || this.frameBuffer.length === 0) {
      return null;
    }

    const heartRate = this.calculateHeartRate();
    return {
      heartRate,
      frameCount: this.frameBuffer.length,
      isAnalyzing: this.isAnalyzing,
      bufferDuration: this.frameBuffer.length > 0 ? 
        (this.frameBuffer[this.frameBuffer.length - 1].timestamp - this.frameBuffer[0].timestamp) / 1000 : 0
    };
  }

  cleanup() {
    this.stopAnalysis();
    this.isInitialized = false;
    this.canvas = null;
    this.context = null;
    this.frameBuffer = [];
    this.heartRateBuffer = [];
  }
}

// Create and export singleton instance
export const rppgAnalysis = new RPPGAnalysis();