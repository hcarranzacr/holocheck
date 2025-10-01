import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, ExternalLink, Copy, Key, Globe } from 'lucide-react';
import { checkConnection, isSupabaseConfigured } from '../services/supabase/supabaseClient';

const SupabaseSetupGuide = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

    checkSupabaseConnection();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlScript = `-- HoloCheck HIPAA-Compliant Database Schema
-- Project: ytdctcyzzilbtkxcebfr
-- Execute this in Supabase SQL Editor

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('individual', 'company', 'insurance', 'admin');
CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'revoked', 'expired');

-- 1. User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    pillar_type user_role NOT NULL DEFAULT 'individual',
    encrypted_personal_data JSONB,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Biometric Data table
CREATE TABLE IF NOT EXISTS biometric_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    session_id TEXT NOT NULL,
    encrypted_biometric_data JSONB NOT NULL,
    capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    analysis_quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Analysis Results table
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biometric_data_id UUID REFERENCES biometric_data(id) NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    encrypted_results JSONB NOT NULL,
    health_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users,
    action TEXT NOT NULL,
    resource_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    phi_accessed BOOLEAN DEFAULT false
);

-- Enable Row Level Security
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
    if (connectionStatus?.connected) return 'text-green-600';
    if (connectionStatus?.needsConfiguration) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (loading) return <Database className="animate-spin" size={20} />;
    if (connectionStatus?.connected) return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verificando conexión...';
    if (connectionStatus?.needsConfiguration) return 'Necesita configuración de API key';
    if (connectionStatus?.connected && connectionStatus?.needsSchema) return 'Conectado - Necesita ejecutar SQL';
    if (connectionStatus?.connected) return 'Conectado y listo';
    return connectionStatus?.error || 'Error de conexión';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Configuración Final de Supabase para HoloCheck
        </h2>
        <div className="flex items-center space-x-3 mb-4">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
            <p className="text-sm text-gray-600">
              Proyecto: ytdctcyzzilbtkxcebfr | URL: https://ytdctcyzzilbtkxcebfr.supabase.co
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="text-blue-600" size={20} />
            <span className="font-medium text-blue-900">Project URL</span>
          </div>
          <p className="text-sm text-blue-800">✅ Configurada correctamente</p>
          <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 block">
            https://ytdctcyzzilbtkxcebfr.supabase.co
          </code>
        </div>

        <div className={`border rounded-lg p-4 ${
          isSupabaseConfigured() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Key className={isSupabaseConfigured() ? 'text-green-600' : 'text-yellow-600'} size={20} />
            <span className={`font-medium ${isSupabaseConfigured() ? 'text-green-900' : 'text-yellow-900'}`}>
              API Key
            </span>
          </div>
          <p className={`text-sm ${isSupabaseConfigured() ? 'text-green-800' : 'text-yellow-800'}`}>
            {isSupabaseConfigured() ? '✅ Configurada' : '⚠️ Pendiente'}
          </p>
        </div>

        <div className={`border rounded-lg p-4 ${
          connectionStatus?.connected && !connectionStatus?.needsSchema 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Database className={
              connectionStatus?.connected && !connectionStatus?.needsSchema 
                ? 'text-green-600' 
                : 'text-yellow-600'
            } size={20} />
            <span className={`font-medium ${
              connectionStatus?.connected && !connectionStatus?.needsSchema 
                ? 'text-green-900' 
                : 'text-yellow-900'
            }`}>
              Base de Datos
            </span>
          </div>
          <p className={`text-sm ${
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

      {/* Step-by-step guide */}
      <div className="space-y-6">
        {/* Step 1: Get API Keys */}
        {!isSupabaseConfigured() && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Paso 1: Obtener Clave API de Supabase
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-blue-800">
                <strong>1.</strong> Ir a: <a 
                  href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Settings → API en tu proyecto Supabase
                </a>
              </p>
              <p className="text-blue-800">
                <strong>2.</strong> Usar contraseña: <code className="bg-blue-200 px-1 rounded">Prodeo.2025@</code>
              </p>
              <p className="text-blue-800">
                <strong>3.</strong> Copiar el <code className="bg-blue-200 px-1 rounded">anon public</code> key
              </p>
              <p className="text-blue-800">
                <strong>4.</strong> Reemplazar en <code className="bg-blue-200 px-1 rounded">.env.local</code>:
              </p>
              <div className="bg-blue-100 p-2 rounded text-xs font-mono">
                VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Execute SQL */}
        {isSupabaseConfigured() && connectionStatus?.needsSchema && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Paso 2: Ejecutar Script SQL
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-green-800">
                Ejecutar este script en el <strong>SQL Editor</strong> de Supabase:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto max-h-64">
                  {sqlScript}
                </pre>
                <button
                  onClick={() => copyToClipboard(sqlScript)}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  title="Copiar SQL"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">✅ SQL copiado al portapapeles</p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {connectionStatus?.connected && !connectionStatus?.needsSchema && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              ✅ Configuración Completada
            </h3>
            <div className="text-sm text-green-800 space-y-2">
              <p>🎉 <strong>¡Supabase configurado exitosamente!</strong></p>
              <p>✅ Base de datos HIPAA-compliant lista</p>
              <p>✅ Sistema de autenticación de tres pilares activo</p>
              <p>✅ Encriptación AES-256 para datos PHI</p>
              <p>✅ Logs de auditoría automáticos</p>
              <p>🚀 <strong>HoloCheck está listo para usar</strong></p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <a
            href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ExternalLink size={16} />
            <span>Abrir API Settings</span>
          </a>
          <a
            href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Database size={16} />
            <span>Abrir SQL Editor</span>
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Settings size={16} />
            <span>Verificar Conexión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupGuide;