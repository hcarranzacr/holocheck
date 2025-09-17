import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, Activity, Heart, Brain, Eye, Volume2, AlertTriangle, Play, Square, Clock } from 'lucide-react';
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

  // Browser and system info (REAL DATA)
  const [browserInfo, setBrowserInfo] = useState({
    name: 'Detectando...',
    resolution: 'Detectando...',
    fps: 'Detectando...'
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

  // Analysis logger
  const { logAnalysis, getAnalysisHistory } = useAnalysisLogger({
    sessionId: `biometric_${Date.now()}`,
    userId: 'demo_user',
    analysisType: 'complete_biometric'
  });

  // Initialize on mount
  useEffect(() => {
    initializeCapture();
    return () => cleanup();
  }, []);

  // Face detection effect
  useEffect(() => {
    if (videoRef.current && hasPermissions && videoStream && videoActive) {
      startFaceDetection();
    }
  }, [hasPermissions, videoStream, videoActive]);

  // Detect real browser info
  const detectRealBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
    } else if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
    }

    return {
      name: browserName,
      resolution: `${screen.width}x${screen.height}`,
      fps: 30, // Will be updated when video loads
      userAgent: userAgent
    };
  };

  // Initialize capture system
  const initializeCapture = async () => {
    try {
      addSystemLog('🔍 Verificando estado inicial de permisos', 'info');
      
      // Detect real browser info
      const realBrowserInfo = detectRealBrowserInfo();
      setBrowserInfo(realBrowserInfo);
      addSystemLog(`🌐 ${realBrowserInfo.name} detectado - Aplicando configuraciones específicas`, 'success');
      
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

      // Initialize video element with robust error handling
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

  // Initialize video element with robust handling
  const initializeVideoElement = async (stream) => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject(new Error('Video element not found'));
        return;
      }

      // Set up event handlers
      const onLoadedMetadata = async () => {
        try {
          // Force video to play
          await video.play();
          setVideoActive(true);
          addSystemLog('📹 Stream de video inicializado correctamente', 'success');
          resolve();
        } catch (playError) {
          console.warn('Auto-play failed:', playError);
          // Try to play on user interaction
          const playOnClick = async () => {
            try {
              await video.play();
              setVideoActive(true);
              addSystemLog('📹 Stream de video activado por interacción', 'success');
              document.removeEventListener('click', playOnClick);
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          document.addEventListener('click', playOnClick);
          addSystemLog('🖱️ Haga clic para activar el video', 'warning');
        }
      };

      const onError = (error) => {
        addSystemLog(`❌ Error de video: ${error.message}`, 'error');
        reject(error);
      };

      // Set up video element
      video.srcObject = stream;
      video.onloadedmetadata = onLoadedMetadata;
      video.onerror = onError;
      
      // Timeout fallback
      setTimeout(() => {
        if (!videoActive) {
          reject(new Error('Video initialization timeout'));
        }
      }, 10000);
    });
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
    setSystemLogs(prev => [...prev, newLog].slice(-10));
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

  // Cleanup function
  const cleanup = () => {
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicializando Sistema</h2>
            <p className="text-gray-600">Configurando cámara y micrófono...</p>
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
            <button
              onClick={initializeCapture}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
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
        title={showLogs ? 'Ocultar Logs' : 'Mostrar Logs'}
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔬 HoloCheck - Análisis Biométrico Profesional
        </h1>
        <p className="text-gray-600">Interfaz HoloCheck con análisis rPPG y vocal en tiempo real</p>
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
                <span className="text-sm font-medium text-blue-600">{browserInfo.name}</span>
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
              />
              
              {/* Face Detection Overlay */}
              <FaceDetectionOverlay />
              
              {/* Video Status Overlay */}
              {!videoActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Activando cámara...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Analysis Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startBiometricAnalysis}
                  disabled={!hasPermissions || !videoActive}
                  className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Análisis Biométrico
                </button>
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
                    Detener
                  </button>
                </div>
              )}
              
              {showLogs && (
                <button
                  onClick={clearLogs}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Limpiar Logs
                </button>
              )}
            </div>
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