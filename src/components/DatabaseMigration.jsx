import React, { useState, useEffect } from 'react';
import { 
  Database, 
  GitBranch, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileText,
  Play,
  RotateCcw
} from 'lucide-react';

const DatabaseMigration = () => {
  const [migrations, setMigrations] = useState([]);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [availableVersions, setAvailableVersions] = useState([]);
  const [migrationHistory, setMigrationHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Mock migration system - In real implementation, this would connect to your migration service
  const mockMigrations = [
    {
      id: 'v1.0.0',
      version: '1.0.0',
      description: 'Initial schema setup',
      status: 'applied',
      appliedAt: '2024-01-01T00:00:00Z',
      scripts: [
        'CREATE TABLE tenants...',
        'CREATE TABLE companies...',
        'CREATE TABLE user_profiles...'
      ]
    },
    {
      id: 'v1.1.0',
      version: '1.1.0', 
      description: 'Add tenant parameters system',
      status: 'pending',
      scripts: [
        'CREATE TABLE tenant_parameters...',
        'CREATE TABLE parameter_categories...',
        'INSERT INTO parameter_categories...'
      ]
    },
    {
      id: 'v1.2.0',
      version: '1.2.0',
      description: 'Enhanced biometric analysis tables',
      status: 'pending',
      scripts: [
        'ALTER TABLE biometric_data ADD COLUMN confidence_score...',
        'CREATE INDEX idx_biometric_confidence...',
        'UPDATE analysis_results SET...'
      ]
    }
  ];

  useEffect(() => {
    // Load migration data
    setMigrations(mockMigrations);
    setAvailableVersions(['1.0.0', '1.1.0', '1.2.0']);
    setMigrationHistory([
      {
        id: 1,
        version: '1.0.0',
        action: 'migrate_up',
        status: 'success',
        executedAt: '2024-01-01T00:00:00Z',
        duration: '2.3s'
      }
    ]);
  }, []);

  const runMigration = async (version, direction = 'up') => {
    setIsRunning(true);
    
    // Simulate migration execution
    try {
      console.log(`Running migration ${version} ${direction}...`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update migration status
      setMigrations(prev => prev.map(m => 
        m.version === version 
          ? { ...m, status: direction === 'up' ? 'applied' : 'pending' }
          : m
      ));

      // Add to history
      const newHistoryEntry = {
        id: Date.now(),
        version,
        action: `migrate_${direction}`,
        status: 'success',
        executedAt: new Date().toISOString(),
        duration: '3.0s'
      };
      
      setMigrationHistory(prev => [newHistoryEntry, ...prev]);
      
      if (direction === 'up') {
        setCurrentVersion(version);
      }

      alert(`Migration ${version} ${direction} completed successfully!`);
      
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`Migration failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const rollbackMigration = async (version) => {
    if (!confirm(`¿Estás seguro de que quieres hacer rollback a la versión ${version}?`)) {
      return;
    }
    
    await runMigration(version, 'down');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <GitBranch className="w-8 h-8 mr-3 text-blue-600" />
            Control de Cambios de Base de Datos
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión de versiones y migración de esquemas de base de datos
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Versión Actual</div>
          <div className="text-xl font-bold text-blue-600">{currentVersion}</div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Estado Actual del Esquema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {migrations.filter(m => m.status === 'applied').length}
            </div>
            <div className="text-sm text-blue-800">Migraciones Aplicadas</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {migrations.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-800">Migraciones Pendientes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {migrationHistory.filter(h => h.status === 'success').length}
            </div>
            <div className="text-sm text-green-800">Ejecuciones Exitosas</div>
          </div>
        </div>
      </div>

      {/* Available Migrations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Migraciones Disponibles
        </h3>
        
        <div className="space-y-4">
          {migrations.map((migration) => (
            <div key={migration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(migration.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Versión {migration.version}
                    </h4>
                    <p className="text-sm text-gray-600">{migration.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(migration.status)}`}>
                    {migration.status}
                  </span>
                  
                  {migration.status === 'pending' && (
                    <button
                      onClick={() => runMigration(migration.version)}
                      disabled={isRunning}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Aplicar
                    </button>
                  )}
                  
                  {migration.status === 'applied' && migration.version !== '1.0.0' && (
                    <button
                      onClick={() => rollbackMigration(migration.version)}
                      disabled={isRunning}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      Rollback
                    </button>
                  )}
                </div>
              </div>
              
              {/* Scripts Preview */}
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  Ver scripts SQL ({migration.scripts.length} statements)
                </summary>
                <div className="mt-2 bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
                  <pre className="whitespace-pre-wrap">
                    {migration.scripts.join('\n\n')}
                  </pre>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Migration History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Historial de Migraciones
        </h3>
        
        <div className="space-y-3">
          {migrationHistory.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {entry.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {entry.action.replace('_', ' ')} v{entry.version}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.executedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{entry.duration}</div>
                <div className={`text-xs ${
                  entry.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {entry.status}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {migrationHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay historial de migraciones disponible
          </div>
        )}
      </div>

      {/* Running State */}
      {isRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ejecutando Migración
              </h3>
              <p className="text-gray-600">
                Por favor espera mientras se ejecutan los cambios en la base de datos...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigration;