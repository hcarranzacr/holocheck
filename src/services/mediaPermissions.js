/**
 * Media Permissions Service - Enhanced for medical-grade transparency
 */

// Check permission status for a specific media type
export const checkPermissionStatus = async (type) => {
  try {
    const permissionName = type === 'camera' ? 'camera' : 'microphone';
    const result = await navigator.permissions.query({ name: permissionName });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    // Fallback for browsers that don't support permissions API
    console.warn(`Permission API not supported for ${type}:`, error);
    return 'prompt';
  }
};

// Request media permissions with detailed logging
export const requestMediaPermissions = async (constraints = {}) => {
  const defaultConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
      facingMode: 'user'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000
    }
  };

  const finalConstraints = { ...defaultConstraints, ...constraints };

  try {
    console.log('🔐 Requesting media permissions...', finalConstraints);
    
    const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
    
    console.log('✅ Media permissions granted successfully');
    console.log('📹 Video tracks:', stream.getVideoTracks().length);
    console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
    
    // Log track settings
    stream.getVideoTracks().forEach((track, index) => {
      console.log(`📹 Video track ${index}:`, track.getSettings());
    });
    
    stream.getAudioTracks().forEach((track, index) => {
      console.log(`🎤 Audio track ${index}:`, track.getSettings());
    });

    return {
      success: true,
      stream,
      constraints: finalConstraints
    };
  } catch (error) {
    console.error('❌ Media permissions denied:', error);
    
    return {
      success: false,
      error,
      constraints: finalConstraints
    };
  }
};

// Get available media devices
export const getAvailableDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const cameras = devices.filter(device => device.kind === 'videoinput');
    const microphones = devices.filter(device => device.kind === 'audioinput');
    
    console.log('📱 Available devices:', {
      cameras: cameras.length,
      microphones: microphones.length
    });
    
    return {
      cameras,
      microphones,
      all: devices
    };
  } catch (error) {
    console.error('❌ Error getting devices:', error);
    return {
      cameras: [],
      microphones: [],
      all: []
    };
  }
};

// Check if media devices are supported
export const checkMediaSupport = () => {
  const support = {
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
    mediaRecorder: !!window.MediaRecorder,
    permissions: !!navigator.permissions
  };
  
  console.log('🔍 Media support check:', support);
  
  return support;
};

// Stop all tracks in a stream
export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`⏹️ Stopped ${track.kind} track`);
    });
  }
};

// Get optimal constraints for rPPG analysis
export const getRPPGOptimalConstraints = () => {
  return {
    video: {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      frameRate: { ideal: 30, min: 15 }, // Critical for rPPG
      facingMode: 'user',
      // Additional constraints for better rPPG signal
      brightness: { ideal: 0.5 },
      contrast: { ideal: 1.0 },
      saturation: { ideal: 1.0 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: { ideal: 48000, min: 16000 },
      channelCount: { ideal: 1 } // Mono is sufficient for voice analysis
    }
  };
};

export default {
  checkPermissionStatus,
  requestMediaPermissions,
  getAvailableDevices,
  checkMediaSupport,
  stopMediaStream,
  getRPPGOptimalConstraints
};