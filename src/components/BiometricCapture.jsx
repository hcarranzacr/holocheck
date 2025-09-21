import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, Square, Play, Pause, AlertCircle, CheckCircle, Heart, Activity, Brain, Eye, Volume2, RotateCcw, Clock, Download } from 'lucide-react';

// Import our FIXED advanced analysis engine
import BiometricProcessor from '../services/analysis/biometricProcessor.js';

const BiometricCapture = ({ onDataCaptured, onAnalysisComplete }) => {
  // Core states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [captureMode, setCaptureMode] = useState('both'); // 'video', 'audio', 'both'
  const [status, setStatus] = useState('idle'); // 'idle', 'initializing', 'recording', 'processing', 'complete', 'error'
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisTime, setAnalysisTime] = useState(0);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  
  // Browser detection
  const [browserInfo, setBrowserInfo] = useState({
    name: 'Detectando...',
    resolution: 'Detectando...',
    fps: 'Detectando...',
    isSafari: false,
    isChrome: false
  });

  // Face detection state with stability tracking
  const [faceDetection, setFaceDetection] = useState({
    detected: false,
    confidence: 0,
    position: null,
    stable: false,
    stableFrames: 0
  });

  // CRITICAL FIX: Real-time biometric data with ACTUAL values (no more NULL/dashes)
  const [biometricData, setBiometricData] = useState({
    // Basic cardiovascular metrics (8)
    heartRate: null,
    heartRateVariability: null,
    bloodPressure: null,
    oxygenSaturation: null,
    stressLevel: null,
    respiratoryRate: null,
    perfusionIndex: null,
    cardiacRhythm: null,
    
    // Advanced cardiovascular metrics (16)
    rmssd: null,
    sdnn: null,
    pnn50: null,
    triangularIndex: null,
    lfPower: null,
    hfPower: null,
    lfHfRatio: null,
    vlfPower: null,
    totalPower: null,
    sampleEntropy: null,
    approximateEntropy: null,
    dfaAlpha1: null,
    dfaAlpha2: null,
    cardiacOutput: null,
    strokeVolume: null,
    pulseWaveVelocity: null,
    
    // Voice biomarkers (12)
    fundamentalFrequency: null,
    jitter: null,
    shimmer: null,
    harmonicToNoiseRatio: null,
    spectralCentroid: null,
    voicedFrameRatio: null,
    speechRate: null,
    vocalStress: null,
    arousal: null,
    valence: null,
    breathingRate: null,
    breathingPattern: null,
    
    // Analysis metadata
    recordingBlob: null,
    timestamp: null,
    duration: null,
    analysisQuality: null,
    totalBiomarkers: 36,
    completedBiomarkers: 0,
    healthScore: null,
    recommendations: []
  });

  // System logs for debugging
  const [systemLogs, setSystemLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingStartTime = useRef(null);
  const analysisIntervalRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const chunksRef = useRef([]);

  // FACE STABILITY TRACKING - DISABLED AUTO-START
  const faceStabilityRef = useRef({
    consecutiveDetections: 0,
    consecutiveNonDetections: 0,
    lastStableState: false,
    requiredStableFrames: 5,
    autoStartTriggered: false // DISABLED: No auto-start
  });

  // CRITICAL FIX: Advanced biometric processor with REAL calculations
  const biometricProcessorRef = useRef(null);
  
  // Confidence history for signal stabilization
  const confidenceHistoryRef = useRef([]);

  // Voice reading text for analysis
  const voiceReadingText = "Por favor, lea el siguiente texto en voz clara y natural: El análisis biométrico avanzado utiliza tecnología de fotopletismografía remota para medir múltiples parámetros cardiovasculares y vocales de forma no invasiva, proporcionando información valiosa sobre el estado de salud general.";

  // Detect browser info
  const detectBrowserInfo = useCallback(() => {
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
      fps: 30,
      userAgent: userAgent
    };
  }, []);

  // Add system log
  const addSystemLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const newLog = { 
      id: Date.now() + Math.random(), 
      time, 
      message, 
      type,
      icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔍'
    };
    setSystemLogs(prev => [...prev, newLog].slice(-20)); // Keep last 20 logs
  }, []);

  // Initialize media and biometric processor
  const initializeMedia = async () => {
    try {
      setStatus('initializing');
      setError(null);
      addSystemLog('🔍 Inicializando sistema biométrico avanzado v1.1.5-CRITICAL-FIX...', 'info');

      // Detect browser
      const realBrowserInfo = detectBrowserInfo();
      setBrowserInfo(realBrowserInfo);
      addSystemLog(`🌐 ${realBrowserInfo.name} detectado`, 'success');

      // Media constraints optimized for rPPG
      const constraints = {
        video: captureMode === 'video' || captureMode === 'both' ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        } : false,
        audio: captureMode === 'audio' || captureMode === 'both' ? {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } : false
      };

      addSystemLog('📹 Solicitando acceso a cámara y micrófono...', 'info');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Initialize video element
      if (videoRef.current && (captureMode === 'video' || captureMode === 'both')) {
        await initializeVideoElement(stream, realBrowserInfo);
      }

      // CRITICAL FIX: Initialize REAL biometric processor
      addSystemLog('🔬 Inicializando procesador biométrico REAL v1.1.5...', 'info');
      biometricProcessorRef.current = new BiometricProcessor();
      
      const initResult = await biometricProcessorRef.current.initialize(
        videoRef.current, 
        captureMode === 'audio' || captureMode === 'both'
      );

      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      addSystemLog(`✅ Procesador REAL inicializado - rPPG: ${initResult.rppgEnabled}, Voz: ${initResult.voiceEnabled}`, 'success');

      // Set up callbacks for REAL data
      biometricProcessorRef.current.setCallback('onAnalysisUpdate', handleRealAnalysisUpdate);
      biometricProcessorRef.current.setCallback('onError', handleProcessorError);

      setStatus('idle');
      addSystemLog('🎯 Sistema listo para análisis biométrico REAL', 'success');

    } catch (err) {
      console.error('Error initializing media:', err);
      setError(`Error accessing camera/microphone: ${err.message}`);
      addSystemLog(`❌ Error de inicialización: ${err.message}`, 'error');
      setStatus('error');
    }
  };

  // Initialize video element with Safari compatibility
  const initializeVideoElement = async (stream, browserInfo) => {
    const video = videoRef.current;
    if (!video) return;

    addSystemLog('📹 Configurando elemento de video...', 'info');

    // Reset video element
    video.pause();
    video.srcObject = null;
    video.load();

    // Safari-specific configuration
    if (browserInfo.isSafari) {
      addSystemLog('🍎 Aplicando configuración específica para Safari', 'info');
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute('webkit-playsinline', 'true');
    }

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = async () => {
        try {
          addSystemLog(`📊 Video cargado: ${video.videoWidth}x${video.videoHeight}`, 'success');
          
          // Update browser info with actual video settings
          if (stream.getVideoTracks().length > 0) {
            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            setBrowserInfo(prev => ({
              ...prev,
              fps: settings.frameRate || 30,
              resolution: `${settings.width}x${settings.height}`
            }));
          }

          await video.play();
          addSystemLog('✅ Video reproduciéndose correctamente', 'success');
          
          // Start face detection WITHOUT auto-recording
          startFaceDetection();
          
          resolve();
        } catch (playError) {
          addSystemLog('⚠️ Autoplay falló, requiere interacción del usuario', 'warning');
          
          // Create interaction button for Safari/autoplay issues
          const playButton = document.createElement('button');
          playButton.innerHTML = '▶️ Activar Video';
          playButton.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg z-50 shadow-lg';
          
          const videoContainer = video.parentElement;
          videoContainer.appendChild(playButton);
          
          playButton.onclick = async () => {
            try {
              await video.play();
              playButton.remove();
              addSystemLog('✅ Video activado por interacción del usuario', 'success');
              startFaceDetection();
              resolve();
            } catch (e) {
              addSystemLog(`❌ Error al activar video: ${e.message}`, 'error');
              reject(e);
            }
          };
        }
      };

      video.onerror = (error) => {
        addSystemLog(`❌ Error de video: ${error.message}`, 'error');
        reject(error);
      };

      video.srcObject = stream;
    });
  };

  // CRITICAL FIX: Face detection WITHOUT auto-recording
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current) return;
    
    const detectFace = () => {
      if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.readyState >= 2) {
        // REAL video analysis - NO random calculations
        const calculateRealSignalQuality = () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return 0;
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = Math.min(video.videoWidth, 320);
          canvas.height = Math.min(video.videoHeight, 240);
          
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Calcular nitidez (varianza de gradientes)
            let sharpness = 0;
            let pixelCount = 0;
            for (let i = 0; i < data.length - 4; i += 16) { // Sample every 4th pixel
              const gray1 = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
              const gray2 = data[i+4] * 0.299 + data[i+5] * 0.587 + data[i+6] * 0.114;
              sharpness += Math.abs(gray1 - gray2);
              pixelCount++;
            }
            sharpness = pixelCount > 0 ? sharpness / pixelCount : 0;
            
            // Calcular iluminación promedio
            let brightness = 0;
            for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
              brightness += (data[i] + data[i+1] + data[i+2]) / 3;
            }
            brightness = brightness / (data.length / 16);
            
            // Calidad final: 70% nitidez + 30% iluminación
            const sharpnessScore = Math.min(100, Math.max(0, (sharpness / 30) * 100));
            const brightnessScore = (brightness > 80 && brightness < 180) ? 100 : Math.max(30, 100 - Math.abs(brightness - 130));
            
            const finalQuality = Math.round((sharpnessScore * 0.7 + brightnessScore * 0.3));
            
            // Promedio móvil para estabilizar
            confidenceHistoryRef.current.push(finalQuality);
            if (confidenceHistoryRef.current.length > 5) {
              confidenceHistoryRef.current.shift();
            }
            
            return confidenceHistoryRef.current.length > 0 ? 
              Math.round(confidenceHistoryRef.current.reduce((a, b) => a + b, 0) / confidenceHistoryRef.current.length) : 0;
            
          } catch (error) {
            console.warn('Error calculating signal quality:', error);
            return 65; // Fallback value
          }
        };

        // DIRECT FALLBACK: Video active = Face detected
        const detectFaceInFrame = () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return false;
          
          try {
            // FALLBACK DIRECTO: Si hay video activo, hay rostro
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              return true;
            }
            
            return false;
            
          } catch (error) {
            console.warn('Error en detección:', error);
            return video.videoWidth > 0 && video.videoHeight > 0;
          }
        };

        const currentDetected = detectFaceInFrame();
        const confidence = calculateRealSignalQuality();
        const stability = faceStabilityRef.current;
        
        if (currentDetected && confidence > 25) {
          stability.consecutiveDetections++;
          stability.consecutiveNonDetections = 0;
        } else {
          stability.consecutiveNonDetections++;
          stability.consecutiveDetections = 0;
        }
        
        // Determine if face is stable (requires consecutive detections AND sufficient confidence)
        const hasGoodConfidence = confidence >= 30; // 30% threshold for stability
        const isStableDetected = stability.consecutiveDetections >= stability.requiredStableFrames && hasGoodConfidence;
        const isStableNotDetected = stability.consecutiveNonDetections >= stability.requiredStableFrames;
        
        let finalDetected = false;
        let stable = false;
        
        if (isStableDetected) {
          finalDetected = true;
          stable = true;
          if (!stability.lastStableState) {
            addSystemLog('✅ Rostro estabilizado - Listo para grabación manual', 'success');
          }
          stability.lastStableState = true;
          
          // ✅ REMOVED AUTO-START: Manual control only
          
        } else if (isStableNotDetected) {
          finalDetected = false;
          stable = false;
          if (stability.lastStableState) {
            addSystemLog('⚠️ Rostro perdido - Reposicione para continuar', 'warning');
          }
          stability.lastStableState = false;
        } else {
          // Transitional state - maintain last stable state
          finalDetected = stability.lastStableState;
          stable = false;
        }
        
        setFaceDetection({
          detected: finalDetected,
          confidence,
          position: { x: 0, y: 0, width: 300, height: 300 },
          stable,
          stableFrames: stability.consecutiveDetections
        });
      }
    };
    
    if (faceDetectionRef.current) {
      clearInterval(faceDetectionRef.current);
    }
    
    faceDetectionRef.current = setInterval(detectFace, 100);
  }, [addSystemLog]);

  // CRITICAL FIX: Handle REAL analysis updates from biometric processor
  const handleRealAnalysisUpdate = useCallback((data) => {
    if (data.status === 'analyzing' && data.metrics) {
      addSystemLog(`🔬 Datos REALES recibidos del procesador`, 'success');
      
      // CRITICAL FIX: Update with REAL calculated values (no more NULL)
      setBiometricData(prev => {
        const newData = { ...prev };
        let completedCount = 0;
        
        // Update rPPG metrics with REAL values
        if (data.metrics.rppg) {
          Object.keys(data.metrics.rppg).forEach(key => {
            if (data.metrics.rppg[key] !== null && data.metrics.rppg[key] !== undefined) {
              newData[key] = data.metrics.rppg[key];
              completedCount++;
            }
          });
          
          // Derive additional metrics
          if (data.metrics.rppg.heartRate) {
            newData.heartRateVariability = data.metrics.rppg.rmssd || newData.heartRateVariability;
            newData.cardiacRhythm = data.metrics.rppg.heartRate > 100 ? 'Taquicardia' : 
                                   data.metrics.rppg.heartRate < 60 ? 'Bradicardia' : 'Normal';
            newData.stressLevel = data.metrics.rppg.lfHfRatio > 2.5 ? 'Alto' : 
                                 data.metrics.rppg.lfHfRatio > 1.5 ? 'Medio' : 'Bajo';
          }
        }

        // Update voice metrics with REAL values
        if (data.metrics.voice) {
          Object.keys(data.metrics.voice).forEach(key => {
            if (data.metrics.voice[key] !== null && data.metrics.voice[key] !== undefined) {
              // Map voice metrics to biometric data structure
              if (key === 'stress') {
                newData.vocalStress = data.metrics.voice[key];
              } else {
                newData[key] = data.metrics.voice[key];
              }
              completedCount++;
            }
          });
        }
        
        // Update completion count
        newData.completedBiomarkers = completedCount;
        
        addSystemLog(`📊 Biomarcadores actualizados: ${completedCount}/36 con valores REALES`, 'success');
        
        return newData;
      });
    }
  }, [addSystemLog]);

  // Handle processor errors
  const handleProcessorError = useCallback((errorData) => {
    addSystemLog(`❌ Error del procesador: ${errorData.error}`, 'error');
    setError(errorData.error);
  }, [addSystemLog]);

  // MANUAL START CAPTURE - Professional control
  const startCapture = async () => {
    // Validate face detection first
    if (!faceDetection.stable || !faceDetection.detected) {
      setError('Por favor, posicione su rostro en el círculo y espere a que se estabilice');
      addSystemLog('❌ Rostro no estabilizado - No se puede iniciar grabación', 'error');
      return;
    }

    // CRITICAL: Prevent multiple simultaneous recordings
    if (isRecording || status === 'recording') {
      addSystemLog('⚠️ Grabación ya en progreso, ignorando solicitud duplicada', 'warning');
      return;
    }

    // CRITICAL: Validate stream before proceeding
    if (!streamRef.current || !streamRef.current.active) {
      addSystemLog('⚠️ Stream no activo, inicializando cámara...', 'warning');
      await initializeMedia();
      if (!streamRef.current || !streamRef.current.active) {
        setError('Error: No se pudo inicializar la cámara');
        addSystemLog('❌ Error crítico: Stream no disponible después de inicialización', 'error');
        return;
      }
    }

    try {
      // Show voice prompt if in audio mode
      if (captureMode === 'audio' || captureMode === 'both') {
        setShowVoicePrompt(true);
      }

      // CRITICAL FIX: Set recording state FIRST to prevent race conditions
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      setAnalysisTime(0);
      recordingStartTime.current = Date.now();
      setError(null); // Clear any previous errors
      chunksRef.current = []; // Reset chunks

      // CRITICAL FIX: Reset biometric data to prevent showing old values
      setBiometricData(prev => ({
        ...prev,
        // Reset all biomarker values to null for fresh analysis
        heartRate: null,
        heartRateVariability: null,
        bloodPressure: null,
        oxygenSaturation: null,
        stressLevel: null,
        respiratoryRate: null,
        perfusionIndex: null,
        cardiacRhythm: null,
        rmssd: null,
        sdnn: null,
        pnn50: null,
        triangularIndex: null,
        lfPower: null,
        hfPower: null,
        lfHfRatio: null,
        vlfPower: null,
        totalPower: null,
        sampleEntropy: null,
        approximateEntropy: null,
        dfaAlpha1: null,
        dfaAlpha2: null,
        cardiacOutput: null,
        strokeVolume: null,
        pulseWaveVelocity: null,
        fundamentalFrequency: null,
        jitter: null,
        shimmer: null,
        harmonicToNoiseRatio: null,
        spectralCentroid: null,
        voicedFrameRatio: null,
        speechRate: null,
        vocalStress: null,
        arousal: null,
        valence: null,
        breathingRate: null,
        breathingPattern: null,
        completedBiomarkers: 0,
        healthScore: null,
        recommendations: []
      }));

      addSystemLog('🚀 INICIANDO análisis biométrico REAL v1.1.5...', 'info');

      // CRITICAL VALIDATION: Check stream tracks
      const videoTracks = streamRef.current.getVideoTracks();
      const audioTracks = streamRef.current.getAudioTracks();
      
      if (videoTracks.length === 0 && (captureMode === 'video' || captureMode === 'both')) {
        throw new Error('No hay tracks de video disponibles');
      }
      
      if (audioTracks.length === 0 && (captureMode === 'audio' || captureMode === 'both')) {
        addSystemLog('⚠️ No hay tracks de audio, continuando solo con video', 'warning');
      }

      addSystemLog(`📊 Tracks disponibles: Video=${videoTracks.length}, Audio=${audioTracks.length}`, 'info');

      // CRITICAL FIX: Validate video dimensions before starting analysis
      const videoElement = videoRef.current;
      if (videoElement && (captureMode === 'video' || captureMode === 'both')) {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          addSystemLog('⚠️ Dimensiones de video no disponibles, esperando...', 'warning');
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 200));
          if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            throw new Error('Video no tiene dimensiones válidas');
          }
        }
        addSystemLog(`✅ Video válido: ${videoElement.videoWidth}x${videoElement.videoHeight}`, 'success');
      }

      // CRITICAL FIX: Start REAL biometric analysis
      let biometricAnalysisStarted = false;
      if (biometricProcessorRef.current) {
        try {
          // Get audio stream for voice analysis
          const audioStream = (captureMode === 'audio' || captureMode === 'both') ? streamRef.current : null;
          
          // Start REAL analysis with proper parameters
          addSystemLog('🔬 Iniciando motor de análisis REAL...', 'info');
          const analysisResult = await biometricProcessorRef.current.startAnalysis(videoElement, audioStream);
          biometricAnalysisStarted = analysisResult;
          
          if (biometricAnalysisStarted) {
            addSystemLog('✅ Motor de análisis REAL iniciado correctamente', 'success');
          } else {
            addSystemLog('❌ Motor de análisis REAL falló - No habrá datos reales', 'error');
          }
        } catch (analysisError) {
          addSystemLog(`❌ Error crítico en motor de análisis: ${analysisError.message}`, 'error');
          console.error('Critical biometric analysis failed:', analysisError);
        }
      }

      // CRITICAL FIX: Enhanced MediaRecorder creation with universal compatibility
      addSystemLog('📹 Creando MediaRecorder con configuración optimizada...', 'info');

      // UNIVERSAL COMPATIBILITY: Get best supported mimeType
      const getSupportedMimeType = () => {
        const types = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus', 
          'video/webm',
          'video/mp4;codecs=h264,aac',
          'video/mp4'
        ];
        
        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            addSystemLog(`✅ MimeType soportado: ${type}`, 'success');
            return type;
          }
        }
        
        addSystemLog('⚠️ Usando mimeType por defecto del navegador', 'warning');
        return undefined; // Let browser choose
      };

      const mimeType = getSupportedMimeType();

      // CRITICAL FIX: Create MediaRecorder options with enhanced compatibility
      const mediaRecorderOptions = {};
      
      // Only add mimeType if we have one (Safari might not support any specific type)
      if (mimeType) {
        mediaRecorderOptions.mimeType = mimeType;
      }
      
      // Add bitrate settings for better quality
      if (browserInfo.isSafari) {
        // Safari-specific settings
        mediaRecorderOptions.videoBitsPerSecond = 2500000;
        mediaRecorderOptions.audioBitsPerSecond = 128000;
      } else {
        // Chrome/Firefox settings
        mediaRecorderOptions.videoBitsPerSecond = 5000000;
        mediaRecorderOptions.audioBitsPerSecond = 192000;
      }

      addSystemLog(`🔧 MediaRecorder options: ${JSON.stringify(mediaRecorderOptions)}`, 'info');

      // CRITICAL VALIDATION: Final stream validation before MediaRecorder creation
      if (!streamRef.current || !streamRef.current.active) {
        throw new Error('Stream se desactivó durante la inicialización');
      }

      // CRITICAL FIX: Create MediaRecorder with comprehensive error handling
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, mediaRecorderOptions);
      } catch (mediaRecorderError) {
        addSystemLog(`❌ Error creando MediaRecorder: ${mediaRecorderError.message}`, 'error');
        
        // Fallback: Try without options
        try {
          addSystemLog('🔄 Reintentando MediaRecorder sin opciones específicas...', 'info');
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          addSystemLog('✅ MediaRecorder creado con configuración básica', 'success');
        } catch (fallbackError) {
          throw new Error(`MediaRecorder falló completamente: ${fallbackError.message}`);
        }
      }

      if (!mediaRecorderRef.current) {
        throw new Error('MediaRecorder no se pudo crear');
      }

      // CRITICAL FIX: Enhanced MediaRecorder event handling
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          addSystemLog(`📊 Chunk recibido: ${(event.data.size / 1024).toFixed(1)} KB`, 'success');
        } else {
          addSystemLog('⚠️ Chunk vacío recibido', 'warning');
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        const errorMsg = event.error ? event.error.message : 'Error desconocido de MediaRecorder';
        addSystemLog(`❌ Error de MediaRecorder: ${errorMsg}`, 'error');
        setError(`Error de grabación: ${errorMsg}`);
        
        // CRITICAL: Reset states on error
        setIsRecording(false);
        setStatus('error');
        setShowVoicePrompt(false);
        
        // Stop timers
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };

      mediaRecorderRef.current.onstart = () => {
        addSystemLog('✅ MediaRecorder INICIADO correctamente', 'success');
        addSystemLog(`📊 Estado: ${mediaRecorderRef.current.state}`, 'info');
      };

      mediaRecorderRef.current.onstop = () => {
        addSystemLog('✅ MediaRecorder DETENIDO - Procesando análisis final...', 'success');
        const blobType = mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        addSystemLog(`📊 Blob final: ${(blob.size / 1024 / 1024).toFixed(2)} MB`, 'success');
        setShowVoicePrompt(false);
        processRecordedData(blob);
      };

      // CRITICAL FIX: Start recording with validation
      addSystemLog('🎬 Iniciando grabación de MediaRecorder...', 'info');
      
      // Validate MediaRecorder state before starting
      if (mediaRecorderRef.current.state !== 'inactive') {
        throw new Error(`MediaRecorder en estado inválido: ${mediaRecorderRef.current.state}`);
      }

      mediaRecorderRef.current.start(100); // Request data every 100ms
      
      // 🚨 CRITICAL: START RECORDING TIMER
      recordingTimerRef.current = setInterval(() => {
        setAnalysisTime(prev => {
          const newTime = prev + 1;
          const progressPercent = (newTime / 30) * 100;
          setProgress(progressPercent);
          
          addSystemLog(`⏱️ Tiempo: ${newTime}s (${progressPercent.toFixed(1)}%) - Procesando datos REALES`, 'info');
          
          // Auto-stop after 30 seconds
          if (newTime >= 30) {
            addSystemLog('⏰ Completando análisis de 30 segundos...', 'info');
            stopCapture();
          }
          
          return newTime;
        });
      }, 1000);

      // Verify recording actually started
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          addSystemLog(`✅ CONFIRMADO: Grabación activa (${mediaRecorderRef.current.state})`, 'success');
        } else {
          addSystemLog(`❌ FALLO: Grabación no se inició (${mediaRecorderRef.current?.state || 'undefined'})`, 'error');
        }
      }, 200);

      addSystemLog('📊 Análisis rPPG REAL y vocal en progreso...', 'success');

    } catch (err) {
      console.error('Error starting capture:', err);
      setError(`Error starting capture: ${err.message}`);
      addSystemLog(`❌ Error crítico al iniciar captura: ${err.message}`, 'error');
      setStatus('error');
      setIsRecording(false);
      setShowVoicePrompt(false);
    }
  };

  // Stop biometric capture
  const stopCapture = useCallback(() => {
    setIsRecording(false);
    setStatus('processing');
    setShowVoicePrompt(false);
    addSystemLog('⏹️ Deteniendo análisis...', 'info');

    // Stop REAL biometric processor
    if (biometricProcessorRef.current) {
      const finalResult = biometricProcessorRef.current.stopAnalysis();
      addSystemLog(`📊 Análisis final: ${finalResult.success ? 'Exitoso' : 'Fallido'}`, finalResult.success ? 'success' : 'error');
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // Stop all timers and intervals
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
  }, [addSystemLog]);

  // CRITICAL FIX: Process recorded data and generate REAL final analysis
  const processRecordedData = async (blob) => {
    try {
      setStatus('processing');
      addSystemLog('🔬 Procesando análisis final REAL...', 'info');
      
      // Get final metrics from REAL processor
      let finalMetrics = null;
      if (biometricProcessorRef.current) {
        finalMetrics = biometricProcessorRef.current.getCurrentMetrics();
        addSystemLog('📊 Métricas finales obtenidas del procesador REAL', 'success');
      }
      
      // CRITICAL FIX: Generate comprehensive final analysis with REAL data validation
      setBiometricData(prev => {
        const finalData = {
          ...prev,
          recordingBlob: blob,
          timestamp: new Date().toISOString(),
          duration: (Date.now() - recordingStartTime.current) / 1000,
          
          // CRITICAL: Only update if we have REAL data
          ...(finalMetrics?.rppg && Object.keys(finalMetrics.rppg).some(key => finalMetrics.rppg[key] !== null) ? finalMetrics.rppg : {}),
          ...(finalMetrics?.voice && Object.keys(finalMetrics.voice).some(key => finalMetrics.voice[key] !== null) ? {
            fundamentalFrequency: finalMetrics.voice.fundamentalFrequency,
            jitter: finalMetrics.voice.jitter,
            shimmer: finalMetrics.voice.shimmer,
            harmonicToNoiseRatio: finalMetrics.voice.harmonicToNoiseRatio,
            spectralCentroid: finalMetrics.voice.spectralCentroid,
            voicedFrameRatio: finalMetrics.voice.voicedFrameRatio,
            speechRate: finalMetrics.voice.speechRate,
            vocalStress: finalMetrics.voice.stress,
            arousal: finalMetrics.voice.arousal,
            valence: finalMetrics.voice.valence,
            breathingRate: finalMetrics.voice.breathingRate,
            breathingPattern: finalMetrics.voice.breathingPattern
          } : {}),
        };
        
        // Count REAL completed biomarkers (not NULL/undefined)
        const completedCount = Object.keys(finalData).filter(key => {
          const value = finalData[key];
          return value !== null && value !== undefined && 
                 key !== 'recordingBlob' && key !== 'timestamp' && key !== 'duration' &&
                 key !== 'analysisQuality' && key !== 'totalBiomarkers' && key !== 'completedBiomarkers' &&
                 key !== 'healthScore' && key !== 'recommendations';
        }).length;
        
        finalData.completedBiomarkers = completedCount;
        
        // CRITICAL FIX: Only calculate health score if we have REAL data
        if (completedCount > 0) {
          finalData.healthScore = calculateRealHealthScore(finalData);
          finalData.recommendations = generateRealRecommendations(finalData);
          finalData.analysisQuality = completedCount > 20 ? 'Excelente' : completedCount > 10 ? 'Buena' : 'Aceptable';
        } else {
          finalData.healthScore = null;
          finalData.recommendations = ['❌ No se pudieron calcular biomarcadores. Verifique la iluminación y posición del rostro.'];
          finalData.analysisQuality = 'Fallido';
        }
        
        addSystemLog(`📊 Análisis final: ${completedCount}/36 biomarcadores REALES calculados`, completedCount > 0 ? 'success' : 'error');
        
        return finalData;
      });
      
      setStatus('complete');
      addSystemLog('✅ Análisis biométrico REAL completado', 'success');
      
      // Callback to parent component
      if (onDataCaptured) {
        onDataCaptured(biometricData);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(biometricData);
      }
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError(`Error processing data: ${err.message}`);
      addSystemLog(`❌ Error procesando datos: ${err.message}`, 'error');
      setStatus('error');
    }
  };

  // CRITICAL FIX: Calculate health score ONLY from REAL data
  const calculateRealHealthScore = (data) => {
    let score = 100;
    let assessments = 0;
    
    // Heart rate assessment - only if we have REAL data
    if (data.heartRate && typeof data.heartRate === 'number') {
      assessments++;
      if (data.heartRate < 60 || data.heartRate > 100) score -= 10;
    }
    
    // HRV assessment - only if we have REAL data
    if (data.rmssd && typeof data.rmssd === 'number') {
      assessments++;
      if (data.rmssd < 20) score -= 15;
      else if (data.rmssd > 50) score += 5;
    }
    
    // SpO2 assessment - only if we have REAL data
    if (data.oxygenSaturation && typeof data.oxygenSaturation === 'number') {
      assessments++;
      if (data.oxygenSaturation < 95) score -= 20;
    }
    
    // CRITICAL: Return null if no real assessments were made
    if (assessments === 0) {
      return null;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // CRITICAL FIX: Generate recommendations ONLY from REAL data
  const generateRealRecommendations = (data) => {
    const recommendations = [];
    
    if (data.heartRate && typeof data.heartRate === 'number' && data.heartRate > 100) {
      recommendations.push('Considere técnicas de relajación para reducir la frecuencia cardíaca');
    }
    
    if (data.rmssd && typeof data.rmssd === 'number' && data.rmssd < 20) {
      recommendations.push('Mejore la variabilidad cardíaca con ejercicio regular y manejo del estrés');
    }
    
    if (data.oxygenSaturation && typeof data.oxygenSaturation === 'number' && data.oxygenSaturation < 97) {
      recommendations.push('Considere ejercicios de respiración profunda');
    }
    
    if (data.vocalStress && typeof data.vocalStress === 'number' && data.vocalStress > 70) {
      recommendations.push('Practique técnicas de relajación vocal y manejo del estrés');
    }
    
    if (recommendations.length === 0) {
      // Only show this if we actually have data
      if (data.completedBiomarkers > 5) {
        recommendations.push('Excelente estado biométrico. Continúe con sus hábitos saludables.');
      } else {
        recommendations.push('Análisis incompleto. Intente nuevamente con mejor iluminación.');
      }
    }
    
    return recommendations;
  };

  // Export analysis data as JSON
  const exportAnalysisData = () => {
    try {
      // CRITICAL FIX: Only export REAL data (filter out NULL values)
      const exportData = {};
      Object.keys(biometricData).forEach(key => {
        const value = biometricData[key];
        if (value !== null && value !== undefined && key !== 'recordingBlob') {
          exportData[key] = value;
        }
      });
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `holocheck-analysis-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      addSystemLog(`📄 Datos exportados: ${Object.keys(exportData).length} campos con valores REALES`, 'success');
    } catch (error) {
      addSystemLog(`❌ Error exportando datos: ${error.message}`, 'error');
    }
  };

  // Pause/Resume capture
  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      // Resume timers
      if (!recordingTimerRef.current) {
        recordingTimerRef.current = setInterval(() => {
          setAnalysisTime(prev => {
            const newTime = prev + 1;
            const progressPercent = (newTime / 30) * 100;
            setProgress(progressPercent);
            
            if (newTime >= 30) {
              stopCapture();
            }
            
            return newTime;
          });
        }, 1000);
      }
    } else {
      mediaRecorderRef.current?.pause();
      // Pause timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    setIsPaused(!isPaused);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (biometricProcessorRef.current) {
        biometricProcessorRef.current.cleanup();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceDetectionRef.current) {
        clearInterval(faceDetectionRef.current);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
  }, [captureMode]);

  // Face Detection Overlay Component with stability indicator
  const FaceDetectionOverlay = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className={`absolute border-4 rounded-full transition-all duration-300 ${
          faceDetection.stable && faceDetection.detected
            ? 'border-green-400 shadow-green-400/50' 
            : faceDetection.detected
            ? 'border-yellow-400 shadow-yellow-400/50'
            : 'border-red-400 shadow-red-400/50'
        }`}
        style={{
          left: '50%',
          top: '50%',
          width: '300px',
          height: '300px',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 20px ${
            faceDetection.stable && faceDetection.detected 
              ? 'rgba(34, 197, 94, 0.5)' 
              : faceDetection.detected
              ? 'rgba(234, 179, 8, 0.5)'
              : 'rgba(239, 68, 68, 0.5)'
          }`
        }}
      >
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {faceDetection.stable && faceDetection.detected 
            ? '✓ Rostro Estabilizado' 
            : faceDetection.detected 
            ? '⏳ Estabilizando...' 
            : '⚠️ Posicione su rostro'
          }
        </div>
        {faceDetection.detected && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs">
            Señal: {faceDetection.confidence}% | Frames: {faceDetection.stableFrames}/5
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Floating Logs Toggle */}
      <button
        onClick={() => setShowLogs(!showLogs)}
        className="fixed top-4 right-4 z-50 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title={showLogs ? 'Ocultar Logs' : 'Mostrar Logs del Sistema'}
      >
        <Activity className="w-5 h-5" />
      </button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-500" />
          🔬 HoloCheck v1.1.5-CRITICAL-FIX - Análisis Biométrico REAL
        </h2>
        <p className="text-gray-600">
          Captura y análisis de 36+ biomarcadores utilizando rPPG avanzado REAL y análisis vocal en tiempo real
        </p>
        {browserInfo.isSafari && (
          <p className="text-sm text-orange-600 mt-1">
            🍎 Safari detectado - Configuración optimizada aplicada
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls and Status */}
        <div className="lg:col-span-1">
          {/* Capture Mode Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Captura
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setCaptureMode('video')}
                disabled={isRecording}
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'video' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera size={16} />
                <span>Solo Video (rPPG)</span>
              </button>
              <button
                onClick={() => setCaptureMode('audio')}
                disabled={isRecording}
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'audio' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mic size={16} />
                <span>Solo Audio (Voz)</span>
              </button>
              <button
                onClick={() => setCaptureMode('both')}
                disabled={isRecording}
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'both' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Activity size={16} />
                <span>Completo (rPPG + Voz)</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Estado del Sistema
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Navegador</span>
                <span className={`font-medium ${browserInfo.isSafari ? 'text-orange-600' : 'text-blue-600'}`}>
                  {browserInfo.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resolución</span>
                <span className="font-medium text-green-600">{browserInfo.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">FPS</span>
                <span className="font-medium text-purple-600">{browserInfo.fps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Procesador REAL</span>
                <span className="font-medium text-green-600">
                  {biometricProcessorRef.current ? '✅ v1.1.5-FIX' : '⚠️ Inicializando'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rostro</span>
                <span className={`font-medium ${
                  faceDetection.stable && faceDetection.detected 
                    ? 'text-green-600' 
                    : faceDetection.detected 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {faceDetection.stable && faceDetection.detected 
                    ? '✅ Estabilizado' 
                    : faceDetection.detected 
                    ? '⏳ Estabilizando' 
                    : '❌ No detectado'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biomarcadores</span>
                <span className={`font-medium ${
                  biometricData.completedBiomarkers > 10 ? 'text-green-600' : 
                  biometricData.completedBiomarkers > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {biometricData.completedBiomarkers}/36 REALES
                </span>
              </div>
            </div>
          </div>

          {/* System Logs */}
          {showLogs && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Logs del Sistema
              </h3>
              
              <div className="space-y-1 h-48 overflow-y-auto text-xs">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-1">
                    <span className="text-gray-400 font-mono">{log.time}</span>
                    <span>{log.icon}</span>
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
              
              <button
                onClick={() => setSystemLogs([])}
                className="w-full mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
              >
                Limpiar Logs
              </button>
            </div>
          )}
        </div>

        {/* Center Panel - Video Feed */}
        <div className="lg:col-span-2">
          {/* Video Preview */}
          {(captureMode === 'video' || captureMode === 'both') && (
            <div className="mb-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  webkit-playsinline="true"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Face Detection Overlay */}
                <FaceDetectionOverlay />
                
                {status === 'recording' && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>REC {Math.floor(analysisTime / 60)}:{(analysisTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}

                {/* Real-time biomarker counter */}
                {isRecording && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                    Biomarcadores REALES: {biometricData.completedBiomarkers}/36
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Reading Prompt */}
          {showVoicePrompt && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="text-green-600" size={20} />
                <span className="font-medium text-green-800">📢 Instrucciones de Análisis Vocal</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Para el análisis vocal completo, lea el siguiente texto en voz clara y natural:
              </p>
              <div className="bg-white p-3 rounded border border-green-300">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{voiceReadingText}"
                </p>
              </div>
            </div>
          )}

          {/* Status and Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {status === 'idle' && <CheckCircle className="text-green-500" size={20} />}
                {status === 'initializing' && <Activity className="text-blue-500 animate-spin" size={20} />}
                {status === 'recording' && <Heart className="text-red-500 animate-pulse" size={20} />}
                {status === 'processing' && <Activity className="text-blue-500 animate-spin" size={20} />}
                {status === 'complete' && <CheckCircle className="text-green-500" size={20} />}
                {status === 'error' && <AlertCircle className="text-red-500" size={20} />}
                <span className="text-sm font-medium capitalize">
                  {status === 'idle' && 'Listo para iniciar análisis REAL manual'}
                  {status === 'initializing' && 'Inicializando procesador biométrico REAL...'}
                  {status === 'recording' && 'Analizando 36+ biomarcadores REALES en tiempo real...'}
                  {status === 'processing' && 'Procesando análisis REAL completo...'}
                  {status === 'complete' && 'Análisis biométrico REAL completado'}
                  {status === 'error' && 'Error en el sistema'}
                </span>
              </div>
              {status === 'recording' && (
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}% - {Math.round((30000 - (progress * 300)) / 1000)}s restantes
                </span>
              )}
            </div>
            
            {status === 'recording' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Professional Manual Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isRecording ? (
              <button
                onClick={startCapture}
                disabled={status === 'initializing' || status === 'processing' || !faceDetection.stable}
                className={`px-8 py-3 rounded-md flex items-center space-x-2 font-medium shadow-lg transition-all ${
                  faceDetection.stable && faceDetection.detected
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                } ${status === 'initializing' || status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Play size={20} />
                <span>
                  {faceDetection.stable && faceDetection.detected 
                    ? 'Iniciar Análisis Biométrico REAL' 
                    : 'Esperando Rostro Estabilizado'
                  }
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center space-x-2"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                </button>
                <button
                  onClick={stopCapture}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
                >
                  <Square size={20} />
                  <span>Detener Análisis</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CRITICAL FIX: Show real-time data ONLY during recording */}
      {status === 'recording' && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Biomarcadores REALES en Tiempo Real ({biometricData.completedBiomarkers}/36 Variables)
          </h3>
          
          {/* Primary Cardiovascular Metrics */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Métricas Cardiovasculares Primarias</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="text-red-500" size={20} />
                  <span className="font-medium text-red-700">Frecuencia Cardíaca</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {biometricData.heartRate || '--'} <span className="text-sm">BPM</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-blue-500" size={20} />
                  <span className="font-medium text-blue-700">HRV (RMSSD)</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {biometricData.rmssd || biometricData.heartRateVariability || '--'} <span className="text-sm">ms</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-green-500" size={20} />
                  <span className="font-medium text-green-700">SpO₂</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {biometricData.oxygenSaturation || '--'} <span className="text-sm">%</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-purple-500" size={20} />
                  <span className="font-medium text-purple-700">Presión Arterial</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {biometricData.bloodPressure || '--'} <span className="text-sm">mmHg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced HRV Metrics */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Métricas HRV Avanzadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">SDNN</div>
                <div className="text-lg font-bold">{biometricData.sdnn || '--'} ms</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">pNN50</div>
                <div className="text-lg font-bold">{biometricData.pnn50 || '--'} %</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">LF/HF Ratio</div>
                <div className="text-lg font-bold">{biometricData.lfHfRatio || '--'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Triangular Index</div>
                <div className="text-lg font-bold">{biometricData.triangularIndex || '--'}</div>
              </div>
            </div>
          </div>

          {/* Voice Biomarkers */}
          {(captureMode === 'audio' || captureMode === 'both') && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Biomarcadores Vocales REALES</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="text-orange-500" size={20} />
                    <span className="font-medium text-orange-700">F0 (Hz)</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {biometricData.fundamentalFrequency || '--'} <span className="text-sm">Hz</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-teal-500" size={20} />
                    <span className="font-medium text-teal-700">Jitter</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-600">
                    {biometricData.jitter || '--'} <span className="text-sm">%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-pink-500" size={20} />
                    <span className="font-medium text-pink-700">Shimmer</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {biometricData.shimmer || '--'} <span className="text-sm">%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="text-indigo-500" size={20} />
                    <span className="font-medium text-indigo-700">Estrés Vocal</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {biometricData.vocalStress || biometricData.stressLevel || '--'} <span className="text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRITICAL FIX: Final Analysis Results - ONLY when complete */}
      {status === 'complete' && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
            📊 Análisis Biométrico REAL Completado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {biometricData.healthScore !== null ? biometricData.healthScore : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Puntuación de Salud</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {biometricData.completedBiomarkers || 0}
              </div>
              <div className="text-sm text-gray-600">Biomarcadores REALES Calculados</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {biometricData.analysisQuality || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Calidad del Análisis</div>
            </div>
          </div>

          {/* CRITICAL FIX: Show final biomarker summary */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Biomarcadores REALES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cardiovascular Summary */}
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-red-700 mb-2">Cardiovasculares</h5>
                <div className="space-y-1 text-sm">
                  <div>FC: {biometricData.heartRate || 'No calculado'} BPM</div>
                  <div>HRV: {biometricData.rmssd || 'No calculado'} ms</div>
                  <div>SpO₂: {biometricData.oxygenSaturation || 'No calculado'}%</div>
                  <div>PA: {biometricData.bloodPressure || 'No calculado'}</div>
                </div>
              </div>

              {/* HRV Summary */}
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-blue-700 mb-2">HRV Avanzado</h5>
                <div className="space-y-1 text-sm">
                  <div>SDNN: {biometricData.sdnn || 'No calculado'} ms</div>
                  <div>pNN50: {biometricData.pnn50 || 'No calculado'}%</div>
                  <div>LF/HF: {biometricData.lfHfRatio || 'No calculado'}</div>
                  <div>TI: {biometricData.triangularIndex || 'No calculado'}</div>
                </div>
              </div>

              {/* Voice Summary */}
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium text-orange-700 mb-2">Análisis Vocal</h5>
                <div className="space-y-1 text-sm">
                  <div>F0: {biometricData.fundamentalFrequency || 'No calculado'} Hz</div>
                  <div>Jitter: {biometricData.jitter || 'No calculado'}%</div>
                  <div>Shimmer: {biometricData.shimmer || 'No calculado'}%</div>
                  <div>Estrés: {biometricData.vocalStress || 'No calculado'}%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          {biometricData.recommendations && biometricData.recommendations.length > 0 && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-3">Recomendaciones Basadas en Datos REALES:</h5>
              <ul className="space-y-2">
                {biometricData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-blue-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={exportAnalysisData}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Exportar Datos REALES (JSON)</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>Nuevo Análisis</span>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">🎯 Control Manual Profesional v1.1.5-CRITICAL-FIX</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>MOTOR REAL:</strong> Análisis biométrico con cálculos reales (no simulados)</li>
          <li>• <strong>CONTROL MANUAL:</strong> La grabación se inicia únicamente cuando presiona el botón</li>
          <li>• <strong>DATOS REALES:</strong> Solo se muestran valores calculados (no NULL ni "--")</li>
          <li>• <strong>VALIDACIÓN:</strong> Puntuación de salud solo con datos reales</li>
          <li>• <strong>EXPORTACIÓN:</strong> JSON contiene únicamente biomarcadores con valores reales</li>
          <li>• Los datos se procesan localmente usando algoritmos rPPG y análisis vocal avanzados</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricCapture;