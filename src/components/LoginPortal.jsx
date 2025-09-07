import React, { useState } from 'react';
import { User, Building, Shield, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { authData } from '../data/authData';

const LoginPortal = ({ onLogin }) => {
  const [selectedAccessType, setSelectedAccessType] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const accessTypeIcons = {
    patient: User,
    company: Building,
    insurance: Shield
  };

  const handleAccessTypeSelect = (accessType) => {
    setSelectedAccessType(accessType);
    setSelectedRole(null);
    setIsAuthenticated(false);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple authentication validation
    if (credentials.username && credentials.password) {
      setIsAuthenticated(true);
      
      // Immediate redirect without timeout to prevent infinite loading
      const userData = {
        accessType: selectedAccessType,
        role: selectedRole,
        username: credentials.username,
        permissions: selectedRole.permissions
      };
      
      console.log('Login successful, redirecting immediately with userData:', userData);
      
      // Call onLogin immediately without delay
      try {
        onLogin(userData);
      } catch (error) {
        console.error('Error during login redirect:', error);
        // Reset state if login fails
        setIsAuthenticated(false);
        alert('Error durante el acceso. Intente nuevamente.');
      }
    }
  };

  const openManual = () => {
    window.open('/docs/manual_usuario_holoccheck_completo.html', '_blank');
  };

  if (showManual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manual de Usuario</h2>
              <button
                onClick={() => setShowManual(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Volver al Login
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">📄 Manual Completo</h3>
                <p className="text-sm text-gray-600 mb-4">Guía completa de uso de la plataforma</p>
                <button
                  onClick={openManual}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Abrir Manual HTML
                </button>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibent text-green-800 mb-3">📋 Guía Rápida</h3>
                <p className="text-sm text-gray-600 mb-4">Pasos básicos para comenzar</p>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Ver Guía Rápida
                </button>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3">❓ FAQ</h3>
                <p className="text-sm text-gray-600 mb-4">Preguntas frecuentes</p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                  Ver FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            HoloCheck Digital Ensurace & Health Check
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Plataforma de Salud Preventiva - Acceso Seguro
          </p>
          <button
            onClick={openManual}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            📚 Manual de Usuario
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!selectedAccessType ? (
            /* Access Type Selection */
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                Seleccione su Tipo de Acceso
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(authData.accessTypes).map(([key, accessType]) => {
                  const IconComponent = accessTypeIcons[key];
                  return (
                    <div
                      key={key}
                      onClick={() => handleAccessTypeSelect(key)}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-transparent hover:border-blue-300 cursor-pointer transition-all transform hover:scale-105"
                    >
                      <div className="text-center">
                        <IconComponent className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {accessType.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {accessType.roles.length} roles disponibles
                        </p>
                        <div className="bg-blue-600 text-white py-2 px-4 rounded-lg">
                          Seleccionar
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !selectedRole ? (
            /* Role Selection */
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedAccessType(null)}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Volver
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  Seleccione su Rol - {authData.accessTypes[selectedAccessType].name}
                </h2>
              </div>
              
              <div className="grid gap-4">
                {authData.accessTypes[selectedAccessType].roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className="bg-gray-50 p-6 rounded-lg border-2 border-transparent hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {role.name}
                        </h3>
                        <p className="text-gray-600 mb-3">{role.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{role.permissions.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isAuthenticated ? (
            /* Login Form */
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Volver
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  Iniciar Sesión - {selectedRole.name}
                </h2>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Rol Seleccionado:</h3>
                <p className="text-blue-700">{selectedRole.name}</p>
                <p className="text-blue-600 text-sm">{selectedRole.description}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Ingresar a la Plataforma
                </button>
              </form>
            </div>
          ) : (
            /* Authentication Success - Minimal display */
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                ¡Acceso Exitoso!
              </h2>
              <p className="text-gray-600 text-sm">
                Redirigiendo como: {selectedRole.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;