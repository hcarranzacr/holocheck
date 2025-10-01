import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Settings, 
  RotateCcw, 
  Trash2, 
  Users, 
  Database,
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import TenantManager from '../services/supabase/tenantManager';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showParameters, setShowParameters] = useState(false);
  const [tenantConfig, setTenantConfig] = useState(null);
  const [editingParam, setEditingParam] = useState(null);

  // Form states
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    plan: 'basic',
    defaultCompany: {
      name: '',
      industry: 'Healthcare'
    }
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const result = await TenantManager.getAllTenants();
      if (result.success) {
        setTenants(result.tenants);
      } else {
        console.error('Error loading tenants:', result.error);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await TenantManager.createTenant(newTenant);
      if (result.success) {
        setShowCreateForm(false);
        setNewTenant({
          name: '',
          domain: '',
          plan: 'basic',
          defaultCompany: { name: '', industry: 'Healthcare' }
        });
        await loadTenants();
      } else {
        alert('Error creating tenant: ' + result.error);
      }
    } catch (error) {
      alert('Error creating tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTenant = async (tenantId, options = {}) => {
    if (!confirm('¿Estás seguro de que quieres reiniciar este tenant? Esta acción eliminará todos los datos.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await TenantManager.resetTenant(tenantId, options);
      if (result.success) {
        alert('Tenant reiniciado exitosamente');
        await loadTenants();
      } else {
        alert('Error reiniciando tenant: ' + result.error);
      }
    } catch (error) {
      alert('Error reiniciando tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantConfig = async (tenantId) => {
    try {
      const result = await TenantManager.getTenantConfig(tenantId);
      if (result.success) {
        setTenantConfig(result);
        setSelectedTenant(tenantId);
        setShowParameters(true);
      } else {
        alert('Error loading tenant config: ' + result.error);
      }
    } catch (error) {
      alert('Error loading tenant config: ' + error.message);
    }
  };

  const updateParameter = async (category, key, value, type) => {
    try {
      const result = await TenantManager.updateTenantParameter(
        selectedTenant, 
        category, 
        key, 
        value, 
        type
      );
      
      if (result.success) {
        // Reload config
        await loadTenantConfig(selectedTenant);
        setEditingParam(null);
      } else {
        alert('Error updating parameter: ' + result.error);
      }
    } catch (error) {
      alert('Error updating parameter: ' + error.message);
    }
  };

  const groupParametersByCategory = (parameters) => {
    return parameters.reduce((acc, param) => {
      if (!acc[param.category]) {
        acc[param.category] = [];
      }
      acc[param.category].push(param);
      return acc;
    }, {});
  };

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando tenants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Gestión de Tenants Multi-Inquilino
          </h2>
          <p className="text-gray-600 mt-1">
            Crear, configurar y gestionar tenants (aseguradoras) del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Tenant
        </button>
      </div>

      {/* Create Tenant Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Tenant</h3>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Tenant
                </label>
                <input
                  type="text"
                  required
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Seguros ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dominio
                </label>
                <input
                  type="text"
                  required
                  value={newTenant.domain}
                  onChange={(e) => setNewTenant({...newTenant, domain: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seguros-abc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan de Suscripción
                </label>
                <select
                  value={newTenant.plan}
                  onChange={(e) => setNewTenant({...newTenant, plan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa por Defecto
                </label>
                <input
                  type="text"
                  value={newTenant.defaultCompany.name}
                  onChange={(e) => setNewTenant({
                    ...newTenant, 
                    defaultCompany: {...newTenant.defaultCompany, name: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la empresa principal"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Tenant'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-500">@{tenant.domain}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  tenant.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-medium capitalize">{tenant.subscription_plan}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{tenant.stats.companies}</div>
                <div className="text-xs text-blue-800">Empresas</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{tenant.stats.users}</div>
                <div className="text-xs text-green-800">Usuarios</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => loadTenantConfig(tenant.id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              >
                <Settings className="w-4 h-4 mr-1" />
                Config
              </button>
              <button
                onClick={() => handleResetTenant(tenant.id)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Parameters Modal */}
      {showParameters && tenantConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Configuración de Tenant: {tenantConfig.tenant.name}
              </h3>
              <button
                onClick={() => setShowParameters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tenant Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Empresas</div>
                  <div className="text-lg font-semibold">{tenantConfig.stats.companies}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Usuarios</div>
                  <div className="text-lg font-semibold">{tenantConfig.stats.users}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Plan</div>
                  <div className="text-lg font-semibold capitalize">{tenantConfig.tenant.subscription_plan}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="text-lg font-semibold capitalize">{tenantConfig.tenant.status}</div>
                </div>
              </div>
            </div>

            {/* Parameters by Category */}
            <div className="space-y-6">
              {Object.entries(groupParametersByCategory(tenantConfig.parameters)).map(([category, params]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <div className="space-y-3">
                    {params.map((param) => (
                      <div key={param.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {param.parameter_key.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tipo: {param.parameter_type}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {editingParam === param.id ? (
                            <>
                              <input
                                type={param.parameter_type === 'number' ? 'number' : 'text'}
                                defaultValue={param.parameter_value}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    updateParameter(
                                      param.category,
                                      param.parameter_key,
                                      e.target.value,
                                      param.parameter_type
                                    );
                                  }
                                }}
                              />
                              <button
                                onClick={() => setEditingParam(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-900 font-medium">
                                {param.parameter_value}
                              </span>
                              <button
                                onClick={() => setEditingParam(param.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => handleResetTenant(selectedTenant, { resetParameters: true })}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
              >
                Resetear Parámetros
              </button>
              <button
                onClick={() => setShowParameters(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tenants.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tenants creados</h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer tenant para comenzar a gestionar aseguradoras
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Tenant
          </button>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;