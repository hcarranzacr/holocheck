import React, { useState } from 'react';
import { FileText, Heart, Mic, BarChart3, Users, Shield, ChevronDown, ChevronRight, ExternalLink, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

const MedicalDocumentation = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedStudy, setSelectedStudy] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const studies = [
    {
      id: 'rppg-review',
      title: 'Remote Photoplethysmography & Deep Learning',
      authors: 'Debnath & Kim (2025)',
      journal: 'BioMedical Engineering OnLine',
      impact: 'Comprehensive review of 145 articles',
      category: 'Cardiovascular',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      summary: 'Revisión exhaustiva de métodos rPPG para medición de frecuencia cardíaca usando cámaras RGB y deep learning.',
      keyFindings: [
        'MAE: 0.82-3.41 BPM en condiciones controladas',
        'Correlación Pearson: r = 0.72-0.99',
        'Deep learning supera métodos tradicionales',
        'Time-weighted analysis mejora precisión',
        'Validación en 145 estudios independientes'
      ],
      biomarkers: [
        'Heart Rate (HR): 45-240 BPM',
        'Heart Rate Variability (HRV)',
        'Blood Volume Pulse (BVP)',
        'Pulse Transit Time (PTT)',
        'Respiratory Rate: 12-30/min',
        'SpO2 estimation',
        'Stress Index',
        'Cardiovascular Risk Score'
      ],
      methodology: 'ICA, CHROM, POS algorithms; CNN, Transformer networks; Multi-dataset validation',
      applications: 'Telemedicine, fitness tracking, clinical monitoring, occupational health'
    },
    {
      id: 'vocal-biomarkers',
      title: 'Mental Fitness Vocal Biomarkers',
      authors: 'Larsen et al. (2024)',
      journal: 'Frontiers in Psychiatry',
      impact: '104 participants, 4-week longitudinal study',
      category: 'Mental Health',
      icon: Mic,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      summary: 'Validación de biomarcadores vocales para evaluación de salud mental en población psiquiátrica ambulatoria.',
      keyFindings: [
        'Risk Ratio: 1.53-2.00 para síntomas elevados',
        '70% retención a 4 semanas',
        '81% satisfacción de usuarios',
        'Correlación significativa con M3 Checklist',
        'Mejora con observación continua'
      ],
      biomarkers: [
        'Mental Fitness Score (0-100)',
        'Depression Risk Indicators',
        'Anxiety Level Markers',
        'PTSD Voice Patterns',
        'Stress Vocal Indicators',
        'Jitter & Shimmer (4.9-7.8%)',
        'Pitch Variability (0.15-0.28 octaves)',
        'Speech Rate (75-125 words/min)',
        'Pause Duration (0.31-0.61 sec)'
      ],
      methodology: 'MFVB algorithm, 8 vocal features, time-weighted analysis, M3 Checklist validation',
      applications: 'Mental health screening, therapy support, occupational wellness, insurance underwriting'
    }
  ];

  const technicalSpecs = {
    rppg: {
      title: 'Especificaciones Técnicas rPPG',
      requirements: [
        'Iluminación: 150+ lux (óptimo 300+ lux)',
        'Distancia: 0.5-1.5 metros',
        'Resolución: Mínimo 480p (preferible 720p+)',
        'Frame rate: 25-30 fps',
        'Duración: 30-60 segundos',
        'Movimiento: Sujeto estático'
      ],
      algorithms: [
        'ICA (Independent Component Analysis)',
        'CHROM (Chrominance-based)',
        'POS (Plane Orthogonal to Skin)',
        'CNN 3D (Convolutional Neural Networks)',
        'PhysFormer (Transformer-based)'
      ],
      accuracy: [
        'Condiciones controladas: >95%',
        'Condiciones reales: 85-92%',
        'Cross-dataset: MAE 2.84-5.36 BPM',
        'Clinical correlation: r = 0.72-0.99'
      ]
    },
    voice: {
      title: 'Especificaciones Técnicas Voz',
      requirements: [
        'Duración: 10-20 segundos',
        'Calidad audio: 16kHz, 16-bit mínimo',
        'Ruido ambiente: <40dB',
        'Micrófono: Smartphone estándar',
        'Idioma: Español/Inglés validado',
        'Tipo: Lectura guiada o habla natural'
      ],
      features: [
        'Fundamental Frequency (F0)',
        'Jitter & Shimmer',
        'Harmonic-to-Noise Ratio',
        'MFCC (Mel-frequency cepstral)',
        'Formants (F1, F2, F3)',
        'Spectral features',
        'Prosodic patterns',
        'Pause analysis'
      ],
      validation: [
        'Risk Ratio: 1.53 (single) - 2.00 (time-weighted)',
        'Engagement: 70% retention week 4',
        'Satisfaction: 81% user approval',
        'Clinical correlation: M3 Checklist validated'
      ]
    }
  };

  const clinicalProtocols = [
    {
      title: 'Protocolos de Derivación',
      icon: AlertTriangle,
      color: 'text-orange-600',
      items: [
        'HR >100 o <50 BPM sostenido → Evaluación cardiológica',
        'MFVB <40 o síntomas severos → Apoyo psicológico',
        'Patrones respiratorios anómalos → Chequeo pulmonar',
        'Múltiples marcadores críticos → Evaluación médica urgente',
        'Tendencias negativas >2 semanas → Seguimiento médico'
      ]
    },
    {
      title: 'Limitaciones Clínicas',
      icon: Shield,
      color: 'text-blue-600',
      items: [
        'No es diagnóstico médico - screening preventivo únicamente',
        'Complemento a evaluación médica tradicional',
        'Requiere validación con gold standard',
        'Sensible a condiciones de captura',
        'Exclusiones por medicamentos específicos'
      ]
    },
    {
      title: 'Consideraciones Éticas',
      icon: Users,
      color: 'text-green-600',
      items: [
        'Consentimiento informado obligatorio',
        'Privacidad y protección de datos',
        'No discriminación por resultados',
        'Transparencia en algoritmos',
        'Derecho a rectificación y eliminación'
      ]
    }
  ];

  const implementationPhases = [
    {
      phase: 'Fase 0: Preparación (4-8 semanas)',
      activities: [
        'Convenios marco con aseguradoras',
        'ETL de datos abiertos epidemiológicos',
        'MVP técnico: captura + análisis',
        'Políticas de cumplimiento legal'
      ]
    },
    {
      phase: 'Fase 1: Piloto Controlado (8-12 semanas)',
      activities: [
        'Despliegue en 2 empresas piloto',
        'KPIs: participación ≥65%, NPS ≥60',
        'Validación clínica vs gold standard',
        'Ensayo actuarial inicial'
      ]
    },
    {
      phase: 'Fase 2: Escalamiento (12-16 semanas)',
      activities: [
        'Expansión multi-país',
        'Integración telemedicina',
        'Aprendizaje federado regional',
        'Productos preventivos'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Documentación Médica Científica
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Evidencia científica y validación clínica del análisis biométrico mediante rPPG y biomarcadores vocales
          </p>
        </div>

        {/* Studies Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {studies.map((study) => {
            const IconComponent = study.icon;
            return (
              <div
                key={study.id}
                className={`${study.bgColor} ${study.borderColor} border-2 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => setSelectedStudy(selectedStudy === study.id ? null : study.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <IconComponent className={`w-8 h-8 ${study.color} mr-3`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{study.title}</h3>
                      <p className="text-sm text-gray-600">{study.authors}</p>
                    </div>
                  </div>
                  {selectedStudy === study.id ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${study.color} ${study.bgColor} border ${study.borderColor}`}>
                    {study.category}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">{study.impact}</span>
                </div>

                <p className="text-gray-700 mb-4">{study.summary}</p>

                {selectedStudy === study.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Hallazgos Clave:</h4>
                      <ul className="space-y-1">
                        {study.keyFindings.map((finding, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Biomarcadores:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {study.biomarkers.map((marker, idx) => (
                          <div key={idx} className="text-sm text-gray-700 bg-white bg-opacity-50 rounded px-2 py-1">
                            {marker}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Metodología:</h4>
                      <p className="text-sm text-gray-700">{study.methodology}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Aplicaciones:</h4>
                      <p className="text-sm text-gray-700">{study.applications}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Technical Specifications */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
            Especificaciones Técnicas
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(technicalSpecs).map(([key, spec]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{spec.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Requerimientos:</h4>
                    <ul className="space-y-1">
                      {spec.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      {key === 'rppg' ? 'Algoritmos:' : 'Características:'}
                    </h4>
                    <ul className="space-y-1">
                      {(key === 'rppg' ? spec.algorithms : spec.features).map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      {key === 'rppg' ? 'Precisión:' : 'Validación:'}
                    </h4>
                    <ul className="space-y-1">
                      {(key === 'rppg' ? spec.accuracy : spec.validation).map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Protocols */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Shield className="w-6 h-6 text-green-600 mr-2" />
            Protocolos Clínicos y Consideraciones
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {clinicalProtocols.map((protocol, idx) => {
              const IconComponent = protocol.icon;
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <IconComponent className={`w-6 h-6 ${protocol.color} mr-2`} />
                    <h3 className="text-lg font-semibold text-gray-900">{protocol.title}</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {protocol.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm text-gray-700 flex items-start">
                        <div className={`w-2 h-2 rounded-full mr-2 mt-2 flex-shrink-0 ${protocol.color.replace('text-', 'bg-')}`}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
            Hoja de Ruta de Implementación
          </h2>

          <div className="space-y-6">
            {implementationPhases.map((phase, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{phase.phase}</h3>
                <ul className="space-y-2">
                  {phase.activities.map((activity, actIdx) => (
                    <li key={actIdx} className="text-gray-700 flex items-start">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Resultados Esperados</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-indigo-800">Económicos:</span>
                <p className="text-indigo-700">6-12% reducción siniestralidad en 24 meses</p>
              </div>
              <div>
                <span className="font-medium text-indigo-800">Sociales:</span>
                <p className="text-indigo-700">Acceso masivo a prevención vía smartphone</p>
              </div>
              <div>
                <span className="font-medium text-indigo-800">Clínicos:</span>
                <p className="text-indigo-700">8-12% detección temprana de condiciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="flex items-center justify-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Documentación completa disponible en archivo técnico
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDocumentation;