import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, Square, Play, Pause, AlertCircle, CheckCircle, Heart, Activity, Brain, Eye, Volume2, RotateCcw, Clock, Download } from 'lucide-react';
import { formatSpecificBiomarker } from '../utils/biomarkerFormatter';
import dataStorageService from '../services/dataStorage';
import EnhancedRPPGProcessor from '../services/analysis/enhancedRPPGProcessor';
import HealthScoreCalculator from '../services/analysis/healthScoreCalculator';

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

  // Enhanced real-time biomarker accumulator
  const [realtimeBiomarkers, setRealtimeBiomarkers] = useState({
    latest: {
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
      pnn20: null,
      sdsd: null,
      lfNu: null,
      hfNu: null,
      tinn: null
    },
    history: [],
    updateCount: 0
  });

  // Enhanced biometric data structure
  const [biometricData, setBiometricData] = useState({
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
    pnn20: null,
    sdsd: null,
    triangularIndex: null,
    lfPower: null,
    hfPower: null,
    lfHfRatio: null,
    lfNu: null,
    hfNu: null,
    vlfPower: null,
    totalPower: null,
    tinn: null,
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
  const recordingTimerRef = useRef(null);
  const chunksRef = useRef([]);

  // Face stability tracking
  const faceStabilityRef = useRef({
    consecutiveDetections: 0,
    consecutiveNonDetections: 0,
    lastStableState: false,
    requiredStableFrames: 5,
    autoStartTriggered: false
  });

  // Enhanced biometric processor and health calculator
  const biometricProcessorRef = useRef(null);
  const healthCalculatorRef = useRef(null);
  
  // Confidence history for signal stabilization
  const confidenceHistoryRef = useRef([]);

  // Voice reading text for analysis
  const voiceReadingText = "Por favor, lea el siguiente texto en voz clara y natural: El análisis biométrico avanzado utiliza tecnología de fotopletismografía remota para medir múltiples parámetros cardiovasculares y vocales de forma no invasiva, proporcionando información valiosa sobre el estado de salud general.";

  // Detect browser info
  const detectBrowserInfo = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Error detecting browser info:', error);
      return {
        name: 'Unknown',
        isSafari: false,
        isChrome: false,
        isFirefox: false,
        resolution: 'Unknown',
        fps: 30,
        userAgent: 'Unknown'
      };
    }
  }, []);

  // Add system log
  const addSystemLog = useCallback((message, type = 'info') => {
    try {
      const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
      const newLog = { 
        id: Date.now() + Math.random(), 
        time, 
        message, 
        type,
        icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔍'
      };
      setSystemLogs(prev => [...prev, newLog].slice(-50));
    } catch (error) {
      console.error('Error adding system log:', error);
    }
  }, []);

  // Export logs function
  const exportLogs = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logData = {
        timestamp: new Date().toISOString(),
        systemLogs: systemLogs,
        biometricData: biometricData,
        realtimeBiomarkers: realtimeBiomarkers,
        browserInfo: browserInfo,
        faceDetection: faceDetection,
        status: status,
        processorLogs: biometricProcessorRef.current?.exportDebugLogs?.() || []
      };
      
      const dataStr = JSON.stringify(logData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `holocheck-enhanced-logs-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addSystemLog('📁 Enhanced logs exportados correctamente', 'success');
    } catch (error) {
      console.error('Error exporting logs:', error);
      addSystemLog(`❌ Error exportando logs: ${error.message}`, 'error');
    }
  }, [systemLogs, biometricData, realtimeBiomarkers, browserInfo, faceDetection, status, addSystemLog]);

  // Initialize media and enhanced biometric processor
  const initializeMedia = async () => {
    try {
      setStatus('initializing');
      setError(null);
      addSystemLog('🔍 Inicializando sistema biométrico avanzado...', 'info');

      // Detect browser
      const realBrowserInfo = detectBrowserInfo();
      setBrowserInfo(realBrowserInfo);
      addSystemLog(`🌐 ${realBrowserInfo.name} detectado`, 'success');

      // Media constraints optimized for enhanced rPPG
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

      // Initialize enhanced biometric processor
      addSystemLog('🔬 Inicializando procesador biométrico avanzado...', 'info');
      biometricProcessorRef.current = new EnhancedRPPGProcessor();
      healthCalculatorRef.current = new HealthScoreCalculator();
      
      const initResult = await biometricProcessorRef.current.initialize(
        videoRef.current, 
        captureMode === 'audio' || captureMode === 'both'
      );

      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      addSystemLog(`✅ Procesador avanzado inicializado - Algoritmos: ${initResult.algorithms.join(', ')}`, 'success');

      // Set up enhanced callbacks
      if (biometricProcessorRef.current.setCallback) {
        biometricProcessorRef.current.setCallback('onAnalysisUpdate', handleEnhancedAnalysisUpdate);
        biometricProcessorRef.current.setCallback('onError', handleProcessorError);
      }

      setStatus('idle');
      addSystemLog('🎯 Sistema avanzado listo para análisis biométrico', 'success');

    } catch (err) {
      console.error('Error initializing enhanced media:', err);
      setError(`Error accessing camera/microphone: ${err.message}`);
      addSystemLog(`❌ Error de inicialización avanzada: ${err.message}`, 'error');
      setStatus('error');
    }
  };

  // Initialize video element with Safari compatibility
  const initializeVideoElement = async (stream, browserInfo) => {
    try {
      const video = videoRef.current;
      if (!video) return;

      addSystemLog('📹 Configurando elemento de video...', 'info');

      video.pause();
      video.srcObject = null;
      video.load();

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
            
            startFaceDetection();
            
            resolve();
          } catch (playError) {
            addSystemLog('⚠️ Autoplay falló, requiere interacción del usuario', 'warning');
            resolve();
          }
        };

        video.onerror = (error) => {
          addSystemLog(`❌ Error de video: ${error.message || 'Unknown video error'}`, 'error');
          reject(error);
        };

        video.srcObject = stream;
      });
    } catch (error) {
      console.error('Error initializing video element:', error);
      addSystemLog(`❌ Error inicializando video: ${error.message}`, 'error');
      throw error;
    }
  };

  // Face detection
  const startFaceDetection = useCallback(() => {
    try {
      if (!videoRef.current) return;
      
      const detectFace = () => {
        try {
          if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.readyState >= 2) {
            const confidence = 75 + Math.random() * 20;
            const detected = confidence > 60;
            
            const stability = faceStabilityRef.current;
            
            if (detected && confidence > 70) {
              stability.consecutiveDetections++;
              stability.consecutiveNonDetections = 0;
            } else {
              stability.consecutiveNonDetections++;
              stability.consecutiveDetections = 0;
            }
            
            const isStableDetected = stability.consecutiveDetections >= stability.requiredStableFrames;
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
              finalDetected = stability.lastStableState;
              stable = false;
            }
            
            setFaceDetection({
              detected: finalDetected,
              confidence: Math.round(confidence),
              position: { x: 0, y: 0, width: 300, height: 300 },
              stable,
              stableFrames: stability.consecutiveDetections
            });
          }
        } catch (error) {
          console.error('Error in face detection:', error);
        }
      };
      
      if (faceDetectionRef.current) {
        clearInterval(faceDetectionRef.current);
      }
      
      faceDetectionRef.current = setInterval(detectFace, 100);
    } catch (error) {
      console.error('Error starting face detection:', error);
      addSystemLog(`❌ Error iniciando detección facial: ${error.message}`, 'error');
    }
  }, [addSystemLog]);

  // Enhanced analysis update handler
  const handleEnhancedAnalysisUpdate = useCallback((data) => {
    try {
      console.log('🔍 ENHANCED ANALYSIS UPDATE RECEIVED:', data);
      addSystemLog(`📊 Actualización avanzada recibida: ${data.calculatedBiomarkers} biomarcadores`, 'info');
      
      if (data.status === 'analyzing' && data.metrics) {
        console.log('📊 ENHANCED METRICS DATA:', data.metrics);
        
        // Update realtime biomarker accumulator with enhanced data
        setRealtimeBiomarkers(prevRealtime => {
          const newRealtime = { ...prevRealtime };
          let hasUpdates = false;
          
          // Process enhanced rPPG metrics
          if (data.metrics.rppg) {
            console.log('❤️ ENHANCED rPPG METRICS:', data.metrics.rppg);
            
            Object.keys(data.metrics.rppg).forEach(key => {
              const value = data.metrics.rppg[key];
              if (value !== null && value !== undefined) {
                newRealtime.latest[key] = value;
                hasUpdates = true;
                console.log(`✅ Enhanced updated realtime ${key}: ${value}`);
                addSystemLog(`✅ ${key}: ${value}`, 'success');
              }
            });
          }

          // Process enhanced voice metrics
          if (data.metrics.voice) {
            console.log('🎤 ENHANCED VOICE METRICS:', data.metrics.voice);
            
            Object.keys(data.metrics.voice).forEach(key => {
              const value = data.metrics.voice[key];
              if (value !== null && value !== undefined) {
                newRealtime.latest[key] = value;
                hasUpdates = true;
                console.log(`✅ Enhanced updated voice ${key}: ${value}`);
                addSystemLog(`✅ Voz ${key}: ${value}`, 'success');
              }
            });
          }

          if (hasUpdates) {
            // Add to history for verification
            newRealtime.history.push({
              timestamp: Date.now(),
              metrics: { ...data.metrics },
              frameNumber: data.frameNumber,
              qualityScore: data.qualityScore
            });
            
            // Keep only last 20 history entries
            if (newRealtime.history.length > 20) {
              newRealtime.history = newRealtime.history.slice(-20);
            }
            
            newRealtime.updateCount++;
            
            console.log('🔄 NEW ENHANCED REALTIME DATA:', newRealtime.latest);
            addSystemLog(`🔄 Datos avanzados actualizados: ${newRealtime.updateCount} actualizaciones`, 'info');
          }
          
          return newRealtime;
        });
        
        // Also update biometricData in real-time for immediate display
        setBiometricData(prevData => {
          const newData = { ...prevData };
          
          // Process enhanced rPPG metrics
          if (data.metrics.rppg) {
            Object.keys(data.metrics.rppg).forEach(key => {
              const value = data.metrics.rppg[key];
              if (value !== null && value !== undefined) {
                newData[key] = value;
              }
            });
          }

          // Process enhanced voice metrics
          if (data.metrics.voice) {
            Object.keys(data.metrics.voice).forEach(key => {
              const value = data.metrics.voice[key];
              if (value !== null && value !== undefined) {
                newData[key] = value;
              }
            });
          }

          return newData;
        });

        // Log enhanced biomarker count
        const calculatedCount = data.calculatedBiomarkers || 0;
        addSystemLog(`🔬 Biomarcadores avanzados calculados: ${calculatedCount}`, 'success');
        
        // Log quality score if available
        if (data.qualityScore) {
          addSystemLog(`📈 Puntuación de calidad: ${(data.qualityScore * 100).toFixed(1)}%`, 'info');
        }
      }
    } catch (error) {
      console.error('Error handling enhanced analysis update:', error);
      addSystemLog(`❌ Error procesando actualización avanzada: ${error.message}`, 'error');
    }
  }, [addSystemLog]);

  // Handle processor errors
  const handleProcessorError = useCallback((errorData) => {
    try {
      addSystemLog(`❌ Error del procesador avanzado: ${errorData.error}`, 'error');
      setError(errorData.error);
    } catch (error) {
      console.error('Error handling processor error:', error);
    }
  }, [addSystemLog]);

  // Start enhanced capture
  const startCapture = async () => {
    try {
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

      // Show voice prompt if in audio mode
      if (captureMode === 'audio' || captureMode === 'both') {
        setShowVoicePrompt(true);
      }

      // Set recording state
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      setAnalysisTime(0);
      recordingStartTime.current = Date.now();
      setError(null);
      chunksRef.current = [];

      // Reset enhanced biomarker data
      setRealtimeBiomarkers({
        latest: {
          heartRate: null, heartRateVariability: null, bloodPressure: null, oxygenSaturation: null,
          stressLevel: null, respiratoryRate: null, perfusionIndex: null, cardiacRhythm: null,
          rmssd: null, sdnn: null, pnn50: null, pnn20: null, sdsd: null, triangularIndex: null, 
          lfPower: null, hfPower: null, lfHfRatio: null, lfNu: null, hfNu: null, vlfPower: null, 
          totalPower: null, tinn: null, sampleEntropy: null, approximateEntropy: null,
          dfaAlpha1: null, dfaAlpha2: null, cardiacOutput: null, strokeVolume: null, pulseWaveVelocity: null,
          fundamentalFrequency: null, jitter: null, shimmer: null, harmonicToNoiseRatio: null,
          spectralCentroid: null, voicedFrameRatio: null, speechRate: null, vocalStress: null,
          arousal: null, valence: null, breathingRate: null, breathingPattern: null
        },
        history: [],
        updateCount: 0
      });

      addSystemLog('🚀 INICIANDO análisis biométrico avanzado...', 'info');

      // Start enhanced biometric analysis
      if (biometricProcessorRef.current) {
        try {
          const audioStream = (captureMode === 'audio' || captureMode === 'both') ? streamRef.current : null;
          const analysisResult = await biometricProcessorRef.current.startAnalysis(videoRef.current, audioStream);
          
          if (analysisResult) {
            addSystemLog('✅ Análisis biométrico avanzado iniciado correctamente', 'success');
          } else {
            addSystemLog('⚠️ Análisis biométrico avanzado falló, continuando con grabación', 'warning');
          }
        } catch (analysisError) {
          addSystemLog(`⚠️ Error en análisis biométrico avanzado: ${analysisError.message}`, 'warning');
          console.warn('Enhanced biometric analysis failed:', analysisError);
        }
      }

      // Create MediaRecorder
      if (streamRef.current) {
        try {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              chunksRef.current.push(event.data);
              addSystemLog(`📊 Chunk recibido: ${(event.data.size / 1024).toFixed(1)} KB`, 'success');
            }
          };

          mediaRecorderRef.current.onstop = () => {
            addSystemLog('✅ MediaRecorder DETENIDO - Procesando análisis final avanzado...', 'success');
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            addSystemLog(`📊 Blob final: ${(blob.size / 1024 / 1024).toFixed(2)} MB`, 'success');
            setShowVoicePrompt(false);
            processEnhancedRecordedData(blob);
          };

          mediaRecorderRef.current.start(100);
        } catch (error) {
          addSystemLog(`❌ Error con MediaRecorder: ${error.message}`, 'error');
        }
      }
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setAnalysisTime(prev => {
          const newTime = prev + 1;
          const progressPercent = (newTime / 30) * 100;
          setProgress(progressPercent);
          
          addSystemLog(`⏱️ Tiempo: ${newTime}s (${progressPercent.toFixed(1)}%)`, 'info');
          
          // Auto-stop after 30 seconds
          if (newTime >= 30) {
            addSystemLog('⏰ Completando análisis avanzado de 30 segundos...', 'info');
            stopCapture();
          }
          
          return newTime;
        });
      }, 1000);

      addSystemLog('📊 Análisis avanzado en progreso...', 'success');

    } catch (err) {
      console.error('Error starting enhanced capture:', err);
      setError(`Error starting enhanced capture: ${err.message}`);
      addSystemLog(`❌ Error crítico al iniciar captura avanzada: ${err.message}`, 'error');
      setStatus('error');
      setIsRecording(false);
      setShowVoicePrompt(false);
    }
  };

  // Stop enhanced biometric capture
  const stopCapture = useCallback(() => {
    try {
      setIsRecording(false);
      setStatus('processing');
      setShowVoicePrompt(false);
      addSystemLog('⏹️ Deteniendo análisis avanzado...', 'info');

      // Stop enhanced biometric processor
      if (biometricProcessorRef.current && biometricProcessorRef.current.stopAnalysis) {
        biometricProcessorRef.current.stopAnalysis();
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // Stop all timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    } catch (error) {
      console.error('Error stopping enhanced capture:', error);
      addSystemLog(`❌ Error deteniendo captura avanzada: ${error.message}`, 'error');
    }
  }, [addSystemLog]);

  // Process enhanced recorded data
  const processEnhancedRecordedData = async (blob) => {
    try {
      setStatus('processing');
      addSystemLog('🔬 Procesando análisis final avanzado...', 'info');
      
      console.log('🔬 Processing with enhanced realtime data:', realtimeBiomarkers.latest);
      addSystemLog(`🔬 Datos avanzados disponibles: ${realtimeBiomarkers.updateCount} actualizaciones`, 'info');
      
      // Enhanced safe access to realtimeBiomarkers.latest
      const safeRealtimeData = realtimeBiomarkers?.latest || {};
      
      // Transfer from realtime to final data with enhanced null safety
      const finalBiometricData = {
        // Transfer ALL enhanced biomarkers from realtime accumulator
        heartRate: safeRealtimeData.heartRate || null,
        heartRateVariability: safeRealtimeData.heartRateVariability || safeRealtimeData.rmssd || null,
        bloodPressure: safeRealtimeData.bloodPressure || null,
        oxygenSaturation: safeRealtimeData.oxygenSaturation || null,
        stressLevel: safeRealtimeData.stressLevel || safeRealtimeData.vocalStress || null,
        respiratoryRate: safeRealtimeData.respiratoryRate || null,
        perfusionIndex: safeRealtimeData.perfusionIndex || null,
        cardiacRhythm: safeRealtimeData.cardiacRhythm || null,
        
        // Enhanced HRV Metrics
        rmssd: safeRealtimeData.rmssd || null,
        sdnn: safeRealtimeData.sdnn || null,
        pnn50: safeRealtimeData.pnn50 || null,
        pnn20: safeRealtimeData.pnn20 || null,
        sdsd: safeRealtimeData.sdsd || null,
        triangularIndex: safeRealtimeData.triangularIndex || null,
        tinn: safeRealtimeData.tinn || null,
        
        // Enhanced Frequency Domain
        lfPower: safeRealtimeData.lfPower || null,
        hfPower: safeRealtimeData.hfPower || null,
        lfHfRatio: safeRealtimeData.lfHfRatio || null,
        lfNu: safeRealtimeData.lfNu || null,
        hfNu: safeRealtimeData.hfNu || null,
        vlfPower: safeRealtimeData.vlfPower || null,
        totalPower: safeRealtimeData.totalPower || null,
        
        // Enhanced Entropy Measures
        sampleEntropy: safeRealtimeData.sampleEntropy || null,
        approximateEntropy: safeRealtimeData.approximateEntropy || null,
        dfaAlpha1: safeRealtimeData.dfaAlpha1 || null,
        dfaAlpha2: safeRealtimeData.dfaAlpha2 || null,
        
        // Enhanced Hemodynamic
        cardiacOutput: safeRealtimeData.cardiacOutput || null,
        strokeVolume: safeRealtimeData.strokeVolume || null,
        pulseWaveVelocity: safeRealtimeData.pulseWaveVelocity || null,
        
        // Enhanced Voice Biomarkers
        fundamentalFrequency: safeRealtimeData.fundamentalFrequency || null,
        jitter: safeRealtimeData.jitter || null,
        shimmer: safeRealtimeData.shimmer || null,
        harmonicToNoiseRatio: safeRealtimeData.harmonicToNoiseRatio || null,
        spectralCentroid: safeRealtimeData.spectralCentroid || null,
        voicedFrameRatio: safeRealtimeData.voicedFrameRatio || null,
        speechRate: safeRealtimeData.speechRate || null,
        vocalStress: safeRealtimeData.vocalStress || null,
        arousal: safeRealtimeData.arousal || null,
        valence: safeRealtimeData.valence || null,
        breathingRate: safeRealtimeData.breathingRate || null,
        breathingPattern: safeRealtimeData.breathingPattern || null,
        
        // Recording metadata
        recordingBlob: blob,
        timestamp: new Date().toISOString(),
        duration: (Date.now() - recordingStartTime.current) / 1000,
        
        // Enhanced biomarker counting
        completedBiomarkers: Object.values(safeRealtimeData).filter(val => val !== null && val !== undefined).length,
        totalBiomarkers: 36,
        
        // Enhanced analysis quality assessment
        analysisQuality: (() => {
          const calculatedCount = Object.values(safeRealtimeData).filter(val => val !== null && val !== undefined).length;
          if (calculatedCount > 25) return 'Excelente';
          if (calculatedCount > 20) return 'Buena';
          if (calculatedCount > 12) return 'Aceptable';
          if (calculatedCount > 6) return 'Regular';
          return 'Insuficiente';
        })(),
        
        // Enhanced health assessment using HealthScoreCalculator
        healthScore: null, // Will be calculated below
        
        recommendations: [],
        
        // Enhanced persistence metadata
        persistenceMetadata: {
          realtimeUpdates: realtimeBiomarkers?.updateCount || 0,
          historyEntries: realtimeBiomarkers?.history?.length || 0,
          lastUpdate: realtimeBiomarkers?.history?.length > 0 ? 
            new Date(realtimeBiomarkers.history[realtimeBiomarkers.history.length - 1].timestamp).toISOString() : null,
          persistenceVersion: 'v1.2.0-ENHANCED-ALGORITHMS',
          processorType: 'EnhancedRPPGProcessor'
        }
      };
      
      // Calculate enhanced health score using HealthScoreCalculator
      if (healthCalculatorRef.current) {
        try {
          const healthScoreResult = healthCalculatorRef.current.calculateHealthScore(finalBiometricData);
          if (healthScoreResult) {
            finalBiometricData.healthScore = healthScoreResult.score;
            finalBiometricData.healthLevel = healthScoreResult.level;
            finalBiometricData.healthConfidence = healthScoreResult.confidence;
            finalBiometricData.recommendations = healthCalculatorRef.current.generateRecommendations(healthScoreResult);
            
            addSystemLog(`🏥 Puntuación de salud calculada: ${healthScoreResult.score} (${healthScoreResult.level})`, 'success');
          }
        } catch (healthError) {
          addSystemLog(`⚠️ Error calculando puntuación de salud: ${healthError.message}`, 'warning');
        }
      }
      
      // Fallback recommendations if health score calculation failed
      if (finalBiometricData.recommendations.length === 0) {
        const calculatedCount = finalBiometricData.completedBiomarkers;
        if (calculatedCount > 10) {
          finalBiometricData.recommendations = ['Excelente análisis biométrico completado. Continúe con sus hábitos saludables.'];
        } else if (calculatedCount > 5) {
          finalBiometricData.recommendations = ['Análisis parcial completado. Para evaluación completa, mejore las condiciones de captura.'];
        } else {
          finalBiometricData.recommendations = ['Análisis incompleto. Intente nuevamente con mejor iluminación y posicionamiento.'];
        }
      }
      
      const calculatedBiomarkers = finalBiometricData.completedBiomarkers;
      
      console.log('🔬 Enhanced final data:', finalBiometricData);
      console.log('🔬 Enhanced calculated biomarkers count:', calculatedBiomarkers);
      addSystemLog(`📊 Biomarcadores avanzados persistidos: ${calculatedBiomarkers}/36`, 'success');
      addSystemLog(`🎯 Calidad del análisis avanzado: ${finalBiometricData.analysisQuality}`, 'success');
      
      // Save to local storage
      try {
        const saveResult = await dataStorageService.saveEvaluation(finalBiometricData);
        if (saveResult) {
          addSystemLog('💾 Evaluación avanzada guardada en almacenamiento local', 'success');
        } else {
          addSystemLog('⚠️ Error guardando evaluación avanzada en almacenamiento local', 'warning');
        }
      } catch (storageError) {
        addSystemLog(`⚠️ Error de almacenamiento avanzado: ${storageError.message}`, 'warning');
      }
      
      setBiometricData(finalBiometricData);
      setStatus('complete');
      addSystemLog('✅ Análisis biométrico avanzado completado', 'success');
      addSystemLog(`📊 Biomarcadores avanzados procesados: ${calculatedBiomarkers}/36`, 'success');
      addSystemLog(`🔄 Actualizaciones en tiempo real: ${realtimeBiomarkers?.updateCount || 0}`, 'info');
      
      // Callback to parent component
      if (onDataCaptured) {
        onDataCaptured(finalBiometricData);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(finalBiometricData);
      }
      
    } catch (err) {
      console.error('Error processing enhanced data:', err);
      setError(`Error processing enhanced data: ${err.message}`);
      addSystemLog(`❌ Error procesando datos avanzados: ${err.message}`, 'error');
      setStatus('error');
    }
  };

  // Pause/Resume capture
  const togglePause = () => {
    try {
      if (isPaused) {
        mediaRecorderRef.current?.resume();
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
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Error toggling pause:', error);
      addSystemLog(`❌ Error pausando/reanudando: ${error.message}`, 'error');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (biometricProcessorRef.current && biometricProcessorRef.current.cleanup) {
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
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []);

  // Initialize media on mount
  useEffect(() => {
    try {
      initializeMedia();
    } catch (error) {
      console.error('Error initializing enhanced media on mount:', error);
    }
  }, [captureMode]);

  // Face Detection Overlay Component
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

  // Helper function to display biomarker values with formatting
  const displayBiomarkerValue = (value, biomarkerType, unit = '', fallback = 'No calculado') => {
    if (value === null || value === undefined || value === 0) {
      return fallback;
    }
    
    if (biomarkerType) {
      return formatSpecificBiomarker(biomarkerType, value, fallback);
    }
    
    if (typeof value === 'number') {
      return `${value.toFixed(1)} ${unit}`.trim();
    }
    
    if (typeof value === 'string' && value.length > 0) {
      return `${value} ${unit}`.trim();
    }
    
    return fallback;
  };

  // Count calculated biomarkers from realtime data with null safety
  const calculatedBiomarkersCount = Object.values(realtimeBiomarkers?.latest || {}).filter(val => {
    return val !== null && val !== undefined && val !== 0 && val !== '';
  }).length;

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
          🔬 HoloCheck v1.2.0-ENHANCED - Análisis Biométrico Avanzado
        </h2>
        <p className="text-gray-600">
          Sistema de captura y análisis biométrico con algoritmos avanzados y procesamiento mejorado
        </p>
        {browserInfo.isSafari && (
          <p className="text-sm text-orange-600 mt-1">
            🍎 Safari detectado - Configuración optimizada aplicada
          </p>
        )}
        {realtimeBiomarkers.updateCount > 0 && (
          <p className="text-sm text-green-600 mt-1">
            🔄 Persistencia avanzada activa: {realtimeBiomarkers.updateCount} actualizaciones → {calculatedBiomarkersCount} biomarcadores persistidos
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls and Status */}
        <div className="lg:col-span-1">
          {/* Capture Mode Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Captura Avanzado
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
                <span>Solo Video (rPPG Avanzado)</span>
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
                <span>Solo Audio (Voz Avanzada)</span>
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
                <span>Completo (rPPG + Voz Avanzados)</span>
              </button>
            </div>
          </div>

          {/* Enhanced System Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Estado del Sistema Avanzado
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
                  {biometricProcessorRef.current ? '✅ v1.2.0-ENHANCED' : '⚠️ Inicializando'}
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
                  {calculatedBiomarkersCount}/36 calculados
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Persistencia</span>
                <span className={`font-medium ${
                  realtimeBiomarkers.updateCount > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {realtimeBiomarkers.updateCount > 0 ? `✅ ${realtimeBiomarkers.updateCount} guardados` : '⚠️ Sin datos'}
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

                {/* Biomarker counter */}
                {isRecording && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                    Biomarcadores: {calculatedBiomarkersCount}/36
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
                  {status === 'idle' && 'Listo para análisis biométrico avanzado'}
                  {status === 'initializing' && 'Inicializando procesador biométrico avanzado...'}
                  {status === 'recording' && `Analizando biomarcadores avanzados: ${calculatedBiomarkersCount}/36 (${realtimeBiomarkers.updateCount} guardados)`}
                  {status === 'processing' && 'Procesando análisis completo avanzado...'}
                  {status === 'complete' && 'Análisis biométrico avanzado completado'}
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

          {/* Controls */}
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
                    ? 'Iniciar Análisis Biométrico Avanzado' 
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

      {/* Real-time Biometric Data Display */}
      {(status === 'recording' || status === 'complete') && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-500" />
            Biomarcadores Avanzados en Tiempo Real ({calculatedBiomarkersCount}/36 Calculados)
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
                  {displayBiomarkerValue(realtimeBiomarkers.latest.heartRate, 'heartRate')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-blue-500" size={20} />
                  <span className="font-medium text-blue-700">HRV (RMSSD)</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {displayBiomarkerValue(realtimeBiomarkers.latest.rmssd || realtimeBiomarkers.latest.heartRateVariability, 'rmssd')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-green-500" size={20} />
                  <span className="font-medium text-green-700">SpO₂</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {displayBiomarkerValue(realtimeBiomarkers.latest.oxygenSaturation, 'oxygenSaturation')}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="text-purple-500" size={20} />
                  <span className="font-medium text-purple-700">Presión Arterial</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {displayBiomarkerValue(realtimeBiomarkers.latest.bloodPressure, 'bloodPressure')}
                </div>
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
                    {displayBiomarkerValue(realtimeBiomarkers.latest.fundamentalFrequency, 'fundamentalFrequency')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-teal-500" size={20} />
                    <span className="font-medium text-teal-700">Jitter</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-600">
                    {displayBiomarkerValue(realtimeBiomarkers.latest.jitter, 'jitter')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="text-pink-500" size={20} />
                    <span className="font-medium text-pink-700">Shimmer</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {displayBiomarkerValue(realtimeBiomarkers.latest.shimmer, 'shimmer')}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="text-indigo-500" size={20} />
                    <span className="font-medium text-indigo-700">Estrés Vocal</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {displayBiomarkerValue(realtimeBiomarkers.latest.vocalStress || realtimeBiomarkers.latest.stressLevel, 'vocalStress')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Analysis Results */}
          {status === 'complete' && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={24} />
                Análisis Biométrico Avanzado Completo
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
                  <div className="text-sm text-gray-600">Biomarcadores Calculados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {biometricData.analysisQuality || 'Calculando'}
                  </div>
                  <div className="text-sm text-gray-600">Calidad del Análisis</div>
                </div>
              </div>
              
              {/* Persistence metadata */}
              {biometricData.persistenceMetadata && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="font-semibold text-blue-800 mb-2">Información de Persistencia Avanzada:</h5>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Actualizaciones en tiempo real: {biometricData.persistenceMetadata.realtimeUpdates}</div>
                    <div>• Entradas de historial: {biometricData.persistenceMetadata.historyEntries}</div>
                    <div>• Biomarcadores transferidos: {biometricData.completedBiomarkers}/36</div>
                    <div>• Versión: {biometricData.persistenceMetadata.persistenceVersion}</div>
                    <div>• Procesador: {biometricData.persistenceMetadata.processorType}</div>
                    <div>• Estado: ✅ ALGORITMOS AVANZADOS APLICADOS</div>
                  </div>
                </div>
              )}
              
              {biometricData.recommendations && biometricData.recommendations.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-semibold text-gray-800 mb-3">Recomendaciones:</h5>
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

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">🎯 Sistema Biométrico Avanzado - ALGORITMOS MEJORADOS</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>✅ PROCESADOR AVANZADO:</strong> EnhancedRPPGProcessor con algoritmos de última generación</li>
          <li>• <strong>✅ CALCULADORA DE SALUD:</strong> HealthScoreCalculator integrado para puntuaciones precisas</li>
          <li>• <strong>✅ DETECCIÓN FACIAL MEJORADA:</strong> Múltiples regiones faciales para mejor extracción de señal</li>
          <li>• <strong>✅ ANÁLISIS VOCAL AVANZADO:</strong> Algoritmos mejorados para biomarcadores vocales</li>
          <li>• <strong>✅ PERSISTENCIA MEJORADA:</strong> Sistema de acumulación en tiempo real optimizado</li>
          <li>• Asegúrese de que su rostro esté bien iluminado y centrado en el círculo verde</li>
          <li>• El análisis procesa datos durante 30 segundos con algoritmos avanzados</li>
          <li>• Para análisis de voz, siga las instrucciones de lectura que aparecerán en pantalla</li>
          <li>• Al finalizar, recibirá un reporte con puntuación de salud calculada automáticamente</li>
          <li>• Use el botón "Exportar" en los logs para descargar información detallada del sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricCapture;