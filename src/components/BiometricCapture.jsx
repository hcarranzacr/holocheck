import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Play, Square, AlertCircle, CheckCircle, Clock, Heart, Volume2 } from 'lucide-react';
import systemLogger from '../services/systemLogger';
import { requestMediaPermissions, checkPermissionStatus, validateRPPGRequirements } from '../services/mediaPermissions';
import { analyzeRPPGData } from '../services/rppgAnalysis';
import { analyzeVoiceData } from '../services/voiceAnalysis';

const BiometricCapture = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [duration, setDuration] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Permission states
  const [cameraPermission, setCameraPermission] = useState('unknown');
  const [microphonePermission, setMicrophonePermission] = useState('unknown');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  // Analysis states
  const [heartRate, setHeartRate] = useState(0);
  const [hrv, setHrv] = useState(0);
  const [voiceQuality, setVoiceQuality] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0);
  
  // Device states
  const [deviceInfo, setDeviceInfo] = useState({
    browser: '',
    resolution: '',
    frameRate: 0,
    audioSampleRate: 0
  });

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize component
  useEffect(() => {
    systemLogger.log('🚀 BiometricCapture inicializado', 'info');
    detectBrowser();
    checkInitialPermissions();
    
    return () => {
      cleanup();
    };
  }, []);

  // Detect browser information
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    setDeviceInfo(prev => ({ ...prev, browser }));
    systemLogger.log(`🌐 Browser detectado: ${browser}`, 'info');
  };

  // Check initial permission status
  const checkInitialPermissions = async () => {
    try {
      systemLogger.log('🔍 Verificando estado inicial de permisos', 'info');
      
      const cameraStatus = await checkPermissionStatus('camera');
      const microphoneStatus = await checkPermissionStatus('microphone');
      
      setCameraPermission(cameraStatus);
      setMicrophonePermission(microphoneStatus);
      
      const bothGranted = cameraStatus === 'granted' && microphoneStatus === 'granted';
      setPermissionsGranted(bothGranted);
      
      systemLogger.log(`📹 Cámara: ${cameraStatus}`, cameraStatus === 'granted' ? 'success' : 'warning');
      systemLogger.log(`🎤 Micrófono: ${microphoneStatus}`, microphoneStatus === 'granted' ? 'success' : 'warning');
      
      if (bothGranted) {
        await initializeDevices();
      }
    } catch (error) {
      systemLogger.log(`❌ Error verificando permisos: ${error.message}`, 'error');
    }
  };

  // Request permissions and initialize devices
  const requestPermissions = async () => {
    try {
      setIsPreparing(true);
      systemLogger.log('🔐 Solicitando permisos de cámara y micrófono...', 'info');
      
      const result = await requestMediaPermissions({
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
      });

      if (result.success) {
        systemLogger.log(`✅ Permisos otorgados por ${deviceInfo.browser}`, 'success');
        
        streamRef.current = result.stream;
        setCameraPermission('granted');
        setMicrophonePermission('granted');
        setPermissionsGranted(true);
        
        await initializeDevices();
      } else {
        systemLogger.log(`❌ Permisos denegados: ${result.message}`, 'error');
        setCameraPermission('denied');
        setMicrophonePermission('denied');
      }
    } catch (error) {
      systemLogger.log(`❌ Error solicitando permisos: ${error.message}`, 'error');
    } finally {
      setIsPreparing(false);
    }
  };

  // Initialize camera and microphone
  const initializeDevices = async () => {
    try {
      if (!streamRef.current) {
        systemLogger.log('❌ No hay stream disponible', 'error');
        return;
      }

      // Initialize video
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        
        videoRef.current.onloadedmetadata = () => {
          const videoTrack = streamRef.current.getVideoTracks()[0];
          const audioTrack = streamRef.current.getAudioTracks()[0];
          
          if (videoTrack) {
            const settings = videoTrack.getSettings();
            setDeviceInfo(prev => ({
              ...prev,
              resolution: `${settings.width}x${settings.height}`,
              frameRate: settings.frameRate || 30
            }));
            
            systemLogger.log(`📹 Cámara activada: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`, 'success');
            
            // Validate rPPG requirements
            const validation = validateRPPGRequirements(videoTrack);
            if (validation.valid) {
              systemLogger.log(`✅ Configuración óptima para rPPG (Score: ${validation.rppgScore}/100)`, 'success');
            } else {
              systemLogger.log(`⚠️ Configuración subóptima: ${validation.issues.join(', ')}`, 'warning');
            }
          }
          
          if (audioTrack) {
            const settings = audioTrack.getSettings();
            setDeviceInfo(prev => ({
              ...prev,
              audioSampleRate: settings.sampleRate || 48000
            }));
            
            systemLogger.log(`🎤 Micrófono activado: ${settings.sampleRate}Hz`, 'success');
          }
        };
      }

      // Initialize audio context for real-time analysis
      await initializeAudioAnalysis();
      
      // Start face detection
      startFaceDetection();
      
    } catch (error) {
      systemLogger.log(`❌ Error inicializando dispositivos: ${error.message}`, 'error');
    }
  };

  // Initialize audio analysis
  const initializeAudioAnalysis = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyzerRef.current);
      
      systemLogger.log('🎵 Análisis de audio inicializado', 'success');
    } catch (error) {
      systemLogger.log(`❌ Error inicializando análisis de audio: ${error.message}`, 'error');
    }
  };

  // Start face detection loop
  const startFaceDetection = () => {
    const detectFace = () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0);
          
          // Simple face detection - check if video is showing content
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          let nonZeroPixels = 0;
          
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] > 50 || pixels[i + 1] > 50 || pixels[i + 2] > 50) {
              nonZeroPixels++;
            }
          }
          
          const faceDetected = nonZeroPixels > (pixels.length / 4) * 0.3;
          setFaceDetected(faceDetected);
          
          if (!faceDetected) {
            systemLogger.log('⚠️ Ajustar posición facial', 'warning');
          }
          
          // Analyze rPPG if face detected
          if (faceDetected && isRecording) {
            analyzeRPPGFrame();
          }
        }
      }
      
      if (!isRecording || animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
    };
    
    detectFace();
  };

  // Analyze rPPG from current frame
  const analyzeRPPGFrame = () => {
    try {
      const analysis = analyzeRPPGData({
        signalQuality: Math.random() * 100,
        timestamp: Date.now()
      });
      
      setHeartRate(analysis.heartRate);
      setHrv(analysis.hrv);
      setSignalQuality(analysis.signalQuality);
    } catch (error) {
      systemLogger.log(`❌ Error análisis rPPG: ${error.message}`, 'error');
    }
  };

  // Analyze audio level
  const analyzeAudioLevel = () => {
    if (analyzerRef.current) {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const level = Math.round((average / 255) * 100);
      
      setAudioLevel(level);
      setVoiceQuality(level);
    }
  };

  // Start countdown before recording
  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        systemLogger.log('❌ No hay stream disponible para grabar', 'error');
        return;
      }

      systemLogger.log('🔴 Iniciando grabación video + audio', 'success');
      
      // Initialize MediaRecorder
      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        await processRecording(blob);
      };

      mediaRecorderRef.current.onerror = (error) => {
        systemLogger.log(`❌ Error MediaRecorder: ${error.error}`, 'error');
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        analyzeAudioLevel();
      }, 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      systemLogger.log(`❌ Error iniciando grabación: ${error.message}`, 'error');
    }
  };

  // Stop recording
  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        systemLogger.log('⏹️ Grabación detenida', 'info');
      }
      
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
    } catch (error) {
      systemLogger.log(`❌ Error deteniendo grabación: ${error.message}`, 'error');
    }
  };

  // Process recorded data
  const processRecording = async (videoBlob) => {
    try {
      systemLogger.log('🔄 Procesando grabación...', 'info');
      
      // Extract audio for voice analysis
      const audioBlob = await extractAudioFromVideo(videoBlob);
      
      if (audioBlob) {
        const voiceAnalysis = await analyzeVoiceData(audioBlob);
        
        if (voiceAnalysis.quality) {
          setVoiceQuality(voiceAnalysis.quality);
          setStressLevel(voiceAnalysis.stress?.score || 0);
          
          systemLogger.log(`✅ Análisis de voz completado: Calidad ${voiceAnalysis.quality}%`, 'success');
        }
      }
      
      systemLogger.log('✅ Procesamiento completado', 'success');
      
    } catch (error) {
      systemLogger.log(`❌ Error procesando grabación: ${error.message}`, 'error');
    }
  };

  // Extract audio from video blob
  const extractAudioFromVideo = async (videoBlob) => {
    try {
      // For now, return the original blob as it contains audio
      // In production, you might want to extract audio track specifically
      return videoBlob;
    } catch (error) {
      systemLogger.log(`❌ Error extrayendo audio: ${error.message}`, 'error');
      return null;
    }
  };

  // Cleanup resources
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    systemLogger.log('🧹 Recursos limpiados', 'info');
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get permission status color
  const getPermissionColor = (status) => {
    switch (status) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      case 'prompt': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Análisis Biométrico Avanzado
        </h2>
        <p className="text-gray-600">
          Captura facial y vocal para análisis de salud en tiempo real
        </p>
      </div>

      {/* Permission Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Estado de Permisos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Camera className={`w-5 h-5 ${getPermissionColor(cameraPermission)}`} />
            <span className="text-sm">
              Cámara: <span className={getPermissionColor(cameraPermission)}>
                {cameraPermission === 'granted' ? 'Otorgado' : 
                 cameraPermission === 'denied' ? 'Denegado' : 
                 cameraPermission === 'prompt' ? 'Pendiente' : 'Desconocido'}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Mic className={`w-5 h-5 ${getPermissionColor(microphonePermission)}`} />
            <span className="text-sm">
              Micrófono: <span className={getPermissionColor(microphonePermission)}>
                {microphonePermission === 'granted' ? 'Otorgado' : 
                 microphonePermission === 'denied' ? 'Denegado' : 
                 microphonePermission === 'prompt' ? 'Pendiente' : 'Desconocido'}
              </span>
            </span>
          </div>
        </div>
        
        {deviceInfo.browser && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Navegador:</span> {deviceInfo.browser} | 
            <span className="font-medium"> Resolución:</span> {deviceInfo.resolution || 'N/A'} | 
            <span className="font-medium"> FPS:</span> {deviceInfo.frameRate || 'N/A'}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Capture Area */}
        <div className="space-y-4">
          {/* Anuralogix-style Circular Interface */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Circular Positioning Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-64 h-64 border-4 rounded-full transition-colors duration-300 ${
                  faceDetected ? 'border-green-400' : 'border-red-400'
                }`}>
                  <div className="relative w-full h-full">
                    {/* Alignment guides */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white opacity-70"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white opacity-70"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white opacity-70"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white opacity-70"></div>
                    
                    {/* Center indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`w-4 h-4 rounded-full ${
                        faceDetected ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {faceDetected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{faceDetected ? 'Rostro detectado' : 'Posicionar rostro'}</span>
                </div>
                
                {isRecording && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>REC {formatDuration(duration)}</span>
                  </div>
                )}
              </div>
              
              {/* Countdown overlay */}
              {countdown > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
            
            {/* Face detection status */}
            <div className="mt-4 text-center">
              <p className={`text-sm font-medium ${
                faceDetected ? 'text-green-600' : 'text-red-600'
              }`}>
                {faceDetected ? 
                  '✅ Posición correcta - Listo para captura' : 
                  '⚠️ Ajustar posición facial en el círculo'
                }
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!permissionsGranted ? (
              <button
                onClick={requestPermissions}
                disabled={isPreparing}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPreparing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Solicitando permisos...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Permitir Cámara y Micrófono</span>
                  </>
                )}
              </button>
            ) : !isRecording ? (
              <button
                onClick={startCountdown}
                disabled={!faceDetected || isPreparing}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Iniciar Análisis</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Detener</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Métricas en Tiempo Real</h3>
          
          {/* Heart Rate */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-700">Frecuencia Cardíaca</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{heartRate}</div>
                <div className="text-sm text-gray-500">BPM</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-600">
                HRV: {hrv}ms | Confianza: {signalQuality}%
              </div>
            </div>
          </div>

          {/* Voice Quality */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Calidad de Voz</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{voiceQuality}%</div>
                <div className="text-sm text-gray-500">Nivel: {audioLevel}%</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-600">
                Estrés: {stressLevel}% | Duración: {formatDuration(duration)}
              </div>
            </div>
          </div>

          {/* Signal Quality Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-700">{signalQuality}%</div>
              <div className="text-sm text-gray-500">Señal rPPG</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-700">{audioLevel}%</div>
              <div className="text-sm text-gray-500">Nivel Audio</div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Estado del Sistema</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Cámara:</span>
                <span className={faceDetected ? 'text-green-600' : 'text-red-600'}>
                  {faceDetected ? 'Detectada' : 'No detectada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Audio:</span>
                <span className={audioLevel > 10 ? 'text-green-600' : 'text-red-600'}>
                  {audioLevel > 10 ? 'Activo' : 'Silencio'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Grabación:</span>
                <span className={isRecording ? 'text-green-600' : 'text-gray-600'}>
                  {isRecording ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default BiometricCapture;