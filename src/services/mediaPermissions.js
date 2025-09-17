/**
 * Media Permissions Service - Enhanced for medical-grade applications
 */

export const checkPermissionStatus = async (permissionName) => {
  try {
    if (!navigator.permissions) {
      return 'unknown';
    }
    
    const permission = await navigator.permissions.query({ name: permissionName });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.warn(`Could not check ${permissionName} permission:`, error);
    return 'unknown';
  }
};

export const requestMediaPermissions = async (constraints = {}) => {
  const defaultConstraints = {
    video: {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      frameRate: { ideal: 30, min: 15 },
      facingMode: 'user'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: { ideal: 48000 }
    }
  };

  const finalConstraints = {
    ...defaultConstraints,
    ...constraints
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
    
    return {
      success: true,
      stream,
      constraints: finalConstraints,
      videoTrack: stream.getVideoTracks()[0],
      audioTrack: stream.getAudioTracks()[0]
    };
  } catch (error) {
    return {
      success: false,
      error,
      message: getErrorMessage(error)
    };
  }
};

const getErrorMessage = (error) => {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Permisos denegados por el usuario';
    case 'NotFoundError':
      return 'No se encontraron dispositivos de cámara o micrófono';
    case 'NotReadableError':
      return 'Dispositivos en uso por otra aplicación';
    case 'OverconstrainedError':
      return 'Configuración de video/audio no soportada';
    case 'SecurityError':
      return 'Error de seguridad - use HTTPS';
    default:
      return `Error desconocido: ${error.message}`;
  }
};

export const getDeviceCapabilities = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    return {
      videoInputs: devices.filter(device => device.kind === 'videoinput'),
      audioInputs: devices.filter(device => device.kind === 'audioinput'),
      audioOutputs: devices.filter(device => device.kind === 'audiooutput')
    };
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return {
      videoInputs: [],
      audioInputs: [],
      audioOutputs: []
    };
  }
};

// FUNCIÓN FALTANTE - AGREGADA PARA RESOLVER IMPORT ERROR
export const validateRPPGRequirements = (videoTrack) => {
  if (!videoTrack) {
    return {
      valid: false,
      issues: ['No video track available'],
      recommendations: ['Enable camera permissions'],
      rppgScore: 0
    };
  }

  const settings = videoTrack.getSettings();
  const issues = [];
  const recommendations = [];

  // Check minimum resolution for rPPG (640x480)
  if (settings.width < 640 || settings.height < 480) {
    issues.push(`Resolution too low: ${settings.width}x${settings.height} (minimum 640x480)`);
    recommendations.push('Use higher resolution camera or adjust settings');
  }

  // Check minimum frame rate for rPPG (15 FPS)
  if (settings.frameRate < 15) {
    issues.push(`Frame rate too low: ${settings.frameRate}fps (minimum 15fps)`);
    recommendations.push('Increase frame rate to at least 15fps');
  }

  // Calculate rPPG readiness score (0-100)
  const rppgScore = calculateRPPGScore(settings);

  return {
    valid: issues.length === 0,
    issues,
    recommendations,
    settings,
    rppgScore
  };
};

// Función auxiliar para calcular score
const calculateRPPGScore = (settings) => {
  let score = 0;
  
  // Resolution scoring (0-40 points)
  const pixels = settings.width * settings.height;
  if (pixels >= 1920 * 1080) score += 40;
  else if (pixels >= 1280 * 720) score += 35;
  else if (pixels >= 640 * 480) score += 15;
  else score += 5;

  // Frame rate scoring (0-30 points)
  if (settings.frameRate >= 30) score += 25;
  else if (settings.frameRate >= 15) score += 10;
  else score += 5;

  // Facing mode scoring (0-20 points)
  if (settings.facingMode === 'user') score += 20;
  else score += 10;

  // Base quality (0-10 points)
  score += 10;

  return Math.min(100, score);
};

export default {
  checkPermissionStatus,
  requestMediaPermissions,
  getDeviceCapabilities,
  validateRPPGRequirements  // AGREGADO AL DEFAULT EXPORT
};