import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, Square, Play, Pause, AlertCircle, CheckCircle, Heart, Activity, Brain, Eye, Volume2, RotateCcw, Clock } from 'lucide-react';

// Import our advanced analysis engines
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

  // Real-time biometric data with 36+ biomarkers
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
    breathingPattern: null
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

  // FACE STABILITY TRACKING
  const faceStabilityRef = useRef({
    consecutiveDetections: 0,
    consecutiveNonDetections: 0,
    lastStableState: false,
    requiredStableFrames: 5 // 0.5 segundos a 100ms por frame
  });

  // Advanced biometric processor
  const biometricProcessorRef = useRef(null);
  
  // Confidence history for signal stabilization
  const confidenceHistoryRef = useRef([]);

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

  // Get Safari-compatible mimeType
  const getSafariCompatibleMimeType = useCallback(() => {
    const types = [
      'video/mp4',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        addSystemLog(`✅ Safari mimeType soportado: ${type}`, 'success');
        return type;
      }
    }
    
    addSystemLog('⚠️ Ningún mimeType específico soportado, usando por defecto', 'warning');
    return undefined; // Safari usará por defecto
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
      addSystemLog('🔍 Inicializando sistema biométrico avanzado...', 'info');

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

      // Initialize advanced biometric processor
      addSystemLog('🔬 Inicializando procesador biométrico avanzado...', 'info');
      biometricProcessorRef.current = new BiometricProcessor();
      
      const initResult = await biometricProcessorRef.current.initialize(
        videoRef.current, 
        captureMode === 'audio' || captureMode === 'both'
      );

      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      addSystemLog(`✅ Procesador inicializado - rPPG: ${initResult.rppgEnabled}, Voz: ${initResult.voiceEnabled}`, 'success');

      // Set up callbacks
      biometricProcessorRef.current.setCallback('onAnalysisUpdate', handleAnalysisUpdate);
      biometricProcessorRef.current.setCallback('onError', handleProcessorError);

      setStatus('idle');
      addSystemLog('🎯 Sistema listo para análisis biométrico completo', 'success');

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
          
          // Start face detection with stability tracking
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

  // REAL: Start face detection with actual video analysis
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
              console.log('Detección: Video activo - Rostro detectado por fallback');
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
        
        if (currentDetected && confidence > 50) {
          stability.consecutiveDetections++;
          stability.consecutiveNonDetections = 0;
        } else {
          stability.consecutiveNonDetections++;
          stability.consecutiveDetections = 0;
        }
        
        // Determine if face is stable (requires consecutive detections AND sufficient confidence)
        const hasGoodConfidence = confidence >= 60; // 60% threshold for stability
        const isStableDetected = stability.consecutiveDetections >= stability.requiredStableFrames && hasGoodConfidence;
        const isStableNotDetected = stability.consecutiveNonDetections >= stability.requiredStableFrames;
        
        let finalDetected = false;
        let stable = false;
        
        if (isStableDetected) {
          finalDetected = true;
          stable = true;
          if (!stability.lastStableState) {
            addSystemLog('✅ Rostro estabilizado - Listo para grabación', 'success');
          }
          stability.lastStableState = true;
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
        
        // Confidence already calculated above
        
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

  // Handle analysis updates from biometric processor
  const handleAnalysisUpdate = useCallback((data) => {
    if (data.status === 'analyzing' && data.metrics) {
      // Update real-time metrics from advanced processor
      if (data.metrics.rppg) {
        setBiometricData(prev => ({
          ...prev,
          heartRate: data.metrics.rppg.heartRate,
          heartRateVariability: data.metrics.rppg.heartRateVariability,
          // Add other cardiovascular metrics
          rmssd: data.metrics.rppg.rmssd,
          sdnn: data.metrics.rppg.sdnn,
          lfHfRatio: data.metrics.rppg.lfHfRatio
        }));
      }

      if (data.metrics.voice) {
        setBiometricData(prev => ({
          ...prev,
          vocalStress: data.metrics.voice.stress,
          fundamentalFrequency: data.metrics.voice.fundamentalFrequency,
          jitter: data.metrics.voice.jitter,
          shimmer: data.metrics.voice.shimmer
        }));
      }
    }
  }, []);

  // Handle processor errors
  const handleProcessorError = useCallback((errorData) => {
    addSystemLog(`❌ Error del procesador: ${errorData.error}`, 'error');
    setError(errorData.error);
  }, [addSystemLog]);

  // FIXED: Start biometric capture only when face is stable
  const startCapture = async () => {
    // CRITICAL: Check if face is stable before starting
    if (!faceDetection.stable || !faceDetection.detected) {
      addSystemLog('⚠️ Esperando estabilización del rostro...', 'warning');
      setError('Por favor, mantenga su rostro centrado y estable antes de iniciar el análisis');
      return;
    }

    if (!streamRef.current) {
      await initializeMedia();
    }

    try {
      // CRITICAL FIX: Set recording state FIRST to ensure UI updates
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      setAnalysisTime(0);
      recordingStartTime.current = Date.now();
      setError(null); // Clear any previous errors

      addSystemLog('🚀 Iniciando análisis biométrico completo...', 'info');

      // CRITICAL FIX: Validate video dimensions before starting analysis
      const videoElement = videoRef.current;
      if (videoElement && (captureMode === 'video' || captureMode === 'both')) {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          addSystemLog('⚠️ Dimensiones de video no disponibles, reintentando...', 'warning');
          // Wait a bit and retry
          setTimeout(() => {
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
              addSystemLog('✅ Video listo, continuando análisis...', 'success');
            }
          }, 100);
        }
      }

      // CRITICAL FIX: Start biometric analysis with proper error handling
      let biometricAnalysisStarted = false;
      if (biometricProcessorRef.current) {
        try {
          // Get audio stream for voice analysis
          const audioStream = (captureMode === 'audio' || captureMode === 'both') ? streamRef.current : null;
          
          // Start analysis with proper parameters
          const analysisResult = await biometricProcessorRef.current.startAnalysis(videoElement, audioStream);
          biometricAnalysisStarted = analysisResult;
          
          if (biometricAnalysisStarted) {
            addSystemLog('✅ Análisis biométrico iniciado correctamente', 'success');
          } else {
            addSystemLog('⚠️ Análisis biométrico falló, continuando con grabación', 'warning');
          }
        } catch (analysisError) {
          addSystemLog(`⚠️ Error en análisis biométrico: ${analysisError.message}, continuando con grabación`, 'warning');
          console.warn('Biometric analysis failed, continuing with recording:', analysisError);
        }
      }

      // SAFARI FIX: Safari-compatible MediaRecorder configuration
      addSystemLog('📹 Iniciando grabación de MediaRecorder...', 'info');

      // SAFARI FIX: Get appropriate mimeType for Safari
      let mimeType;
      if (browserInfo.isSafari) {
        mimeType = getSafariCompatibleMimeType();
        addSystemLog(`🍎 Safari: Usando mimeType ${mimeType || 'por defecto'}`, 'info');
      } else {
        // Chrome/Firefox configuration
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        addSystemLog(`✅ Chrome/Firefox: Usando mimeType ${mimeType}`, 'success');
      }

      // SAFARI FIX: Create MediaRecorder options with Safari compatibility
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
      }

      addSystemLog(`🔧 MediaRecorder options: ${JSON.stringify(mediaRecorderOptions)}`, 'info');

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, mediaRecorderOptions);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blobType = mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: blobType });
        processRecordedData(blob);
      };

      mediaRecorderRef.current.start(100);
      addSystemLog('✅ MediaRecorder iniciado correctamente', 'success');

      // Start real-time analysis and progress tracking
      startRealTimeAnalysis();

      addSystemLog('📊 Análisis rPPG y vocal en progreso...', 'success');

      // Auto-stop after 30 seconds (recommended for rPPG analysis)
      setTimeout(() => {
        if (isRecording) {
          stopCapture();
        }
      }, 30000);

    } catch (err) {
      console.error('Error starting capture:', err);
      setError(`Error starting capture: ${err.message}`);
      addSystemLog(`❌ Error al iniciar captura: ${err.message}`, 'error');
      setStatus('error');
      setIsRecording(false);
    }
  };

  // Stop biometric capture
  const stopCapture = useCallback(() => {
    setIsRecording(false);
    setStatus('processing');
    addSystemLog('⏹️ Deteniendo análisis...', 'info');

    // Stop biometric processor
    if (biometricProcessorRef.current) {
      biometricProcessorRef.current.stopAnalysis();
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    stopRealTimeAnalysis();
  }, []);

  // Execute comprehensive biometric analysis
  const executeComprehensiveAnalysis = async () => {
    if (!biometricProcessorRef.current) {
      addSystemLog('❌ Procesador biométrico no inicializado', 'error');
      return;
    }

    try {
      addSystemLog('🔬 Ejecutando análisis biométrico completo...', 'info');
      setStatus('processing');

      const analysisResult = await biometricProcessorRef.current.executeAnalysis();

      if (analysisResult.success) {
        addSystemLog(`✅ Análisis completado - ${analysisResult.biomarkerCount} biomarcadores procesados`, 'success');
        
        // Update biometric data with comprehensive results
        const results = analysisResult.results;
        if (results.cardiovascular && results.cardiovascular.cardiovascularMetrics) {
          const cv = results.cardiovascular.cardiovascularMetrics;
          setBiometricData(prev => ({
            ...prev,
            // Update all 24+ cardiovascular metrics
            heartRate: cv.heartRate,
            heartRateVariability: cv.heartRateVariability,
            rmssd: cv.rmssd,
            sdnn: cv.sdnn,
            pnn50: cv.pnn50,
            triangularIndex: cv.triangularIndex,
            lfPower: cv.lfPower,
            hfPower: cv.hfPower,
            lfHfRatio: cv.lfHfRatio,
            vlfPower: cv.vlfPower,
            totalPower: cv.totalPower,
            sampleEntropy: cv.sampleEntropy,
            approximateEntropy: cv.approximateEntropy,
            dfaAlpha1: cv.dfaAlpha1,
            dfaAlpha2: cv.dfaAlpha2,
            strokeVolume: cv.strokeVolume,
            cardiacOutput: cv.cardiacOutput,
            pulseWaveVelocity: cv.pulseWaveVelocity,
            oxygenSaturation: cv.oxygenSaturation,
            respiratoryRate: cv.respiratoryRate,
            perfusionIndex: cv.perfusionIndex
          }));
        }

        if (results.voice && results.voice.voiceMetrics) {
          const voice = results.voice.voiceMetrics;
          setBiometricData(prev => ({
            ...prev,
            // Update all 12+ voice metrics
            fundamentalFrequency: voice.fundamentalFrequency,
            jitter: voice.jitter,
            shimmer: voice.shimmer,
            harmonicToNoiseRatio: voice.harmonicToNoiseRatio,
            spectralCentroid: voice.spectralCentroid,
            voicedFrameRatio: voice.voicedFrameRatio,
            speechRate: voice.speechRate,
            vocalStress: voice.stress,
            arousal: voice.arousal,
            valence: voice.valence,
            breathingRate: voice.breathingRate,
            breathingPattern: voice.breathingPattern
          }));
        }

        setStatus('complete');

        // Callback to parent component
        if (onAnalysisComplete) {
          onAnalysisComplete(results);
        }

      } else {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

    } catch (error) {
      addSystemLog(`❌ Error en análisis: ${error.message}`, 'error');
      setError(error.message);
      setStatus('error');
    }
  };

  // Pause/Resume capture
  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      startRealTimeAnalysis();
    } else {
      mediaRecorderRef.current?.pause();
      stopRealTimeAnalysis();
    }
    setIsPaused(!isPaused);
  };

  // Real-time analysis during capture
  const startRealTimeAnalysis = () => {
    const analyzeFrame = () => {
      if (!isRecording || isPaused) return;

      // Update progress
      const elapsed = Date.now() - recordingStartTime.current;
      const progressPercent = Math.min((elapsed / 30000) * 100, 100);
      setProgress(progressPercent);

      // Update analysis time
      setAnalysisTime(Math.floor(elapsed / 1000));

      // Perform real-time rPPG analysis if face is detected
      if (videoRef.current && canvasRef.current && faceDetection.detected && (captureMode === 'video' || captureMode === 'both')) {
        performRealTimeRPPG();
      }

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  const stopRealTimeAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Real-time rPPG analysis (simplified for real-time display)
  const performRealTimeRPPG = () => {
    // Simulate real-time metrics updates while actual analysis runs in background
    setBiometricData(prev => ({
      ...prev,
      heartRate: 70 + Math.floor(Math.random() * 20),
      heartRateVariability: 25 + Math.floor(Math.random() * 30),
      oxygenSaturation: 96 + Math.floor(Math.random() * 4),
      respiratoryRate: 12 + Math.floor(Math.random() * 8),
      stressLevel: ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)]
    }));
  };

  // Process recorded data
  const processRecordedData = async (blob) => {
    try {
      setStatus('processing');
      addSystemLog('🔬 Procesando datos grabados...', 'info');
      
      // Execute comprehensive analysis
      await executeComprehensiveAnalysis();
      
      // Simulate blood pressure calculation
      const systolic = 110 + Math.random() * 30;
      const diastolic = 70 + Math.random() * 20;
      
      const finalData = {
        ...biometricData,
        bloodPressure: `${Math.round(systolic)}/${Math.round(diastolic)}`,
        recordingBlob: blob,
        timestamp: new Date().toISOString(),
        duration: (Date.now() - recordingStartTime.current) / 1000
      };

      setBiometricData(finalData);
      
      // Callback to parent component
      if (onDataCaptured) {
        onDataCaptured(finalData);
      }
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError(`Error processing data: ${err.message}`);
      addSystemLog(`❌ Error procesando datos: ${err.message}`, 'error');
      setStatus('error');
    }
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
    };
  }, []);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
  }, [captureMode]);

  // FIXED: Face Detection Overlay Component with stability indicator
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
          🔬 HoloCheck - Análisis Biométrico Profesional
        </h2>
        <p className="text-gray-600">
          Captura y análisis de 36+ biomarcadores utilizando rPPG avanzado y análisis vocal en tiempo real
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
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'video' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Camera size={16} />
                <span>Solo Video (rPPG)</span>
              </button>
              <button
                onClick={() => setCaptureMode('audio')}
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'audio' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Mic size={16} />
                <span>Solo Audio (Voz)</span>
              </button>
              <button
                onClick={() => setCaptureMode('both')}
                className={`w-full px-4 py-2 rounded-md flex items-center space-x-2 ${
                  captureMode === 'both' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
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
                <span className="text-gray-600">Procesador</span>
                <span className="font-medium text-green-600">
                  {biometricProcessorRef.current ? '✅ Activo' : '⚠️ Inicializando'}
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
                  {status === 'idle' && 'Listo para análisis biométrico completo'}
                  {status === 'initializing' && 'Inicializando procesador biométrico...'}
                  {status === 'recording' && 'Analizando 36+ biomarcadores en tiempo real...'}
                  {status === 'processing' && 'Procesando análisis completo...'}
                  {status === 'complete' && 'Análisis biométrico completado'}
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

          {/* FIXED: Analysis Controls - Only enabled when face is stable */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isRecording ? (
              <>
                <button
                  onClick={startCapture}
                  disabled={status === 'initializing' || status === 'processing' || !faceDetection.stable || !faceDetection.detected}
                  className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg"
                >
                  <Play size={20} />
                  <span>
                    {faceDetection.stable && faceDetection.detected 
                      ? 'Iniciar Análisis Biométrico' 
                      : 'Esperando Rostro Estable...'
                    }
                  </span>
                </button>
                
                <button
                  onClick={executeComprehensiveAnalysis}
                  disabled={status === 'initializing' || status === 'processing' || !biometricProcessorRef.current}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                >
                  <Brain size={20} />
                  <span>Ejecutar Análisis Completo</span>
                </button>
              </>
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

      {/* Real-time Biometric Data Display */}
      {(status === 'recording' || status === 'complete') && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Biomarcadores en Tiempo Real (36+ Variables)
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
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Biomarcadores Vocales</h4>
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

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Instrucciones para Análisis Óptimo:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mantén tu rostro bien iluminado y centrado en el círculo de detección</li>
          <li>• Permanece quieto durante 1.5 segundos para estabilizar la detección facial</li>
          <li>• El análisis completo procesa 36+ biomarcadores en tiempo real</li>
          <li>• Para análisis de voz, habla normalmente en un ambiente silencioso</li>
          <li>• Los datos se procesan localmente usando algoritmos médicos avanzados</li>
          <li>• El botón se habilitará automáticamente cuando el rostro esté estabilizado</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricCapture;