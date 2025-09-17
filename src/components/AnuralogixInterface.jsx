import React, { useState, useEffect, useRef } from 'react';

const AnuralogixInterface = ({ 
  isActive = false, 
  faceDetected = false, 
  signalQuality = 0,
  onPositionValid,
  onPositionInvalid,
  className = ""
}) => {
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setAnimationPhase('active');
      startPulseAnimation();
    } else {
      setAnimationPhase('idle');
      stopPulseAnimation();
    }
  }, [isActive]);

  useEffect(() => {
    if (faceDetected && signalQuality > 50) {
      onPositionValid?.();
    } else {
      onPositionInvalid?.();
    }
  }, [faceDetected, signalQuality, onPositionValid, onPositionInvalid]);

  const startPulseAnimation = () => {
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev + 0.1) % 1);
    }, 100);
    return () => clearInterval(interval);
  };

  const stopPulseAnimation = () => {
    setPulseIntensity(0);
  };

  const getCircleColor = () => {
    if (!isActive) return '#e5e7eb'; // gray-300
    if (!faceDetected) return '#ef4444'; // red-500
    if (signalQuality < 30) return '#f59e0b'; // amber-500
    if (signalQuality < 70) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
  };

  const getStatusText = () => {
    if (!isActive) return 'Posicione su rostro en el círculo';
    if (!faceDetected) return 'Rostro no detectado';
    if (signalQuality < 30) return 'Señal débil - Acérquese más';
    if (signalQuality < 70) return 'Ajustando posición...';
    return 'Posición óptima - Mantenga la posición';
  };

  const getStatusIcon = () => {
    if (!isActive) return '👤';
    if (!faceDetected) return '❌';
    if (signalQuality < 30) return '⚠️';
    if (signalQuality < 70) return '🔄';
    return '✅';
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Main Capture Circle */}
      <div className="relative">
        {/* Outer pulse ring */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isActive ? 'animate-ping' : ''
          }`}
          style={{
            width: '320px',
            height: '320px',
            border: `2px solid ${getCircleColor()}`,
            opacity: isActive ? 0.3 + (pulseIntensity * 0.4) : 0.1,
            transform: `scale(${1 + (pulseIntensity * 0.1)})`
          }}
        />

        {/* Main circle */}
        <div 
          className="relative rounded-full border-4 transition-all duration-300 flex items-center justify-center"
          style={{
            width: '300px',
            height: '300px',
            borderColor: getCircleColor(),
            backgroundColor: `${getCircleColor()}10`,
            boxShadow: isActive ? `0 0 30px ${getCircleColor()}40` : 'none'
          }}
        >
          {/* Positioning guides */}
          <div className="absolute inset-0">
            {/* Top guide */}
            <div 
              className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: getCircleColor() }}
            />
            
            {/* Bottom guide */}
            <div 
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: getCircleColor() }}
            />
            
            {/* Left guide */}
            <div 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full transition-all duration-300"
              style={{ backgroundColor: getCircleColor() }}
            />
            
            {/* Right guide */}
            <div 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full transition-all duration-300"
              style={{ backgroundColor: getCircleColor() }}
            />
          </div>

          {/* Center face outline */}
          <div className="relative">
            <svg 
              width="120" 
              height="150" 
              viewBox="0 0 120 150" 
              className="transition-all duration-300"
              style={{ 
                opacity: isActive ? 0.6 : 0.3,
                filter: `drop-shadow(0 0 10px ${getCircleColor()})`
              }}
            >
              {/* Face outline */}
              <ellipse 
                cx="60" 
                cy="75" 
                rx="45" 
                ry="60" 
                fill="none" 
                stroke={getCircleColor()} 
                strokeWidth="2"
                strokeDasharray={faceDetected ? "0" : "5,5"}
              />
              
              {/* Eyes */}
              <circle cx="45" cy="60" r="3" fill={getCircleColor()} opacity="0.6" />
              <circle cx="75" cy="60" r="3" fill={getCircleColor()} opacity="0.6" />
              
              {/* Nose */}
              <path 
                d="M60 70 L58 80 L62 80 Z" 
                fill="none" 
                stroke={getCircleColor()} 
                strokeWidth="1.5"
                opacity="0.6"
              />
              
              {/* Mouth */}
              <path 
                d="M50 95 Q60 105 70 95" 
                fill="none" 
                stroke={getCircleColor()} 
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Signal quality indicator */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className="w-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${8 + (bar * 2)}px`,
                    backgroundColor: signalQuality >= (bar * 20) ? getCircleColor() : '#e5e7eb'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Corner alignment markers */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 rounded-tl-lg" 
             style={{ borderColor: getCircleColor() }} />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 rounded-tr-lg" 
             style={{ borderColor: getCircleColor() }} />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 rounded-bl-lg" 
             style={{ borderColor: getCircleColor() }} />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 rounded-br-lg" 
             style={{ borderColor: getCircleColor() }} />
      </div>

      {/* Status Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <span className="text-lg font-semibold" style={{ color: getCircleColor() }}>
            {getStatusText()}
          </span>
        </div>
        
        {/* Signal quality bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${signalQuality}%`,
              backgroundColor: getCircleColor()
            }}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          Calidad de señal: {Math.round(signalQuality)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">
          Instrucciones de Posicionamiento
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Mantenga su rostro centrado en el círculo</p>
          <p>• Asegúrese de que sus ojos estén alineados con las guías</p>
          <p>• Manténgase inmóvil durante la captura</p>
          <p>• Asegure buena iluminación frontal</p>
        </div>
      </div>

      {/* Technical Info */}
      {isActive && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>Análisis rPPG: {faceDetected ? 'Activo' : 'Inactivo'}</div>
          <div>Detección facial: {faceDetected ? 'Detectado' : 'No detectado'}</div>
          <div>Calidad de señal: {signalQuality.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
};

export default AnuralogixInterface;