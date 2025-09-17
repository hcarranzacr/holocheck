import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Eye, Download, Upload, CheckCircle, AlertTriangle, Play, Copy } from 'lucide-react';
import { promptManager } from '../services/openaiPrompts';

const PromptEditor = ({ type, onSave, onTest }) => {
  const [prompt, setPrompt] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [testData, setTestData] = useState({});

  // Cargar prompt al montar o cambiar tipo
  useEffect(() => {
    const loadedPrompt = promptManager.getPrompt(type);
    setPrompt(loadedPrompt);
    setEditedPrompt(loadedPrompt?.prompt || '');
    
    // Inicializar datos de prueba
    const initialTestData = {};
    loadedPrompt?.variables.forEach(variable => {
      initialTestData[variable] = `[Ejemplo ${variable}]`;
    });
    setTestData(initialTestData);
  }, [type]);

  // Validar prompt cuando cambie
  useEffect(() => {
    if (prompt && editedPrompt) {
      const result = promptManager.validatePrompt(editedPrompt, prompt.variables);
      setValidation(result);
    }
  }, [editedPrompt, prompt]);

  // Guardar prompt
  const handleSave = async () => {
    if (!validation.isValid) return;
    
    setIsSaving(true);
    try {
      const success = promptManager.updatePrompt(type, { prompt: editedPrompt });
      if (success) {
        setSaveStatus('success');
        if (onSave) onSave(type, editedPrompt);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    }
    setIsSaving(false);
    
    // Limpiar estado después de 3 segundos
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Restaurar a default
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar este prompt a su configuración original?')) {
      promptManager.resetPrompt(type);
      const resetPrompt = promptManager.getPrompt(type);
      setPrompt(resetPrompt);
      setEditedPrompt(resetPrompt.prompt);
    }
  };

  // Probar prompt
  const handleTest = () => {
    if (!validation.isValid) return;
    
    try {
      const processedPrompt = promptManager.processPrompt(type, testData);
      if (onTest) {
        onTest(processedPrompt, testData);
      } else {
        // Mostrar en modal o nueva ventana
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head><title>Vista Previa del Prompt - ${prompt.name}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
              <h1>Vista Previa del Prompt</h1>
              <h2>${prompt.name}</h2>
              <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${processedPrompt}</pre>
            </body>
          </html>
        `);
      }
    } catch (error) {
      alert('Error al procesar el prompt: ' + error.message);
    }
  };

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPrompt);
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Exportar prompt
  const handleExport = () => {
    const exportData = {
      type,
      prompt: { ...prompt, prompt: editedPrompt },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holocheck-prompt-${type}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importar prompt
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        if (importData.prompt && importData.type === type) {
          setEditedPrompt(importData.prompt.prompt);
        } else {
          alert('Archivo de prompt inválido o tipo incorrecto');
        }
      } catch (error) {
        alert('Error al leer el archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  if (!prompt) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{prompt.name}</h3>
          <p className="text-gray-600 mt-1">{prompt.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Status indicator */}
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Guardado
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Error
            </div>
          )}
          {saveStatus === 'copied' && (
            <div className="flex items-center text-blue-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Copiado
            </div>
          )}
        </div>
      </div>

      {/* Variables disponibles */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Variables Disponibles:</h4>
        <div className="flex flex-wrap gap-2">
          {prompt.variables.map(variable => (
            <span key={variable} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
              {`{${variable}}`}
            </span>
          ))}
        </div>
      </div>

      {/* Validation errors */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Errores de Validación:
          </h4>
          <ul className="text-red-800 text-sm space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Editor de Prompt</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              {isPreviewMode ? 'Editor' : 'Vista Previa'}
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {editedPrompt}
            </pre>
          </div>
        ) : (
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu prompt aquí..."
          />
        )}
      </div>

      {/* Test Data */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Datos de Prueba</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompt.variables.map(variable => (
            <div key={variable}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {variable}
              </label>
              <input
                type="text"
                value={testData[variable] || ''}
                onChange={(e) => setTestData(prev => ({ ...prev, [variable]: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Valor para {${variable}}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>

        <button
          onClick={handleTest}
          disabled={!validation.isValid}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 mr-2" />
          Probar
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar
        </button>

        <button
          onClick={handleReset}
          className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar
        </button>

        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </button>

        <label className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          Importar
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default PromptEditor;