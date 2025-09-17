// Media Permissions Service
// Handles camera and microphone permissions across all browsers

export class MediaPermissionsService {
  constructor() {
    this.permissions = {
      camera: null,
      microphone: null
    };
    this.streams = {
      video: null,
      audio: null
    };
  }

  // Check if browser supports required APIs
  checkBrowserSupport() {
    const support = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection),
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      canvas: !!document.createElement('canvas').getContext
    };

    const unsupported = Object.entries(support)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      supported: unsupported.length === 0,
      unsupported,
      details: support
    };
  }

  // Request camera permission and stream
  async requestCameraPermission() {
    try {
      console.log('[MediaPermissions] Requesting camera access...');
      
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.streams.video = stream;
      this.permissions.camera = 'granted';
      
      console.log('[MediaPermissions] Camera access granted');
      return {
        success: true,
        stream,
        constraints: stream.getVideoTracks()[0].getSettings()
      };
    } catch (error) {
      console.error('[MediaPermissions] Camera access denied:', error);
      this.permissions.camera = 'denied';
      
      return {
        success: false,
        error: this.getPermissionErrorMessage(error, 'camera')
      };
    }
  }

  // Request microphone permission and stream
  async requestMicrophonePermission() {
    try {
      console.log('[MediaPermissions] Requesting microphone access...');
      
      const constraints = {
        audio: {
          sampleRate: { ideal: 44100 },
          channelCount: { ideal: 1 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.streams.audio = stream;
      this.permissions.microphone = 'granted';
      
      console.log('[MediaPermissions] Microphone access granted');
      return {
        success: true,
        stream,
        constraints: stream.getAudioTracks()[0].getSettings()
      };
    } catch (error) {
      console.error('[MediaPermissions] Microphone access denied:', error);
      this.permissions.microphone = 'denied';
      
      return {
        success: false,
        error: this.getPermissionErrorMessage(error, 'microphone')
      };
    }
  }

  // Request both permissions
  async requestAllPermissions() {
    try {
      console.log('[MediaPermissions] Requesting all media permissions...');
      
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        },
        audio: {
          sampleRate: { ideal: 44100 },
          channelCount: { ideal: 1 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Separate video and audio streams
      const videoStream = new MediaStream(stream.getVideoTracks());
      const audioStream = new MediaStream(stream.getAudioTracks());
      
      this.streams.video = videoStream;
      this.streams.audio = audioStream;
      this.permissions.camera = 'granted';
      this.permissions.microphone = 'granted';
      
      console.log('[MediaPermissions] All permissions granted');
      return {
        success: true,
        videoStream,
        audioStream,
        combinedStream: stream,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      };
    } catch (error) {
      console.error('[MediaPermissions] Permission request failed:', error);
      
      return {
        success: false,
        error: this.getPermissionErrorMessage(error, 'both')
      };
    }
  }

  // Check current permission status
  async checkPermissionStatus() {
    if (!navigator.permissions) {
      return {
        camera: 'unknown',
        microphone: 'unknown'
      };
    }

    try {
      const [cameraPermission, microphonePermission] = await Promise.all([
        navigator.permissions.query({ name: 'camera' }),
        navigator.permissions.query({ name: 'microphone' })
      ]);

      return {
        camera: cameraPermission.state,
        microphone: microphonePermission.state
      };
    } catch (error) {
      console.warn('[MediaPermissions] Could not check permission status:', error);
      return {
        camera: 'unknown',
        microphone: 'unknown'
      };
    }
  }

  // Get available media devices
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        videoInputs: devices.filter(device => device.kind === 'videoinput'),
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('[MediaPermissions] Could not enumerate devices:', error);
      return {
        videoInputs: [],
        audioInputs: [],
        audioOutputs: []
      };
    }
  }

  // Stop all streams
  stopAllStreams() {
    console.log('[MediaPermissions] Stopping all media streams...');
    
    if (this.streams.video) {
      this.streams.video.getTracks().forEach(track => track.stop());
      this.streams.video = null;
    }
    
    if (this.streams.audio) {
      this.streams.audio.getTracks().forEach(track => track.stop());
      this.streams.audio = null;
    }
  }

  // Get user-friendly error messages
  getPermissionErrorMessage(error, deviceType) {
    const deviceName = deviceType === 'camera' ? 'cámara' : 
                      deviceType === 'microphone' ? 'micrófono' : 
                      'cámara y micrófono';

    switch (error.name) {
      case 'NotAllowedError':
        return `Acceso a ${deviceName} denegado. Por favor, permite el acceso en la configuración del navegador.`;
      case 'NotFoundError':
        return `No se encontró ${deviceName}. Verifica que esté conectado y funcionando.`;
      case 'NotReadableError':
        return `${deviceName.charAt(0).toUpperCase() + deviceName.slice(1)} en uso por otra aplicación. Cierra otras aplicaciones que puedan estar usándola.`;
      case 'OverconstrainedError':
        return `La configuración solicitada para ${deviceName} no es compatible con tu dispositivo.`;
      case 'SecurityError':
        return `Acceso a ${deviceName} bloqueado por razones de seguridad. Asegúrate de estar usando HTTPS.`;
      case 'AbortError':
        return `La solicitud de acceso a ${deviceName} fue cancelada.`;
      default:
        return `Error desconocido al acceder a ${deviceName}: ${error.message}`;
    }
  }

  // Test stream quality
  async testStreamQuality(stream) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      
      video.onloadedmetadata = () => {
        const quality = {
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight,
          frameRate: stream.getVideoTracks()[0]?.getSettings()?.frameRate || 'unknown'
        };
        
        video.srcObject = null;
        resolve(quality);
      };
      
      video.onerror = () => {
        video.srcObject = null;
        resolve({
          width: 0,
          height: 0,
          aspectRatio: 0,
          frameRate: 0,
          error: 'Could not test stream quality'
        });
      };
    });
  }
}

// Create singleton instance
export const mediaPermissions = new MediaPermissionsService();

export default mediaPermissions;