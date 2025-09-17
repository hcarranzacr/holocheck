import React, { useState } from 'react';
import { Bot, Calendar, Download, Share2, Copy, CheckCircle, AlertTriangle, User, Building, Shield, Sparkles } from 'lucide-react';

const AIResponse = ({ response, isLoading = false, error = null }) => {
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (response?.analysis) {
      try {
        await navigator.clipboard.writeText(response.analysis);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Handle export to PDF (placeholder)
  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    alert('Función de exportación PDF próximamente disponible');
  };

  // Handle share (placeholder)
  const handleShare = () => {
    // TODO: Implement share functionality
    alert('Función de compartir próximamente disponible');
  };

  // Get icon and color based on analysis type
  const getTypeConfig = (type) => {
    switch (type) {
      case 'personal':
        return { icon: User, color: 'blue', label: 'Análisis Personal' };
      case 'company':
        return { icon: Building, color: 'green', label: 'Análisis Empresarial' };
      case 'insurance':
        return { icon: Shield, color: 'purple', label: 'Análisis Actuarial' };
      default:
        return { icon: Bot, color: 'gray', label: 'Análisis IA' };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-blue-800">
            <div className="font-semibold">🤖 Analizando con IA...</div>
            <div className="text-sm text-blue-600">Procesando datos biométricos</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-blue-200 rounded animate-pulse"></div>
          <div className="h-4 bg-blue-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (response && !response.success)) {
    const errorMessage = error || response?.error || 'Error desconocido';
    
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="font-semibold text-red-900">Error en el Análisis IA</h3>
            <p className="text-red-700 text-sm mt-1">No se pudo completar el análisis</p>
          </div>
        </div>
        
        <div className="bg-red-100 p-3 rounded text-sm text-red-800 mb-4">
          <strong>Error:</strong> {errorMessage}
        </div>
        
        <div className="text-sm text-red-700">
          <p><strong>Posibles soluciones:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verifica que la API key de OpenAI sea válida</li>
            <li>Comprueba tu conexión a internet</li>
            <li>Revisa la configuración de prompts</li>
            <li>Intenta nuevamente en unos momentos</li>
          </ul>
        </div>
      </div>
    );
  }

  // No response state
  if (!response) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Análisis IA</h3>
        <p className="text-gray-600">
          Realiza un análisis biométrico para obtener recomendaciones de inteligencia artificial
        </p>
      </div>
    );
  }

  const typeConfig = getTypeConfig(response.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className={`bg-gradient-to-r from-${typeConfig.color}-50 to-${typeConfig.color}-100 rounded-lg border border-${typeConfig.color}-200 shadow-lg`}>
      {/* Header */}
      <div className={`bg-${typeConfig.color}-600 text-white p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`bg-${typeConfig.color}-500 p-2 rounded-lg mr-3`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {typeConfig.label}
              </h3>
              <div className="flex items-center text-sm opacity-90">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(response.timestamp).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
          
          {/* Success indicator */}
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span className="ml-2 text-sm">Análisis Completado</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Analysis Content */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {response.analysis}
            </div>
          </div>
        </div>

        {/* Metadata */}
        {response.usage && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Información del Análisis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Modelo:</span>
                <div className="font-medium">{response.model || 'GPT-4'}</div>
              </div>
              <div>
                <span className="text-gray-600">Tokens usados:</span>
                <div className="font-medium">{response.usage.total_tokens || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Tipo de prompt:</span>
                <div className="font-medium capitalize">{response.promptType}</div>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <div className="font-medium text-green-600">Exitoso</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopy}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : `bg-${typeConfig.color}-600 hover:bg-${typeConfig.color}-700 text-white`
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Análisis
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </button>

          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;