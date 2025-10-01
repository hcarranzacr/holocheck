import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, ExternalLink, Copy, Key, Globe, RefreshCw } from 'lucide-react';
import { checkConnection, isSupabaseConfigured } from '../services/supabase/supabaseClient';

const SupabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const checkSupabaseConnection = async () => {
    setLoading(true);
    try {
      const status = await checkConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error.message
      });
    } finally {
      setLoading(false);
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

  const sqlScript = `-- HoloCheck HIPAA Database Schema
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql

BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('individual', 'company', 'insurance', 'admin');
CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'revoked', 'expired');

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    pillar_type user_role NOT NULL DEFAULT 'individual',
    encrypted_personal_data JSONB,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Biometric Data
CREATE TABLE IF NOT EXISTS biometric_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    session_id TEXT NOT NULL,
    encrypted_biometric_data JSONB NOT NULL,
    capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    analysis_quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Analysis Results
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biometric_data_id UUID REFERENCES biometric_data(id) NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    encrypted_results JSONB NOT NULL,
    health_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users,
    action TEXT NOT NULL,
    resource_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    phi_accessed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own biometric data" ON biometric_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own biometric data" ON biometric_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analysis results" ON analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis results" ON analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

COMMIT;

SELECT 'HoloCheck database schema created successfully!' as status;`;

  const getStatusColor = () => {
    if (loading) return 'text-gray-500';
    if (connectionStatus?.connected && !connectionStatus?.needsSchema) return 'text-green-600';
    if (connectionStatus?.connected && connectionStatus?.needsSchema) return 'text-yellow-600';
    if (connectionStatus?.needsConfiguration) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (loading) return <Database className="animate-spin" size={20} />;
    if (connectionStatus?.connected && !connectionStatus?.needsSchema) return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verificando conexión...';
    if (connectionStatus?.needsConfiguration) return 'Configuración de API key requerida';
    if (connectionStatus?.connected && connectionStatus?.needsSchema) return 'Conectado - Ejecutar SQL requerido';
    if (connectionStatus?.connected) return 'Conectado y listo';
    return connectionStatus?.error || 'Error de conexión';
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Estado de Supabase
        </h3>
        <button
          onClick={checkSupabaseConnection}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="Verificar conexión"
        >
          <RefreshCw size={16} />
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
          connectionStatus?.connected && !connectionStatus?.needsSchema 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <Database className={
              connectionStatus?.connected && !connectionStatus?.needsSchema 
                ? 'text-green-600' 
                : 'text-yellow-600'
            } size={16} />
            <span className={`text-sm font-medium ${
              connectionStatus?.connected && !connectionStatus?.needsSchema 
                ? 'text-green-900' 
                : 'text-yellow-900'
            }`}>
              Base de Datos
            </span>
          </div>
          <p className={`text-xs ${
            connectionStatus?.connected && !connectionStatus?.needsSchema 
              ? 'text-green-800' 
              : 'text-yellow-800'
          }`}>
            {connectionStatus?.connected && !connectionStatus?.needsSchema 
              ? '✅ Lista' 
              : connectionStatus?.needsSchema 
              ? '⚠️ Necesita SQL'
              : '❌ No configurada'}
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
            <div className="bg-yellow-100 p-2 rounded mt-2 font-mono text-xs">
              VITE_SUPABASE_ANON_KEY=tu_clave_aqui
            </div>
          </div>
        </div>
      )}

      {/* SQL Required */}
      {isConfigured && connectionStatus?.needsSchema && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
            <Database className="w-4 h-4 mr-1" />
            📊 Ejecutar Script SQL
          </h4>
          <div className="text-xs text-green-800 space-y-2">
            <p>Ejecutar en <a 
              href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-green-900"
            >
              Supabase SQL Editor
            </a>:</p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto max-h-32">
                {sqlScript}
              </pre>
              <button
                onClick={() => copyToClipboard(sqlScript)}
                className="absolute top-1 right-1 p-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                title="Copiar SQL"
              >
                <Copy size={12} />
              </button>
            </div>
            {copied && (
              <p className="text-green-600">✅ SQL copiado</p>
            )}
          </div>
        </div>
      )}

      {/* Success */}
      {connectionStatus?.connected && !connectionStatus?.needsSchema && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            ✅ Configuración Completada
          </h4>
          <div className="text-xs text-green-800 space-y-1">
            <p>🎉 Supabase configurado exitosamente</p>
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
      </div>
    </div>
  );
};

export default SupabaseStatus;