import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, ExternalLink, Copy, Key, Globe, RefreshCw, Play } from 'lucide-react';
import { checkConnection, isSupabaseConfigured } from '../services/supabase/supabaseClient';
import DirectDatabaseCreator from '../services/supabase/directDatabaseCreator';

const SupabaseStatus = ({ databaseStatus }) => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tableCount, setTableCount] = useState({ count: 0, total: 9 });
  const [creatingTables, setCreatingTables] = useState(false);
  const [creationResult, setCreationResult] = useState(null);

  const checkSupabaseConnection = async () => {
    setLoading(true);
    try {
      const status = await checkConnection();
      setConnectionStatus(status);
      
      // Also check table count
      if (isSupabaseConfigured()) {
        const count = await DirectDatabaseCreator.countExistingTables();
        setTableCount(count);
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createTablesAutomatically = async () => {
    setCreatingTables(true);
    setCreationResult(null);
    
    try {
      console.log('🚀 Starting automatic table creation...');
      const result = await DirectDatabaseCreator.initializeWithVerification();
      
      setCreationResult(result);
      setTableCount({ count: result.tablesCreated, total: result.total });
      
      // Refresh connection status
      await checkSupabaseConnection();
      
    } catch (error) {
      console.error('Table creation failed:', error);
      setCreationResult({
        success: false,
        message: `Creation failed: ${error.message}`,
        tablesCreated: 0,
        total: 9
      });
    } finally {
      setCreatingTables(false);
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlScript = `-- HoloCheck Database Creation Script
-- Copy and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pillar_type TEXT NOT NULL DEFAULT 'individual',
  encrypted_personal_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  encrypted_biometric_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  encrypted_results JSONB NOT NULL,
  health_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  resource_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  retention_period_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;

SELECT 'HoloCheck database tables created successfully!' as status;`;

  const getStatusColor = () => {
    if (loading) return 'text-gray-500';
    if (tableCount.count === tableCount.total) return 'text-green-600';
    if (tableCount.count > 0) return 'text-yellow-600';
    if (connectionStatus?.needsConfiguration) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (loading || creatingTables) return <Database className="animate-spin" size={20} />;
    if (tableCount.count === tableCount.total) return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verificando conexión...';
    if (creatingTables) return 'Creando tablas automáticamente...';
    if (connectionStatus?.needsConfiguration) return 'Configuración de API key requerida';
    if (tableCount.count === tableCount.total) return `Base de datos completa (${tableCount.count}/${tableCount.total} tablas)`;
    if (tableCount.count > 0) return `Base de datos parcial (${tableCount.count}/${tableCount.total} tablas)`;
    return connectionStatus?.error || 'Base de datos no configurada';
  };

  const isConfigured = isSupabaseConfigured();
  const isComplete = tableCount.count === tableCount.total;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Estado de Supabase
        </h3>
        <button
          onClick={checkSupabaseConnection}
          disabled={loading || creatingTables}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          title="Verificar conexión"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Globe className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-900">Project URL</span>
          </div>
          <p className="text-xs text-blue-800">✅ Configurada</p>
          <code className="text-xs bg-blue-100 px-1 rounded">
            ytdctcyzzilbtkxcebfr
          </code>
        </div>

        <div className={`border rounded-lg p-3 ${
          isConfigured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <Key className={isConfigured ? 'text-green-600' : 'text-yellow-600'} size={16} />
            <span className={`text-sm font-medium ${isConfigured ? 'text-green-900' : 'text-yellow-900'}`}>
              API Key
            </span>
          </div>
          <p className={`text-xs ${isConfigured ? 'text-green-800' : 'text-yellow-800'}`}>
            {isConfigured ? '✅ Configurada' : '⚠️ Pendiente'}
          </p>
        </div>

        <div className={`border rounded-lg p-3 ${
          isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <Database className={isComplete ? 'text-green-600' : 'text-yellow-600'} size={16} />
            <span className={`text-sm font-medium ${isComplete ? 'text-green-900' : 'text-yellow-900'}`}>
              Base de Datos
            </span>
          </div>
          <p className={`text-xs ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
            {isComplete ? '✅ Completa' : `⚠️ ${tableCount.count}/${tableCount.total} tablas`}
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <div>
          <p className={`font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
          <p className="text-xs text-gray-500">
            Última verificación: {connectionStatus?.timestamp ? new Date(connectionStatus.timestamp).toLocaleTimeString() : 'Nunca'}
          </p>
        </div>
      </div>

      {/* Creation Results */}
      {creationResult && (
        <div className={`mb-4 p-3 rounded-lg border ${
          creationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            creationResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {creationResult.message}
          </p>
          {creationResult.existingTables && creationResult.existingTables.length > 0 && (
            <p className="text-xs text-green-700 mt-1">
              Tablas disponibles: {creationResult.existingTables.join(', ')}
            </p>
          )}
          {creationResult.missingTables && creationResult.missingTables.length > 0 && (
            <p className="text-xs text-yellow-700 mt-1">
              Tablas faltantes: {creationResult.missingTables.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Action Required */}
      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">🔑 Configuración Requerida</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>1. Ve a: <a 
              href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900"
            >
              Supabase API Settings
            </a></p>
            <p>2. Copia el <strong>anon public</strong> key</p>
            <p>3. Actualiza el archivo <code className="bg-yellow-200 px-1 rounded">.env.local</code></p>
          </div>
        </div>
      )}

      {/* Database Creation */}
      {isConfigured && !isComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Database className="w-4 h-4 mr-1" />
            📊 Crear Base de Datos
          </h4>
          <div className="text-xs text-blue-800 space-y-2">
            <p>Estado actual: {tableCount.count}/{tableCount.total} tablas creadas</p>
            <div className="flex space-x-2">
              <button
                onClick={createTablesAutomatically}
                disabled={creatingTables}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                <Play size={12} />
                <span>{creatingTables ? 'Creando...' : 'Crear Automáticamente'}</span>
              </button>
              <button
                onClick={() => copyToClipboard(sqlScript)}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                <Copy size={12} />
                <span>Copiar SQL</span>
              </button>
            </div>
            {copied && (
              <p className="text-blue-600">✅ SQL copiado al portapapeles</p>
            )}
          </div>
        </div>
      )}

      {/* Success */}
      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            ✅ Base de Datos Completa
          </h4>
          <div className="text-xs text-green-800 space-y-1">
            <p>🎉 {tableCount.count}/{tableCount.total} tablas creadas exitosamente</p>
            <p>🛡️ Sistema HIPAA-compliant activo</p>
            <p>🔐 Encriptación y auditoría funcionando</p>
            <p>🚀 HoloCheck listo para usar</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <a
          href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          <ExternalLink size={12} />
          <span>API Settings</span>
        </a>
        <a
          href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          <Database size={12} />
          <span>SQL Editor</span>
        </a>
        <a
          href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
        >
          <Database size={12} />
          <span>Table Editor</span>
        </a>
      </div>
    </div>
  );
};

export default SupabaseStatus;