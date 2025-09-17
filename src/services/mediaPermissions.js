/**
 * Media Permissions Service
 * Handles camera and microphone permissions with Safari optimization
 * FIXED: Safari stream initialization issues
 */

/**
 * Request media permissions with Safari-specific handling
 */
export const requestMediaPermissions = async (constraints = {}) => {
  try {
    console.log('🎥 Solicitando permisos de medios con configuración Safari...');
    
    // Default constraints optimized for Safari
    const defaultConstraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }
    };

    // Merge with provided constraints
    const finalConstraints = {
      video: { ...defaultConstraints.video, ...constraints.video },
      audio: { ...defaultConstraints.audio, ...constraints.audio }
    };

    console.log('📋 Configuración de medios:', finalConstraints);

    // Request media stream with Safari-specific error handling
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      console.log('✅ Stream obtenido exitosamente');
      console.log('📊 Stream info:', {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
    } catch (initialError) {
      console.warn('⚠️ Error con configuración inicial, intentando configuración básica:', initialError.message);
      
      // Fallback to basic constraints for Safari compatibility
      const basicConstraints = {
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: 'user'
        },
        audio: true
      };
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        console.log('✅ Stream obtenido con configuración básica');
      } catch (fallbackError) {
        console.error('❌ Error obteniendo stream con configuración básica:', fallbackError);
        throw new Error(`No se pudo acceder a los dispositivos de medios: ${fallbackError.message}`);
      }
    }

    // Verify stream is active and has tracks
    if (!stream || !stream.active) {
      throw new Error('Stream obtenido pero no está activo');
    }

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    if (videoTracks.length === 0) {
      throw new Error('No se obtuvieron pistas de video');
    }

    if (audioTracks.length === 0) {
      console.warn('⚠️ No se obtuvieron pistas de audio');
    }

    // Log track capabilities for debugging
    videoTracks.forEach((track, index) => {
      console.log(`📹 Video track ${index}:`, {
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      });
    });

    audioTracks.forEach((track, index) => {
      console.log(`🎤 Audio track ${index}:`, {
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      });
    });

    return {
      success: true,
      stream,
      permissions: {
        camera: 'granted',
        microphone: audioTracks.length > 0 ? 'granted' : 'denied'
      },
      capabilities: {
        video: videoTracks.length > 0 ? videoTracks[0].getSettings() : null,
        audio: audioTracks.length > 0 ? audioTracks[0].getSettings() : null
      }
    };

  } catch (error) {
    console.error('❌ Error solicitando permisos de medios:', error);
    
    return {
      success: false,
      stream: null,
      permissions: {
        camera: 'denied',
        microphone: 'denied'
      },
      error: error.message,
      capabilities: null
    };
  }
};

/**
 * Check current permission status
 */
export const checkPermissionStatus = async () => {
  try {
    console.log('🔍 Verificando estado de permisos...');
    
    if (!navigator.permissions) {
      console.warn('⚠️ API de permisos no disponible, usando método alternativo');
      return await checkPermissionsAlternative();
    }

    const [cameraPermission, microphonePermission] = await Promise.all([
      navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'prompt' })),
      navigator.permissions.query({ name: 'microphone' }).catch(() => ({ state: 'prompt' }))
    ]);

    const status = {
      camera: cameraPermission.state,
      microphone: microphonePermission.state,
      both: cameraPermission.state === 'granted' && microphonePermission.state === 'granted'
    };

    console.log('📊 Estado de permisos:', status);
    return status;

  } catch (error) {
    console.error('❌ Error verificando permisos:', error);
    return {
      camera: 'prompt',
      microphone: 'prompt',
      both: false,
      error: error.message
    };
  }
};

/**
 * Alternative permission check for browsers without permissions API
 */
const checkPermissionsAlternative = async () => {
  try {
    console.log('🔄 Verificando permisos con método alternativo...');
    
    // Try to get a very basic stream to test permissions
    const testStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1, height: 1 },
      audio: true
    });

    // If we get here, permissions are granted
    const videoTracks = testStream.getVideoTracks();
    const audioTracks = testStream.getAudioTracks();

    // Clean up test stream immediately
    testStream.getTracks().forEach(track => track.stop());

    return {
      camera: videoTracks.length > 0 ? 'granted' : 'denied',
      microphone: audioTracks.length > 0 ? 'granted' : 'denied',
      both: videoTracks.length > 0 && audioTracks.length > 0
    };

  } catch (error) {
    console.log('📋 Permisos no otorgados aún:', error.message);
    return {
      camera: 'prompt',
      microphone: 'prompt',
      both: false
    };
  }
};

/**
 * Validate rPPG requirements
 */
export const validateRPPGRequirements = (stream) => {
  try {
    console.log('🔬 Validando requisitos para rPPG...');
    
    if (!stream || !stream.active) {
      return {
        valid: false,
        issues: ['Stream no disponible o inactivo'],
        recommendations: ['Reiniciar cámara', 'Verificar permisos']
      };
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      return {
        valid: false,
        issues: ['No hay pistas de video disponibles'],
        recommendations: ['Verificar cámara', 'Otorgar permisos de cámara']
      };
    }

    const videoTrack = videoTracks[0];
    const settings = videoTrack.getSettings();
    
    console.log('📊 Configuración de video para rPPG:', settings);

    const issues = [];
    const recommendations = [];

    // Check resolution
    if (settings.width < 480 || settings.height < 360) {
      issues.push(`Resolución baja: ${settings.width}x${settings.height}`);
      recommendations.push('Usar resolución mínima de 480x360');
    }

    // Check frame rate
    if (settings.frameRate < 15) {
      issues.push(`Frame rate bajo: ${settings.frameRate} FPS`);
      recommendations.push('Usar mínimo 15 FPS para rPPG');
    }

    // Check if track is enabled and ready
    if (!videoTrack.enabled) {
      issues.push('Pista de video deshabilitada');
      recommendations.push('Habilitar pista de video');
    }

    if (videoTrack.readyState !== 'live') {
      issues.push(`Estado de pista: ${videoTrack.readyState}`);
      recommendations.push('Esperar a que la pista esté en estado "live"');
    }

    const isValid = issues.length === 0;
    
    console.log(isValid ? '✅ Requisitos rPPG cumplidos' : '⚠️ Requisitos rPPG no cumplidos:', { issues, recommendations });

    return {
      valid: isValid,
      issues,
      recommendations,
      settings,
      quality: calculateStreamQuality(settings)
    };

  } catch (error) {
    console.error('❌ Error validando requisitos rPPG:', error);
    return {
      valid: false,
      issues: [`Error de validación: ${error.message}`],
      recommendations: ['Reiniciar análisis', 'Verificar configuración de cámara'],
      settings: null,
      quality: 0
    };
  }
};

/**
 * Calculate stream quality score for rPPG analysis
 */
const calculateStreamQuality = (settings) => {
  try {
    let quality = 100;

    // Resolution score (30% weight)
    const resolutionScore = Math.min(100, (settings.width * settings.height) / (1280 * 720) * 100);
    quality = quality * 0.3 + resolutionScore * 0.3;

    // Frame rate score (40% weight)
    const frameRateScore = Math.min(100, (settings.frameRate / 30) * 100);
    quality = quality * 0.6 + frameRateScore * 0.4;

    // Additional factors (30% weight)
    let additionalScore = 100;
    
    // Prefer user-facing camera for rPPG
    if (settings.facingMode !== 'user') {
      additionalScore -= 20;
    }

    quality = quality * 0.7 + additionalScore * 0.3;

    return Math.round(Math.max(0, Math.min(100, quality)));

  } catch (error) {
    console.error('Error calculando calidad de stream:', error);
    return 50; // Default quality score
  }
};

/**
 * Get available media devices
 */
export const getAvailableDevices = async () => {
  try {
    console.log('🔍 Obteniendo dispositivos disponibles...');
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    console.log('📊 Dispositivos encontrados:', {
      video: videoDevices.length,
      audio: audioDevices.length
    });

    return {
      video: videoDevices,
      audio: audioDevices,
      total: devices.length
    };

  } catch (error) {
    console.error('❌ Error obteniendo dispositivos:', error);
    return {
      video: [],
      audio: [],
      total: 0,
      error: error.message
    };
  }
};

/**
 * Stop all tracks in a stream safely
 */
export const stopMediaStream = (stream) => {
  try {
    if (stream && stream.getTracks) {
      console.log('🛑 Deteniendo stream de medios...');
      
      stream.getTracks().forEach(track => {
        console.log(`🔇 Deteniendo track: ${track.kind} - ${track.label}`);
        track.stop();
      });
      
      console.log('✅ Stream detenido correctamente');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error deteniendo stream:', error);
    return false;
  }
};

export default {
  requestMediaPermissions,
  checkPermissionStatus,
  validateRPPGRequirements,
  getAvailableDevices,
  stopMediaStream
};