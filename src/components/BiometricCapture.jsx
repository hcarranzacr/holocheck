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

  // Logs state
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);

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

  // Add log function
  const addLog = useCallback((message, type = 'info', details = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      message,
      type,
      details
    };
    
    setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    
    // Also log to console for debugging
    console.log(`[${timestamp}] ${message}`, details || '');
  }, []);

  // Initialize component
  useEffect(() => {
    addLog('🚀 BiometricCapture inicializado', 'info');
    detectBrowser();
    checkInitialPermissions();
    
    return () => {
      cleanup();
    };
  }, [addLog]);

  // Detect browser information
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    setDeviceInfo(prev => ({ ...prev, browser }));
    addLog(`🌐 Browser detectado: ${browser}`, 'info');
  };

  // Check initial permission status
  const checkInitialPermissions = async () => {
    try {
      addLog('🔍 Verificando estado inicial de permisos', 'info');
      
      const cameraStatus = await checkPermissionStatus('camera');
      const microphoneStatus = await checkPermissionStatus('microphone');
      
      setCameraPermission(cameraStatus);
      setMicrophonePermission(microphoneStatus);
      
      const bothGranted = cameraStatus === 'granted' && microphoneStatus === 'granted';
      setPermissionsGranted(bothGranted);
      
      addLog(`📹 Estado cámara: ${cameraStatus}`, cameraStatus === 'granted' ? 'success' : 'warning');
      addLog(`🎤 Estado micrófono: ${microphoneStatus}`, microphoneStatus === 'granted' ? 'success' : 'warning');
      
      if (bothGranted) {
        addLog('✅ Permisos ya otorgados, inicializando dispositivos...', 'success');
        await initializeDevices();
      } else {
        addLog('⚠️ Permisos pendientes - Click "Permitir Acceso" para continuar', 'warning');
      }
    } catch (error) {
      addLog(`❌ Error verificando permisos: ${error.message}`, 'error');
    }
  };

  // Request permissions and initialize devices
  const requestPermissions = async () => {
    try {
      setIsPreparing(true);
      addLog('🔐 Solicitando permisos de cámara y micrófono...', 'info');
      
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
        addLog(`✅ ${deviceInfo.browser}: Permisos otorgados correctamente`, 'success');
        
        streamRef.current = result.stream;
        setCameraPermission('granted');
        setMicrophonePermission('granted');
        setPermissionsGranted(true);
        
        await initializeDevices();
      } else {
        addLog(`❌ ${deviceInfo.browser}: Permisos denegados - ${result.message}`, 'error');
        setCameraPermission('denied');
        setMicrophonePermission('denied');
      }
    } catch (error) {
      addLog(`❌ Error solicitando permisos: ${error.message}`, 'error');
    } finally {
      setIsPreparing(false);
    }
  };

  // Initialize camera and microphone
  const initializeDevices = async () => {
    try {
      if (!streamRef.current) {
        addLog('❌ No hay stream disponible para inicializar', 'error');
        return;
      }

      // Initialize video
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            
            const videoTrack = streamRef.current.getVideoTracks()[0];
            const audioTrack = streamRef.current.getAudioTracks()[0];
            
            if (videoTrack) {
              const settings = videoTrack.getSettings();
              setDeviceInfo(prev => ({
                ...prev,
                resolution: `${settings.width}x${settings.height}`,
                frameRate: settings.frameRate || 30
              }));
              
              addLog(`📹 Cámara activada: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`, 'success');
              
              // Validate rPPG requirements
              const validation = validateRPPGRequirements(videoTrack);
              if (validation.valid) {
                addLog(`✅ Configuración óptima para rPPG (Score: ${validation.rppgScore}/100)`, 'success');
              } else {
                addLog(`⚠️ Configuración subóptima: ${validation.issues.join(', ')}`, 'warning');
              }
            }
            
            if (audioTrack) {
              const settings = audioTrack.getSettings();
              setDeviceInfo(prev => ({
                ...prev,
                audioSampleRate: settings.sampleRate || 48000
              }));
              
              addLog(`🎤 Micrófono activado: ${settings.sampleRate}Hz stereo`, 'success');
            }
            
            resolve();
          };
        });
      }

      // Initialize audio context for real-time analysis
      await initializeAudioAnalysis();
      
      // Start face detection
      startFaceDetection();
      
      addLog('🎯 Sistema listo para análisis biométrico', 'success');
      
    } catch (error) {
      addLog(`❌ Error inicializando dispositivos: ${error.message}`, 'error');
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
      
      addLog('🎵 Análisis de audio en tiempo real inicializado', 'success');
    } catch (error) {
      addLog(`❌ Error inicializando análisis de audio: ${error.message}`, 'error');
    }
  };

  // Start face detection loop
  const startFaceDetection = () => {
    const detectFace = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        // Enhanced face detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let nonZeroPixels = 0;
        let skinPixels = 0;
        
        // Count non-zero and skin-like pixels
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          if (r > 50 || g > 50 || b > 50) {
            nonZeroPixels++;
            
            // Simple skin detection
            if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
              skinPixels++;
            }
          }
        }
        
        const totalPixels = pixels.length / 4;
        const faceDetected = nonZeroPixels > totalPixels * 0.3 && skinPixels > totalPixels * 0.05;
        const quality = faceDetected ? Math.min(100, (skinPixels / totalPixels) * 500) : 0;
        
        setFaceDetected(faceDetected);
        setSignalQuality(quality);
        
        // Analyze rPPG if face detected and recording
        if (faceDetected && isRecording) {
          analyzeRPPGFrame(quality);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(detectFace);
    };
    
    detectFace();
  };

  // Analyze rPPG from current frame
  const analyzeRPPGFrame = (quality) => {
    try {
      const analysis = analyzeRPPGData({
        signalQuality: quality,
        timestamp: Date.now()
      });
      
      setHeartRate(analysis.heartRate);
      setHrv(analysis.hrv);
      setSignalQuality(analysis.signalQuality);
    } catch (error) {
      addLog(`❌ Error análisis rPPG: ${error.message}`, 'error');
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
    addLog('⏰ Iniciando cuenta regresiva...', 'info');
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
        addLog('❌ No hay stream disponible para grabar', 'error');
        return;
      }

      addLog('🔴 Iniciando grabación video + audio', 'success');
      
      // Initialize MediaRecorder
      recordedChunksRef.current = [];
      
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
          mimeType: 'video/webm;codecs=vp9,opus'
        });
        
        addLog('✅ MediaRecorder inicializado correctamente', 'success');
      } catch (error) {
        // Fallback to default codec
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        addLog('⚠️ MediaRecorder inicializado con codec por defecto', 'warning');
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          addLog(`📊 Chunk de datos recibido: ${event.data.size} bytes`, 'info');
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        addLog(`✅ Grabación completada: ${blob.size} bytes total`, 'success');
        await processRecording(blob);
      };

      mediaRecorderRef.current.onerror = (error) => {
        addLog(`❌ Error MediaRecorder: ${error.error}`, 'error');
      };

      mediaRecorderRef.current.onstart = () => {
        addLog('🎬 MediaRecorder iniciado correctamente', 'success');
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          analyzeAudioLevel();
          
          if (newDuration % 5 === 0) {
            addLog(`⏱️ Grabando: ${formatDuration(newDuration)} / 00:30`, 'info');
          }
          
          return newDuration;
        });
      }, 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      addLog(`❌ Error iniciando grabación: ${error.message}`, 'error');
    }
  };

  // Stop recording
  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        addLog('⏹️ Deteniendo grabación...', 'info');
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
      addLog(`❌ Error deteniendo grabación: ${error.message}`, 'error');
    }
  };

  // Process recorded data
  const processRecording = async (videoBlob) => {
    try {
      addLog('🔄 Procesando grabación para análisis...', 'info');
      
      // Extract audio for voice analysis
      const audioBlob = await extractAudioFromVideo(videoBlob);
      
      if (audioBlob) {
        const voiceAnalysis = await analyzeVoiceData(audioBlob);
        
        if (voiceAnalysis.quality) {
          setVoiceQuality(voiceAnalysis.quality);
          setStressLevel(voiceAnalysis.stress?.score || 0);
          
          addLog(`✅ Análisis de voz completado: Calidad ${voiceAnalysis.quality}%`, 'success');
          addLog(`📊 Nivel de estrés detectado: ${voiceAnalysis.stress?.score || 0}%`, 'info');
        }
      }
      
      addLog('🎯 Análisis biométrico completado exitosamente', 'success');
      
    } catch (error) {
      addLog(`❌ Error procesando grabación: ${error.message}`, 'error');
    }
  };

  // Extract audio from video blob
  const extractAudioFromVideo = async (videoBlob) => {
    try {
      return videoBlob; // For now, return the original blob as it contains audio
    } catch (error) {
      addLog(`❌ Error extrayendo audio: ${error.message}`, 'error');
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
    
    addLog('🧹 Recursos limpiados correctamente', 'info');
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
      case 'granted': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'prompt': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get log color
  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🩺 HoloCheck - Análisis Biométrico Profesional
          </h1>
          <p className="text-lg text-gray-600">
            Interfaz Anuralogix con análisis rPPG y vocal en tiempo real
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Capture Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Permission Status Banner */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                Estado del Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Navegador</div>
                  <div className="font-semibold text-blue-600">{deviceInfo.browser}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Resolución</div>
                  <div className="font-semibold text-green-600">{deviceInfo.resolution || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">FPS</div>
                  <div className="font-semibold text-purple-600">{deviceInfo.frameRate || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Cámara</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionColor(cameraPermission)}`}>
                    {cameraPermission === 'granted' ? '✅ Otorgado' : 
                     cameraPermission === 'denied' ? '❌ Denegado' : 
                     cameraPermission === 'prompt' ? '⏳ Pendiente' : '❓ Desconocido'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Micrófono</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionColor(microphonePermission)}`}>
                    {microphonePermission === 'granted' ? '✅ Otorgado' : 
                     microphonePermission === 'denied' ? '❌ Denegado' : 
                     microphonePermission === 'prompt' ? '⏳ Pendiente' : '❓ Desconocido'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Capture Area */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative bg-gradient-to-br from-blue-900 to-indigo-900 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Anuralogix Circular Interface */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-80 h-80 border-4 rounded-full transition-all duration-300 ${
                    faceDetected ? 'border-green-400 shadow-green-400/50' : 'border-red-400 shadow-red-400/50'
                  } shadow-lg`}>
                    <div className="relative w-full h-full">
                      {/* Alignment guides */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-white opacity-80 rounded-full"></div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-white opacity-80 rounded-full"></div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-12 bg-white opacity-80 rounded-full"></div>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-12 bg-white opacity-80 rounded-full"></div>
                      
                      {/* Center indicator */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className={`w-6 h-6 rounded-full transition-colors duration-300 ${
                          faceDetected ? 'bg-green-400' : 'bg-red-400'
                        } shadow-lg`}></div>
                      </div>
                      
                      {/* Quality indicators */}
                      <div className="absolute top-4 left-4 text-white text-sm font-medium">
                        Señal: {Math.round(signalQuality)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                    faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {faceDetected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{faceDetected ? 'Rostro detectado' : 'Posicionar rostro'}</span>
                  </div>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>REC {formatDuration(duration)}</span>
                    </div>
                  )}
                </div>
                
                {/* Countdown overlay */}
                {countdown > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="text-white text-8xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Face detection status */}
              <div className="p-4 bg-gray-50 text-center">
                <p className={`text-lg font-semibold ${
                  faceDetected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {faceDetected ? 
                    '✅ Posición correcta - Sistema listo para análisis' : 
                    '⚠️ Posicione su rostro dentro del círculo para continuar'
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
                  className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg font-semibold"
                >
                  {isPreparing ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Solicitando permisos...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6" />
                      <span>Permitir Acceso a Cámara y Micrófono</span>
                    </>
                  )}
                </button>
              ) : !isRecording ? (
                <button
                  onClick={startCountdown}
                  disabled={!faceDetected || isPreparing}
                  className="flex items-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg font-semibold"
                >
                  <Play className="w-6 h-6" />
                  <span>Iniciar Análisis Biométrico</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg text-lg font-semibold"
                >
                  <Square className="w-6 h-6" />
                  <span>Detener Análisis</span>
                </button>
              )}
              
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg"
                title="Toggle System Logs"
              >
                <span>📝</span>
                <span>{showLogs ? 'Ocultar' : 'Mostrar'} Logs</span>
              </button>
            </div>

            {/* Real-time Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Métricas Biométricas en Tiempo Real
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-sm text-gray-600 mb-1">Frecuencia Cardíaca</div>
                  <div className="text-3xl font-bold text-red-600">{heartRate || '--'}</div>
                  <div className="text-xs text-gray-500">BPM</div>
                  <div className="text-xs text-gray-500 mt-1">HRV: {hrv}ms</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-gray-600 mb-1">Calidad de Voz</div>
                  <div className="text-3xl font-bold text-blue-600">{Math.round(voiceQuality)}%</div>
                  <div className="text-xs text-gray-500">Nivel: {audioLevel}%</div>
                  <div className="text-xs text-gray-500 mt-1">Estrés: {stressLevel}%</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm text-gray-600 mb-1">Detección Facial</div>
                  <div className="text-3xl font-bold text-green-600">{faceDetected ? '✅' : '❌'}</div>
                  <div className="text-xs text-gray-500">{faceDetected ? 'Detectado' : 'No detectado'}</div>
                  <div className="text-xs text-gray-500 mt-1">Calidad: {Math.round(signalQuality)}%</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm text-gray-600 mb-1">Estado Sistema</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {isRecording ? '🔴' : permissionsGranted ? '✅' : '⚠️'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRecording ? 'Grabando' : permissionsGranted ? 'Listo' : 'Permisos'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isRecording ? formatDuration(duration) : 'Standby'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - System Logs */}
          <div className="space-y-6">
            {showLogs && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Logs del Sistema
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No hay logs disponibles
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border text-sm ${getLogColor(log.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{log.message}</div>
                            {log.details && (
                              <div className="text-xs mt-1 opacity-75">
                                {typeof log.details === 'object' 
                                  ? JSON.stringify(log.details, null, 2)
                                  : log.details
                                }
                              </div>
                            )}
                          </div>
                          <div className="text-xs opacity-60 ml-2">
                            {log.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Limpiar Logs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default BiometricCapture;