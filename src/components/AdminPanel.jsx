import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Settings, Shield, Users, Building, Play, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MultiTenantSetup from '../services/supabase/multiTenantSetup';

const AdminPanel = () => {
  const [setupStatus, setSetupStatus] = useState('checking');
  const [setupProgress, setSetupProgress] = useState([]);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResults, setSetupResults] = useState(null);
  const [tenantStats, setTenantStats] = useState({ tenants: 0, companies: 0, users: 0 });

  const checkDatabaseStatus = async () => {
    try {
      setSetupStatus('checking');
      const status = await MultiTenantSetup.checkDatabaseStatus();
      
      if (status.isComplete) {
        setSetupStatus('complete');
        setTenantStats(status.stats || { tenants: 0, companies: 0, users: 0 });
      } else {
        setSetupStatus('needs-setup');
      }
    } catch (error) {
      console.error('Database status check failed:', error);
      setSetupStatus('error');
    }
  };

  const runDatabaseSetup = async () => {
    setIsSetupRunning(true);
    setSetupProgress([]);
    setSetupResults(null);
    
    try {
      const progressCallback = (step) => {
        setSetupProgress(prev => [...prev, step]);
      };

      const results = await MultiTenantSetup.initializeMultiTenantDatabase(progressCallback);
      
      setSetupResults(results);
      
      if (results.success) {
        setSetupStatus('complete');
        await checkDatabaseStatus();
      } else {
        setSetupStatus('error');
      }
    } catch (error) {
      console.error('Database setup failed:', error);
      setSetupResults({
        success: false,
        error: error.message,
        tablesCreated: 0,
        totalTables: 9
      });
      setSetupStatus('error');
    } finally {
      setIsSetupRunning(false);
    }
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
      case 'error': return <AlertCircle size={24} />;
      default: return <Database className="animate-spin" size={24} />;
    }
  };

  const getStatusMessage = () => {
    switch (setupStatus) {
      case 'complete': return 'Base de datos multi-tenant configurada correctamente';
      case 'needs-setup': return 'Base de datos requiere configuración inicial';
      case 'error': return 'Error en la configuración de base de datos';
      default: return 'Verificando estado de base de datos...';
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
                Panel de Administración
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
            <button
              onClick={checkDatabaseStatus}
              disabled={setupStatus === 'checking' || isSetupRunning}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Verificar estado"
            >
              <RefreshCw size={16} className={setupStatus === 'checking' ? 'animate-spin' : ''} />
            </button>
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
                Arquitectura: Aseguradoras → Empresas → Empleados
              </p>
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

          {/* Setup Button */}
          {setupStatus === 'needs-setup' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                🚀 Configuración Inicial Requerida
              </h3>
              <p className="text-yellow-800 mb-4">
                La base de datos multi-tenant no está configurada. Ejecute la configuración inicial para crear:
              </p>
              <ul className="text-sm text-yellow-700 mb-4 space-y-1">
                <li>• 9 tablas multi-tenant con aislamiento por aseguradora</li>
                <li>• Políticas de seguridad Row Level Security (RLS)</li>
                <li>• Sistema de configuración sin valores hardcodeados</li>
                <li>• Jerarquía: Aseguradoras → Empresas → Empleados</li>
                <li>• Compliance HIPAA con encriptación y auditoría</li>
              </ul>
              <button
                onClick={runDatabaseSetup}
                disabled={isSetupRunning}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Play size={16} />
                <span>{isSetupRunning ? 'Configurando...' : 'Ejecutar Configuración Inicial'}</span>
              </button>
            </div>
          )}

          {/* Setup Progress */}
          {isSetupRunning && setupProgress.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                🔧 Progreso de Configuración
              </h3>
              <div className="space-y-2">
                {setupProgress.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Results */}
          {setupResults && (
            <div className={`border rounded-lg p-4 ${
              setupResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`text-lg font-medium mb-2 ${
                setupResults.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {setupResults.success ? '✅ Configuración Exitosa' : '❌ Error en Configuración'}
              </h3>
              <div className={`text-sm space-y-1 ${
                setupResults.success ? 'text-green-800' : 'text-red-800'
              }`}>
                <p>Tablas creadas: {setupResults.tablesCreated}/{setupResults.totalTables}</p>
                {setupResults.configsCreated && (
                  <p>Configuraciones: {setupResults.configsCreated} entradas</p>
                )}
                {setupResults.error && (
                  <p>Error: {setupResults.error}</p>
                )}
                {setupResults.success && (
                  <div className="mt-2">
                    <p>🎉 Sistema multi-tenant configurado correctamente</p>
                    <p>🛡️ Políticas RLS activas para aislamiento de tenants</p>
                    <p>🔐 Encriptación HIPAA habilitada</p>
                    <p>📊 Sistema de configuración sin hardcoding</p>
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
                <p>🏗️ Arquitectura multi-tenant implementada correctamente</p>
                <p>🔒 Aislamiento de datos por aseguradora (tenant)</p>
                <p>🛡️ Políticas RLS activas y funcionando</p>
                <p>📋 Sistema de configuración database-driven</p>
                <p>🚀 HoloCheck listo para producción</p>
              </div>
            </div>
          )}
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Arquitectura Multi-Tenant
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Aseguradoras (Tenants)</h3>
              <p className="text-sm text-gray-600">
                Cada aseguradora es un tenant independiente con aislamiento completo de datos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Empresas Aseguradas</h3>
              <p className="text-sm text-gray-600">
                Empresas con convenios bajo cada aseguradora con configuración específica
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Colaboradores</h3>
              <p className="text-sm text-gray-600">
                Empleados de empresas con acceso a análisis biométrico personal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;