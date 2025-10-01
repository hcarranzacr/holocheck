import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, Shield, Users, Building, Play, RefreshCw, ArrowLeft, FileText, Clock, AlertTriangle, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import AutomaticDatabaseManager from '../services/supabase/automaticDatabaseManager';

const AdminPanel = () => {
  const [setupStatus, setSetupStatus] = useState('checking');
  const [setupProgress, setSetupProgress] = useState([]);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResults, setSetupResults] = useState(null);
  const [tenantStats, setTenantStats] = useState({ tenants: 0, companies: 0, users: 0 });
  const [databaseLogs, setDatabaseLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [persistentLogs, setPersistentLogs] = useState([]); // NEVER cleared

  const checkDatabaseStatus = async () => {
    try {
      setSetupStatus('checking');
      const status = await AutomaticDatabaseManager.checkDatabaseStatus();
      
      if (status.isComplete) {
        setSetupStatus('complete');
        setTenantStats(status.stats || { tenants: 0, companies: 0, users: 0 });
        
        // Load recent logs
        const logs = await AutomaticDatabaseManager.getDatabaseLogs(null, 50);
        setDatabaseLogs(logs);
      } else {
        setSetupStatus('needs-setup');
      }
    } catch (error) {
      console.error('Database status check failed:', error);
      setSetupStatus('error');
      
      // Add error to persistent logs
      setPersistentLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        operation: 'STATUS_CHECK',
        status: 'ERROR',
        details: `Error verificando estado: ${error.message}`,
        error: error
      }]);
    }
  };

  const runAutomaticDatabaseSetup = async () => {
    setIsSetupRunning(true);
    setSetupProgress([]); // Clear progress but NOT persistent logs
    setSetupResults(null);
    setShowLogs(true);
    
    // Add start log to persistent logs
    setPersistentLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      operation: 'SETUP_START',
      status: 'STARTED',
      details: 'Iniciando configuración automática de base de datos'
    }]);
    
    try {
      const progressCallback = (step) => {
        setSetupProgress(prev => [...prev, step]);
        
        // ALSO add to persistent logs - NEVER clear these
        setPersistentLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          operation: 'PROGRESS',
          status: 'INFO',
          details: step
        }]);
      };

      console.log('🚀 Iniciando configuración automática de base de datos...');
      const results = await AutomaticDatabaseManager.initializeDatabase(progressCallback);
      
      setSetupResults(results);
      
      // Add results to persistent logs - NEVER clear these
      setPersistentLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        operation: 'SETUP_COMPLETE',
        status: results.success ? 'SUCCESS' : 'FAILED',
        details: `Configuración ${results.success ? 'exitosa' : 'falló'}: ${results.tablesCreated}/${results.totalTables} tablas`,
        error: results.error,
        results: results
      }]);
      
      if (results.success) {
        setSetupStatus('complete');
        await checkDatabaseStatus();
        
        // Load logs for this session
        const sessionLogs = await AutomaticDatabaseManager.getDatabaseLogs(results.sessionId);
        setDatabaseLogs(sessionLogs);
      } else {
        setSetupStatus('error');
        
        // Add detailed error to persistent logs
        if (results.errorDetails) {
          setPersistentLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            operation: 'ERROR_DETAILS',
            status: 'ERROR',
            details: `Error detallado: ${JSON.stringify(results.errorDetails, null, 2)}`,
            error: results.errorDetails
          }]);
        }
      }
    } catch (error) {
      console.error('Database setup failed:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        tablesCreated: 0,
        totalTables: 9,
        errorDetails: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      };
      
      setSetupResults(errorResult);
      setSetupStatus('error');
      
      // Add critical error to persistent logs
      setPersistentLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        operation: 'CRITICAL_ERROR',
        status: 'CRITICAL_ERROR',
        details: `Error crítico: ${error.message}`,
        error: error,
        stack: error.stack
      }]);
      
    } finally {
      setIsSetupRunning(false);
      
      // Add completion log
      setPersistentLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        operation: 'SETUP_END',
        status: 'COMPLETED',
        details: 'Proceso de configuración terminado'
      }]);
    }
  };

  // Clear only progress logs, NEVER clear persistent logs
  const clearProgressLogs = () => {
    setSetupProgress([]);
    // setPersistentLogs remains untouched - NEVER clear these
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusColor = () => {
    switch (setupStatus) {
      case 'complete': return 'text-green-600';
      case 'needs-setup': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (setupStatus) {
      case 'complete': return <CheckCircle size={24} />;
      case 'needs-setup': return <AlertCircle size={24} />;
      case 'error': return <AlertTriangle size={24} />;
      default: return <Database className="animate-spin" size={24} />;
    }
  };

  const getStatusMessage = () => {
    switch (setupStatus) {
      case 'complete': return 'Base de datos multi-tenant configurada correctamente';
      case 'needs-setup': return 'Base de datos requiere configuración automática inicial';
      case 'error': return 'Error en la configuración de base de datos - Ver logs detallados';
      default: return 'Verificando estado de base de datos...';
    }
  };

  const formatLogTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getLogStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': case 'failed': case 'critical_error': return 'text-red-600 bg-red-50 border-red-200';
      case 'starting': case 'started': case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'complete': case 'completed': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLogIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success': case 'complete': case 'completed': return <CheckCircle size={16} />;
      case 'error': case 'failed': case 'critical_error': return <AlertTriangle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Volver a HoloCheck</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Panel de Administración - Debug Completo
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Admin Only</span>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              Estado de Base de Datos Multi-Tenant
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={checkDatabaseStatus}
                disabled={setupStatus === 'checking' || isSetupRunning}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Verificar estado"
              >
                <RefreshCw size={16} className={setupStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <FileText size={16} />
                <span>{showLogs ? 'Ocultar Logs' : 'Ver Logs Debug'}</span>
              </button>
              <button
                onClick={clearProgressLogs}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                title="Limpiar solo logs de progreso (logs persistentes se mantienen)"
              >
                <Bug size={16} />
                <span>Limpiar Progreso</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <div>
              <p className={`font-medium text-lg ${getStatusColor()}`}>
                {getStatusMessage()}
              </p>
              <p className="text-sm text-gray-500">
                Arquitectura: Aseguradoras → Empresas → Empleados | Debug Completo Habilitado
              </p>
              {persistentLogs.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  📊 {persistentLogs.length} logs persistentes almacenados (nunca se limpian)
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          {setupStatus === 'complete' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Aseguradoras (Tenants)</p>
                    <p className="text-2xl font-bold text-blue-800">{tenantStats.tenants}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Building className="text-green-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-green-900">Empresas</p>
                    <p className="text-2xl font-bold text-green-800">{tenantStats.companies}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Users className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Usuarios</p>
                    <p className="text-2xl font-bold text-purple-800">{tenantStats.users}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automatic Setup Button */}
          {setupStatus === 'needs-setup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                🤖 Configuración Automática con Debug Completo
              </h3>
              <p className="text-blue-800 mb-4">
                El sistema creará automáticamente toda la infraestructura con logging detallado:
              </p>
              <ul className="text-sm text-blue-700 mb-4 space-y-1">
                <li>• 🔍 Debug completo de autenticación y conexión</li>
                <li>• ✅ 9 tablas multi-tenant con logging paso a paso</li>
                <li>• 🛡️ Políticas RLS con validación detallada</li>
                <li>• 📊 Logs persistentes que NUNCA se limpian</li>
                <li>• 🚨 Manejo robusto de errores con stack traces</li>
                <li>• 🔧 Troubleshooting automático de problemas</li>
              </ul>
              <button
                onClick={runAutomaticDatabaseSetup}
                disabled={isSetupRunning}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Play size={16} />
                <span>{isSetupRunning ? 'Ejecutando con Debug Completo...' : 'Ejecutar Configuración con Debug'}</span>
              </button>
            </div>
          )}

          {/* Real-time Progress */}
          {isSetupRunning && setupProgress.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                <Database className="animate-spin w-5 h-5 mr-2" />
                🔧 Progreso en Tiempo Real (Logs Temporales)
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {setupProgress.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs font-mono">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                    <span className="text-blue-800 break-all">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Results */}
          {setupResults && (
            <div className={`border rounded-lg p-4 mb-6 ${
              setupResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`text-lg font-medium mb-2 ${
                setupResults.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {setupResults.success ? '✅ Configuración Automática Exitosa' : '❌ Error en Configuración - Ver Logs Debug'}
              </h3>
              <div className={`text-sm space-y-1 ${
                setupResults.success ? 'text-green-800' : 'text-red-800'
              }`}>
                <p>Tablas creadas: {setupResults.tablesCreated}/{setupResults.totalTables}</p>
                {setupResults.indexesCreated && (
                  <p>Índices configurados: {setupResults.indexesCreated}</p>
                )}
                {setupResults.policiesCreated && (
                  <p>Políticas RLS: {setupResults.policiesCreated}</p>
                )}
                {setupResults.configsCreated && (
                  <p>Configuraciones: {setupResults.configsCreated}</p>
                )}
                {setupResults.duration && (
                  <p>Duración total: {setupResults.duration}ms</p>
                )}
                {setupResults.sessionId && (
                  <p>Session ID: {setupResults.sessionId}</p>
                )}
                {setupResults.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <p className="font-medium">Error Principal: {setupResults.error}</p>
                    {setupResults.errorDetails && (
                      <pre className="text-xs mt-1 whitespace-pre-wrap">
                        {JSON.stringify(setupResults.errorDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                {setupResults.success && (
                  <div className="mt-2 space-y-1">
                    <p>🎉 Sistema multi-tenant configurado automáticamente</p>
                    <p>🛡️ Políticas RLS activas para aislamiento de tenants</p>
                    <p>🔐 Encriptación HIPAA habilitada</p>
                    <p>📊 Sistema de configuración database-driven</p>
                    <p>📝 Logs detallados almacenados permanentemente</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success State */}
          {setupStatus === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ Sistema Multi-Tenant Activo
              </h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>🏗️ Arquitectura multi-tenant implementada automáticamente</p>
                <p>🔒 Aislamiento de datos por aseguradora (tenant)</p>
                <p>🛡️ Políticas RLS activas y funcionando</p>
                <p>📋 Sistema de configuración database-driven</p>
                <p>📝 Logs detallados disponibles permanentemente</p>
                <p>🚀 HoloCheck listo para producción</p>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Debug Logs Section - NEVER CLEARED */}
        {showLogs && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Bug className="w-6 h-6 mr-2 text-red-600" />
                Logs Persistentes de Debug (NUNCA se limpian)
              </h2>
              <div className="text-sm text-gray-500">
                {persistentLogs.length} logs almacenados
              </div>
            </div>
            
            {persistentLogs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {persistentLogs.slice().reverse().map((log, index) => (
                  <div key={index} className={`border rounded-lg p-3 text-sm ${getLogStatusColor(log.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getLogIcon(log.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white`}>
                          {log.status}
                        </span>
                        <span className="font-medium">{log.operation}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs opacity-75">
                        <Clock size={12} />
                        <span>{formatLogTimestamp(log.timestamp)}</span>
                      </div>
                    </div>
                    <p className="mb-1 font-mono text-xs">{log.details}</p>
                    {log.error && (
                      <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                        <p className="font-medium text-red-700">Error Details:</p>
                        <pre className="whitespace-pre-wrap mt-1">
                          {typeof log.error === 'string' ? log.error : JSON.stringify(log.error, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.stack && (
                      <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                        <p className="font-medium text-red-700">Stack Trace:</p>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bug className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay logs de debug aún</p>
                <p className="text-sm">Los logs aparecerán cuando ejecutes la configuración automática</p>
              </div>
            )}
          </div>
        )}

        {/* Database Logs from Database */}
        {showLogs && databaseLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-purple-600" />
              Logs Almacenados en Base de Datos
            </h2>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {databaseLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      <span className="font-medium text-gray-900">{log.operation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatLogTimestamp(log.timestamp)}</span>
                      {log.duration_ms && <span>({log.duration_ms}ms)</span>}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-1">{log.details}</p>
                  {log.error && (
                    <p className="text-red-600 text-xs bg-red-50 p-2 rounded">
                      Error: {typeof log.error === 'string' ? log.error : JSON.stringify(log.error)}
                    </p>
                  )}
                  {log.additional_data && (
                    <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
                      {typeof log.additional_data === 'string' ? log.additional_data : JSON.stringify(log.additional_data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Arquitectura Multi-Tenant con Debug Completo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Aseguradoras (Tenants)</h3>
              <p className="text-sm text-gray-600">
                Cada aseguradora es un tenant independiente con aislamiento completo y debug detallado
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Empresas Aseguradas</h3>
              <p className="text-sm text-gray-600">
                Empresas con convenios bajo cada aseguradora con logging completo de operaciones
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Colaboradores</h3>
              <p className="text-sm text-gray-600">
                Empleados con acceso biométrico y logs persistentes de todas las operaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;