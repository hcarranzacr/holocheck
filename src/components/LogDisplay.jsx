import React, { useState, useEffect, useRef } from 'react';
import systemLogger from '../services/systemLogger';

const LogDisplay = ({ isVisible = true, maxHeight = '300px' }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initial logs
    setLogs(systemLogger.getLogs());

    // Listen for new logs
    const handleNewLog = (logEntry) => {
      setLogs(prevLogs => {
        const newLogs = [...prevLogs, logEntry];
        // Keep only last 100 logs for performance
        return newLogs.slice(-100);
      });
    };

    systemLogger.addListener(handleNewLog);

    return () => {
      systemLogger.removeListener(handleNewLog);
    };
  }, []);

  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLogIcon = (level) => {
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    return icons[level] || '📋';
  };

  const getLogColor = (level) => {
    const colors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      debug: 'text-gray-500'
    };
    return colors[level] || 'text-gray-600';
  };

  const getLogBgColor = (level) => {
    const colors = {
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      debug: 'bg-gray-50 border-gray-200'
    };
    return colors[level] || 'bg-gray-50 border-gray-200';
  };

  const clearLogs = () => {
    systemLogger.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const logsData = systemLogger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holocheck-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAutoScroll(isAtBottom);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-gray-700">
            📝 Logs del Sistema
          </h3>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {filteredLogs.length} entradas
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="success">Éxito</option>
            <option value="info">Info</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`text-xs px-2 py-1 rounded ${
              isAutoScroll 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title="Auto-scroll"
          >
            📜
          </button>

          {/* Export */}
          <button
            onClick={exportLogs}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            title="Exportar logs"
          >
            💾
          </button>

          {/* Clear */}
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            title="Limpiar logs"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={containerRef}
        className="overflow-y-auto p-2 space-y-1"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No hay logs para mostrar
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border text-xs ${getLogBgColor(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <span className="text-sm">{getLogIcon(log.level)}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${getLogColor(log.level)}`}>
                      {log.message}
                    </div>
                    {log.data && (
                      <div className="mt-1 text-gray-600">
                        <details className="cursor-pointer">
                          <summary className="hover:text-gray-800">
                            Ver detalles
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap ml-2">
                  {log.timeString}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer with summary */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>✅ {logs.filter(l => l.level === 'success').length}</span>
            <span>❌ {logs.filter(l => l.level === 'error').length}</span>
            <span>⚠️ {logs.filter(l => l.level === 'warning').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Browser: {systemLogger.getBrowserInfo().browser}</span>
            <span className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-400' : 'bg-red-400'}`}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDisplay;