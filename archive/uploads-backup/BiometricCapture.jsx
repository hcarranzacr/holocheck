import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Play, Pause, AlertCircle, CheckCircle, Heart, Activity } from 'lucide-react';

const BiometricCapture = ({ onDataCaptured, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [captureMode, setCaptureMode] = useState('video'); // 'video', 'audio', 'both'
  const [status, setStatus] = useState('idle'); // 'idle', 'initializing', 'recording', 'processing', 'complete', 'error'
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [biometricData, setBiometricData] = useState({
    heartRate: null,
    hrv: null,
    bloodPressure: null,
    oxygenSaturation: null,
    stressLevel: null,
    respiratoryRate: null
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingStartTime = useRef(null);

  // Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      setStatus('initializing');
      setError(null);

      const constraints = {
        video: captureMode === 'video' || captureMode === 'both' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } : false,
        audio: captureMode === 'audio' || captureMode === 'both' ? {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && (captureMode === 'video' || captureMode === 'both')) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize audio context for voice analysis
      if (captureMode === 'audio' || captureMode === 'both') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;
      }

      setStatus('idle');
    } catch (err) {
      console.error('Error initializing media:', err);
      setError(`Error accessing camera/microphone: ${err.message}`);
      setStatus('error');
    }
  };

  // Start biometric capture
  const startCapture = async () => {
    if (!streamRef.current) {
      await initializeMedia();
    }

    try {
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      recordingStartTime.current = Date.now();

      // Initialize MediaRecorder for data capture
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus'
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        processRecordedData(blob);
      };

      mediaRecorderRef.current.start(100); // Capture data every 100ms

      // Start real-time analysis
      startRealTimeAnalysis();

      // Auto-stop after 30 seconds (recommended for rPPG analysis)
      setTimeout(() => {
        if (isRecording) {
          stopCapture();
        }
      }, 30000);

    } catch (err) {
      console.error('Error starting capture:', err);
      setError(`Error starting capture: ${err.message}`);
      setStatus('error');
      setIsRecording(false);
    }
  };

  // Stop biometric capture
  const stopCapture = () => {
    setIsRecording(false);
    setStatus('processing');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    stopRealTimeAnalysis();
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

      // Perform rPPG analysis on video frame
      if (videoRef.current && canvasRef.current && (captureMode === 'video' || captureMode === 'both')) {
        performRPPGAnalysis();
      }

      // Perform voice analysis
      if (analyserRef.current && (captureMode === 'audio' || captureMode === 'both')) {
        performVoiceAnalysis();
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

  // rPPG Analysis (simplified implementation)
  const performRPPGAnalysis = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    // Extract face region (simplified - in production, use face detection)
    const imageData = ctx.getImageData(
      canvas.width * 0.3, 
      canvas.height * 0.2, 
      canvas.width * 0.4, 
      canvas.height * 0.4
    );
    
    // Calculate average RGB values
    let r = 0, g = 0, b = 0;
    const pixels = imageData.data;
    const pixelCount = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }
    
    r /= pixelCount;
    g /= pixelCount;
    b /= pixelCount;
    
    // Simulate heart rate calculation (in production, use proper signal processing)
    const heartRate = 60 + Math.sin(Date.now() / 1000) * 20 + Math.random() * 10;
    const hrv = 20 + Math.random() * 30;
    const oxygenSaturation = 95 + Math.random() * 5;
    
    setBiometricData(prev => ({
      ...prev,
      heartRate: Math.round(heartRate),
      hrv: Math.round(hrv),
      oxygenSaturation: Math.round(oxygenSaturation * 10) / 10
    }));
  };

  // Voice Analysis (simplified implementation)
  const performVoiceAnalysis = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average frequency magnitude
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    
    // Simulate stress level and respiratory rate calculation
    const stressLevel = Math.min(100, (average / 255) * 100 + Math.random() * 20);
    const respiratoryRate = 12 + Math.random() * 8;
    
    setBiometricData(prev => ({
      ...prev,
      stressLevel: Math.round(stressLevel),
      respiratoryRate: Math.round(respiratoryRate * 10) / 10
    }));
  };

  // Process recorded data
  const processRecordedData = async (blob) => {
    try {
      setStatus('processing');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      setStatus('complete');
      
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
      setStatus('error');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
  }, [captureMode]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Captura Biométrica</h2>
        <p className="text-gray-600">
          Captura datos biométricos en tiempo real utilizando análisis rPPG y de voz
        </p>
      </div>

      {/* Capture Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modo de Captura
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setCaptureMode('video')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              captureMode === 'video' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Camera size={16} />
            <span>Solo Video</span>
          </button>
          <button
            onClick={() => setCaptureMode('audio')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              captureMode === 'audio' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Mic size={16} />
            <span>Solo Audio</span>
          </button>
          <button
            onClick={() => setCaptureMode('both')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              captureMode === 'both' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Activity size={16} />
            <span>Video + Audio</span>
          </button>
        </div>
      </div>

      {/* Video Preview */}
      {(captureMode === 'video' || captureMode === 'both') && (
        <div className="mb-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {status === 'recording' && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded-md text-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>REC</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status and Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {status === 'idle' && <CheckCircle className="text-green-500" size={20} />}
            {status === 'initializing' && <Activity className="text-blue-500 animate-spin" size={20} />}
            {status === 'recording' && <Heart className="text-red-500 animate-pulse" size={20} />}
            {status === 'processing' && <Activity className="text-blue-500 animate-spin" size={20} />}
            {status === 'complete' && <CheckCircle className="text-green-500" size={20} />}
            {status === 'error' && <AlertCircle className="text-red-500" size={20} />}
            <span className="text-sm font-medium capitalize">
              {status === 'idle' && 'Listo para capturar'}
              {status === 'initializing' && 'Inicializando...'}
              {status === 'recording' && 'Capturando datos biométricos...'}
              {status === 'processing' && 'Procesando datos...'}
              {status === 'complete' && 'Análisis completado'}
              {status === 'error' && 'Error'}
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startCapture}
            disabled={status === 'initializing' || status === 'processing'}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Play size={20} />
            <span>Iniciar Captura</span>
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
              <span>Detener</span>
            </button>
          </>
        )}
      </div>

      {/* Real-time Biometric Data */}
      {(status === 'recording' || status === 'complete') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <span className="font-medium text-blue-700">VFC</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {biometricData.hrv || '--'} <span className="text-sm">ms</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="text-green-500" size={20} />
              <span className="font-medium text-green-700">SpO2</span>
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

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="text-orange-500" size={20} />
              <span className="font-medium text-orange-700">Nivel de Estrés</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {biometricData.stressLevel || '--'} <span className="text-sm">%</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="text-teal-500" size={20} />
              <span className="font-medium text-teal-700">Freq. Respiratoria</span>
            </div>
            <div className="text-2xl font-bold text-teal-600">
              {biometricData.respiratoryRate || '--'} <span className="text-sm">RPM</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mantén tu rostro bien iluminado y centrado en la cámara</li>
          <li>• Permanece quieto durante la captura para obtener mejores resultados</li>
          <li>• La captura durará aproximadamente 30 segundos</li>
          <li>• Asegúrate de estar en un ambiente silencioso para el análisis de voz</li>
          <li>• Los datos se procesan localmente por privacidad</li>
        </ul>
      </div>
    </div>
  );
};

export default BiometricCapture;