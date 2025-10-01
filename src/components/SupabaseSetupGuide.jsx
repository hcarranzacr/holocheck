import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, ExternalLink, Copy, Key } from 'lucide-react';
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
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
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (loading) return <Database className="animate-spin" size={20} />;
    if (connectionStatus?.connected) return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Configuración de Supabase para HoloCheck
        </h2>
        <div className="flex items-center space-x-3 mb-4">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {loading ? 'Verificando conexión...' : 
               connectionStatus?.connected ? 'Conectado a Supabase' : 'Configuración requerida'}
            </p>
            {connectionStatus?.error && (
              <p className="text-sm text-red-600">{connectionStatus.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="space-y-6">
        {/* Step 1: Get API Keys */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Paso 1: Obtener Claves API de Supabase
          </h3>
          <div className="space-y-3 text-sm">
            <p className="text-blue-800">
              <strong>1.</strong> Ir a: <a 
                href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfrn/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Settings → API en tu proyecto Supabase
              </a>
            </p>
            <p className="text-blue-800">
              <strong>2.</strong> Copiar el <code className="bg-blue-200 px-1 rounded">Project URL</code>
            </p>
            <p className="text-blue-800">
              <strong>3.</strong> Copiar el <code className="bg-blue-200 px-1 rounded">anon public</code> key
            </p>
            <p className="text-blue-800">
              <strong>4.</strong> Actualizar el archivo <code className="bg-blue-200 px-1 rounded">.env.local</code> con las claves reales
            </p>
          </div>
        </div>

        {/* Step 2: Execute SQL */}
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

        {/* Step 3: Test Connection */}
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Paso 3: Verificar Conexión
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-purple-800">
              Una vez completados los pasos anteriores, recarga la página para verificar la conexión.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-2"
            >
              <Settings size={16} />
              <span>Verificar Conexión</span>
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Estado Actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Project URL:</span>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                https://ytdctcyzzilbtkxcebfrn.supabase.co
              </code>
            </div>
            <div>
              <span className="font-medium">Project ID:</span>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                ytdctcyzzilbtkxcebfrn
              </code>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <span className={`ml-2 font-medium ${getStatusColor()}`}>
                {loading ? 'Verificando...' : 
                 connectionStatus?.connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div>
              <span className="font-medium">Base de datos:</span>
              <span className={`ml-2 font-medium ${
                connectionStatus?.needsSchema ? 'text-yellow-600' : 
                connectionStatus?.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus?.needsSchema ? 'Necesita esquema' : 
                 connectionStatus?.connected ? 'Lista' : 'No configurada'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <a
            href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfrn/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ExternalLink size={16} />
            <span>Abrir API Settings</span>
          </a>
          <a
            href="https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfrn/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Database size={16} />
            <span>Abrir SQL Editor</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupGuide;