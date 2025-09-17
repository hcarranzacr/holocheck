import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, Play, Square, CheckCircle, AlertTriangle, Heart, Activity, Volume2, Timer, User } from 'lucide-react';
import { mediaPermissions } from '../services/mediaPermissions';
import { rppgAnalysis } from '../services/rppgAnalysis';
import { voiceAnalysis } from '../services/voiceAnalysis';
import { useAnalysisLogger } from './AnalysisLogger';

const BiometricCapture = ({ onCapture, onNext, onBack }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('setup'); // setup, reading, recording, processing, complete
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  
  // Media streams and permissions
  const [hasPermissions, setHasPermissions] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  
  // Analysis results
  const [rppgResults, setRppgResults] = useState(null);
  const [voiceResults, setVoiceResults] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    heartRate: 0,
    confidence: 0,
    faceDetected: false,
    voiceQuality: 0,
    voiceStress: 0
  });
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  
  // Logger
  const { setLogger, logInfo, logSuccess, logWarning, logError, logProcessing } = useAnalysisLogger();

  // Reading text for voice analysis
  const readingText = `Por favor, lee el siguiente texto en voz alta de manera natural:

"Buenos días, mi nombre es [tu nombre] y estoy realizando una evaluación de salud preventiva digital. 

Voy a respirar profundamente tres veces: uno... dos... tres.

Ahora voy a contar del uno al diez de manera pausada:
Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.

Para finalizar, voy a decir la frase: 'La tecnología de análisis biométrico nos permite monitorear nuestra salud de manera no invasiva y precisa.'

Gracias por completar la evaluación."`;

  // Initialize component
  useEffect(() => {
    initializeCapture();
    return () => cleanup();
  }, []);

  // Initialize capture system
  const initializeCapture = async () => {
    try {
      logInfo('Iniciando sistema de captura biométrica...');
      
      // Check browser support
      const support = mediaPermissions.checkBrowserSupport();
      if (!support.supported) {
        throw new Error(`Navegador no compatible. Funciones faltantes: ${support.unsupported.join(', ')}`);
      }
      logSuccess('Navegador compatible verificado');

      // Request permissions
      logProcessing('Solicitando permisos de cámara y micrófono...');
      const permissionResult = await mediaPermissions.requestAllPermissions();
      
      if (!permissionResult.success) {
        throw new Error(permissionResult.error);
      }

      setVideoStream(permissionResult.videoStream);
      setAudioStream(permissionResult.audioStream);
      setHasPermissions(true);
      logSuccess('Permisos otorgados correctamente');

      // Initialize video element
      if (videoRef.current && permissionResult.videoStream) {
        videoRef.current.srcObject = permissionResult.videoStream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        logSuccess('Stream de video inicializado');
      }

      // Initialize analysis systems
      logProcessing('Inicializando sistemas de análisis...');
      
      const rppgInit = await rppgAnalysis.initialize();
      if (!rppgInit.success) {
        logWarning(`Error al inicializar rPPG: ${rppgInit.error}`);
      } else {
        logSuccess('Sistema rPPG inicializado');
      }

      const voiceInit = await voiceAnalysis.initialize(permissionResult.audioStream);
      if (!voiceInit.success) {
        logWarning(`Error al inicializar análisis de voz: ${voiceInit.error}`);
      } else {
        logSuccess('Sistema de análisis de voz inicializado');
      }

      logSuccess('Sistema de captura listo');
      setCurrentStep('reading');

    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message);
      logError('Error de inicialización', error.message);
    }
  };

  // Start recording process
  const startRecording = useCallback(async () => {
    if (!hasPermissions) {
      logError('No se tienen los permisos necesarios');
      return;
    }

    try {
      logInfo('Iniciando grabación biométrica...');
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
      console.error('Recording start error:', error);
      setError(error.message);
      logError('Error al iniciar grabación', error.message);
    }
  }, [hasPermissions]);

  // Begin actual recording
  const beginRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      logSuccess('Grabación iniciada');

      // Reset analysis systems
      rppgAnalysis.reset();
      voiceAnalysis.reset();

      // Start voice recording
      const voiceStarted = voiceAnalysis.startRecording();
      if (!voiceStarted) {
        logWarning('No se pudo iniciar el análisis de voz');
      }

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start real-time analysis
      analysisIntervalRef.current = setInterval(() => {
        performRealTimeAnalysis();
      }, 100); // 10 FPS analysis

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 60000);

    } catch (error) {
      console.error('Recording begin error:', error);
      setError(error.message);
      logError('Error durante la grabación', error.message);
    }
  }, [isRecording]);

  // Perform real-time analysis
  const performRealTimeAnalysis = useCallback(() => {
    if (!videoRef.current || !isRecording) return;

    try {
      // rPPG Analysis
      const rppgResult = rppgAnalysis.processFrame(videoRef.current, Date.now());
      if (rppgResult && rppgResult.success) {
        setRealTimeMetrics(prev => ({
          ...prev,
          heartRate: rppgResult.heartRate || prev.heartRate,
          confidence: rppgResult.confidence || prev.confidence,
          faceDetected: rppgResult.faceDetected || false
        }));

        if (rppgResult.heartRate && rppgResult.heartRate !== prev.heartRate) {
          logInfo(`Frecuencia cardíaca: ${rppgResult.heartRate} BPM (Confianza: ${rppgResult.confidence}%)`);
        }
      }

      // Voice Analysis
      const voiceResult = voiceAnalysis.getCurrentAnalysis();
      if (voiceResult) {
        setRealTimeMetrics(prev => ({
          ...prev,
          voiceQuality: voiceResult.voiceQuality,
          voiceStress: voiceResult.voiceStress
        }));

        if (voiceResult.fundamentalFrequency > 0) {
          logInfo(`Análisis de voz: F0=${voiceResult.fundamentalFrequency}Hz, Estrés=${voiceResult.voiceStress}%`);
        }
      }

    } catch (error) {
      console.error('Real-time analysis error:', error);
    }
  }, [isRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      logProcessing('Finalizando grabación...');
      setIsRecording(false);
      setCurrentStep('processing');

      // Clear intervals
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }

      // Stop voice analysis and get results
      const voiceResults = voiceAnalysis.stopRecording();
      setVoiceResults(voiceResults);
      
      if (voiceResults.success) {
        logSuccess('Análisis de voz completado');
      } else {
        logWarning('Análisis de voz incompleto');
      }

      // Get final rPPG results
      const rppgStats = rppgAnalysis.getStatistics();
      setRppgResults({
        heartRate: realTimeMetrics.heartRate,
        confidence: realTimeMetrics.confidence,
        duration: rppgStats.duration,
        frameCount: rppgStats.frameCount
      });

      logSuccess('Análisis rPPG completado');
      logInfo(`Duración total: ${recordingTime}s`);

      // Process final results
      await processFinalResults();

    } catch (error) {
      console.error('Stop recording error:', error);
      setError(error.message);
      logError('Error al finalizar grabación', error.message);
    }
  }, [realTimeMetrics, recordingTime]);

  // Process final results
  const processFinalResults = async () => {
    try {
      logProcessing('Procesando resultados finales...');

      // Combine all results
      const finalResults = {
        rppg: rppgResults || {
          heartRate: realTimeMetrics.heartRate,
          confidence: realTimeMetrics.confidence
        },
        voice: voiceResults,
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        quality: {
          videoQuality: realTimeMetrics.faceDetected ? 'good' : 'poor',
          audioQuality: voiceResults?.success ? 'good' : 'poor'
        }
      };

      logSuccess('Resultados procesados correctamente');
      setCurrentStep('complete');

      // Call parent callback
      if (onCapture) {
        onCapture({
          biometricData: {
            metrics: {
              heartRate: finalResults.rppg.heartRate,
              heartRateConfidence: finalResults.rppg.confidence,
              voiceStress: finalResults.voice?.averages?.voiceStress || 0,
              voiceQuality: finalResults.voice?.averages?.voiceQuality || 0,
              fundamentalFrequency: finalResults.voice?.averages?.fundamentalFrequency || 0,
              respiratoryRate: finalResults.voice?.averages?.respiratoryRate || 0
            },
            riskFactors: generateRiskFactors(finalResults),
            quality: finalResults.quality
          },
          duration: recordingTime
        });
      }

    } catch (error) {
      console.error('Final processing error:', error);
      setError(error.message);
      logError('Error en procesamiento final', error.message);
    }
  };

  // Generate risk factors based on results
  const generateRiskFactors = (results) => {
    const factors = [];
    
    if (results.rppg.heartRate > 100) {
      factors.push('Frecuencia cardíaca elevada');
    }
    if (results.rppg.heartRate < 60) {
      factors.push('Frecuencia cardíaca baja');
    }
    if (results.voice?.averages?.voiceStress > 70) {
      factors.push('Estrés vocal elevado');
    }
    if (results.rppg.confidence < 50) {
      factors.push('Calidad de señal rPPG baja');
    }
    
    return factors.length > 0 ? factors : ['Sin factores de riesgo detectados'];
  };

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

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurando Sistema</h2>
              <p className="text-gray-600">Inicializando cámara, micrófono y sistemas de análisis...</p>
            </div>
          </div>
        );

      case 'reading':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparación para Análisis de Voz</h2>
              <p className="text-gray-600 mb-6">Lee el siguiente texto en voz alta cuando comience la grabación</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Texto para Análisis de Voz:
              </h3>
              <div className="bg-white p-4 rounded border text-gray-800 leading-relaxed whitespace-pre-line">
                {readingText}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Instrucciones importantes:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Mantén tu rostro visible en la cámara durante toda la grabación</li>
                    <li>• Habla de manera natural, sin forzar la voz</li>
                    <li>• La grabación durará aproximadamente 60 segundos</li>
                    <li>• Asegúrate de estar en un lugar con buena iluminación</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={startRecording}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Comenzar Grabación
              </button>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="space-y-6">
            {countdown > 0 ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">{countdown}</div>
                <p className="text-xl text-gray-700">Preparándose para grabar...</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Square className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Grabando Análisis Biométrico</h2>
                  <div className="flex items-center justify-center space-x-4 text-lg">
                    <Timer className="w-5 h-5 text-gray-600" />
                    <span className="font-mono text-red-600">{formatTime(recordingTime)}</span>
                  </div>
                </div>

                {/* Real-time metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.heartRate || '--'}</div>
                    <div className="text-sm text-gray-600">BPM</div>
                    <div className="text-xs text-gray-500">Confianza: {realTimeMetrics.confidence}%</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <Volume2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.voiceQuality || '--'}</div>
                    <div className="text-sm text-gray-600">Calidad Voz</div>
                    <div className="text-xs text-gray-500">Estrés: {realTimeMetrics.voiceStress}%</div>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${realTimeMetrics.faceDetected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">Rostro detectado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-gray-600">Grabando audio</span>
                  </div>
                </div>

                <button
                  onClick={stopRecording}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Detener Grabación
                </button>
              </>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-10 h-10 text-white animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando Análisis</h2>
              <p className="text-gray-600">Analizando datos biométricos y generando métricas...</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis Completado</h2>
              <p className="text-gray-600">Datos biométricos capturados y procesados exitosamente</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Resumen de Captura:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Duración:</span>
                  <span className="ml-2 font-mono">{formatTime(recordingTime)}</span>
                </div>
                <div>
                  <span className="text-green-700">Frecuencia cardíaca:</span>
                  <span className="ml-2 font-mono">{realTimeMetrics.heartRate} BPM</span>
                </div>
                <div>
                  <span className="text-green-700">Calidad de voz:</span>
                  <span className="ml-2 font-mono">{realTimeMetrics.voiceQuality}%</span>
                </div>
                <div>
                  <span className="text-green-700">Estrés vocal:</span>
                  <span className="ml-2 font-mono">{realTimeMetrics.voiceStress}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Resultados Detallados
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Video Preview */}
        {hasPermissions && currentStep !== 'setup' && (
          <div className="mb-6">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error ? (
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Error de Captura</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Volver
              </button>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricCapture;