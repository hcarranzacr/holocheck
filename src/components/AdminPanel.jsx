import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Copy, ExternalLink, ArrowLeft, FileText, Clock, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import ManualSetupHelper from '../services/supabase/manualSetupHelper';

const AdminPanel = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [tableStatus, setTableStatus] = useState(null);
  const [showSQL, setShowSQL] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await ManualSetupHelper.testConnection();
      setConnectionDetails(result);
      setConnectionStatus(result.success ? 'connected' : 'error');
    } catch (error) {
      setConnectionDetails({ success: false, error: 'Test failed', details: error.message });
      setConnectionStatus('error');
    }
  };

  const checkTables = async () => {
    setIsChecking(true);
    try {
      const result = await ManualSetupHelper.checkTablesExist();
      setTableStatus(result);
    } catch (error) {
      setTableStatus({ success: false, error: error.message, existingTables: 0, totalTables: 9 });
    } finally {
      setIsChecking(false);
    }
  };

  const copySQL = async () => {
    try {
      const sql = ManualSetupHelper.getCompleteSQL();
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy SQL:', error);
    }
  };

  useEffect(() => {
    checkConnection();
    checkTables();
  }, []);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="text-green-600" size={20} />;
      case 'error': return <WifiOff className="text-red-600" size={20} />;
      default: return <Database className="animate-spin text-blue-600" size={20} />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getConnectionMessage = () => {
    if (!connectionDetails) return 'Verificando conexión...';
    if (connectionDetails.success) {
      return `Conexión exitosa - ${connectionDetails.message}`;
    }
    return `Error de conexión: ${connectionDetails.error}`;
  };

  const instructions = ManualSetupHelper.getManualInstructions();

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
                <Database className="w-8 h-8 mr-3 text-blue-600" />
                Panel de Administración - Configuración Manual
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Solución Simple</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {getConnectionIcon()}
              <span className="ml-2">Estado de Conexión Supabase</span>
            </h2>
            <button
              onClick={checkConnection}
              disabled={connectionStatus === 'checking'}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
            >
              Verificar
            </button>
          </div>

          <div className={`mb-4 ${getConnectionColor()}`}>
            <p className="font-medium">{getConnectionMessage()}</p>
          </div>

          {connectionDetails && connectionDetails.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>URL:</strong> {connectionDetails.url}</p>
                <p><strong>Key:</strong> {connectionDetails.keyPreview}</p>
                <p><strong>Estado:</strong> ✅ Conexión funcionando correctamente</p>
              </div>
            </div>
          )}

          {connectionDetails && !connectionDetails.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-800 space-y-1">
                <p><strong>Error:</strong> {connectionDetails.error}</p>
                <p><strong>Detalles:</strong> {connectionDetails.details}</p>
                {connectionDetails.code && <p><strong>Código:</strong> {connectionDetails.code}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Table Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              Estado de Tablas Multi-Tenant
            </h2>
            <button
              onClick={checkTables}
              disabled={isChecking}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
            >
              {isChecking ? 'Verificando...' : 'Verificar Tablas'}
            </button>
          </div>

          {tableStatus && (
            <div className="mb-4">
              <div className={`text-lg font-medium mb-2 ${
                tableStatus.isComplete ? 'text-green-600' : 'text-red-600'
              }`}>
                Tablas creadas: {tableStatus.existingTables}/{tableStatus.totalTables}
              </div>
              
              {tableStatus.isComplete ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-medium">✅ Base de datos configurada correctamente</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Todas las tablas multi-tenant han sido creadas exitosamente. HoloCheck está listo para usar.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertCircle size={20} />
                    <span className="font-medium">⚠️ Configuración de base de datos requerida</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Las tablas necesarias no han sido creadas. Sigue las instrucciones manuales a continuación.
                  </p>
                </div>
              )}

              {tableStatus.tableStatus && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {Object.entries(tableStatus.tableStatus).map(([table, exists]) => (
                    <div key={table} className={`text-xs p-2 rounded ${
                      exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {exists ? '✅' : '❌'} {table}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Setup Instructions */}
        {tableStatus && !tableStatus.isComplete && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              {instructions.title}
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <Clock size={16} />
                <span className="font-medium">Tiempo estimado: {instructions.estimatedTime}</span>
              </div>
              <p className="text-sm text-blue-700">
                Dificultad: {instructions.difficulty}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {instructions.steps.map((step) => (
                <div key={step.step} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SQL Script Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Script SQL Completo</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSQL(!showSQL)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {showSQL ? 'Ocultar SQL' : 'Ver SQL'}
                  </button>
                  <button
                    onClick={copySQL}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                      copied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Copy size={16} />
                    <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
              </div>

              {showSQL && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm whitespace-pre-wrap">
                    {ManualSetupHelper.getCompleteSQL()}
                  </pre>
                </div>
              )}

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Instrucciones importantes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Copia el SQL completo usando el botón "Copiar SQL"</li>
                      <li>Ve a tu Supabase Dashboard → SQL Editor</li>
                      <li>Pega todo el script y ejecuta con "Run"</li>
                      <li>Regresa aquí y haz clic en "Verificar Tablas"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {tableStatus && tableStatus.isComplete && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              ✅ HoloCheck Configurado Exitosamente
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-800 space-y-2">
                <p className="font-medium text-lg">🎉 ¡Configuración completada!</p>
                <div className="text-sm space-y-1">
                  <p>✅ 9 tablas multi-tenant creadas</p>
                  <p>✅ Políticas RLS configuradas</p>
                  <p>✅ Índices de rendimiento activos</p>
                  <p>✅ Configuración HIPAA habilitada</p>
                  <p>✅ Sistema listo para producción</p>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="font-medium">Próximos pasos:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Regresa a la aplicación principal</li>
                    <li>• Comienza a crear tenants (aseguradoras)</li>
                    <li>• Configura empresas y empleados</li>
                    <li>• Inicia análisis biométricos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;