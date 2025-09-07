import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, AlertCircle } from 'lucide-react';

const VoiceCapture = ({ onCapture, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  const RECORDING_DURATION = 30; // 30 seconds

  // Add debug logging
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(`[VoiceCapture] ${logEntry}`);
    setDebugLog(prev => [...prev.slice(-15), logEntry]); // Keep last 15 logs
  };

  // Get supported MIME type for audio recording
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        addLog(`Using supported MIME type: ${type}`);
        return type;
      }
    }
    
    addLog('No supported MIME type found, using default');
    return '';
  };

  // Countdown effect
  useEffect(() => {
    let countdownInterval;
    if (isCountdown && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            // Start actual recording after countdown
            startActualRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [isCountdown, countdown]);

  // Recording timer effect
  useEffect(() => {
    let recordingInterval;
    if (isRecording && recordingTime < RECORDING_DURATION) {
      recordingInterval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= RECORDING_DURATION) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(recordingInterval);
  }, [isRecording, recordingTime]);

  // Start actual recording after countdown
  const startActualRecording = useCallback(async () => {
    try {
      addLog('=== STARTING ACTUAL RECORDING ===');
      
      // Request audio permissions with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      addLog(`Audio stream obtained - active: ${stream.active}, tracks: ${stream.getTracks().length}`);
      
      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      addLog(`Audio tracks: ${audioTracks.length}, first track enabled: ${audioTracks[0].enabled}`);

      streamRef.current = stream;
      chunksRef.current = [];

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      
      // Create MediaRecorder with proper configuration
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;

      addLog(`MediaRecorder created with state: ${mediaRecorder.state}`);

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        addLog(`Data available - size: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          addLog(`Total chunks collected: ${chunksRef.current.length}`);
        }
      };

      mediaRecorder.onstop = () => {
        addLog(`Recording stopped - total chunks: ${chunksRef.current.length}`);
        
        if (chunksRef.current.length > 0) {
          const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
          addLog(`Creating blob from ${chunksRef.current.length} chunks, total size: ${totalSize} bytes`);
          
          const blob = new Blob(chunksRef.current, { 
            type: mimeType || 'audio/webm' 
          });
          
          addLog(`Audio blob created - size: ${blob.size} bytes, type: ${blob.type}`);
          setAudioBlob(blob);
          
          // Clean up stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop();
              addLog(`Audio track stopped: ${track.kind}`);
            });
          }
        } else {
          addLog('ERROR: No audio chunks collected');
          setError('No se pudo capturar audio. Inténtalo de nuevo.');
        }
      };

      mediaRecorder.onerror = (event) => {
        addLog(`MediaRecorder error: ${event.error}`);
        setError(`Error de grabación: ${event.error}`);
      };

      mediaRecorder.onstart = () => {
        addLog('MediaRecorder started successfully');
        setIsRecording(true);
        setIsCountdown(false);
        setRecordingTime(0);
      };

      // Start recording with data collection every 1000ms
      mediaRecorder.start(1000);
      addLog('MediaRecorder.start() called');

    } catch (error) {
      addLog(`ERROR in startActualRecording: ${error.message}`);
      setError(`Error al acceder al micrófono: ${error.message}`);
      setIsCountdown(false);
      setIsRecording(false);
    }
  }, []);

  // Initialize recording (start countdown)
  const startRecording = useCallback(() => {
    addLog('=== INITIATING RECORDING SEQUENCE ===');
    setError(null);
    setAudioBlob(null);
    setIsCountdown(true);
    setCountdown(3);
    setRecordingTime(0);
    setDebugLog([]);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    addLog('=== STOPPING RECORDING ===');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      addLog('Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setIsCountdown(false);
  }, []);

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (audioBlob && audioRef.current) {
      addLog('Playing recorded audio...');
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        addLog('Audio playback completed');
      };
    }
  }, [audioBlob]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      addLog('Audio playback paused');
    }
  }, []);

  // Retake recording
  const retakeRecording = useCallback(() => {
    addLog('Retaking recording - clearing current audio');
    setAudioBlob(null);
    setIsPlaying(false);
    setError(null);
    setRecordingTime(0);
    setDebugLog([]);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  // Confirm recording
  const confirmRecording = useCallback(() => {
    if (audioBlob && onCapture) {
      addLog(`Confirming recording - blob size: ${audioBlob.size} bytes`);
      
      // Create File object from blob
      const file = new File([audioBlob], 'voice_recording.webm', {
        type: audioBlob.type,
        lastModified: Date.now()
      });
      
      addLog(`File created: ${file.name}, size: ${file.size} bytes`);
      onCapture(file);
      addLog('=== RECORDING CONFIRMATION COMPLETED ===');
    }
  }, [audioBlob, onCapture]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de Grabación</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setAudioBlob(null);
              setIsRecording(false);
              setIsCountdown(false);
              setDebugLog([]);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mb-4"
          >
            Intentar de Nuevo
          </button>
          
          {/* Debug log display */}
          {debugLog.length > 0 && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Ver registro de depuración ({debugLog.length} eventos)
              </summary>
              <div className="text-xs bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
                {debugLog.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Análisis de Voz Biométrica
      </h2>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Busca un lugar silencioso sin ruido de fondo</li>
          <li>• Habla claramente hacia el micrófono</li>
          <li>• Lee el texto que aparecerá en pantalla</li>
          <li>• Mantén un tono natural y constante</li>
          <li>• La grabación durará {RECORDING_DURATION} segundos</li>
        </ul>
      </div>

      {/* Recording Area */}
      <div className="relative mb-6">
        {!audioBlob ? (
          <div className="text-center">
            {/* Countdown Display */}
            {isCountdown && (
              <div className="mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {countdown}
                </div>
                <p className="text-gray-600">Preparándose para grabar...</p>
              </div>
            )}

            {/* Recording Display */}
            {isRecording && (
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-3"></div>
                  <span className="text-lg font-semibold text-red-600">GRABANDO</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(recordingTime / RECORDING_DURATION) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 mb-4">
                  Lee en voz alta: "Mi nombre es [tu nombre] y estoy realizando un análisis de salud preventiva. 
                  Hoy es un buen día para cuidar mi bienestar y monitorear mi estado de salud."
                </p>
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Square className="w-5 h-5 mr-2 inline" />
                  Detener Grabación
                </button>
              </div>
            )}

            {/* Start Recording Button */}
            {!isCountdown && !isRecording && (
              <div className="text-center">
                <div className="mb-6">
                  <Mic className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Presiona el botón para comenzar la grabación de voz
                  </p>
                </div>
                <button
                  onClick={startRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-semibold"
                >
                  <Mic className="w-6 h-6 mr-2 inline" />
                  Iniciar Grabación
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Grabación Completada
              </h3>
              <p className="text-gray-600 mb-4">
                Audio capturado: {Math.round(audioBlob.size / 1024)} KB
              </p>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center gap-3 mb-6">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2 inline" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2 inline" />
                    Reproducir
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retakeRecording}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Grabar de Nuevo
              </button>
              
              <button
                onClick={confirmRecording}
                className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmar Grabación
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Debug panel for development */}
      {debugLog.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            Registro de actividad ({debugLog.length} eventos)
          </summary>
          <div className="text-xs bg-gray-100 p-3 rounded max-h-32 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default VoiceCapture;