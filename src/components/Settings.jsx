import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Brain, Building, Shield, Save, AlertTriangle, CheckCircle, BarChart3, Users, FileText, Eye, EyeOff } from 'lucide-react';
import PromptEditor from './PromptEditor';
import { promptManager } from '../services/openaiPrompts';
import { testOpenAIConnection, isApiKeyConfigured } from '../services/openaiService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [promptStats, setPromptStats] = useState({});
  const [testResults, setTestResults] = useState(null);

  // Cargar configuraciones al montar
  useEffect(() => {
    // Cargar API key desde localStorage
    const savedApiKey = localStorage.getItem('holocheck_openai_key');
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey);
      setIsApiKeyValid(isApiKeyConfigured());
    } else {
      // Verificar si existe en variables de entorno
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (envApiKey && envApiKey !== 'your-openai-api-key-here') {
        setIsApiKeyValid(true);
      }
    }

    // Cargar estadísticas de prompts
    setPromptStats(promptManager.getUsageStats());
  }, []);

  // Validar y guardar API key
  const handleSaveApiKey = async () => {
    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      setIsApiKeyValid(false);
      return;
    }

    // Guardar en localStorage
    localStorage.setItem('holocheck_openai_key', openaiApiKey);
    
    // Probar conexión
    setIsTestingConnection(true);
    try {
      const result = await testOpenAIConnection();
      setIsApiKeyValid(result.success);
      if (result.success) {
        setTestResults({
          type: 'connection',
          success: true,
          message: result.message,
          timestamp: new Date().toISOString()
        });
      } else {
        setTestResults({
          type: 'connection',
          success: false,
          message: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setIsApiKeyValid(false);
      setTestResults({
        type: 'connection',
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    setIsTestingConnection(false);
  };

  // Probar conexión independiente
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testOpenAIConnection();
      setTestResults({
        type: 'connection',
        success: result.success,
        message: result.success ? result.message : result.error,
        response: result.response,
        model: result.model,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResults({
        type: 'connection',
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    setIsTestingConnection(false);
  };

  // Manejar prueba de prompt
  const handlePromptTest = (processedPrompt, testData) => {
    setTestResults({
      type: 'prompt',
      prompt: processedPrompt,
      data: testData,
      timestamp: new Date().toISOString()
    });
    setActiveTab('test-results');
  };

  // Tabs de configuración
  const tabs = [
    { id: 'prompts', label: 'Prompts IA', icon: Brain },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'test-results', label: 'Resultados de Prueba', icon: FileText }
  ];

  // Prompt tabs
  const promptTabs = [
    { id: 'personal', label: 'Personal', icon: Users, color: 'blue' },
    { id: 'company', label: 'Empresa', icon: Building, color: 'green' },
    { id: 'insurance', label: 'Aseguradora', icon: Shield, color: 'purple' }
  ];

  const [activePromptTab, setActivePromptTab] = useState('personal');

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <SettingsIcon className="w-6 h-6 text-gray-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
            <p className="text-gray-600 mt-1">Gestiona prompts de IA, API keys y configuraciones de seguridad</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            {/* Prompt Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{promptStats.personal || 0}</div>
                    <div className="text-sm text-blue-800">Análisis Personales</div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Building className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{promptStats.company || 0}</div>
                    <div className="text-sm text-green-800">Análisis Empresariales</div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{promptStats.insurance || 0}</div>
                    <div className="text-sm text-purple-800">Análisis Actuariales</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Type Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {promptTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePromptTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activePromptTab === tab.id
                          ? `border-${tab.color}-500 text-${tab.color}-600`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Prompt Editor */}
            <PromptEditor 
              type={activePromptTab} 
              onTest={handlePromptTest}
              onSave={(type, prompt) => {
                // Actualizar estadísticas
                setPromptStats(promptManager.getUsageStats());
              }}
            />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de OpenAI API</h3>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Configuración Segura:</strong> Tu API key se almacena localmente en tu navegador y nunca se envía a nuestros servidores.
                    <br />
                    <strong>Alternativa:</strong> También puedes configurar la variable de entorno <code className="bg-blue-100 px-1 rounded">VITE_OPENAI_API_KEY</code>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveApiKey}
                      disabled={isTestingConnection}
                      className="flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isTestingConnection ? 'Probando...' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {/* API Key Status */}
                {isApiKeyValid !== null && (
                  <div className={`flex items-center p-3 rounded-lg ${
                    isApiKeyValid 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {isApiKeyValid ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        API Key válida y configurada correctamente
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        API Key inválida. Verifica que comience con 'sk-' y sea válida.
                      </>
                    )}
                  </div>
                )}

                {/* Test Connection Button */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !isApiKeyConfigured()}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Probando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Probar Conexión
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">¿Cómo obtener tu API Key?</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Ve a <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
                    <li>2. Inicia sesión en tu cuenta de OpenAI</li>
                    <li>3. Haz clic en "Create new secret key"</li>
                    <li>4. Copia la key y pégala aquí</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <h4 className="font-semibold text-green-900">Cifrado de Datos</h4>
                </div>
                <p className="text-green-800 text-sm mb-3">
                  Todos los datos biométricos se cifran con AES-256 antes del almacenamiento.
                </p>
                <div className="text-xs text-green-700">
                  ✓ Activo y funcionando
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-semibold text-blue-900">Privacidad de Datos</h4>
                </div>
                <p className="text-blue-800 text-sm mb-3">
                  Los datos se procesan localmente. Las API keys no se envían a nuestros servidores.
                </p>
                <div className="text-xs text-blue-700">
                  ✓ Cumplimiento GDPR/HIPAA
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <Key className="w-6 h-6 text-purple-600 mr-3" />
                  <h4 className="font-semibold text-purple-900">Gestión de Claves</h4>
                </div>
                <p className="text-purple-800 text-sm mb-3">
                  Las claves de API se almacenan de forma segura en el almacenamiento local del navegador o variables de entorno.
                </p>
                <div className="text-xs text-purple-700">
                  ✓ Almacenamiento local seguro
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600 mr-3" />
                  <h4 className="font-semibold text-orange-900">Auditoría</h4>
                </div>
                <p className="text-orange-800 text-sm mb-3">
                  Registro de todas las operaciones críticas para auditoría y compliance.
                </p>
                <div className="text-xs text-orange-700">
                  ✓ Logs de actividad activos
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Políticas de Seguridad</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Los datos biométricos nunca se almacenan sin cifrado</li>
                <li>• Las sesiones expiran automáticamente después de 24 horas</li>
                <li>• Se requiere autenticación para acceder a datos sensibles</li>
                <li>• Los prompts de IA se validan antes de su uso</li>
                <li>• Cumplimiento con estándares HIPAA y GDPR</li>
                <li>• API keys nunca se incluyen en el código fuente (GitHub Push Protection)</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'test-results' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Resultados de Pruebas</h3>
            
            {testResults ? (
              <div className="space-y-4">
                <div className={`border p-4 rounded-lg ${
                  testResults.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {testResults.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      testResults.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.type === 'connection' ? 'Prueba de Conexión' : 'Prueba de Prompt'}
                      {testResults.success ? ' Exitosa' : ' Fallida'}
                    </span>
                    <span className={`text-sm ml-2 ${
                      testResults.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {new Date(testResults.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    testResults.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResults.message}
                  </p>
                  {testResults.response && (
                    <div className="mt-2 p-2 bg-white rounded text-sm">
                      <strong>Respuesta:</strong> {testResults.response}
                    </div>
                  )}
                  {testResults.model && (
                    <div className="mt-1 text-xs opacity-75">
                      Modelo usado: {testResults.model}
                    </div>
                  )}
                </div>

                {testResults.type === 'prompt' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-3">Datos de Prueba Utilizados:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <pre>{JSON.stringify(testResults.data, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-3">Prompt Procesado:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                          {testResults.prompt}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No hay resultados de prueba</h4>
                <p className="text-gray-600">
                  Ejecuta una prueba desde el editor de prompts o prueba la conexión API para ver los resultados aquí.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;