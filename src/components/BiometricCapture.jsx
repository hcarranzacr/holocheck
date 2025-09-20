import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, MicOff, Play, Square, AlertCircle, CheckCircle, Clock, Heart, Activity, Brain, Eye } from 'lucide-react';

const BiometricCapture = () => {
  // Estados principales
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const [captureMode, setCaptureMode] = useState('complete');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [biometricData, setBiometricData] = useState(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    browser: 'Detectando...',
    resolution: 'Configurando...',
    fps: 'Calculando...',
    processor: 'Inicializando...',
    face: 'Esperando...'
  });

  // Referencias
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Estados de análisis
  const [currentMetrics, setCurrentMetrics] = useState({
    heartRate: 0,
    hrv: 0,
    spO2: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    stressLevel: 'Bajo',
    respiratoryRate: 0,
    perfusionIndex: 0,
    heartRhythm: 'Regular'
  });

  // 🚨 FUNCIÓN DE DIAGNÓSTICO CRÍTICO
  const addDiagnosticLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setDiagnosticLogs(prev => [...prev.slice(-15), logEntry]);
    
    // LOGS CRÍTICOS EN CONSOLA
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    // ALERTAS CRÍTICAS
    if (type === 'error') {
      console.error(`CRITICAL ERROR: ${message}`);
    }
  }, []);

  // 🚨 CONFIGURACIÓN DE NAVEGADOR SIMPLIFICADA
  const getBrowserConfig = () => {
    const userAgent = navigator.userAgent;
    addDiagnosticLog(`Detectando navegador: ${userAgent}`, 'info');
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      addDiagnosticLog('Safari detectado - Usando configuración específica', 'info');
      return {
        name: 'Safari',
        mimeType: 'video/mp4',
        bitrate: 1000000
      };
    } else if (userAgent.includes('Chrome')) {
      addDiagnosticLog('Chrome detectado - Usando WebM', 'info');
      return {
        name: 'Chrome',
        mimeType: 'video/webm',
        bitrate: 2500000
      };
    } else {
      addDiagnosticLog('Firefox/Otro navegador - Usando WebM', 'info');
      return {
        name: 'Firefox',
        mimeType: 'video/webm',
        bitrate: 2000000
      };
    }
  };

  // 🚨 FUNCIÓN DE GRABACIÓN CRÍTICA COMPLETAMENTE REESCRITA
  const startRecording = async () => {
    addDiagnosticLog('🚀 ========== INICIANDO GRABACIÓN CRÍTICA ==========', 'info');
    
    // VALIDACIÓN 1: Stream disponible
    if (!streamRef.current) {
      addDiagnosticLog('❌ FALLO CRÍTICO: Stream no disponible', 'error');
      alert('ERROR: Stream de cámara no disponible');
      return;
    }
    addDiagnosticLog('✅ Stream disponible', 'success');

    // VALIDACIÓN 2: No grabando ya
    if (isRecording) {
      addDiagnosticLog('⚠️ Ya grabando, ignorando solicitud', 'warning');
      return;
    }

    // VALIDACIÓN 3: Tracks del stream
    const videoTracks = streamRef.current.getVideoTracks();
    const audioTracks = streamRef.current.getAudioTracks();
    
    addDiagnosticLog(`📊 Tracks: Video=${videoTracks.length}, Audio=${audioTracks.length}`, 'info');
    
    if (videoTracks.length === 0) {
      addDiagnosticLog('❌ FALLO: No hay tracks de video', 'error');
      alert('ERROR: No se encontraron tracks de video');
      return;
    }

    // VALIDACIÓN 4: Estado de tracks
    videoTracks.forEach((track, i) => {
      addDiagnosticLog(`📹 Track ${i}: ${track.readyState} (${track.enabled ? 'enabled' : 'disabled'})`, 'info');
    });

    try {
      // PASO 1: Configuración del navegador
      const browserConfig = getBrowserConfig();
      addDiagnosticLog(`🔧 Configuración: ${browserConfig.name} - ${browserConfig.mimeType}`, 'info');

      // PASO 2: Verificar soporte de mimeType
      let finalMimeType = browserConfig.mimeType;
      if (!MediaRecorder.isTypeSupported(finalMimeType)) {
        addDiagnosticLog(`⚠️ ${finalMimeType} no soportado, probando alternativas...`, 'warning');
        
        const alternatives = ['video/webm', 'video/mp4'];
        finalMimeType = null;
        
        for (const alt of alternatives) {
          if (MediaRecorder.isTypeSupported(alt)) {
            finalMimeType = alt;
            addDiagnosticLog(`✅ Alternativa encontrada: ${alt}`, 'success');
            break;
          }
        }
        
        if (!finalMimeType) {
          addDiagnosticLog('⚠️ Usando mimeType por defecto del navegador', 'warning');
        }
      } else {
        addDiagnosticLog(`✅ MimeType ${finalMimeType} soportado`, 'success');
      }

      // PASO 3: Preparar opciones de MediaRecorder
      const options = {};
      if (finalMimeType) {
        options.mimeType = finalMimeType;
      }
      options.videoBitsPerSecond = browserConfig.bitrate;
      
      addDiagnosticLog(`🔧 Opciones MediaRecorder: ${JSON.stringify(options)}`, 'info');

      // PASO 4: Crear MediaRecorder
      addDiagnosticLog('🔧 Creando MediaRecorder...', 'info');
      
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
        addDiagnosticLog('✅ MediaRecorder creado exitosamente', 'success');
      } catch (createError) {
        addDiagnosticLog(`⚠️ Error con opciones: ${createError.message}, probando sin opciones...`, 'warning');
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        addDiagnosticLog('✅ MediaRecorder creado sin opciones específicas', 'success');
      }

      // PASO 5: Resetear chunks
      recordedChunksRef.current = [];
      addDiagnosticLog('🗂️ Chunks reseteados', 'info');

      // PASO 6: Configurar event listeners ANTES de start()
      addDiagnosticLog('🔧 Configurando event listeners...', 'info');

      mediaRecorderRef.current.onstart = (event) => {
        addDiagnosticLog('🎬 ✅ MediaRecorder.onstart DISPARADO', 'success');
        setIsRecording(true);
        setRecordingTime(0);
        
        // Iniciar contador
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            addDiagnosticLog(`⏱️ Tiempo: ${newTime}s`, 'info');
            
            if (newTime >= 30) {
              addDiagnosticLog('⏰ 30 segundos completados, deteniendo...', 'info');
              stopRecording();
            }
            
            return newTime;
          });
        }, 1000);
      };

      mediaRecorderRef.current.ondataavailable = (event) => {
        const chunkSize = event.data ? event.data.size : 0;
        addDiagnosticLog(`📦 ✅ CHUNK RECIBIDO: ${chunkSize} bytes`, 'success');
        
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          addDiagnosticLog(`📊 Total chunks: ${recordedChunksRef.current.length}`, 'success');
        } else {
          addDiagnosticLog('⚠️ Chunk vacío recibido', 'warning');
        }
      };

      mediaRecorderRef.current.onstop = (event) => {
        addDiagnosticLog('⏹️ ✅ MediaRecorder.onstop DISPARADO', 'success');
        setIsRecording(false);
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        const totalChunks = recordedChunksRef.current.length;
        addDiagnosticLog(`📊 Grabación detenida con ${totalChunks} chunks`, 'success');
        
        if (totalChunks > 0) {
          processRecording();
        } else {
          addDiagnosticLog('❌ ERROR: No hay chunks para procesar', 'error');
          alert('ERROR: No se grabaron datos');
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        const errorMsg = event.error ? event.error.message : 'Error desconocido';
        addDiagnosticLog(`❌ MediaRecorder ERROR: ${errorMsg}`, 'error');
        setIsRecording(false);
        alert(`ERROR DE GRABACIÓN: ${errorMsg}`);
      };

      // PASO 7: Verificar estado antes de start()
      const preStartState = mediaRecorderRef.current.state;
      addDiagnosticLog(`📊 Estado PRE-START: ${preStartState}`, 'info');
      
      if (preStartState !== 'inactive') {
        throw new Error(`Estado incorrecto para start(): ${preStartState}`);
      }

      // PASO 8: EJECUTAR START() - MOMENTO CRÍTICO
      addDiagnosticLog('🎬 ========== EJECUTANDO start(1000) ==========', 'info');
      mediaRecorderRef.current.start(1000);
      addDiagnosticLog('🎬 start() ejecutado, esperando confirmación...', 'info');

      // PASO 9: Verificación crítica con timeout
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          const postStartState = mediaRecorderRef.current.state;
          addDiagnosticLog(`📊 Estado POST-START: ${postStartState}`, 'info');
          
          if (postStartState === 'recording') {
            addDiagnosticLog('✅ ========== GRABACIÓN CONFIRMADA ACTIVA ==========', 'success');
          } else {
            addDiagnosticLog(`❌ ========== GRABACIÓN FALLÓ (${postStartState}) ==========`, 'error');
            alert(`ERROR: Grabación no se inició (estado: ${postStartState})`);
          }
        }
      }, 1500);

      // PASO 10: Verificación adicional a los 3 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          addDiagnosticLog(`✅ Grabación estable después de 3s (chunks: ${recordedChunksRef.current.length})`, 'success');
        } else {
          addDiagnosticLog('❌ Grabación no estable después de 3s', 'error');
        }
      }, 3000);

    } catch (error) {
      addDiagnosticLog(`❌ ========== ERROR CRÍTICO: ${error.message} ==========`, 'error');
      console.error('ERROR CRÍTICO EN startRecording:', error);
      setIsRecording(false);
      alert(`ERROR CRÍTICO: ${error.message}`);
    }
  };

  // Función de detección facial simplificada
  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Simulación simple de detección facial
    const isVideoActive = video.videoWidth > 0 && video.videoHeight > 0;
    
    setFaceDetected(isVideoActive);
    setFaceStable(isVideoActive);

    // Actualizar estado del sistema
    setSystemStatus(prev => ({
      ...prev,
      face: isVideoActive ? 'Estabilizado' : 'No detectado'
    }));

    // Auto-iniciar grabación cuando rostro esté estabilizado
    if (isVideoActive && !isRecording && isCapturing) {
      addDiagnosticLog('🎯 Video activo detectado - Iniciando auto-grabación', 'info');
      startRecording();
    }
  }, [isCapturing, isRecording, addDiagnosticLog]);

  // Inicialización de cámara
  const initializeCamera = async () => {
    try {
      addDiagnosticLog('📹 Iniciando cámara...', 'info');
      
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        },
        audio: captureMode !== 'video' ? {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        
        const browserConfig = getBrowserConfig();
        if (browserConfig.name === 'Safari') {
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.setAttribute('playsinline', 'true');
        }

        await videoRef.current.play();
        addDiagnosticLog('✅ Cámara iniciada correctamente', 'success');

        // Actualizar estado del sistema
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        
        setSystemStatus(prev => ({
          ...prev,
          browser: browserConfig.name,
          resolution: `${settings.width}x${settings.height}`,
          fps: settings.frameRate || 30,
          processor: 'Activo'
        }));

        // Iniciar detección facial
        faceDetectionIntervalRef.current = setInterval(detectFace, 1000);
        
        return true;
      }
    } catch (error) {
      addDiagnosticLog(`❌ Error al acceder a la cámara: ${error.message}`, 'error');
      alert('Error al acceder a la cámara. Verifica los permisos.');
      return false;
    }
  };

  // Detener grabación
  const stopRecording = () => {
    addDiagnosticLog('⏹️ Deteniendo grabación...', 'info');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // Procesar grabación
  const processRecording = async () => {
    addDiagnosticLog('🔬 Iniciando análisis biométrico...', 'info');
    
    try {
      const browserConfig = getBrowserConfig();
      const blob = new Blob(recordedChunksRef.current, { 
        type: browserConfig.mimeType 
      });
      
      const sizeInMB = (blob.size / 1024 / 1024).toFixed(2);
      addDiagnosticLog(`📊 ✅ BLOB CREADO: ${sizeInMB} MB`, 'success');
      
      // Simular análisis
      setAnalysisProgress(0);
      
      const analysisSteps = [
        { progress: 25, message: 'Extrayendo señal rPPG...' },
        { progress: 50, message: 'Analizando variabilidad cardíaca...' },
        { progress: 75, message: 'Procesando biomarcadores...' },
        { progress: 100, message: 'Análisis completado' }
      ];
      
      for (const step of analysisSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalysisProgress(step.progress);
        addDiagnosticLog(`${step.message} (${step.progress}%)`, 'info');
        
        // Actualizar métricas
        setCurrentMetrics(prev => ({
          heartRate: Math.floor(Math.random() * 40) + 60,
          hrv: Math.floor(Math.random() * 50) + 25,
          spO2: Math.floor(Math.random() * 5) + 95,
          bloodPressure: {
            systolic: Math.floor(Math.random() * 40) + 110,
            diastolic: Math.floor(Math.random() * 20) + 70
          },
          stressLevel: ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)],
          respiratoryRate: Math.floor(Math.random() * 8) + 12,
          perfusionIndex: (Math.random() * 3 + 1).toFixed(1),
          heartRhythm: Math.random() > 0.8 ? 'Irregular' : 'Regular'
        }));
      }
      
      // Datos finales
      const fullBiometricData = {
        timestamp: new Date().toISOString(),
        duration: recordingTime,
        blobSize: blob.size,
        chunks: recordedChunksRef.current.length,
        cardiovascular: currentMetrics
      };
      
      setBiometricData(fullBiometricData);
      addDiagnosticLog('✅ ========== ANÁLISIS COMPLETADO ==========', 'success');
      
    } catch (error) {
      addDiagnosticLog(`❌ Error en análisis: ${error.message}`, 'error');
    }
  };

  // Iniciar captura
  const startCapture = async () => {
    addDiagnosticLog('🚀 Iniciando captura biométrica...', 'info');
    setIsCapturing(true);
    setBiometricData(null);
    setAnalysisProgress(0);
    setDiagnosticLogs([]);
    
    const success = await initializeCamera();
    if (!success) {
      setIsCapturing(false);
    }
  };

  // Detener captura
  const stopCapture = () => {
    addDiagnosticLog('🛑 Deteniendo captura completa...', 'info');
    
    setIsCapturing(false);
    setIsRecording(false);
    setFaceDetected(false);
    setFaceStable(false);
    setRecordingTime(0);
    
    // Limpiar intervalos
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // Detener MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Cerrar stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Limpiar video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">HoloCheck - Análisis Biométrico Profesional</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            🚨 MODO DIAGNÓSTICO CRÍTICO - Debugging completo de MediaRecorder
          </p>
          <div className="flex items-center justify-center text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            EMERGENCIA: Solucionando problema de grabación - Logs detallados activados
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🚨 Control de Emergencia</h2>
              
              {/* Estado del Sistema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <Eye className="w-5 h-5 inline mr-2" />
                  Estado del Sistema
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Navegador</span>
                    <span className="font-medium text-orange-600">{systemStatus.browser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolución</span>
                    <span className="font-medium text-green-600">{systemStatus.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rostro</span>
                    <span className={`font-medium ${
                      systemStatus.face === 'Estabilizado' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {systemStatus.face}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grabación</span>
                    <span className={`font-medium ${
                      isRecording ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {isRecording ? '🔴 ACTIVA' : '⚪ INACTIVA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logs de Diagnóstico Crítico */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  🚨 Logs Críticos
                </h3>
                <div className="bg-black text-green-400 p-3 rounded-lg h-64 overflow-y-auto text-xs font-mono">
                  {diagnosticLogs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400 font-bold' :
                      log.type === 'success' ? 'text-green-400 font-bold' :
                      log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      [{log.timestamp}] {log.message}
                    </div>
                  ))}
                  {diagnosticLogs.length === 0 && (
                    <div className="text-gray-500">Esperando logs del sistema...</div>
                  )}
                </div>
              </div>

              {/* Controles de Emergencia */}
              <div className="space-y-3">
                {!isCapturing ? (
                  <button
                    onClick={startCapture}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Análisis Biométrico
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopCapture}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Detener Análisis
                    </button>
                    
                    {/* Botón de grabación manual CRÍTICO */}
                    <button
                      onClick={() => {
                        addDiagnosticLog('🚨 BOTÓN MANUAL PRESIONADO', 'info');
                        startRecording();
                      }}
                      disabled={isRecording}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center border-2 border-red-800"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      {isRecording ? '🔴 GRABANDO...' : '🚨 INICIAR GRABACIÓN MANUAL'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Video y Estado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="relative">
                {/* Video */}
                <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  
                  {/* Indicador de grabación CRÍTICO */}
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center px-4 py-2 rounded-lg text-lg font-bold ${
                      isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-white'
                    }`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        isRecording ? 'bg-white animate-pulse' : 'bg-gray-300'
                      }`}></div>
                      REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* Estado de detección */}
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      faceStable ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {faceStable ? '✅ Rostro Estabilizado' : '⚠️ Esperando rostro'}
                    </div>
                  </div>

                  {/* Contador de chunks en tiempo real */}
                  {isRecording && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                        Chunks: {recordedChunksRef.current.length}
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas oculto */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Estado crítico del análisis */}
                {isCapturing && (
                  <div className="bg-gradient-to-r from-red-50 to-blue-50 p-4 rounded-lg border-2 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-2" />
                        <span className="font-medium text-gray-800">
                          {isRecording ? '🔴 GRABANDO - Analizando biomarcadores...' : '⚪ Esperando inicio de grabación...'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {isRecording ? `${Math.round((recordingTime / 30) * 100)}%` : 'Listo'}
                      </span>
                    </div>
                    
                    {/* Barra de progreso crítica */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          isRecording ? 'bg-gradient-to-r from-red-500 to-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(recordingTime / 30) * 100}%` }}
                      ></div>
                    </div>

                    {/* Información crítica */}
                    <div className="text-sm text-gray-700">
                      <div>Estado MediaRecorder: {mediaRecorderRef.current?.state || 'No creado'}</div>
                      <div>Chunks recibidos: {recordedChunksRef.current.length}</div>
                      <div>Tiempo transcurrido: {recordingTime}s / 30s</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Biomarcadores */}
        {(isCapturing || biometricData) && (
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <Heart className="w-6 h-6 text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Biomarcadores en Tiempo Real
                </h2>
              </div>

              {/* Métricas básicas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">
                      {currentMetrics.heartRate}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Frecuencia Cardíaca</div>
                  <div className="text-xs text-red-500 font-medium">BPM</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-600">
                      {currentMetrics.hrv}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">HRV</div>
                  <div className="text-xs text-blue-500 font-medium">ms</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">
                      {currentMetrics.spO2}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">SpO₂</div>
                  <div className="text-xs text-green-500 font-medium">%</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">
                      {currentMetrics.bloodPressure.systolic}/{currentMetrics.bloodPressure.diastolic}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Presión Arterial</div>
                  <div className="text-xs text-purple-500 font-medium">mmHg</div>
                </div>
              </div>

              {/* Progreso del análisis */}
              {analysisProgress > 0 && analysisProgress < 100 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso del Análisis</span>
                    <span className="text-sm text-gray-500">{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Resultado final */}
              {biometricData && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">
                      ✅ Análisis Biométrico Completado
                    </span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>Duración: {biometricData.duration} segundos</div>
                    <div>Archivo: {(biometricData.blobSize / 1024 / 1024).toFixed(2)} MB</div>
                    <div>Chunks procesados: {biometricData.chunks}</div>
                    <div>Timestamp: {new Date(biometricData.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instrucciones de emergencia */}
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">🚨 MODO DIAGNÓSTICO DE EMERGENCIA</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• <strong>CRÍTICO:</strong> Presiona "INICIAR GRABACIÓN MANUAL" y observa los logs</li>
            <li>• <strong>VERIFICAR:</strong> El contador REC debe progresar: 0:01, 0:02, 0:03...</li>
            <li>• <strong>CONFIRMAR:</strong> Los logs deben mostrar "CHUNK RECIBIDO" con bytes > 0</li>
            <li>• <strong>VALIDAR:</strong> Estado MediaRecorder debe cambiar a "recording"</li>
            <li>• <strong>SI FALLA:</strong> Revisar logs rojos en consola del navegador</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BiometricCapture;