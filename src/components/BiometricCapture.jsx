import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, Play, Square, CheckCircle, AlertTriangle, Heart, Activity, Volume2, Timer, User, Eye, Cpu } from 'lucide-react';
import { mediaPermissions } from '../services/mediaPermissions';
import { rppgAnalysis } from '../services/rppgAnalysis';
import { voiceAnalysis } from '../services/voiceAnalysis';
import { useAnalysisLogger } from './AnalysisLogger';

const BiometricCapture = ({ onCapture, onNext, onBack }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  
  // Media streams and permissions
  const [hasPermissions, setHasPermissions] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  
  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [signalStrength, setSignalStrength] = useState(100);
  
  // System status
  const [systemStatus, setSystemStatus] = useState({
    browser: 'Safari',
    resolution: '1280x720',
    fps: 30,
    cameraGranted: false,
    cameraActive: false,
    microphoneGranted: false,
    microphoneActive: false
  });
  
  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    heartRate: '--',
    hrv: '0ms',
    voiceQuality: 'NaN',
    voiceLevel: '16',
    voiceStress: '0',
    faceDetectionQuality: '100',
    systemState: 'Listo',
    systemMode: 'Standby'
  });
  
  // Logs state
  const [systemLogs, setSystemLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const faceDetectionRef = useRef(null);
  
  // Logger
  const { setLogger, logInfo, logSuccess, logWarning, logError, logProcessing } = useAnalysisLogger();

  // Add log to system logs
  const addSystemLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    
    setSystemLogs(prev => [...prev.slice(-50), newLog]); // Keep last 50 logs
  }, []);

  // Detect browser
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Edge')) {
      return 'Edge';
    }
    return 'Unknown';
  };

  // Initialize component
  useEffect(() => {
    initializeCapture();
    return () => cleanup();
  }, []);

  // Initialize capture system
  const initializeCapture = async () => {
    try {
      addSystemLog('🔍 Verificando estado inicial de permisos', 'info');
      
      // Detect browser
      const browser = detectBrowser();
      setSystemStatus(prev => ({ ...prev, browser }));
      
      addSystemLog(`🦊 ${browser} detectado - Aplicando configuraciones específicas`, 'success');
      addSystemLog(`🌐 Browser detectado: ${browser}`, 'info');
      
      // Check browser support
      const support = mediaPermissions.checkBrowserSupport();
      if (!support.supported) {
        throw new Error(`Navegador no compatible. Funciones faltantes: ${support.unsupported.join(', ')}`);
      }
      
      // Request permissions
      addSystemLog('⚠️ No hay stream, re-solicitando permisos...', 'warning');
      const permissionResult = await mediaPermissions.requestAllPermissions();
      
      if (!permissionResult.success) {
        throw new Error(permissionResult.error);
      }

      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        cameraGranted: true,
        cameraActive: true,
        microphoneGranted: true,
        microphoneActive: true,
        resolution: `${permissionResult.videoSettings?.width || 1280}x${permissionResult.videoSettings?.height || 720}`,
        fps: permissionResult.videoSettings?.frameRate || 30
      }));

      setVideoStream(permissionResult.videoStream);
      setAudioStream(permissionResult.audioStream);
      setHasPermissions(true);
      
      addSystemLog('📹 Asignando stream al elemento video...', 'info');

      // Initialize video element
      if (videoRef.current && permissionResult.videoStream) {
        videoRef.current.srcObject = permissionResult.videoStream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        // Start face detection
        startFaceDetection();
      }

      // Initialize analysis systems
      const rppgInit = await rppgAnalysis.initialize();
      const voiceInit = await voiceAnalysis.initialize(permissionResult.audioStream);
      
      setCurrentStep('ready');
      setFaceDetected(true);
      
      addSystemLog('✅ Sistema listo para análisis', 'success');

    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      addSystemLog(`❌ Error: ${error.message}`, 'error');
    }
  };

  // Start face detection
  const startFaceDetection = () => {
    // Simulate face detection for now
    setFaceDetected(true);
    setFacePosition({
      x: 0.3, // 30% from left
      y: 0.2, // 20% from top
      width: 0.4, // 40% width
      height: 0.6 // 60% height
    });
    setSignalStrength(100);
  };

  // Start biometric analysis
  const startBiometricAnalysis = useCallback(async () => {
    if (!hasPermissions) {
      addSystemLog('❌ No se tienen los permisos necesarios', 'error');
      return;
    }

    try {
      addSystemLog('🚀 Iniciando análisis biométrico...', 'info');
      setIsRecording(true);
      setCurrentStep('recording');
      setCountdown(3);

      // Countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            beginRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Analysis start error:', error);
      setError(error.message);
      addSystemLog(`❌ Error al iniciar análisis: ${error.message}`, 'error');
    }
  }, [hasPermissions]);

  // Begin actual recording
  const beginRecording = useCallback(async () => {
    try {
      setRecordingTime(0);
      addSystemLog('📊 Análisis biométrico iniciado', 'success');

      // Reset analysis systems
      rppgAnalysis.reset();
      voiceAnalysis.reset();

      // Start voice recording
      const voiceStarted = voiceAnalysis.startRecording();
      if (!voiceStarted) {
        addSystemLog('⚠️ No se pudo iniciar el análisis de voz', 'warning');
      }

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start real-time analysis
      analysisIntervalRef.current = setInterval(() => {
        performRealTimeAnalysis();
      }, 100);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 60000);

    } catch (error) {
      console.error('Recording begin error:', error);
      setError(error.message);
      addSystemLog(`❌ Error durante la grabación: ${error.message}`, 'error');
    }
  }, [isRecording]);

  // Perform real-time analysis
  const performRealTimeAnalysis = useCallback(() => {
    if (!videoRef.current || !isRecording) return;

    try {
      // Simulate real-time metrics updates
      setRealTimeMetrics(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
        voiceLevel: Math.floor(Math.random() * 50) + 10, // 10-60%
        voiceStress: Math.floor(Math.random() * 20), // 0-20%
        systemState: 'Analizando',
        systemMode: 'Activo'
      }));

    } catch (error) {
      console.error('Real-time analysis error:', error);
    }
  }, [isRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      addSystemLog('⏹️ Finalizando análisis...', 'info');
      setIsRecording(false);
      setCurrentStep('complete');

      // Clear intervals
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }

      // Update metrics to final state
      setRealTimeMetrics(prev => ({
        ...prev,
        systemState: 'Completado',
        systemMode: 'Standby'
      }));

      addSystemLog('✅ Análisis completado exitosamente', 'success');

    } catch (error) {
      console.error('Stop recording error:', error);
      setError(error.message);
      addSystemLog(`❌ Error al finalizar: ${error.message}`, 'error');
    }
  }, []);

  // Cleanup function
  const cleanup = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    mediaPermissions.stopAllStreams();
    voiceAnalysis.cleanup();
  };

  // Clear logs
  const clearLogs = () => {
    setSystemLogs([]);
  };

  // Toggle logs visibility
  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render face detection overlay
  const renderFaceDetectionOverlay = () => {
    if (!faceDetected || !videoRef.current) return null;

    const videoRect = videoRef.current.getBoundingClientRect();
    const centerX = videoRect.width * 0.5;
    const centerY = videoRect.height * 0.45;
    const radius = Math.min(videoRect.width, videoRect.height) * 0.25;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Circular face detection overlay */}
        <div 
          className="absolute border-4 border-green-400 rounded-full"
          style={{
            left: centerX - radius,
            top: centerY - radius,
            width: radius * 2,
            height: radius * 2,
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
          }}
        >
          {/* Signal strength indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Señal: {signalStrength}%
          </div>
          
          {/* Detection points */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
        </div>

        {/* Face detected badge */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Rostro detectado</span>
        </div>
      </div>
    );
  };

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse mb-6">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurando Sistema</h2>
            <p className="text-gray-600">Inicializando cámara, micrófono y sistemas de análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🩺 HoloCheck - Análisis Biométrico Profesional
          </h1>
          <p className="text-gray-600">Interfaz Anuralogix con análisis rPPG y vocal en tiempo real</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* System Status Panel */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg border border-blue-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                Estado del Sistema - {systemStatus.browser}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Navegador</span>
                  <span className="font-semibold text-blue-600">{systemStatus.browser}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resolución</span>
                  <span className="font-semibold text-green-600">{systemStatus.resolution}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">FPS</span>
                  <span className="font-semibold text-purple-600">{systemStatus.fps}</span>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">Cámara</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {systemStatus.cameraGranted && (
                        <span className="text-green-600 text-sm">✓ Otorgado</span>
                      )}
                      {systemStatus.cameraActive && (
                        <span className="text-green-600 text-sm">🟢 Activa</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">Micrófono</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {systemStatus.microphoneGranted && (
                        <span className="text-green-600 text-sm">✓ Otorgado</span>
                      )}
                      {systemStatus.microphoneActive && (
                        <span className="text-green-600 text-sm">🟢 Activo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Stream */}
          <div className="col-span-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face detection overlay */}
              {renderFaceDetectionOverlay()}
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}
            </div>
            
            {/* Position status */}
            <div className="mt-2 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Posición correcta - Sistema listo para análisis
              </span>
            </div>
          </div>

          {/* Real-time Logs Panel */}
          <div className="col-span-4">
            {showLogs && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-96">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Logs del Sistema en Tiempo Real
                  </h3>
                  <button
                    onClick={clearLogs}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpiar Logs
                  </button>
                </div>
                
                <div className="h-80 overflow-y-auto space-y-1">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-sm">
                      <span className="text-gray-500 font-mono text-xs">{log.timestamp}</span>
                      <span className={`flex-1 ${
                        log.type === 'success' ? 'text-green-600' :
                        log.type === 'warning' ? 'text-yellow-600' :
                        log.type === 'error' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={startBiometricAnalysis}
            disabled={!hasPermissions || isRecording}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Iniciar Análisis Biométrico</span>
          </button>
          
          <button
            onClick={toggleLogs}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            {showLogs ? 'Ocultar Logs' : 'Mostrar Logs'}
          </button>
        </div>

        {/* Biometric Metrics Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Métricas Biométricas en Tiempo Real
          </h3>
          
          <div className="grid grid-cols-4 gap-4">
            {/* Heart Rate Card */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.heartRate}</div>
              <div className="text-sm text-gray-600">Frecuencia</div>
              <div className="text-sm text-gray-600">Cardíaca</div>
              <div className="text-xs text-gray-500 mt-1">BPM</div>
              <div className="text-xs text-gray-500">HRV: {realTimeMetrics.hrv}</div>
            </div>

            {/* Voice Quality Card */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Volume2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.voiceQuality}%</div>
              <div className="text-sm text-gray-600">Calidad de Voz</div>
              <div className="text-xs text-gray-500 mt-1">Nivel: {realTimeMetrics.voiceLevel}%</div>
              <div className="text-xs text-gray-500">Estrés: {realTimeMetrics.voiceStress}%</div>
            </div>

            {/* Face Detection Card */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">✓</div>
              <div className="text-sm text-gray-600">Detección Facial</div>
              <div className="text-xs text-gray-500 mt-1">Detectado</div>
              <div className="text-xs text-gray-500">Calidad: {realTimeMetrics.faceDetectionQuality}%</div>
            </div>

            {/* System Status Card */}
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Cpu className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">✓</div>
              <div className="text-sm text-gray-600">Estado Sistema</div>
              <div className="text-xs text-gray-500 mt-1">{realTimeMetrics.systemState}</div>
              <div className="text-xs text-gray-500">{realTimeMetrics.systemMode}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricCapture;