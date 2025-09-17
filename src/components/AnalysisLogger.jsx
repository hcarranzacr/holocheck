import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';

const AnalysisLogger = ({ isActive, onLogUpdate }) => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const logContainerRef = useRef(null);
  const maxLogs = 15;

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Expose addLog function to parent components
  useEffect(() => {
    if (onLogUpdate) {
      onLogUpdate({ addLog });
    }
  }, [onLogUpdate]);

  const addLog = (message, type = 'info', data = null) => {
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 1
    });

    const newLog = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type, // 'info', 'success', 'warning', 'error', 'processing'
      data,
      fullTimestamp: new Date()
    };

    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      // Keep only the last maxLogs entries
      return updatedLogs.slice(-maxLogs);
    });
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-green-400 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-l-yellow-400 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-l-red-400 text-red-800';
      case 'processing':
        return 'bg-blue-50 border-l-blue-400 text-blue-800';
      default:
        return 'bg-gray-50 border-l-gray-400 text-gray-800';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Sample logs for demonstration
  useEffect(() => {
    if (isActive && logs.length === 0) {
      addLog('Iniciando sistema de análisis biométrico...', 'info');
      setTimeout(() => addLog('Verificando permisos de cámara y micrófono...', 'processing'), 500);
      setTimeout(() => addLog('Permisos otorgados correctamente', 'success'), 1000);
      setTimeout(() => addLog('Inicializando análisis rPPG...', 'processing'), 1500);
      setTimeout(() => addLog('Detector facial activado', 'success'), 2000);
      setTimeout(() => addLog('Calibrando análisis de voz...', 'processing'), 2500);
      setTimeout(() => addLog('Sistema de análisis listo', 'success'), 3000);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleVisibility}
        className="mb-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
      >
        <Activity className="w-5 h-5" />
        {!isVisible && (
          <span className="text-sm font-medium">
            Ver Log ({logs.length})
          </span>
        )}
      </button>

      {/* Log Panel */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Registro de Análisis</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Últimas {maxLogs} líneas
              </span>
              <button
                onClick={clearLogs}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Log Container */}
          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 max-h-80"
          >
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay registros de análisis</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border-l-4 ${getLogStyle(log.type)} transition-all duration-200 hover:shadow-sm`}
                >
                  <div className="flex items-start space-x-2">
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-600">
                          {log.timestamp}
                        </span>
                        {log.type === 'processing' && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm leading-tight">{log.message}</p>
                      {log.data && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs font-mono">
                          {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Tiempo real</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Activo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for using the logger in other components
export const useAnalysisLogger = () => {
  const [logger, setLogger] = useState(null);

  const logInfo = (message, data) => logger?.addLog(message, 'info', data);
  const logSuccess = (message, data) => logger?.addLog(message, 'success', data);
  const logWarning = (message, data) => logger?.addLog(message, 'warning', data);
  const logError = (message, data) => logger?.addLog(message, 'error', data);
  const logProcessing = (message, data) => logger?.addLog(message, 'processing', data);

  return {
    setLogger,
    logInfo,
    logSuccess,
    logWarning,
    logError,
    logProcessing
  };
};

export default AnalysisLogger;