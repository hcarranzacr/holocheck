import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react';

const BiometricCapture = ({ onCapture, onError }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  // Add debug logging
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(`[BiometricCapture] ${logEntry}`);
    setDebugLog(prev => [...prev.slice(-10), logEntry]); // Keep last 10 logs
  };

  // Webcam configuration for maximum compatibility
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  };

  // Handle webcam ready state with enhanced logging
  const handleUserMedia = useCallback((stream) => {
    addLog('Webcam media stream received');
    addLog(`Stream active: ${stream.active}, tracks: ${stream.getTracks().length}`);
    
    // Add small delay to ensure webcam is fully ready
    setTimeout(() => {
      setIsReady(true);
      setIsWebcamReady(true);
      setError(null);
      addLog('Webcam marked as ready for capture');
    }, 1000); // 1 second delay to ensure stability
  }, []);

  // Handle webcam errors with detailed logging
  const handleUserMediaError = useCallback((error) => {
    addLog(`Webcam error: ${error.name} - ${error.message}`);
    setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    setIsReady(false);
    setIsWebcamReady(false);
    if (onError) onError(error);
  }, [onError]);

  // Enhanced capture photo with extensive validation and logging
  const capturePhoto = useCallback(() => {
    addLog('=== STARTING PHOTO CAPTURE ===');
    
    // Validate webcam ref
    if (!webcamRef.current) {
      addLog('ERROR: Webcam ref not available');
      setError('Cámara no disponible. Recarga la página.');
      return;
    }

    // Validate ready states
    if (!isReady || !isWebcamReady) {
      addLog(`ERROR: Webcam not ready - isReady: ${isReady}, isWebcamReady: ${isWebcamReady}`);
      setError('La cámara no está lista. Espera un momento.');
      return;
    }

    try {
      addLog('Attempting to get screenshot...');
      
      // Add small delay before capture to ensure frame stability
      setTimeout(() => {
        try {
          const imageSrc = webcamRef.current.getScreenshot();
          
          addLog(`Screenshot result: ${imageSrc ? 'SUCCESS' : 'FAILED'}`);
          
          if (imageSrc) {
            addLog(`Screenshot data length: ${imageSrc.length} characters`);
            addLog(`Screenshot format: ${imageSrc.substring(0, 30)}...`);
            
            // Validate the image data
            if (imageSrc.startsWith('data:image/')) {
              setImgSrc(imageSrc);
              addLog('Image successfully set for preview');
              addLog('=== PHOTO CAPTURE COMPLETED SUCCESSFULLY ===');
            } else {
              addLog('ERROR: Invalid image data format');
              setError('Formato de imagen inválido. Inténtalo de nuevo.');
            }
          } else {
            addLog('ERROR: getScreenshot returned null or undefined');
            setError('Error al capturar la foto. La cámara no está lista o el video no está disponible.');
          }
        } catch (innerErr) {
          addLog(`ERROR in delayed capture: ${innerErr.message}`);
          setError('Error interno al capturar. Inténtalo de nuevo.');
        }
      }, 100); // 100ms delay for frame stability
      
    } catch (err) {
      addLog(`ERROR in capturePhoto: ${err.message}`);
      setError('Error al capturar la foto. Inténtalo de nuevo.');
    }
  }, [isReady, isWebcamReady]);

  // Retake photo with logging
  const retakePhoto = useCallback(() => {
    addLog('Retaking photo - clearing current image');
    setImgSrc(null);
    setError(null);
    setDebugLog([]);
  }, []);

  // Confirm photo with enhanced validation
  const confirmPhoto = useCallback(() => {
    addLog('Confirming photo...');
    
    if (!imgSrc) {
      addLog('ERROR: No image source available for confirmation');
      setError('No hay imagen para confirmar.');
      return;
    }

    if (!onCapture) {
      addLog('ERROR: No onCapture callback provided');
      setError('Error de configuración. No se puede procesar la imagen.');
      return;
    }

    try {
      addLog('Converting image to blob...');
      
      // Convert data URL to blob
      fetch(imgSrc)
        .then(res => {
          addLog(`Fetch response status: ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          addLog(`Blob created - size: ${blob.size} bytes, type: ${blob.type}`);
          
          if (blob.size === 0) {
            addLog('ERROR: Blob is empty');
            setError('La imagen está vacía. Retoma la foto.');
            return;
          }

          // Create File object
          const file = new File([blob], '/images/selfie.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          addLog(`File created: ${file.name}, size: ${file.size} bytes`);
          addLog('Calling onCapture callback...');
          onCapture(file);
          addLog('=== PHOTO CONFIRMATION COMPLETED ===');
        })
        .catch(err => {
          addLog(`ERROR converting image: ${err.message}`);
          setError('Error al procesar la imagen.');
        });
    } catch (err) {
      addLog(`ERROR in confirmPhoto: ${err.message}`);
      setError('Error al confirmar la foto.');
    }
  }, [imgSrc, onCapture]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de Cámara</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setImgSrc(null);
              setIsReady(false);
              setIsWebcamReady(false);
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
        Captura de Selfie Biométrica
      </h2>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Busca un lugar con buena iluminación natural</li>
          <li>• Sostén el dispositivo a la altura de los ojos</li>
          <li>• Asegúrate de que tu rostro esté centrado</li>
          <li>• Mira directamente a la cámara</li>
          <li>• Mantén una expresión neutral</li>
          <li>• Espera a ver "✓ Listo para Capturar" antes de presionar</li>
        </ul>
      </div>

      {/* Camera/Preview Area */}
      <div className="relative mb-6">
        {!imgSrc ? (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-cover"
              mirrored={true}
            />
            
            {/* Camera guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-white rounded-full opacity-30"></div>
            </div>
            
            {/* Ready indicator - only show when fully ready */}
            {isReady && isWebcamReady && (
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                ✓ Listo para Capturar
              </div>
            )}
            
            {/* Capture button - only show when fully ready */}
            {isReady && isWebcamReady && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  title="Tomar Foto"
                >
                  <Camera className="w-8 h-8" />
                </button>
              </div>
            )}
            
            {/* Loading state */}
            {(!isReady || !isWebcamReady) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">
                    {!isReady ? 'Iniciando cámara...' : 'Preparando captura...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src={imgSrc}
              alt="Selfie capturada"
              className="w-full rounded-lg shadow-md aspect-video object-cover"
            />
            
            <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ✓ Foto Capturada Exitosamente
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {imgSrc && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retakePhoto}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retomar Foto
          </button>
          
          <button
            onClick={confirmPhoto}
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar Foto
          </button>
        </div>
      )}

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

export default BiometricCapture;