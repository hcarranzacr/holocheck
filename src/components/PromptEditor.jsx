import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  User,
  Building,
  Shield,
  Copy,
  Download
} from 'lucide-react';

const PromptEditor = () => {
  const [activePrompt, setActivePrompt] = useState('personal');
  const [prompts, setPrompts] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationStatus, setValidationStatus] = useState('valid');

  // Prompts por defecto
  const defaultPrompts = {
    personal: {
      title: "Análisis Personal de Biomarcadores",
      icon: User,
      color: "blue",
      content: `Eres un asistente médico especializado en análisis de biomarcadores personales. Tu tarea es evaluar los datos biométricos individuales y proporcionar recomendaciones personalizadas de salud.

INSTRUCCIONES:
1. Analiza los siguientes biomarcadores del usuario:
   - Frecuencia cardíaca y variabilidad
   - Presión arterial estimada
   - Saturación de oxígeno
   - Indicadores de estrés
   - Patrones respiratorios
   - Análisis de voz (si disponible)

2. Proporciona un análisis personalizado que incluya:
   - Estado de salud actual basado en biomarcadores
   - Identificación de patrones anómalos o preocupantes
   - Recomendaciones específicas de estilo de vida
   - Sugerencias de seguimiento médico si es necesario
   - Tendencias de salud a lo largo del tiempo

3. Formato de respuesta:
   - Resumen ejecutivo (2-3 líneas)
   - Análisis detallado por biomarcador
   - Recomendaciones priorizadas
   - Alertas de salud (si aplican)
   - Próximos pasos sugeridos

TONO: Profesional, empático y educativo
CONFIDENCIALIDAD: Mantén estricta confidencialidad de datos personales
LIMITACIONES: Recuerda que este análisis no reemplaza consulta médica profesional`
    },
    empresa: {
      title: "Análisis Somatizado y Anónimo por Empresa",
      icon: Building,
      color: "green",
      content: `Eres un analista de salud ocupacional especializado en evaluaciones agregadas y anonimizadas de empresas para aseguradoras. Tu función es analizar datos poblacionales de salud empresarial.

INSTRUCCIONES:
1. Procesa datos agregados y anonimizados de:
   - Métricas de salud poblacional por departamento/área
   - Indicadores de estrés laboral colectivos
   - Patrones de salud cardiovascular grupales
   - Tendencias de bienestar organizacional
   - Factores de riesgo ocupacional

2. Genera análisis somatizado que incluya:
   - Perfil de salud general de la organización
   - Identificación de áreas de riesgo elevado
   - Comparación con benchmarks industriales
   - Indicadores de productividad relacionados con salud
   - Recomendaciones de programas de bienestar

3. Estructura del reporte:
   - Resumen ejecutivo para aseguradoras
   - Métricas clave de salud organizacional
   - Análisis de riesgo por categorías
   - Recomendaciones de intervención
   - Proyecciones de tendencias

PRINCIPIOS:
- ANONIMIZACIÓN TOTAL: Ningún dato individual identificable
- AGREGACIÓN: Solo estadísticas poblacionales
- COMPLIANCE: Cumplimiento total con regulaciones de privacidad
- OBJETIVIDAD: Análisis basado en evidencia estadística`
    },
    aseguradora: {
      title: "Análisis para Aseguradoras",
      icon: Shield,
      color: "purple",
      content: `Eres un actuario especializado en análisis de riesgo para seguros de salud. Tu objetivo es evaluar datos poblacionales para pricing, suscripción y gestión de riesgos.

INSTRUCCIONES:
1. Analiza métricas actuariales de:
   - Distribución de riesgos de salud poblacional
   - Indicadores predictivos de siniestralidad
   - Factores de riesgo cardiovascular agregados
   - Patrones de utilización de servicios de salud
   - Tendencias demográficas y de salud

2. Genera evaluación actuarial que incluya:
   - Perfil de riesgo de la población asegurada
   - Probabilidades de eventos de salud mayores
   - Recomendaciones de pricing basadas en riesgo
   - Identificación de segmentos de alto/bajo riesgo
   - Estrategias de mitigación de riesgo

3. Deliverables para aseguradoras:
   - Score de riesgo poblacional (1-100)
   - Análisis de siniestralidad esperada
   - Recomendaciones de underwriting
   - Programas de prevención sugeridos
   - Modelos predictivos de costos

4. Métricas clave:
   - Loss Ratio proyectado
   - Frequency y Severity de claims
   - Risk-adjusted pricing recommendations
   - Population health trends
   - Preventive care ROI analysis

ESTÁNDARES:
- ACTUARIAL RIGOR: Metodologías estadísticas robustas
- REGULATORY COMPLIANCE: Cumplimiento normativo total
- PREDICTIVE ACCURACY: Modelos validados y calibrados
- BUSINESS VALUE: Insights accionables para decisiones comerciales`
    }
  };

  // Cargar prompts desde localStorage al inicializar
  useEffect(() => {
    const savedPrompts = localStorage.getItem('holocheck-prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        setPrompts(parsed);
      } catch (error) {
        console.error('Error loading saved prompts:', error);
        setPrompts(defaultPrompts);
      }
    } else {
      setPrompts(defaultPrompts);
    }
  }, []);

  // Guardar prompts en localStorage
  const savePrompts = () => {
    try {
      localStorage.setItem('holocheck-prompts', JSON.stringify(prompts));
      setHasChanges(false);
      setValidationStatus('saved');
      setTimeout(() => setValidationStatus('valid'), 2000);
    } catch (error) {
      console.error('Error saving prompts:', error);
      setValidationStatus('error');
    }
  };

  // Restaurar prompts por defecto
  const restoreDefaults = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar los prompts por defecto? Se perderán todos los cambios.')) {
      setPrompts(defaultPrompts);
      setHasChanges(true);
      setValidationStatus('restored');
      setTimeout(() => setValidationStatus('valid'), 2000);
    }
  };

  // Actualizar contenido del prompt
  const updatePromptContent = (content) => {
    setPrompts(prev => ({
      ...prev,
      [activePrompt]: {
        ...prev[activePrompt],
        content
      }
    }));
    setHasChanges(true);
    setValidationStatus('modified');
  };

  // Copiar prompt al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompts[activePrompt]?.content || '');
      setValidationStatus('copied');
      setTimeout(() => setValidationStatus('valid'), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Exportar prompts
  const exportPrompts = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'holocheck-prompts.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const promptTypes = [
    { id: 'personal', label: 'Personal', icon: User, color: 'blue' },
    { id: 'empresa', label: 'Empresarial', icon: Building, color: 'green' },
    { id: 'aseguradora', label: 'Aseguradoras', icon: Shield, color: 'purple' }
  ];

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'saved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'modified': return <Edit className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'copied': return <Copy className="w-4 h-4 text-blue-600" />;
      case 'restored': return <RotateCcw className="w-4 h-4 text-purple-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (validationStatus) {
      case 'saved': return 'Prompts guardados exitosamente';
      case 'modified': return 'Cambios pendientes de guardar';
      case 'error': return 'Error al guardar prompts';
      case 'copied': return 'Prompt copiado al portapapeles';
      case 'restored': return 'Prompts restaurados por defecto';
      default: return 'Prompts sincronizados';
    }
  };

  const currentPrompt = prompts[activePrompt] || defaultPrompts[activePrompt];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Edit className="w-6 h-6 text-purple-600 mr-3" />
            Editor de Prompts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configura los prompts para análisis de biomarcadores en los tres pilares de HoloCheck
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-600">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Prompt Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Análisis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promptTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activePrompt === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setActivePrompt(type.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${isActive 
                    ? `border-${type.color}-500 bg-${type.color}-50` 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`
                    w-6 h-6 
                    ${isActive ? `text-${type.color}-600` : 'text-gray-400'}
                  `} />
                  <div>
                    <h4 className={`
                      font-medium 
                      ${isActive ? `text-${type.color}-900` : 'text-gray-900'}
                    `}>
                      {type.label}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentPrompt?.title || defaultPrompts[type.id]?.title}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentPrompt?.title}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </button>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Vista Previa</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <textarea
            value={currentPrompt?.content || ''}
            onChange={(e) => updatePromptContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu prompt aquí..."
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex space-x-3">
            <button
              onClick={savePrompts}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
            
            <button
              onClick={restoreDefaults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar</span>
            </button>
          </div>

          <button
            onClick={exportPrompts}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Vista Previa: {currentPrompt?.title}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {currentPrompt?.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Guías de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📊 Análisis Personal</h4>
            <p className="text-blue-700">
              Para evaluaciones individuales detalladas con recomendaciones personalizadas de salud.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🏢 Análisis Empresarial</h4>
            <p className="text-blue-700">
              Para datos agregados y anonimizados de organizaciones, enfocado en salud ocupacional.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🛡️ Análisis Actuarial</h4>
            <p className="text-blue-700">
              Para evaluaciones de riesgo y pricing de seguros basado en datos poblacionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;