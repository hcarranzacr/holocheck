import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, ExternalLink } from 'lucide-react';
import { checkSupabaseConnection, isSupabaseConfigured } from '../services/supabase/supabaseClient';

const SupabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setLoading(true);
      try {
        const status = await checkSupabaseConnection();
        setConnectionStatus(status);
      } catch (error) {
        setConnectionStatus({
          status: 'error',
          message: error.message,
          hasCredentials: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (loading) return 'text-gray-500';
    switch (connectionStatus?.status) {
      case 'connected': return 'text-green-600';
      case 'connected_no_schema': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Database className="animate-spin" size={20} />;
    switch (connectionStatus?.status) {
      case 'connected': return <CheckCircle size={20} />;
      case 'connected_no_schema': return <AlertCircle size={20} />;
      case 'disconnected': return <AlertCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      default: return <Database size={20} />;
    }
  };

  const getStatusMessage = () => {
    if (loading) return 'Verificando conexión...';
    return connectionStatus?.message || 'Estado desconocido';
  };

  const getInstructions = () => {
    if (!connectionStatus) return null;

    switch (connectionStatus.status) {
      case 'disconnected':
        return (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🔧 Configuración Requerida</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>Paso 1:</strong> Crear proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></p>
              <p><strong>Paso 2:</strong> Copiar URL del proyecto y Anon Key</p>
              <p><strong>Paso 3:</strong> Actualizar variables en <code>.env.local</code></p>
              <p><strong>Paso 4:</strong> Ejecutar scripts SQL en Supabase SQL Editor</p>
            </div>
          </div>
        );
      
      case 'connected_no_schema':
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Configurar Base de Datos</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>Supabase conectado pero falta el esquema de base de datos.</p>
              <p><strong>Ejecutar:</strong> Scripts SQL de HoloCheck en SQL Editor</p>
              <p><strong>Archivo:</strong> <code>HoloCheck_Supabase_SQL_Scripts.sql</code></p>
            </div>
          </div>
        );
      
      case 'connected':
        return (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Supabase Configurado Correctamente</h4>
            <div className="text-sm text-green-700">
              <p>Base de datos HIPAA-compliant lista para usar.</p>
              <p>Sistema de autenticación de tres pilares activo.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Estado de Supabase</h3>
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>
        {connectionStatus?.hasCredentials && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-600">Configurado</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
        )}
      </div>
      
      {getInstructions()}
      
      {!isSupabaseConfigured && (
        <div className="mt-4 flex space-x-2">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            <ExternalLink size={14} />
            <span>Crear Proyecto Supabase</span>
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            <Settings size={14} />
            <span>Verificar Conexión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;