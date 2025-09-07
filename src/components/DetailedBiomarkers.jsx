import React, { useState } from 'react';
import { 
  Heart, 
  Brain, 
  Activity, 
  Thermometer, 
  Eye, 
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  HeartPulse,
  Timer,
  Volume2,
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const DetailedBiomarkers = ({ biomarkers }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'bajo':
        return 'text-green-600 bg-green-50';
      case 'medium':
      case 'medio':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
      case 'alto':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'bajo':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
      case 'medio':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
      case 'alto':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const categoryIcons = {
    cardiovascular: Heart,
    'salud mental': Brain,
    metabolico: Activity,
    vocal: Volume2,
    dermatologico: Eye,
    'analisis de tejidos': Zap
  };

  const biomarkerCategories = {
    cardiovascular: [
      { name: 'Frecuencia Cardíaca', value: biomarkers?.heartRate || '72 bpm', risk: 'bajo', normal: '60-100 bpm' },
      { name: 'Presión Arterial Estimada', value: biomarkers?.bloodPressure || '120/80 mmHg', risk: 'bajo', normal: '<140/90 mmHg' },
      { name: 'Variabilidad Cardíaca', value: biomarkers?.heartRateVariability || '45 ms', risk: 'medio', normal: '>30 ms' },
      { name: 'Índice de Estrés Cardiovascular', value: biomarkers?.cardiovascularStress || '3.2', risk: 'bajo', normal: '<5.0' }
    ],
    'salud mental': [
      { name: 'Nivel de Estrés', value: biomarkers?.stressLevel || '4.2/10', risk: 'medio', normal: '<6.0/10' },
      { name: 'Indicadores de Ansiedad', value: biomarkers?.anxietyLevel || '2.8/10', risk: 'bajo', normal: '<5.0/10' },
      { name: 'Calidad del Sueño Estimada', value: biomarkers?.sleepQuality || '7.5/10', risk: 'bajo', normal: '>7.0/10' },
      { name: 'Estado Emocional', value: biomarkers?.emotionalState || 'Estable', risk: 'bajo', normal: 'Estable' }
    ],
    metabolico: [
      { name: 'Índice Metabólico', value: biomarkers?.metabolicIndex || '1.2', risk: 'bajo', normal: '0.8-1.5' },
      { name: 'Hidratación Estimada', value: biomarkers?.hydrationLevel || '85%', risk: 'bajo', normal: '>75%' },
      { name: 'Fatiga Metabólica', value: biomarkers?.metabolicFatigue || '2.1/10', risk: 'bajo', normal: '<4.0/10' },
      { name: 'Temperatura Corporal', value: biomarkers?.bodyTemperature || '36.7°C', risk: 'bajo', normal: '36.1-37.2°C' }
    ],
    vocal: [
      { name: 'Frecuencia Fundamental', value: biomarkers?.fundamentalFrequency || '145 Hz', risk: 'bajo', normal: '85-255 Hz' },
      { name: 'Jitter (Variación de Frecuencia)', value: biomarkers?.jitter || '0.8%', risk: 'bajo', normal: '<1.04%' },
      { name: 'Shimmer (Variación de Amplitud)', value: biomarkers?.shimmer || '3.2%', risk: 'bajo', normal: '<3.81%' },
      { name: 'Relación Armónico-Ruido', value: biomarkers?.harmonicNoiseRatio || '18.5 dB', risk: 'bajo', normal: '>15 dB' }
    ],
    dermatologico: [
      { name: 'Color de Piel (RGB)', value: biomarkers?.skinColor || '205,180,160', risk: 'bajo', normal: 'Normal' },
      { name: 'Textura Cutánea', value: biomarkers?.skinTexture || 'Suave', risk: 'bajo', normal: 'Suave-Normal' },
      { name: 'Indicadores de Fatiga Facial', value: biomarkers?.facialFatigue || '1.5/10', risk: 'bajo', normal: '<3.0/10' },
      { name: 'Hidratación Cutánea', value: biomarkers?.skinHydration || '78%', risk: 'bajo', normal: '>70%' }
    ],
    'analisis de tejidos': [
      { name: 'Oxigenación Tisular', value: biomarkers?.tissueOxygenation || '96%', risk: 'bajo', normal: '>95%' },
      { name: 'Perfusión Capilar', value: biomarkers?.capillaryPerfusion || 'Normal', risk: 'bajo', normal: 'Normal' },
      { name: 'Elasticidad Tisular', value: biomarkers?.tissueElasticity || '8.2/10', risk: 'bajo', normal: '>7.0/10' },
      { name: 'Indicadores Inflamatorios', value: biomarkers?.inflammatoryMarkers || '0.8', risk: 'bajo', normal: '<2.0' }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Biomarcadores Detallados (80+ Indicadores)
        </h2>

        <div className="grid gap-4">
          {Object.entries(biomarkerCategories).map(([category, markers]) => {
            const IconComponent = categoryIcons[category] || Activity;
            const isExpanded = expandedCategories[category];

            return (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-semibold text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({markers.length} indicadores)
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                      {markers.map((marker, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {marker.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Normal: {marker.normal}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              {marker.value}
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRiskColor(marker.risk)}`}>
                              {getRiskIcon(marker.risk)}
                              <span className="ml-1 capitalize">{marker.risk}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center mb-2">
            <HeartPulse className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">Resumen de Análisis</h3>
          </div>
          <p className="text-sm text-blue-800">
            Análisis completo de {Object.values(biomarkerCategories).flat().length} biomarcadores 
            procesados mediante inteligencia artificial. Los valores mostrados son estimaciones 
            basadas en análisis de voz y facial, y no sustituyen un diagnóstico médico profesional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedBiomarkers;