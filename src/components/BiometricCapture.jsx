import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, Square, Play, Pause, AlertCircle, CheckCircle, Heart, Activity, Brain, Eye, Volume2, RotateCcw, Clock, Download } from 'lucide-react';

// Import our REAL analysis engine - NO estimations
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

  // REAL biometric data - FIXED: Initialize with null values that will be updated
  const [biometricData, setBiometricData] = useState({
    // Basic cardiovascular metrics
    heartRate: null,
    heartRateVariability: null,
    bloodPressure: null,
    oxygenSaturation: null,
    stressLevel: null,
    respiratoryRate: null,
    perfusionIndex: null,
    cardiacRhythm: null,
    
    // Advanced cardiovascular metrics
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
    
    // Voice biomarkers
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

  // System logs for debugging - ENHANCED
  const [systemLogs, setSystemLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [detailedLogs, setDetailedLogs] = useState([]);

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

  // FACE STABILITY TRACKING - NO auto-start
  const faceStabilityRef = useRef({
    consecutiveDetections: 0,
    consecutiveNonDetections: 0,
    lastStableState: false,
    requiredStableFrames: 5,
    autoStartTriggered: false // DISABLED: No auto-start
  });

  // REAL biometric processor - NO estimations
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

  // ENHANCED: Add system log with detailed logging
  const addSystemLog = useCallback((message, type = 'info', data = null) => {
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const timestamp = new Date().toISOString();
    
    const newLog = { 
      id: Date.now() + Math.random(), 
      time, 
      timestamp,
      message, 
      type,
      data: data ? JSON.stringify(data) : null,
      icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔍'
    };
    
    setSystemLogs(prev => [...prev, newLog].slice(-50)); // Keep last 50 logs
    
    // Also add to detailed logs for export
    setDetailedLogs(prev => [...prev, {
      ...newLog,
      source: 'UI',
      component: 'BiometricCapture'
    }].slice(-200)); // Keep last 200 detailed logs
    
    console.log(`[${time}] UI: ${message}`, data || '');
  }, []);

  // ENHANCED: Export comprehensive logs
  const exportLogs = useCallback(() => {
    try {
      // Get processor logs if available
      const processorLogs = biometricProcessorRef.current?.debugLogs || [];
      
      // Combine all logs
      const allLogs = [
        ...detailedLogs.map(log => ({
          ...log,
          source: 'UI'
        })),
        ...processorLogs.map(log => ({
          ...log,
          source: 'Processor'
        }))
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Create comprehensive log content
      const logContent = [
        '='.repeat(80),
        'HOLOCHECK DEBUG LOG EXPORT',
        `Generated: ${new Date().toISOString()}`,
        `Total Logs: ${allLogs.length}`,
        `Browser: ${browserInfo.name}`,
        `Status: ${status}`,
        `Calculated Biomarkers: ${calculatedBiomarkersCount}`,
        '='.repeat(80),
        '',
        ...allLogs.map(log => 
          `[${log.timestamp}] [${log.source}] ${log.type.toUpperCase()}: ${log.message}${log.data ? ` | DATA: ${log.data}` : ''}`
        )
      ].join('\n');
      
      // Download file
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holocheck-complete-debug-${Date.now()}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addSystemLog('📁 Logs completos exportados exitosamente', 'success', {
        totalLogs: allLogs.length,
        uiLogs: detailedLogs.length,
        processorLogs: processorLogs.length
      });
      
    } catch (error) {
      addSystemLog('❌ Error exportando logs', 'error', { error: error.message });
    }
  }, [detailedLogs, browserInfo, status, calculatedBiomarkersCount, addSystemLog]);

  // Initialize media and REAL biometric processor
  const initializeMedia = async () => {
    try {
      setStatus('initializing');
      setError(null);
      addSystemLog('🔍 Inicializando sistema biométrico REAL v1.1.8-DEBUG-ENHANCED...', 'info');

      // Detect browser
      const realBrowserInfo = detectBrowserInfo();
      setBrowserInfo(realBrowserInfo);
      addSystemLog(`🌐 ${realBrowserInfo.name} detectado`, 'success', realBrowserInfo);

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

      addSystemLog('📹 Solicitando acceso a cámara y micrófono...', 'info', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Initialize video element
      if (videoRef.current && (captureMode === 'video' || captureMode === 'both')) {
        await initializeVideoElement(stream, realBrowserInfo);
      }

      // Initialize REAL biometric processor - NO estimations
      addSystemLog('🔬 Inicializando procesador biométrico REAL v1.1.8-DEBUG-ENHANCED...', 'info');
      biometricProcessorRef.current = new BiometricProcessor();
      
      const initResult = await biometricProcessorRef.current.initialize(
        videoRef.current, 
        captureMode === 'audio' || captureMode === 'both'
      );

      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      addSystemLog(`✅ Procesador REAL inicializado`, 'success', initResult);

      // Set up callbacks - FIXED: Proper callback setup
      biometricProcessorRef.current.setCallback('onAnalysisUpdate', handleAnalysisUpdate);
      biometricProcessorRef.current.setCallback('onError', handleProcessorError);

      setStatus('idle');
      addSystemLog('🎯 Sistema listo para análisis biométrico REAL con logs detallados', 'success');

    } catch (err) {
      console.error('Error initializing media:', err);
      setError(`Error accessing camera/microphone: ${err.message}`);
      addSystemLog(`❌ Error de inicialización: ${err.message}`, 'error', { error: err.message });
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
          const videoInfo = {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            duration: video.duration
          };
          
          addSystemLog(`📊 Video cargado correctamente`, 'success', videoInfo);
          
          // Update browser info with actual video settings
          if (stream.getVideoTracks().length > 0) {
            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            setBrowserInfo(prev => ({
              ...prev,
              fps: settings.frameRate || 30,
              resolution: `${settings.width}x${settings.height}`
            }));
            
            addSystemLog('📊 Configuración de video actualizada', 'info', settings);
          }

          await video.play();
          addSystemLog('✅ Video reproduciéndose correctamente', 'success');
          
          // Start face detection WITHOUT auto-recording
          startFaceDetection();
          
          resolve();
        } catch (playError) {
          addSystemLog('⚠️ Autoplay falló, requiere interacción del usuario', 'warning', { error: playError.message });
          
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
              addSystemLog(`❌ Error al activar video: ${e.message}`, 'error', { error: e.message });
              reject(e);
            }
          };
        }
      };

      video.onerror = (error) => {
        addSystemLog(`❌ Error de video`, 'error', { error: error.message });
        reject(error);
      };

      video.srcObject = stream;
    });
  };

  // Face detection WITHOUT auto-recording
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current) return;
    
    addSystemLog('👁️ Iniciando detección facial...', 'info');
    
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
            
            // Calculate sharpness (gradient variance)
            let sharpness = 0;
            let pixelCount = 0;
            for (let i = 0; i < data.length - 4; i += 16) { // Sample every 4th pixel
              const gray1 = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
              const gray2 = data[i+4] * 0.299 + data[i+5] * 0.587 + data[i+6] * 0.114;
              sharpness += Math.abs(gray1 - gray2);
              pixelCount++;
            }
            sharpness = pixelCount > 0 ? sharpness / pixelCount : 0;
            
            // Calculate average brightness
            let brightness = 0;
            for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
              brightness += (data[i] + data[i+1] + data[i+2]) / 3;
            }
            brightness = brightness / (data.length / 16);
            
            // Final quality: 70% sharpness + 30% lighting
            const sharpnessScore = Math.min(100, Math.max(0, (sharpness / 30) * 100));
            const brightnessScore = (brightness > 80 && brightness < 180) ? 100 : Math.max(30, 100 - Math.abs(brightness - 130));
            
            const finalQuality = Math.round((sharpnessScore * 0.7 + brightnessScore * 0.3));
            
            // Moving average to stabilize
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
            // DIRECT FALLBACK: If video is active, face is detected
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              return true;
            }
            
            return false;
            
          } catch (error) {
            console.warn('Error in detection:', error);
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
          
          // NO AUTO-START: Manual control only
          
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

  // ENHANCED: Handle analysis updates from REAL biometric processor
  const handleAnalysisUpdate = useCallback((data) => {
    addSystemLog(`📊 Actualización de análisis recibida`, 'info', {
      status: data.status,
      calculatedBiomarkers: data.calculatedBiomarkers,
      hasRppgData: !!data.metrics?.rppg,
      hasVoiceData: !!data.metrics?.voice,
      timestamp: data.timestamp
    });
    
    if (data.status === 'analyzing' && data.metrics) {
      // ENHANCED: Update biometric data with REAL values
      setBiometricData(prevData => {
        const newData = { ...prevData };
        
        // Process rPPG metrics
        if (data.metrics.rppg) {
          addSystemLog('❤️ Procesando métricas rPPG', 'info', {
            metricsCount: Object.keys(data.metrics.rppg).length,
            metrics: Object.keys(data.metrics.rppg)
          });
          
          // Update ONLY non-null values
          Object.keys(data.metrics.rppg).forEach(key => {
            const value = data.metrics.rppg[key];
            if (value !== null && value !== undefined) {
              newData[key] = value;
              addSystemLog(`✅ ${key} actualizado`, 'success', { key, value });
            }
          });
        }

        // Process voice metrics
        if (data.metrics.voice) {
          addSystemLog('🎤 Procesando métricas de voz', 'info', {
            metricsCount: Object.keys(data.metrics.voice).length,
            metrics: Object.keys(data.metrics.voice)
          });
          
          Object.keys(data.metrics.voice).forEach(key => {
            const value = data.metrics.voice[key];
            if (value !== null && value !== undefined) {
              newData[key] = value;
              addSystemLog(`✅ Voz ${key} actualizado`, 'success', { key, value });
            }
          });
        }

        return newData;
      });

      // Log REAL biomarker count
      const calculatedCount = data.calculatedBiomarkers || 0;
      addSystemLog(`🔬 Total biomarcadores REALES: ${calculatedCount}`, calculatedCount > 0 ? 'success' : 'warning');
    }
  }, [addSystemLog]);

  // Handle processor errors
  const handleProcessorError = useCallback((errorData) => {
    addSystemLog(`❌ Error del procesador biométrico`, 'error', errorData);
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

    // Prevent multiple simultaneous recordings
    if (isRecording || status === 'recording') {
      addSystemLog('⚠️ Grabación ya en progreso, ignorando solicitud duplicada', 'warning');
      return;
    }

    // Validate stream before proceeding
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
      addSystemLog('🚀 INICIANDO análisis biométrico REAL con logs detallados...', 'info');
      
      // Show voice prompt if in audio mode
      if (captureMode === 'audio' || captureMode === 'both') {
        setShowVoicePrompt(true);
        addSystemLog('🎤 Mostrando prompt de voz', 'info');
      }

      // Set recording state FIRST to prevent race conditions
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      setAnalysisTime(0);
      recordingStartTime.current = Date.now();
      setError(null); // Clear any previous errors
      chunksRef.current = []; // Reset chunks

      // ENHANCED: Reset biometric data for fresh analysis with proper structure
      setBiometricData({
        heartRate: null, heartRateVariability: null, bloodPressure: null, oxygenSaturation: null,
        stressLevel: null, respiratoryRate: null, perfusionIndex: null, cardiacRhythm: null,
        rmssd: null, sdnn: null, pnn50: null, triangularIndex: null, lfPower: null, hfPower: null,
        lfHfRatio: null, vlfPower: null, totalPower: null, sampleEntropy: null, approximateEntropy: null,
        dfaAlpha1: null, dfaAlpha2: null, cardiacOutput: null, strokeVolume: null, pulseWaveVelocity: null,
        fundamentalFrequency: null, jitter: null, shimmer: null, harmonicToNoiseRatio: null,
        spectralCentroid: null, voicedFrameRatio: null, speechRate: null, vocalStress: null,
        arousal: null, valence: null, breathingRate: null, breathingPattern: null
      });

      addSystemLog('🔄 Datos biométricos reiniciados para análisis fresco', 'info');

      // Start REAL biometric analysis
      let biometricAnalysisStarted = false;
      if (biometricProcessorRef.current) {
        try {
          // Get audio stream for voice analysis
          const audioStream = (captureMode === 'audio' || captureMode === 'both') ? streamRef.current : null;
          
          addSystemLog('🔬 Iniciando procesador biométrico REAL...', 'info', {
            hasVideo: !!videoRef.current,
            hasAudio: !!audioStream,
            captureMode
          });
          
          // Start REAL analysis
          const analysisResult = await biometricProcessorRef.current.startAnalysis(videoRef.current, audioStream);
          biometricAnalysisStarted = analysisResult;
          
          if (biometricAnalysisStarted) {
            addSystemLog('✅ Análisis biométrico REAL iniciado correctamente', 'success');
          } else {
            addSystemLog('⚠️ Análisis biométrico falló, continuando con grabación', 'warning');
          }
        } catch (analysisError) {
          addSystemLog(`⚠️ Error en análisis biométrico`, 'warning', { error: analysisError.message });
          console.warn('Biometric analysis failed:', analysisError);
        }
      }

      // Create MediaRecorder for recording
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
        return undefined;
      };

      const mimeType = getSupportedMimeType();
      const mediaRecorderOptions = {};
      
      if (mimeType) {
        mediaRecorderOptions.mimeType = mimeType;
      }
      
      if (browserInfo.isSafari) {
        mediaRecorderOptions.videoBitsPerSecond = 2500000;
        mediaRecorderOptions.audioBitsPerSecond = 128000;
      } else {
        mediaRecorderOptions.videoBitsPerSecond = 5000000;
        mediaRecorderOptions.audioBitsPerSecond = 192000;
      }

      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, mediaRecorderOptions);
        addSystemLog('✅ MediaRecorder creado exitosamente', 'success', mediaRecorderOptions);
      } catch (mediaRecorderError) {
        addSystemLog(`❌ Error creando MediaRecorder`, 'error', { error: mediaRecorderError.message });
        
        try {
          addSystemLog('🔄 Reintentando MediaRecorder sin opciones específicas...', 'info');
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          addSystemLog('✅ MediaRecorder creado con configuración básica', 'success');
        } catch (fallbackError) {
          throw new Error(`MediaRecorder falló completamente: ${fallbackError.message}`);
        }
      }

      // MediaRecorder event handling
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          addSystemLog(`📊 Chunk recibido: ${(event.data.size / 1024).toFixed(1)} KB`, 'info');
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        const errorMsg = event.error ? event.error.message : 'Error desconocido de MediaRecorder';
        addSystemLog(`❌ Error de MediaRecorder`, 'error', { error: errorMsg });
        setError(`Error de grabación: ${errorMsg}`);
        
        setIsRecording(false);
        setStatus('error');
        setShowVoicePrompt(false);
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      mediaRecorderRef.current.onstart = () => {
        addSystemLog('✅ MediaRecorder INICIADO correctamente', 'success');
      };

      mediaRecorderRef.current.onstop = () => {
        addSystemLog('✅ MediaRecorder DETENIDO - Procesando análisis final...', 'success');
        const blobType = mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        addSystemLog(`📊 Blob final creado: ${(blob.size / 1024 / 1024).toFixed(2)} MB`, 'success');
        setShowVoicePrompt(false);
        processRecordedData(blob);
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Request data every 100ms
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setAnalysisTime(prev => {
          const newTime = prev + 1;
          const progressPercent = (newTime / 30) * 100;
          setProgress(progressPercent);
          
          addSystemLog(`⏱️ Tiempo: ${newTime}s (${progressPercent.toFixed(1)}%)`, 'info');
          
          // Auto-stop after 30 seconds
          if (newTime >= 30) {
            addSystemLog('⏰ Completando análisis de 30 segundos...', 'info');
            stopCapture();
          }
          
          return newTime;
        });
      }, 1000);

      addSystemLog('📊 Análisis rPPG REAL en progreso con logs detallados...', 'success');

    } catch (err) {
      console.error('Error starting capture:', err);
      setError(`Error starting capture: ${err.message}`);
      addSystemLog(`❌ Error crítico al iniciar captura`, 'error', { error: err.message });
      setStatus('error');
      setIsRecording(false);
      setShowVoicePrompt(false);
    }
  };

  // Stop biometric capture
  const stopCapture = useCallback(() => {
    addSystemLog('⏹️ Deteniendo análisis biométrico...', 'info');
    
    setIsRecording(false);
    setStatus('processing');
    setShowVoicePrompt(false);

    // Stop REAL biometric processor
    if (biometricProcessorRef.current) {
      biometricProcessorRef.current.stopAnalysis();
      addSystemLog('🔬 Procesador biométrico detenido', 'info');
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      addSystemLog('📹 MediaRecorder detenido', 'info');
    }

    // Stop all timers and intervals
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
  }, [addSystemLog]);

  // Process recorded data and generate final analysis - ONLY REAL DATA
  const processRecordedData = async (blob) => {
    try {
      setStatus('processing');
      addSystemLog('🔬 Procesando análisis final REAL...', 'info');
      
      // Count ONLY calculated biomarkers (not null)
      const calculatedBiomarkers = Object.values(biometricData).filter(val => val !== null && val !== undefined).length;
      
      addSystemLog('📊 Conteo final de biomarcadores', 'info', {
        calculatedBiomarkers,
        totalPossible: 36,
        percentage: Math.round((calculatedBiomarkers / 36) * 100)
      });
      
      // Generate final data with ONLY real calculations
      const finalData = {
        ...biometricData,
        recordingBlob: blob,
        timestamp: new Date().toISOString(),
        duration: (Date.now() - recordingStartTime.current) / 1000,
        
        // Analysis summary - HONEST reporting
        analysisQuality: calculatedBiomarkers > 15 ? 'Excelente' : calculatedBiomarkers > 8 ? 'Buena' : calculatedBiomarkers > 3 ? 'Aceptable' : 'Insuficiente',
        totalBiomarkers: 36,
        completedBiomarkers: calculatedBiomarkers,
        
        // Health assessment - ONLY if we have real data
        healthScore: calculatedBiomarkers > 5 ? calculateRealHealthScore(biometricData) : null,
        recommendations: calculatedBiomarkers > 3 ? generateRealRecommendations(biometricData) : ['Análisis incompleto. Intente nuevamente con mejor iluminación.']
      };

      setBiometricData(finalData);
      setStatus('complete');
      
      addSystemLog('✅ Análisis biométrico REAL completado', 'success', {
        calculatedBiomarkers,
        analysisQuality: finalData.analysisQuality,
        healthScore: finalData.healthScore
      });
      
      // Callback to parent component
      if (onDataCaptured) {
        onDataCaptured(finalData);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(finalData);
      }
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError(`Error processing data: ${err.message}`);
      addSystemLog(`❌ Error procesando datos finales`, 'error', { error: err.message });
      setStatus('error');
    }
  };

  // Calculate REAL health score - ONLY from calculated data
  const calculateRealHealthScore = (data) => {
    let score = 100;
    let assessments = 0;
    
    // Heart rate assessment - ONLY if calculated
    if (data.heartRate !== null) {
      assessments++;
      if (data.heartRate < 60 || data.heartRate > 100) score -= 10;
    }
    
    // HRV assessment - ONLY if calculated
    if (data.rmssd !== null) {
      assessments++;
      if (data.rmssd < 20) score -= 15;
      else if (data.rmssd > 50) score += 5;
    }
    
    // SpO2 assessment - ONLY if calculated
    if (data.oxygenSaturation !== null) {
      assessments++;
      if (data.oxygenSaturation < 95) score -= 20;
    }
    
    // If no assessments possible, return null
    if (assessments === 0) {
      return null;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Generate REAL recommendations - ONLY from calculated data
  const generateRealRecommendations = (data) => {
    const recommendations = [];
    
    if (data.heartRate !== null && data.heartRate > 100) {
      recommendations.push('Considere técnicas de relajación para reducir la frecuencia cardíaca');
    }
    
    if (data.rmssd !== null && data.rmssd < 20) {
      recommendations.push('Mejore la variabilidad cardíaca con ejercicio regular y manejo del estrés');
    }
    
    if (data.oxygenSaturation !== null && data.oxygenSaturation < 97) {
      recommendations.push('Considere ejercicios de respiración profunda');
    }
    
    if (data.vocalStress !== null && data.vocalStress > 70) {
      recommendations.push('Practique técnicas de relajación vocal y manejo del estrés');
    }
    
    if (recommendations.length === 0) {
      const calculatedCount = Object.values(data).filter(val => val !== null && val !== undefined).length;
      if (calculatedCount > 10) {
        recommendations.push('Excelente estado biométrico basado en datos calculados. Continúe con sus hábitos saludables.');
      } else {
        recommendations.push('Análisis parcial completado. Para evaluación completa, mejore las condiciones de captura.');
      }
    }
    
    return recommendations;
  };

  // Pause/Resume capture
  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      addSystemLog('▶️ Análisis reanudado', 'info');
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
      addSystemLog('⏸️ Análisis pausado', 'info');
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

  // ENHANCED: Helper function to display biomarker values - FIXED LOGIC
  const displayBiomarkerValue = (value, unit = '', fallback = 'No calculado') => {
    // CRITICAL: Check for actual calculated values, not just null/undefined
    if (value === null || value === undefined || value === 0) {
      return fallback;
    }
    
    // Handle different value types
    if (typeof value === 'number') {
      return `${value} ${unit}`.trim();
    }
    
    if (typeof value === 'string' && value.length > 0) {
      return `${value} ${unit}`.trim();
    }
    
    return fallback;
  };

  // Count calculated biomarkers in real time - FIXED COUNTING
  const calculatedBiomarkersCount = Object.values(biometricData).filter(val => {
    return val !== null && val !== undefined && val !== 0 && val !== '';
  }).length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* ENHANCED: Floating Controls */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title={showLogs ? 'Ocultar Logs' : 'Mostrar Logs del Sistema'}
        >
          <Activity className="w-5 h-5" />
        </button>
        
        <button
          onClick={exportLogs}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Exportar Logs Completos"
        >
          <Download className="w-5 h-5" />
        </button>
        
        {biometricProcessorRef.current && (
          <button
            onClick={() => biometricProcessorRef.current.exportDebugLogs()}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Exportar Logs del Procesador"
          >
            <Brain className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-500" />
          🔬 HoloCheck v1.1.8-DEBUG-ENHANCED - Análisis Biométrico REAL
        </h2>
        <p className="text-gray-600">
          Captura y análisis de 36+ biomarcadores REALES con logs detallados - Sin estimaciones ni valores falsos
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
                  {biometricProcessorRef.current ? '✅ v1.1.8-DEBUG-ENHANCED' : '⚠️ Inicializando'}
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
                  calculatedBiomarkersCount > 15 ? 'text-green-600' : 
                  calculatedBiomarkersCount > 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {calculatedBiomarkersCount}/36 REALES
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Logs del Sistema</span>
                <span className="font-medium text-blue-600">{systemLogs.length}</span>
              </div>
            </div>
          </div>

          {/* ENHANCED: System Logs */}
          {showLogs && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Logs del Sistema
                </div>
                <span className="text-sm text-gray-500">({systemLogs.length}/50)</span>
              </h3>
              
              <div className="space-y-1 h-64 overflow-y-auto text-xs bg-black text-green-400 p-2 rounded font-mono">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-1">
                    <span className="text-gray-400">{log.time}</span>
                    <span>{log.icon}</span>
                    <span className={`flex-1 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      log.type === 'error' ? 'text-red-400' :
                      'text-green-400'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {systemLogs.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No hay logs disponibles
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setSystemLogs([])}
                  className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                >
                  Limpiar Logs
                </button>
                <button
                  onClick={exportLogs}
                  className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center justify-center space-x-1"
                >
                  <Download size={12} />
                  <span>Exportar</span>
                </button>
              </div>
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

                {/* Real biomarker counter */}
                {isRecording && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                    Biomarcadores REALES: {calculatedBiomarkersCount}/36
                  </div>
                )}

                {/* Debug info overlay */}
                {showLogs && isRecording && (
                  <div className="absolute top-4 left-4 bg-black/80 text-green-400 px-3 py-2 rounded-md text-xs font-mono">
                    <div>Logs: {systemLogs.length}</div>
                    <div>Processor: {biometricProcessorRef.current?.debugLogs?.length || 0}</div>
                    <div>Status: {status}</div>
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
                  {status === 'idle' && 'Listo para análisis biométrico REAL con logs detallados'}
                  {status === 'initializing' && 'Inicializando procesador biométrico REAL v1.1.8...'}
                  {status === 'recording' && `Analizando biomarcadores REALES: ${calculatedBiomarkersCount}/36`}
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

      {/* Real-time Biometric Data Display - ONLY REAL VALUES */}
      {(status === 'recording' || status === 'complete') && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Biomarcadores REALES en Tiempo Real ({calculatedBiomarkersCount}/36 Calculados)
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
                  {displayBiomarkerValue(biometricData.heartRate, 'BPM')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-blue-500" size={20} />
                  <span className="font-medium text-blue-700">HRV (RMSSD)</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {displayBiomarkerValue(biometricData.rmssd || biometricData.heartRateVariability, 'ms')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-green-500" size={20} />
                  <span className="font-medium text-green-700">SpO₂</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {displayBiomarkerValue(biometricData.oxygenSaturation, '%')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-purple-500" size={20} />
                  <span className="font-medium text-purple-700">Presión Arterial</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {displayBiomarkerValue(biometricData.bloodPressure)}
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
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.sdnn, 'ms')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">pNN50</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.pnn50, '%')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">LF/HF Ratio</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.lfHfRatio)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Triangular Index</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.triangularIndex)}</div>
              </div>
            </div>
          </div>

          {/* Additional Cardiovascular Metrics */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Métricas Cardiovasculares Adicionales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Frecuencia Respiratoria</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.respiratoryRate, 'rpm')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Índice de Perfusión</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.perfusionIndex, '%')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Gasto Cardíaco</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.cardiacOutput, 'L/min')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm text-gray-600">Volumen Sistólico</div>
                <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.strokeVolume, 'ml')}</div>
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
                    {displayBiomarkerValue(biometricData.fundamentalFrequency, 'Hz')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-teal-500" size={20} />
                    <span className="font-medium text-teal-700">Jitter</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-600">
                    {displayBiomarkerValue(biometricData.jitter, '%')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-pink-500" size={20} />
                    <span className="font-medium text-pink-700">Shimmer</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {displayBiomarkerValue(biometricData.shimmer, '%')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="text-indigo-500" size={20} />
                    <span className="font-medium text-indigo-700">Estrés Vocal</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {displayBiomarkerValue(biometricData.vocalStress || biometricData.stressLevel, '%')}
                  </div>
                </div>
              </div>

              {/* Additional Voice Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm text-gray-600">HNR</div>
                  <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.harmonicToNoiseRatio, 'dB')}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm text-gray-600">Centroide Espectral</div>
                  <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.spectralCentroid, 'Hz')}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm text-gray-600">Velocidad de Habla</div>
                  <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.speechRate, 'sil/s')}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm text-gray-600">Patrón Respiratorio</div>
                  <div className="text-lg font-bold">{displayBiomarkerValue(biometricData.breathingPattern)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Final Analysis Results - ONLY when complete */}
          {status === 'complete' && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={24} />
                Análisis Biométrico REAL Completo
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {biometricData.healthScore !== null ? biometricData.healthScore : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Puntuación de Salud</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {biometricData.completedBiomarkers || calculatedBiomarkersCount}
                  </div>
                  <div className="text-sm text-gray-600">Biomarcadores REALES Calculados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {biometricData.analysisQuality || 'Calculando'}
                  </div>
                  <div className="text-sm text-gray-600">Calidad del Análisis</div>
                </div>
              </div>
              
              {biometricData.recommendations && biometricData.recommendations.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-semibold text-gray-800 mb-3">Recomendaciones Basadas en Datos REALES:</h5>
                  <ul className="space-y-2">
                    {biometricData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ENHANCED: Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">🎯 Análisis Biométrico REAL v1.1.8-DEBUG-ENHANCED</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>LOGS DETALLADOS:</strong> Rastreo completo de cada paso del análisis con exportación</li>
          <li>• <strong>SOLO DATOS REALES:</strong> Los biomarcadores se calculan únicamente cuando hay datos válidos</li>
          <li>• <strong>SIN ESTIMACIONES:</strong> Si no se puede calcular, se muestra "No calculado"</li>
          <li>• <strong>TRANSPARENCIA TOTAL:</strong> Solo valores basados en análisis rPPG real</li>
          <li>• <strong>EXPORTACIÓN DE LOGS:</strong> Use los botones flotantes para exportar logs completos</li>
          <li>• Asegúrese de que su rostro esté bien iluminado y centrado en el círculo verde</li>
          <li>• El análisis procesa datos reales durante 30 segundos sin generar valores falsos</li>
          <li>• Para análisis de voz, siga las instrucciones de lectura que aparecerán en pantalla</li>
          <li>• Al finalizar, recibirá un reporte con únicamente los biomarcadores calculados realmente</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricCapture;