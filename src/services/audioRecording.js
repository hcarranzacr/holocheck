/**
 * Audio Recording Service - Fixed for complete session recording
 * Resolves 1-second audio limitation bug
 */

class AudioRecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.recordingDuration = 0;
    this.maxDuration = 60000; // 60 seconds max
    this.onDataAvailable = null;
    this.onRecordingComplete = null;
    this.onError = null;
    this.recordingTimer = null;
    this.logger = null;
  }

  setLogger(logger) {
    this.logger = logger;
  }

  setCallbacks({ onDataAvailable, onRecordingComplete, onError }) {
    this.onDataAvailable = onDataAvailable;
    this.onRecordingComplete = onRecordingComplete;
    this.onError = onError;
  }

  async initializeRecording(audioStream, duration = 30000) {
    try {
      this.maxDuration = duration;
      this.audioChunks = [];
      this.recordingDuration = 0;

      // Optimized MediaRecorder configuration
      const options = this.getOptimalRecorderOptions();
      
      this.mediaRecorder = new MediaRecorder(audioStream, options);
      
      this.logger?.log('🎤 MediaRecorder inicializado', {
        mimeType: this.mediaRecorder.mimeType,
        state: this.mediaRecorder.state,
        maxDuration: this.maxDuration / 1000 + 's'
      });

      this.setupEventHandlers();
      
      return true;
    } catch (error) {
      this.logger?.error('❌ Error inicializando grabación audio:', error);
      this.onError?.(error);
      return false;
    }
  }

  getOptimalRecorderOptions() {
    const options = [];
    
    // Try different MIME types in order of preference
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        options.push({
          mimeType,
          audioBitsPerSecond: 128000
        });
        break;
      }
    }

    return options[0] || {};
  }

  setupEventHandlers() {
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
        this.logger?.log('📊 Chunk de audio recibido', {
          size: event.data.size,
          totalChunks: this.audioChunks.length,
          duration: this.recordingDuration / 1000 + 's'
        });
        this.onDataAvailable?.(event.data);
      }
    };

    this.mediaRecorder.onstart = () => {
      this.isRecording = true;
      this.recordingDuration = 0;
      this.logger?.log('🔴 Grabación de audio iniciada');
      this.startTimer();
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      this.stopTimer();
      this.logger?.log('⏹️ Grabación de audio detenida', {
        totalDuration: this.recordingDuration / 1000 + 's',
        totalChunks: this.audioChunks.length
      });
      this.processRecordedAudio();
    };

    this.mediaRecorder.onerror = (event) => {
      this.logger?.error('❌ Error en MediaRecorder:', event.error);
      this.onError?.(event.error);
    };

    this.mediaRecorder.onpause = () => {
      this.logger?.log('⏸️ Grabación pausada');
    };

    this.mediaRecorder.onresume = () => {
      this.logger?.log('▶️ Grabación reanudada');
    };
  }

  startRecording() {
    if (!this.mediaRecorder) {
      this.logger?.error('❌ MediaRecorder no inicializado');
      return false;
    }

    if (this.mediaRecorder.state === 'inactive') {
      try {
        // Request data every 100ms for real-time processing
        this.mediaRecorder.start(100);
        this.logger?.log('🎤 Iniciando grabación de audio', {
          state: this.mediaRecorder.state,
          maxDuration: this.maxDuration / 1000 + 's'
        });
        return true;
      } catch (error) {
        this.logger?.error('❌ Error iniciando grabación:', error);
        this.onError?.(error);
        return false;
      }
    }

    return false;
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.logger?.log('⏹️ Deteniendo grabación de audio');
      return true;
    }
    return false;
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      return true;
    }
    return false;
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      return true;
    }
    return false;
  }

  startTimer() {
    this.recordingTimer = setInterval(() => {
      this.recordingDuration += 100;
      
      // Auto-stop when max duration reached
      if (this.recordingDuration >= this.maxDuration) {
        this.logger?.log('⏰ Duración máxima alcanzada, deteniendo grabación');
        this.stopRecording();
      }
    }, 100);
  }

  stopTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  processRecordedAudio() {
    if (this.audioChunks.length === 0) {
      this.logger?.error('❌ No hay chunks de audio para procesar');
      this.onError?.(new Error('No audio data recorded'));
      return;
    }

    try {
      const audioBlob = new Blob(this.audioChunks, { 
        type: this.mediaRecorder.mimeType || 'audio/webm' 
      });

      this.logger?.log('✅ Audio procesado exitosamente', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration: this.recordingDuration / 1000 + 's',
        chunks: this.audioChunks.length
      });

      this.onRecordingComplete?.({
        audioBlob,
        duration: this.recordingDuration,
        chunks: this.audioChunks.length,
        mimeType: this.mediaRecorder.mimeType
      });

    } catch (error) {
      this.logger?.error('❌ Error procesando audio:', error);
      this.onError?.(error);
    }
  }

  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      duration: this.recordingDuration,
      maxDuration: this.maxDuration,
      state: this.mediaRecorder?.state || 'inactive',
      chunksCount: this.audioChunks.length
    };
  }

  cleanup() {
    this.stopTimer();
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.audioChunks = [];
    this.mediaRecorder = null;
    this.isRecording = false;
    this.recordingDuration = 0;
    this.logger?.log('🧹 AudioRecordingService limpiado');
  }
}

export default AudioRecordingService;