import React, { useState } from 'react';
import { Shield, Camera, Mic, Database, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ConsentManager = ({ onConsentGranted, onConsentDenied }) => {
  const [consents, setConsents] = useState({
    video_capture: false,
    audio_capture: false,
    biometric_analysis: false,
    data_storage: false,
    ai_analysis: false
  });

  const [showDetails, setShowDetails] = useState({});

  const consentOptions = [
    {
      id: 'video_capture',
      title: 'Captura de Video',
      icon: Camera,
      description: 'Acceso a tu cámara para análisis de pulso cardíaco mediante rPPG (fotopletismografía remota)',
      details: 'Utilizamos tu cámara para detectar cambios sutiles en el color de tu piel que corresponden a tu pulso cardíaco. Este análisis se realiza localmente en tu dispositivo.',
      required: true,
      risks: 'Bajo - Solo se analiza tu rostro para detectar señales cardiovasculares',
      dataProcessed: 'Frames de video de tu rostro, píxeles de piel, señales RGB'
    },
    {
      id: 'audio_capture',
      title: 'Captura de Audio',
      icon: Mic,
      description: 'Acceso a tu micrófono para análisis de voz y patrones respiratorios',
      details: 'Analizamos tu voz para detectar indicadores de estrés, calidad vocal y patrones respiratorios que pueden indicar tu estado de salud.',
      required: true,
      risks: 'Bajo - Solo se analiza la calidad y características de tu voz',
      dataProcessed: 'Grabación de voz, frecuencias, patrones respiratorios'
    },
    {
      id: 'biometric_analysis',
      title: 'Análisis Biométrico',
      icon: Shield,
      description: 'Procesamiento de datos biométricos para generar métricas de salud',
      details: 'Combinamos los datos de video y audio para calcular métricas como frecuencia cardíaca, variabilidad cardíaca, estrés vocal y patrones respiratorios.',
      required: true,
      risks: 'Bajo - Análisis matemático de señales biológicas',
      dataProcessed: 'Métricas calculadas, tendencias, indicadores de salud'
    },
    {
      id: 'ai_analysis',
      title: 'Análisis con IA',
      icon: FileText,
      description: 'Envío de métricas biométricas a OpenAI para generar recomendaciones personalizadas',
      details: 'Tus métricas biométricas (sin video ni audio) se envían a OpenAI GPT-4 para generar recomendaciones de salud personalizadas.',
      required: false,
      risks: 'Medio - Datos enviados a servicio externo (OpenAI)',
      dataProcessed: 'Métricas numéricas, edad, género, recomendaciones generadas'
    },
    {
      id: 'data_storage',
      title: 'Almacenamiento Local',
      icon: Database,
      description: 'Guardar resultados en el almacenamiento local de tu navegador',
      details: 'Los resultados de tus análisis se guardan localmente en tu navegador para que puedas ver tu historial y tendencias.',
      required: false,
      risks: 'Muy bajo - Datos almacenados solo en tu dispositivo',
      dataProcessed: 'Resultados de análisis, historial, tendencias personales'
    }
  ];

  const handleConsentChange = (id, value) => {
    setConsents(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const toggleDetails = (id) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const canProceed = () => {
    const requiredConsents = consentOptions.filter(option => option.required);
    return requiredConsents.every(option => consents[option.id]);
  };

  const handleProceed = () => {
    try {
      if (canProceed() && typeof onConsentGranted === 'function') {
        onConsentGranted(consents);
      }
    } catch (error) {
      console.error('Error in handleProceed:', error);
      // Fallback: just log the error and continue
    }
  };

  const handleDeny = () => {
    try {
      if (typeof onConsentDenied === 'function') {
        onConsentDenied();
      }
    } catch (error) {
      console.error('Error in handleDeny:', error);
      // Fallback: just log the error
    }
  };

  const getConsentSummary = () => {
    const granted = Object.values(consents).filter(Boolean).length;
    const total = consentOptions.length;
    return { granted, total };
  };

  const summary = getConsentSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consentimiento Informado</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Para realizar el análisis biométrico, necesitamos tu consentimiento explícito para cada tipo de procesamiento de datos.
            Lee cuidadosamente cada opción y otorga solo los permisos con los que te sientes cómodo.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Permisos Otorgados</span>
            <span className="text-sm text-gray-600">{summary.granted} de {summary.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(summary.granted / summary.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Consent Options */}
        <div className="space-y-4 mb-8">
          {consentOptions.map((option) => {
            const Icon = option.icon;
            const isGranted = consents[option.id];
            const showDetail = showDetails[option.id];

            return (
              <div key={option.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      isGranted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${isGranted ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                          {option.required && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Requerido
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleDetails(option.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {showDetail ? 'Ocultar detalles' : 'Ver detalles'}
                          </button>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={(e) => handleConsentChange(option.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      
                      {showDetail && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Detalles del Procesamiento:</h4>
                            <p className="text-sm text-gray-600">{option.details}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Datos Procesados:</h4>
                            <p className="text-sm text-gray-600">{option.dataProcessed}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Nivel de Riesgo:</h4>
                            <p className="text-sm text-gray-600">{option.risks}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Puedes revocar estos consentimientos en cualquier momento</li>
                <li>• Los datos de video y audio se procesan localmente en tu dispositivo</li>
                <li>• Solo las métricas numéricas se envían a OpenAI (si autorizas el análisis con IA)</li>
                <li>• Nunca almacenamos ni transmitimos tus grabaciones de video o audio</li>
                <li>• Este análisis es informativo y no reemplaza la consulta médica profesional</li>
                <li>• Cumplimos con las regulaciones GDPR y HIPAA de protección de datos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning for required consents */}
        {!canProceed() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Debes otorgar todos los permisos requeridos para continuar con el análisis biométrico.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDeny}
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            No Continuar
          </button>
          
          <button
            onClick={handleProceed}
            disabled={!canProceed()}
            className={`px-8 py-3 font-medium rounded-lg transition-colors ${
              canProceed()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canProceed() ? (
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Continuar con Análisis
              </span>
            ) : (
              'Otorga Permisos Requeridos'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Al continuar, confirmas que has leído y entendido cómo se procesarán tus datos.
            <br />
            Para más información, consulta nuestra política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;