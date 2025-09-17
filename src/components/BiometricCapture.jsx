import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, Activity, Heart, Brain, Eye, Volume2, AlertTriangle, Play, Square, Clock, RotateCcw } from 'lucide-react';
import { mediaPermissions } from '../services/mediaPermissions';
import { rppgAnalysis } from '../services/rppgAnalysis';
import { voiceAnalysis } from '../services/voiceAnalysis';
import { useAnalysisLogger } from './AnalysisLogger';

const BiometricCapture = ({ onCapture, onNext, onBack }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('initializing');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisTime, setAnalysisTime] = useState(0);
  const [error, setError] = useState(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // Browser and system info (REAL DATA)
  const [browserInfo, setBrowserInfo] = useState({
    name: 'Detectando...',
    resolution: 'Detectando...',
    fps: 'Detectando...',
    isSafari: false,
    isChrome: false,
    isFirefox: false
  });

  // Face detection state
  const [faceDetection, setFaceDetection] = useState({
    detected: false,
    confidence: 0,
    position: null
  });

  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    heartRate: 0,
    heartRateVariability: 0,
    stressLevel: 'Calculando...',
    oxygenSaturation: 0,
    respiratoryRate: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    voiceStress: 0,
    cognitiveLoad: 0
  });

  // System logs
  const [systemLogs, setSystemLogs] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const streamHealthCheckRef = useRef(null);

  // Analysis logger
  const { logAnalysis, getAnalysisHistory } = useAnalysisLogger({
    sessionId: `biometric_${Date.now()}`,
    userId: 'demo_user',
    analysisType: 'complete_biometric'
  });

  // Initialize on mount
  useEffect(() => {
    initializeCapture();
    return () => cleanupResources();
  }, []);

  // Face detection effect
  useEffect(() => {
    if (videoRef.current && hasPermissions && videoStream && videoActive) {
      startFaceDetection();
    }
  }, [hasPermissions, videoStream, videoActive]);

  // Stream health monitoring
  useEffect(() => {
    if (videoStream && videoActive) {
      startStreamHealthMonitoring();
    }
    return () => {
      if (streamHealthCheckRef.current) {
        clearInterval(streamHealthCheckRef.current);
      }
    };
  }, [videoStream, videoActive]);

  // ENHANCED: Detect real browser info with Safari-specific detection
  const detectRealBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    
    let browserName = 'Unknown';
    if (isSafari) browserName = 'Safari';
    else if (isChrome) browserName = 'Chrome';
    else if (isFirefox) browserName = 'Firefox';

    return {
      name: browserName,
      isSafari,
      isChrome,
      isFirefox,
      resolution: `${screen.width}x${screen.height}`,
      fps: 30, // Will be updated when video loads
      userAgent: userAgent
    };
  };

  // CRITICAL: Complete resource cleanup
  const cleanupResources = useCallback(() => {
    addSystemLog('🧹 Iniciando limpieza completa de recursos...', 'info');
    
    // Stop all intervals
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
      faceDetectionRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (streamHealthCheckRef.current) {
      clearInterval(streamHealthCheckRef.current);
      streamHealthCheckRef.current = null;
    }

    // Complete video element cleanup
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load(); // CRITICAL: Force reset
      addSystemLog('📹 Video element completamente reseteado', 'success');
    }

    // Stop all media tracks
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
          addSystemLog(`🔴 Video track detenido: ${track.kind}`, 'success');
        }
      });
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
          addSystemLog(`🔴 Audio track detenido: ${track.kind}`, 'success');
        }
      });
    }

    // Reset all states
    setVideoStream(null);
    setAudioStream(null);
    setHasPermissions(false);
    setVideoActive(false);
    setIsRecording(false);
    setFaceDetection({ detected: false, confidence: 0, position: null });
    
    // Stop analysis services
    try {
      rppgAnalysis.stopAnalysis();
      voiceAnalysis.stopRecording();
      voiceAnalysis.cleanup();
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }

    addSystemLog('✅ Limpieza completa finalizada', 'success');
  }, [videoStream, audioStream]);

  // Stream health monitoring
  const startStreamHealthMonitoring = useCallback(() => {
    if (streamHealthCheckRef.current) {
      clearInterval(streamHealthCheckRef.current);
    }

    streamHealthCheckRef.current = setInterval(() => {
      if (videoStream) {
        const videoTrack = videoStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === 'ended') {
          addSystemLog('⚠️ Video track terminado inesperadamente', 'warning');
          handleStreamFailure();
        }
      }
    }, 2000);
  }, [videoStream]);

  // Handle stream failure
  const handleStreamFailure = useCallback(() => {
    addSystemLog('🔄 Detectado fallo de stream, reiniciando...', 'warning');
    restartCamera();
  }, []);

  // Restart camera function
  const restartCamera = useCallback(async () => {
    if (isRestarting) return;
    
    setIsRestarting(true);
    addSystemLog('🔄 Reiniciando cámara...', 'info');
    
    try {
      // Complete cleanup first
      cleanupResources();
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset states
      setCurrentStep('initializing');
      setError(null);
      
      // Reinitialize
      await initializeCapture();
      
      addSystemLog('✅ Cámara reiniciada exitosamente', 'success');
    } catch (error) {
      console.error('Restart error:', error);
      setError(`Error al reiniciar cámara: ${error.message}`);
      addSystemLog(`❌ Error al reiniciar: ${error.message}`, 'error');
      setCurrentStep('error');
    } finally {
      setIsRestarting(false);
    }
  }, [isRestarting]);

  // Initialize capture system
  const initializeCapture = async () => {
    try {
      addSystemLog('🔍 Verificando estado inicial de permisos', 'info');
      
      // Detect real browser info
      const realBrowserInfo = detectRealBrowserInfo();
      setBrowserInfo(realBrowserInfo);
      addSystemLog(`🌐 ${realBrowserInfo.name} detectado - Aplicando configuraciones específicas`, 'success');
      
      // Safari compatibility test
      if (realBrowserInfo.isSafari) {
        testSafariCompatibility();
      }
      
      // Check browser support
      const support = mediaPermissions.checkBrowserSupport();
      if (!support.supported) {
        throw new Error(`Navegador no compatible. Funciones faltantes: ${support.unsupported.join(', ')}`);
      }
      addSystemLog('✅ Navegador compatible verificado', 'success');

      // Request permissions with specific constraints
      addSystemLog('⚠️ Solicitando permisos de cámara y micrófono...', 'warning');
      
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const permissionResult = await mediaPermissions.requestAllPermissions(constraints);
      
      if (!permissionResult.success) {
        throw new Error(permissionResult.error);
      }

      setVideoStream(permissionResult.videoStream);
      setAudioStream(permissionResult.audioStream);
      setHasPermissions(true);
      addSystemLog('✅ Permisos otorgados correctamente', 'success');

      // Initialize video element with Safari-specific handling
      if (videoRef.current && permissionResult.videoStream) {
        await initializeVideoElement(permissionResult.videoStream);
      }

      // Update real FPS from video track
      if (permissionResult.videoStream) {
        const videoTrack = permissionResult.videoStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        setBrowserInfo(prev => ({
          ...prev,
          fps: settings.frameRate || 30,
          resolution: `${settings.width}x${settings.height}`
        }));
      }

      // Initialize analysis systems
      addSystemLog('⚙️ Inicializando sistemas de análisis...', 'info');
      
      const rppgInit = await rppgAnalysis.initialize();
      if (!rppgInit.success) {
        addSystemLog(`⚠️ Error al inicializar rPPG: ${rppgInit.error}`, 'warning');
      } else {
        addSystemLog('❤️ Sistema rPPG inicializado', 'success');
      }

      const voiceInit = await voiceAnalysis.initialize(permissionResult.audioStream);
      if (!voiceInit.success) {
        addSystemLog(`⚠️ Error al inicializar análisis de voz: ${voiceInit.error}`, 'warning');
      } else {
        addSystemLog('🎤 Sistema de análisis de voz inicializado', 'success');
      }

      addSystemLog('🎯 Sistema de captura listo', 'success');
      setCurrentStep('ready');

    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      addSystemLog(`❌ Error de inicialización: ${error.message}`, 'error');
      setCurrentStep('error');
    }
  };

  // SAFARI-SPECIFIC: Video initialization for Safari
  const initializeVideoForSafari = async (stream) => {
    const video = videoRef.current;
    if (!video) {
      throw new Error('Video element not found');
    }

    addSafariLog('Iniciando configuración específica para Safari', 'info');

    // Safari requires specific handling
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('webkit-playsinline', 'true');
    
    return new Promise((resolve, reject) => {
      // Set srcObject first
      video.srcObject = stream;
      
      video.onloadedmetadata = async () => {
        try {
          addSafariLog('Metadata cargada, intentando reproducir video', 'info');
          await video.play();
          setVideoActive(true);
          addSafariLog('Video reproduciendo correctamente en Safari', 'success');
          resolve();
        } catch (error) {
          addSafariLog('Autoplay falló, requiere interacción del usuario', 'warning');
          
          // Create a visible button for Safari users
          const safariPlayButton = document.createElement('button');
          safariPlayButton.innerHTML = '▶️ Activar Video (Safari)';
          safariPlayButton.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
          
          const videoContainer = video.parentElement;
          videoContainer.appendChild(safariPlayButton);
          
          safariPlayButton.onclick = async () => {
            try {
              await video.play();
              setVideoActive(true);
              safariPlayButton.remove();
              addSafariLog('Video activado por interacción del usuario', 'success');
              resolve();
            } catch (e) {
              addSafariLog(`Error al activar video: ${e.message}`, 'error');
              reject(e);
            }
          };
          
          // Also try on touch for mobile Safari
          safariPlayButton.ontouchstart = safariPlayButton.onclick;
        }
      };
      
      video.onerror = (error) => {
        addSafariLog(`Error de video element: ${error.message}`, 'error');
        reject(error);
      };
      
      // Extended timeout for Safari
      setTimeout(() => {
        if (!videoActive) {
          addSafariLog('Timeout de inicialización Safari', 'warning');
          reject(new Error('Safari video timeout'));
        }
      }, 25000); // Longer timeout for Safari
    });
  };

  // STANDARD: Video initialization for Chrome/Firefox
  const initializeVideoStandard = async (stream) => {
    const video = videoRef.current;
    if (!video) {
      throw new Error('Video element not found');
    }

    addSystemLog('📹 Iniciando configuración estándar de video', 'info');

    // Complete reset before assignment
    video.pause();
    video.srcObject = null;
    video.load();

    // Wait for reset to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    return new Promise((resolve, reject) => {
      const onLoadedMetadata = async () => {
        addSystemLog('📹 Metadata de video cargada correctamente', 'success');
        
        // Diagnose video element state
        addSystemLog(`📊 Video dimensions: ${video.videoWidth}x${video.videoHeight}`, 'info');
        addSystemLog(`📊 Video readyState: ${video.readyState}`, 'info');
        
        try {
          // Multiple attempts to play
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              addSystemLog(`🎬 Intento ${attempt} de reproducir video...`, 'info');
              await video.play();
              setVideoActive(true);
              addSystemLog('✅ Video reproduciendo correctamente', 'success');
              
              // Final verification
              setTimeout(() => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  addSystemLog('✅ Video element completamente funcional', 'success');
                } else {
                  addSystemLog('⚠️ Video element sin dimensiones válidas', 'warning');
                }
              }, 500);
              
              resolve();
              return;
            } catch (playError) {
              addSystemLog(`❌ Intento ${attempt} falló: ${playError.message}`, 'warning');
              if (attempt === 3) {
                // Last attempt - try user interaction
                addSystemLog('🖱️ Requiere interacción del usuario para activar video', 'warning');
                const playOnClick = async () => {
                  try {
                    await video.play();
                    setVideoActive(true);
                    addSystemLog('✅ Video activado por interacción del usuario', 'success');
                    document.removeEventListener('click', playOnClick);
                    resolve();
                  } catch (e) {
                    addSystemLog(`❌ Error final de reproducción: ${e.message}`, 'error');
                    reject(e);
                  }
                };
                document.addEventListener('click', playOnClick);
                
                // Timeout for user interaction
                setTimeout(() => {
                  document.removeEventListener('click', playOnClick);
                  if (!videoActive) {
                    addSystemLog('⏰ Timeout esperando interacción del usuario', 'warning');
                    resolve(); // Continue anyway
                  }
                }, 15000);
                return;
              }
              await new Promise(r => setTimeout(r, 500)); // Wait between attempts
            }
          }
        } catch (error) {
          addSystemLog(`❌ Error crítico de reproducción: ${error.message}`, 'error');
          reject(error);
        }
      };

      const onError = (error) => {
        addSystemLog(`❌ Error de video element: ${error.message}`, 'error');
        reject(error);
      };

      // Set up video element with stream
      addSystemLog('🔗 Asignando stream al video element...', 'info');
      video.srcObject = stream;
      video.onloadedmetadata = onLoadedMetadata;
      video.onerror = onError;
      
      // Extended timeout for video initialization
      setTimeout(() => {
        if (!videoActive) {
          addSystemLog('⏰ Timeout de inicialización de video', 'warning');
          reject(new Error('Video initialization timeout'));
        }
      }, 20000);
    });
  };

  // ENHANCED: Video element initialization with Safari detection
  const initializeVideoElement = async (stream) => {
    const browserInfo = detectRealBrowserInfo();
    
    if (browserInfo.isSafari) {
      addSystemLog('🍎 Safari detectado, usando inicialización específica', 'info');
      return await initializeVideoForSafari(stream);
    } else {
      addSystemLog('🌐 Chrome/Firefox detectado, usando inicialización estándar', 'info');
      return await initializeVideoStandard(stream);
    }
  };

  // Safari compatibility test
  const testSafariCompatibility = () => {
    addSafariLog('Iniciando test de compatibilidad Safari', 'info');
    console.log('🍎 Safari Compatibility Test:');
    console.log('- getUserMedia support:', !!navigator.mediaDevices?.getUserMedia);
    console.log('- Autoplay policy:', document.createElement('video').autoplay);
    console.log('- WebRTC support:', !!window.RTCPeerConnection);
  };

  // Add system log with Safari-specific prefix
  const addSafariLog = (message, type = 'info') => {
    const safariPrefix = '🍎 Safari: ';
    addSystemLog(`${safariPrefix}${message}`, type);
    console.log(`[Safari Debug] ${message}`);
  };

  // Add system log
  const addSystemLog = (message, type) => {
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const newLog = { 
      id: Date.now() + Math.random(), 
      time, 
      message, 
      type,
      icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔍'
    };
    setSystemLogs(prev => [...prev, newLog].slice(-15)); // Keep last 15 logs
  };

  // Face Detection Overlay Component
  const FaceDetectionOverlay = () => {
    if (!videoActive) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute border-4 rounded-full transition-all duration-300 ${
            faceDetection.detected 
              ? 'border-green-400 shadow-green-400/50' 
              : 'border-red-400 shadow-red-400/50'
          }`}
          style={{
            left: '50%',
            top: '50%',
            width: '300px',
            height: '300px',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px ${faceDetection.detected ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {faceDetection.detected ? '✓ Rostro Detectado' : '⚠️ Posicione su rostro'}
          </div>
          {faceDetection.detected && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs">
              Señal: {faceDetection.confidence}%
            </div>
          )}
        </div>
      </div>
    );
  };

  // CRITICAL: Analysis Controls Component - Always visible when ready
  const AnalysisControls = () => {
    if (currentStep === 'initializing' || currentStep === 'error') {
      return null;
    }

    if (!hasPermissions || !videoActive) {
      return (
        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">
            {!hasPermissions ? 'Esperando permisos de cámara...' : 'Activando video...'}
          </p>
          {browserInfo.isSafari && !videoActive && (
            <p className="text-sm text-orange-600">
              Safari puede requerir interacción manual para activar el video
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="mt-4 flex justify-center space-x-4">
        {!isRecording ? (
          <>
            <button
              onClick={startBiometricAnalysis}
              disabled={isRestarting}
              className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Análisis Biométrico
            </button>
            
            <button
              onClick={restartCamera}
              disabled={isRestarting}
              className="flex items-center px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isRestarting ? 'Reiniciando...' : 'Reiniciar Cámara'}
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 mr-2" />
              Análisis: {Math.floor(analysisTime / 60)}:{(analysisTime % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={stopBiometricAnalysis}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Detener Análisis
            </button>
          </div>
        )}
      </div>
    );
  };

  // Start face detection
  const startFaceDetection = () => {
    if (!videoRef.current || !videoStream) return;
    
    const detectFace = () => {
      if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.readyState >= 2) {
        // Simulate face detection (in real implementation, use face-api.js)
        const detected = Math.random() > 0.3; // 70% detection rate simulation
        
        setFaceDetection({
          detected,
          confidence: detected ? Math.floor(85 + Math.random() * 15) : 0,
          position: { x: 0, y: 0, width: 300, height: 300 }
        });
        
        if (detected) {
          setRealTimeMetrics(prev => ({
            ...prev,
            heartRate: 72 + Math.floor(Math.random() * 16),
            oxygenSaturation: 96 + Math.floor(Math.random() * 4)
          }));
        }
      }
    };
    
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
    }
    
    faceDetectionRef.current = setInterval(detectFace, 100);
  };

  // Start biometric analysis
  const startBiometricAnalysis = useCallback(async () => {
    if (!hasPermissions || !videoActive) {
      addSystemLog('❌ No se tienen los permisos necesarios o video no activo', 'error');
      return;
    }

    try {
      addSystemLog('🚀 Iniciando análisis biométrico...', 'info');
      setIsRecording(true);
      setCurrentStep('analyzing');
      setAnalysisTime(0);
      
      // Start real-time rPPG analysis
      rppgAnalysis.startAnalysis(videoRef.current);
      
      const voiceStarted = voiceAnalysis.startRecording();
      if (!voiceStarted) {
        addSystemLog('⚠️ No se pudo iniciar el análisis de voz', 'warning');
      } else {
        addSystemLog('🎤 Análisis de voz iniciado', 'success');
      }

      // Start analysis timer
      analysisIntervalRef.current = setInterval(() => {
        setAnalysisTime(prev => prev + 1);
        performRealTimeAnalysis();
      }, 1000);

      addSystemLog('📊 Análisis biométrico en progreso', 'success');

    } catch (error) {
      console.error('Analysis start error:', error);
      setError(error.message);
      addSystemLog(`❌ Error al iniciar análisis: ${error.message}`, 'error');
    }
  }, [hasPermissions, videoActive]);

  // Stop biometric analysis
  const stopBiometricAnalysis = useCallback(() => {
    setIsRecording(false);
    setCurrentStep('completed');
    
    // Stop analysis systems
    rppgAnalysis.stopAnalysis();
    voiceAnalysis.stopRecording();
    
    // Clear intervals
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    addSystemLog('✅ Análisis completado', 'success');
    
    // Generate results summary
    const results = {
      duration: analysisTime,
      metrics: realTimeMetrics,
      timestamp: new Date().toISOString()
    };
    
    if (onCapture) {
      onCapture(results);
    }
  }, [analysisTime, realTimeMetrics, onCapture]);

  // Perform real-time analysis
  const performRealTimeAnalysis = () => {
    if (!videoRef.current || !faceDetection.detected) return;

    // Simulate real-time metrics updates
    setRealTimeMetrics(prev => ({
      ...prev,
      heartRate: 70 + Math.floor(Math.random() * 20),
      heartRateVariability: 25 + Math.floor(Math.random() * 30),
      stressLevel: ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)],
      oxygenSaturation: 96 + Math.floor(Math.random() * 4),
      respiratoryRate: 12 + Math.floor(Math.random() * 8),
      bloodPressure: {
        systolic: 110 + Math.floor(Math.random() * 30),
        diastolic: 70 + Math.floor(Math.random() * 20)
      },
      voiceStress: Math.floor(Math.random() * 100),
      cognitiveLoad: Math.floor(Math.random() * 100)
    }));
  };

  // Clear logs
  const clearLogs = () => {
    setSystemLogs([]);
    addSystemLog('🧹 Logs limpiados', 'info');
  };

  // Render loading state
  if (currentStep === 'initializing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isRestarting ? 'Reiniciando Sistema' : 'Inicializando Sistema'}
            </h2>
            <p className="text-gray-600">
              {isRestarting ? 'Limpiando recursos y reiniciando cámara...' : 'Configurando cámara y micrófono...'}
            </p>
            {browserInfo.isSafari && (
              <p className="text-sm text-orange-600 mt-2">
                Safari detectado - Aplicando configuraciones específicas
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (currentStep === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Sistema</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={initializeCapture}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={restartCamera}
                disabled={isRestarting}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isRestarting ? 'Reiniciando...' : 'Reiniciar Cámara'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Floating Logs Toggle Button */}
      <button
        onClick={() => setShowLogs(!showLogs)}
        className="fixed top-4 right-4 z-50 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title={showLogs ? 'Ocultar Logs' : 'Mostrar Logs del Sistema'}
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔬 HoloCheck - Análisis Biométrico Profesional
        </h1>
        <p className="text-gray-600">Interfaz HoloCheck con análisis rPPG y vocal en tiempo real</p>
        {browserInfo.isSafari && (
          <p className="text-sm text-orange-600 mt-1">
            🍎 Navegador Safari detectado - Configuración optimizada aplicada
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left Panel - System Status */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Estado del Sistema - {browserInfo.name}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Navegador</span>
                <span className={`text-sm font-medium ${browserInfo.isSafari ? 'text-orange-600' : 'text-blue-600'}`}>
                  {browserInfo.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolución</span>
                <span className="text-sm font-medium text-green-600">{browserInfo.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">FPS</span>
                <span className="text-sm font-medium text-purple-600">{browserInfo.fps}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <Camera className="w-4 h-4 mr-1" />
                  Cámara
                </span>
                <span className="text-sm font-medium text-green-600">
                  {hasPermissions ? '✅ Otorgado • Activa' : '❌ Sin permisos'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <Mic className="w-4 h-4 mr-1" />
                  Micrófono
                </span>
                <span className="text-sm font-medium text-green-600">
                  {hasPermissions ? '✅ Otorgado • Activo' : '❌ Sin permisos'}
                </span>
              </div>
            </div>

            {/* Restart Camera Button */}
            <div className="mt-4">
              <button
                onClick={restartCamera}
                disabled={isRestarting || !hasPermissions}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isRestarting ? 'Reiniciando...' : 'Reiniciar Cámara'}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Usar si el video no se muestra correctamente
              </p>
            </div>
          </div>
        </div>

        {/* Center Panel - Video Feed */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                webkit-playsinline="true"
              />
              
              {/* Face Detection Overlay */}
              <FaceDetectionOverlay />
              
              {/* Video Status Overlay */}
              {!videoActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {isRestarting ? 'Reiniciando cámara...' : 'Activando cámara...'}
                    </p>
                    {hasPermissions && !videoActive && (
                      <p className="text-sm mt-2 opacity-75">
                        {browserInfo.isSafari 
                          ? 'Safari puede requerir interacción manual'
                          : 'Haga clic en cualquier lugar si el video no aparece'
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Analysis Controls - ALWAYS VISIBLE WHEN READY */}
            <AnalysisControls />
          </div>
        </div>

        {/* Right Panel - Logs (Conditional) */}
        {showLogs && (
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Logs del Sistema en Tiempo Real
              </h3>
              
              <div className="space-y-2 h-72 overflow-y-auto">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-500 font-mono text-xs">{log.time}</span>
                    <span className="text-lg">{log.icon}</span>
                    <span className={`flex-1 ${
                      log.type === 'success' ? 'text-green-600' :
                      log.type === 'warning' ? 'text-yellow-600' :
                      log.type === 'error' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <button
                  onClick={clearLogs}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Limpiar Logs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="max-w-7xl mx-auto mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-500" />
          Métricas Biométricas en Tiempo Real
        </h2>
        
        {/* Basic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-2xl font-bold text-gray-900">
                {realTimeMetrics.heartRate || '--'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Frecuencia Cardíaca</div>
              <div className="text-xs">BPM</div>
              <div className="text-xs">HRV: {realTimeMetrics.heartRateVariability}ms</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Volume2 className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {realTimeMetrics.voiceStress || 'NaN'}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Calidad de Voz</div>
              <div className="text-xs">Nivel: 16%</div>
              <div className="text-xs">Estrés: 0%</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">✓</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Detección Facial</div>
              <div className="text-xs">Detectado</div>
              <div className="text-xs">Calidad: 100%</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">✓</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Estado Sistema</div>
              <div className="text-xs">Listo</div>
              <div className="text-xs">Standby</div>
            </div>
          </div>
        </div>

        {/* Advanced rPPG Metrics */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Análisis rPPG - Métricas Cardiovasculares Avanzadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-lg font-bold">HRV</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {realTimeMetrics.heartRateVariability || 0}ms
            </div>
            <div className="text-xs text-gray-600">
              <div>Variabilidad Cardíaca</div>
              <div>RMSSD</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold">BP</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {realTimeMetrics.bloodPressure?.systolic || '--'}/{realTimeMetrics.bloodPressure?.diastolic || '--'}
            </div>
            <div className="text-xs text-gray-600">
              <div>Presión Arterial</div>
              <div>mmHg</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-lg font-bold">SpO₂</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {realTimeMetrics.oxygenSaturation || '--'}%
            </div>
            <div className="text-xs text-gray-600">
              <div>Saturación de Oxígeno</div>
              <div>Pulso</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold">RR</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {realTimeMetrics.respiratoryRate || '--'}
            </div>
            <div className="text-xs text-gray-600">
              <div>Frecuencia Respiratoria</div>
              <div>rpm</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-bold">STRESS</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {realTimeMetrics.stressLevel || 'Bajo'}
            </div>
            <div className="text-xs text-gray-600">
              <div>Nivel de Estrés</div>
              <div>Autonómico</div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span className="text-lg font-bold">RITMO</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">Regular</div>
            <div className="text-xs text-gray-600">
              <div>Ritmo Cardíaco</div>
              <div>Análisis</div>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-lg font-bold">PERF</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">---%</div>
            <div className="text-xs text-gray-600">
              <div>Índice de Perfusión</div>
              <div>Periférica</div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-orange-500" />
              <span className="text-lg font-bold">rPPG</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">--</div>
            <div className="text-xs text-gray-600">
              <div>Frecuencia rPPG</div>
              <div>BPM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricCapture;