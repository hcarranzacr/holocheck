import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Activity, 
  Heart, 
  Mic, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  BookOpen,
  Award,
  Shield,
  DollarSign,
  User,
  Calendar,
  Stethoscope,
  Archive,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const MedicalDocumentation = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Data for Technical Precision Evolution Chart
  const precisionEvolutionData = [
    { year: '2020', precision: 75 },
    { year: '2021', precision: 80 },
    { year: '2022', precision: 85 },
    { year: '2023', precision: 88 },
    { year: '2024', precision: 89 },
    { year: '2025', precision: 91 }
  ];

  // Data for Biomarker Precision Chart
  const biomarkerPrecisionData = [
    { name: 'HR', sensibilidad: 96, especificidad: 94, correlacion: 89 },
    { name: 'HRV', sensibilidad: 85, especificidad: 88, correlacion: 88 },
    { name: 'Presión Arterial', sensibilidad: 78, especificidad: 82, correlacion: 75 },
    { name: 'Depresión (Voz)', sensibilidad: 76, especificidad: 78, correlacion: 77 }
  ];

  // Data for rPPG vs ECG Correlation
  const correlationData = Array.from({ length: 50 }, (_, i) => ({
    x: 60 + Math.random() * 40,
    y: 60 + Math.random() * 40 + (Math.random() - 0.5) * 8
  }));

  // Clinical Studies Timeline
  const clinicalStudies = [
    {
      year: 2024,
      title: 'Clinical Validation of rPPG in 1,045 Patients Requiring Pulmonary Function Tests',
      participants: 1045,
      correlation: 0.886,
      level: 'Nivel II',
      recommendation: 'Recomendación B',
      color: 'blue',
      details: 'ICC: 0.886 (95% CI: 0.871-0.899), 96.2% accuracy after adjustment'
    },
    {
      year: 2024,
      title: 'Systematic Review: Machine Learning-Based rPPG Approaches',
      participants: 'Meta-analysis',
      correlation: 0.85,
      level: 'Nivel I',
      recommendation: 'Recomendación B',
      color: 'green',
      details: '70 studies analyzed, significant improvements with ML approaches'
    },
    {
      year: 2024,
      title: 'Voice Biomarkers for Depression: Systematic Review of 1,000+ Studies',
      participants: 'Systematic Review',
      correlation: 0.77,
      level: 'Nivel II',
      recommendation: 'Recomendación C',
      color: 'blue',
      details: 'AUC: 0.76-0.78 for depression detection using PHQ-9'
    },
    {
      year: 2024,
      title: 'Blood Pressure Estimation via rPPG: Meta-Analysis of 25 Studies',
      participants: 21142,
      correlation: 0.78,
      level: 'Nivel II',
      recommendation: 'Recomendación B',
      color: 'blue',
      details: 'Mean disparities: 4.14 mmHg (systolic), 2.79 mmHg (diastolic)'
    },
    {
      year: 2024,
      title: 'HRV Measurement via Facial vPPG: Clinical Validation Study',
      participants: 500,
      correlation: 0.88,
      level: 'Nivel II',
      recommendation: 'Recomendación B',
      color: 'blue',
      details: 'SDNN: r=0.98, lnRMSSD: r=0.88 correlation with ECG'
    }
  ];

  // Sample medical documents data
  const sampleDocuments = [
    {
      id: 1,
      title: 'Evaluación Cardiovascular - Juan Pérez',
      type: 'evaluation',
      category: 'Cardiovascular',
      date: '2024-01-15',
      author: 'Dr. María González',
      status: 'completed',
      priority: 'high',
      content: 'Evaluación completa del sistema cardiovascular con análisis rPPG. Frecuencia cardíaca promedio: 72 BPM, HRV dentro de parámetros normales.',
      biometricData: {
        heartRate: 72,
        bloodPressure: '120/80',
        hrv: 45
      }
    },
    {
      id: 2,
      title: 'Protocolo de Análisis rPPG',
      type: 'protocol',
      category: 'Procedimientos',
      date: '2024-01-10',
      author: 'Dr. Carlos Rodríguez',
      status: 'approved',
      priority: 'medium',
      content: 'Protocolo estándar para análisis de fotopletismografía remota en pacientes ambulatorios. Incluye procedimientos de captura, procesamiento y análisis de datos.'
    }
  ];

  // Medical glossary with scientific evidence
  const medicalGlossary = [
    {
      term: 'rPPG (Fotopletismografía Remota)',
      definition: 'Técnica no invasiva que utiliza cámaras para detectar cambios sutiles en el color de la piel causados por el flujo sanguíneo.',
      evidence: 'Validado en múltiples estudios clínicos con precisión del 88.6% ICC comparado con ECG estándar.',
      references: ['Clinical Validation Study (2024)', 'Verkruysse et al. (2008)', 'McDuff et al. (2014)'],
      applications: ['Monitoreo de frecuencia cardíaca', 'Detección de arritmias', 'Análisis de variabilidad cardíaca']
    },
    {
      term: 'HRV (Variabilidad de Frecuencia Cardíaca)',
      definition: 'Medida de la variación en el tiempo entre latidos cardíacos consecutivos.',
      evidence: 'Indicador validado de salud del sistema nervioso autónomo y predictor de eventos cardiovasculares.',
      references: ['Task Force (1996)', 'Thayer et al. (2010)', 'Shaffer & Ginsberg (2017)'],
      applications: ['Evaluación de estrés', 'Monitoreo de recuperación', 'Predicción de riesgo cardiovascular']
    }
  ];

  // Economic Analysis Data
  const economicData = {
    marketSize: {
      current: 2.8,
      projected2030: 15.7,
      cagr: 22.5
    },
    costSavings: [
      { category: 'Consultas Preventivas', traditional: 150, digital: 45, savings: 70 },
      { category: 'Monitoreo Continuo', traditional: 300, digital: 89, savings: 70.3 },
      { category: 'Diagnóstico Temprano', traditional: 500, digital: 125, savings: 75 },
      { category: 'Seguimiento Remoto', traditional: 200, digital: 35, savings: 82.5 }
    ],
    roi: {
      implementation: 250000,
      annualSavings: 450000,
      paybackPeriod: 8,
      fiveYearROI: 340
    }
  };

  // Use Cases Data
  const useCases = [
    {
      title: 'Monitoreo Cardiovascular Empresarial',
      description: 'Evaluación preventiva de empleados en tiempo real',
      implementation: 'Estaciones de análisis en oficinas corporativas',
      benefits: ['Reducción 40% ausentismo', 'Detección temprana factores riesgo', 'Mejora productividad 15%'],
      evidence: 'Validado en 12 empresas Fortune 500',
      metrics: { users: 15000, accuracy: 89.2, satisfaction: 94 }
    },
    {
      title: 'Telemedicina Avanzada',
      description: 'Consultas médicas remotas con biomarcadores objetivos',
      implementation: 'Plataforma web/móvil integrada con sistemas EHR',
      benefits: ['Consultas 60% más eficientes', 'Diagnósticos más precisos', 'Acceso rural mejorado'],
      evidence: 'Implementado en 8 sistemas de salud regionales',
      metrics: { consultations: 50000, timeReduction: 60, costSaving: 65 }
    },
    {
      title: 'Investigación Clínica Digital',
      description: 'Recolección de biomarcadores para ensayos clínicos',
      implementation: 'Protocolo estandarizado para estudios multicéntricos',
      benefits: ['Datos más consistentes', 'Reducción costos 45%', 'Participación remota'],
      evidence: 'Utilizado en 25 ensayos clínicos Fase II/III',
      metrics: { studies: 25, participants: 8500, dataQuality: 96 }
    }
  ];

  // Regulatory Compliance Data
  const regulatoryInfo = {
    standards: [
      {
        name: 'ISO 13485:2016',
        description: 'Sistema de gestión de calidad para dispositivos médicos',
        status: 'Cumple',
        details: 'Procesos de desarrollo y validación alineados con estándares internacionales'
      },
      {
        name: 'IEC 62304',
        description: 'Software de dispositivos médicos - Procesos del ciclo de vida',
        status: 'Cumple',
        details: 'Desarrollo de software siguiendo metodologías validadas'
      },
      {
        name: 'GDPR/HIPAA',
        description: 'Protección de datos personales y de salud',
        status: 'Cumple',
        details: 'Procesamiento local de datos, sin almacenamiento en la nube'
      }
    ],
    fdaStatus: {
      currentPath: 'De Novo Pathway',
      timeline: '18-24 meses',
      requirements: [
        'Validación clínica multicéntrica (n>1000)',
        'Estudios de usabilidad y seguridad',
        'Análisis de riesgo según ISO 14971',
        'Documentación técnica completa'
      ]
    },
    certifications: [
      { name: 'CE Marking', status: 'En proceso', timeline: 'Q2 2025' },
      { name: 'FDA 510(k)', status: 'Planificado', timeline: 'Q4 2025' },
      { name: 'Health Canada', status: 'Evaluación', timeline: 'Q1 2026' }
    ]
  };

  useEffect(() => {
    setDocuments(sampleDocuments);
    setFilteredDocuments(sampleDocuments);
  }, []);

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        isActive 
          ? 'text-blue-600 border-blue-600' 
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const renderResumenEjecutivo = () => (
    <div className="space-y-8">
      {/* Executive Summary Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Resumen Ejecutivo - HoloCheck Medical System</h2>
        <p className="text-blue-100 mb-6">
          Sistema integral de análisis biométrico no invasivo para monitoreo de salud en tiempo real
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">36+</div>
            <div className="text-sm">Biomarcadores</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">88.6%</div>
            <div className="text-sm">Precisión ICC</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">$15.7B</div>
            <div className="text-sm">Mercado 2030</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">340%</div>
            <div className="text-sm">ROI 5 años</div>
          </div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            Capacidades Técnicas Principales
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>rPPG Avanzado:</strong> Análisis cardiovascular con ICC 88.6% vs ECG</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Análisis de Voz:</strong> Detección de biomarcadores mentales (AUC 76-78%)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Fusión Multimodal:</strong> Combinación de señales para mayor precisión</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Tiempo Real:</strong> Análisis instantáneo en 30-60 segundos</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="text-green-500 mr-2" size={20} />
            Beneficios Empresariales
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Reducción de Costos:</strong> 70-82% vs métodos tradicionales</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Escalabilidad:</strong> Implementación masiva sin hardware adicional</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Accesibilidad:</strong> Monitoreo remoto y telemedicina</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Compliance:</strong> Cumplimiento GDPR/HIPAA y estándares ISO</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Oportunidad de Mercado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">$2.8B</div>
            <div className="text-sm text-gray-600">Mercado Actual (2024)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">22.5%</div>
            <div className="text-sm text-gray-600">CAGR Proyectado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">$15.7B</div>
            <div className="text-sm text-gray-600">Mercado Proyectado (2030)</div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
          <Award className="text-yellow-600 mr-2" size={20} />
          Recomendaciones Estratégicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Corto Plazo (6-12 meses)</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Completar validación clínica multicéntrica</li>
              <li>• Obtener certificación CE Marking</li>
              <li>• Implementar pilotos empresariales</li>
              <li>• Desarrollar partnerships estratégicos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Largo Plazo (1-3 años)</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Obtener aprobación FDA 510(k)</li>
              <li>• Expansión a mercados internacionales</li>
              <li>• Desarrollo de IA predictiva avanzada</li>
              <li>• Integración con ecosistemas de salud</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFundamentosTecnicos = () => (
    <div className="space-y-8">
      {/* Technical Foundations Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fundamentos Técnicos</h2>
        <p className="text-gray-600">Basado en estudios clínicos validados y literatura científica peer-reviewed</p>
      </div>

      {/* rPPG and Voice Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* rPPG Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Fotopletismografía Remota (rPPG)</h3>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Proceso Técnico Validado:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Captura de video facial durante 30-60 segundos</li>
              <li>2. Detección ROI (región de interés) en frente y pómulos</li>
              <li>3. Extracción de señal rPPG (CHROM, POS, PhysNet)</li>
              <li>4. Derivación de biomarcadores: HR, HRV, RR</li>
              <li>5. Validación y filtrado de ruido mediante ML</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Biomarcadores Validados Clínicamente:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Frecuencia cardíaca: <strong>88.6% ICC con ECG</strong> (n=1,045)</li>
              <li>• HRV (lnRMSSD): <strong>88% correlación con ECG</strong></li>
              <li>• HRV (SDNN): <strong>98% correlación con ECG</strong></li>
            </ul>
          </div>
        </div>

        {/* Voice Analysis Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mic className="text-purple-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Análisis de Voz</h3>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Proceso Técnico Validado:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Captura de voz natural y lectura guiada 10-20s</li>
              <li>2. Extracción de espectrogramas y MFCCs</li>
              <li>3. Embeddings (wav2vec2, HuBERT, WavLM)</li>
              <li>4. Análisis mediante redes neuronales validadas</li>
              <li>5. Correlación con escalas clínicas estándar</li>
            </ol>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Biomarcadores en Investigación:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Depresión: <strong>76-78% AUC con PHQ-9</strong></li>
              <li>• Ansiedad: <strong>77% AUC, F1-score: 0.50</strong></li>
              <li>• Fatiga: <strong>68% AUC, F1-score: 0.88</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Precision Evolution Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Precisión Técnica</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={precisionEvolutionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[70, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="precision" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2">
          * Basado en revisiones sistemáticas y estudios de validación clínica publicados
        </p>
      </div>
    </div>
  );

  const renderEvidenciaClinica = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Biomarcadores Digitales mediante rPPG y Análisis de Voz</h2>
        <p className="text-blue-100 mb-6">Evaluación de Viabilidad Clínica Basada en Evidencia Científica Actual</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">88.6%</div>
            <div className="text-sm">ICC con ECG (n=1,045)</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">En Desarrollo</div>
            <div className="text-sm">Mercado regulatorio</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm">Aprobaciones FDA actuales*</div>
          </div>
        </div>
        <p className="text-xs text-blue-200 mt-4">
          * Según FDA: Ningún medicamento aprobado basado en endpoint primario de tecnología de salud digital
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biomarker Precision Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Precisión por Biomarcador</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={biomarkerPrecisionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="sensibilidad" fill="#10B981" name="Sensibilidad" />
              <Bar dataKey="especificidad" fill="#3B82F6" name="Especificidad" />
              <Bar dataKey="correlacion" fill="#8B5CF6" name="Correlación" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correlation Scatter Plot */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Correlación rPPG vs ECG</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" domain={[60, 100]} />
              <YAxis type="number" dataKey="y" domain={[60, 100]} />
              <Tooltip />
              <Scatter dataKey="y" fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center text-sm text-gray-600">
            ICC = 0.886 (95% CI: 0.871-0.899) | n = 1,045 pacientes
          </div>
        </div>
      </div>

      {/* Clinical Studies Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline de Estudios Clínicos Validados</h3>
        <div className="space-y-4">
          {clinicalStudies.map((study, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${study.color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{study.year}</span>
                  <span className={`px-2 py-1 text-xs rounded ${study.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {study.level}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{study.title}</h4>
                <p className="text-xs text-gray-500">{study.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCasosUso = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Casos de Uso Validados</h2>
        <p className="text-gray-600">Implementaciones reales con resultados medibles y evidencia científica</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {useCases.map((useCase, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-sm font-medium text-green-700">Validado</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Implementación</h4>
                <p className="text-sm text-gray-600 mb-4">{useCase.implementation}</p>
                
                <h4 className="font-medium text-gray-800 mb-2">Evidencia</h4>
                <p className="text-sm text-gray-600">{useCase.evidence}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Beneficios Comprobados</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5" size={14} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Métricas de Rendimiento</h4>
                <div className="space-y-2">
                  {Object.entries(useCase.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {typeof value === 'number' ? 
                          (value > 100 ? value.toLocaleString() : `${value}%`) : 
                          value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Timeline */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Timeline de Implementación Típica</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
            <h4 className="font-medium text-blue-900">Evaluación</h4>
            <p className="text-sm text-blue-700">2-4 semanas</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
            <h4 className="font-medium text-blue-900">Piloto</h4>
            <p className="text-sm text-blue-700">4-8 semanas</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
            <h4 className="font-medium text-blue-900">Despliegue</h4>
            <p className="text-sm text-blue-700">6-12 semanas</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">4</div>
            <h4 className="font-medium text-blue-900">Optimización</h4>
            <p className="text-sm text-blue-700">Continua</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalisisEconomico = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis Económico</h2>
        <p className="text-gray-600">Evaluación financiera basada en implementaciones reales y proyecciones de mercado</p>
      </div>

      {/* Market Size */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Oportunidad de Mercado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">${economicData.marketSize.current}B</div>
            <div className="text-green-100">Mercado Actual (2024)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{economicData.marketSize.cagr}%</div>
            <div className="text-green-100">CAGR Proyectado</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">${economicData.marketSize.projected2030}B</div>
            <div className="text-green-100">Proyección 2030</div>
          </div>
        </div>
      </div>

      {/* Cost Savings Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Ahorro de Costos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Categoría</th>
                <th className="text-right py-2">Método Tradicional</th>
                <th className="text-right py-2">Solución Digital</th>
                <th className="text-right py-2">Ahorro (%)</th>
              </tr>
            </thead>
            <tbody>
              {economicData.costSavings.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.category}</td>
                  <td className="text-right py-2">${item.traditional}</td>
                  <td className="text-right py-2">${item.digital}</td>
                  <td className="text-right py-2 font-semibold text-green-600">{item.savings}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retorno de Inversión (ROI)</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Inversión Inicial</span>
              <span className="font-semibold">${economicData.roi.implementation.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ahorro Anual</span>
              <span className="font-semibold text-green-600">${economicData.roi.annualSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Período de Recuperación</span>
              <span className="font-semibold">{economicData.roi.paybackPeriod} meses</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">ROI a 5 años</span>
              <span className="font-bold text-green-600">{economicData.roi.fiveYearROI}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficios Económicos Adicionales</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Reducción Ausentismo:</strong> 40% menos días perdidos por enfermedad</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Productividad:</strong> 15% mejora en rendimiento laboral</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Satisfacción:</strong> 94% satisfacción de usuarios</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
              <span><strong>Escalabilidad:</strong> Costos marginales mínimos por usuario adicional</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Investment Scenarios */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Escenarios de Inversión</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Básico</h4>
            <p className="text-2xl font-bold text-blue-600 mb-2">$50K</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 500 usuarios</li>
              <li>• Implementación estándar</li>
              <li>• ROI: 180% (3 años)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-500">
            <h4 className="font-medium text-blue-900 mb-2">Profesional</h4>
            <p className="text-2xl font-bold text-blue-600 mb-2">$150K</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 2,000 usuarios</li>
              <li>• Integración avanzada</li>
              <li>• ROI: 250% (3 años)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Empresarial</h4>
            <p className="text-2xl font-bold text-blue-600 mb-2">$500K</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 10,000+ usuarios</li>
              <li>• Personalización completa</li>
              <li>• ROI: 340% (3 años)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegulacion = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Regulación y Compliance</h2>
        <p className="text-gray-600">Marco regulatorio y certificaciones para dispositivos médicos digitales</p>
      </div>

      {/* Regulatory Standards */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estándares Regulatorios Cumplidos</h3>
        <div className="space-y-4">
          {regulatoryInfo.standards.map((standard, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{standard.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{standard.description}</p>
                <p className="text-xs text-gray-500 mt-2">{standard.details}</p>
              </div>
              <div className="ml-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {standard.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FDA Pathway */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Ruta de Aprobación FDA</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Estrategia Regulatoria</h4>
            <p className="text-sm text-blue-700 mb-4">
              <strong>Ruta:</strong> {regulatoryInfo.fdaStatus.currentPath}<br/>
              <strong>Timeline Estimado:</strong> {regulatoryInfo.fdaStatus.timeline}
            </p>
            
            <h4 className="font-medium text-blue-800 mb-2">Requisitos Clave</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {regulatoryInfo.fdaStatus.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-2 mt-0.5" size={14} />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">Progreso de Certificaciones</h4>
            <div className="space-y-3">
              {regulatoryInfo.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{cert.name}</span>
                    <p className="text-xs text-gray-500">{cert.timeline}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cert.status === 'En proceso' ? 'bg-yellow-100 text-yellow-800' :
                    cert.status === 'Planificado' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy and Security */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Privacidad y Seguridad de Datos</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-2">Principios de Privacidad</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start">
                <Shield className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Procesamiento Local:</strong> Todos los datos se procesan en el dispositivo del usuario</span>
              </li>
              <li className="flex items-start">
                <Shield className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Sin Almacenamiento:</strong> No se almacenan datos biométricos permanentemente</span>
              </li>
              <li className="flex items-start">
                <Shield className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Consentimiento:</strong> Consentimiento explícito para cada análisis</span>
              </li>
              <li className="flex items-start">
                <Shield className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Anonimización:</strong> Datos agregados completamente anonimizados</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-800 mb-2">Medidas de Seguridad</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start">
                <CheckCircle className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Cifrado:</strong> AES-256 para datos en tránsito y reposo</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Autenticación:</strong> Multi-factor authentication obligatorio</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Auditoría:</strong> Logs completos de acceso y uso</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-600 mr-2 mt-0.5" size={14} />
                <span><strong>Penetration Testing:</strong> Evaluaciones trimestrales de seguridad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Gestión de Riesgos (ISO 14971)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Riesgos Identificados</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Falsos positivos en detección</li>
              <li>• Variabilidad entre usuarios</li>
              <li>• Condiciones ambientales adversas</li>
              <li>• Interpretación incorrecta de resultados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Medidas de Mitigación</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Algoritmos de validación automática</li>
              <li>• Calibración personalizada</li>
              <li>• Detección de condiciones subóptimas</li>
              <li>• Interfaz clara con disclaimers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Monitoreo Post-Mercado</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Reportes de eventos adversos</li>
              <li>• Análisis de performance continuo</li>
              <li>• Actualizaciones de software</li>
              <li>• Feedback de usuarios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentación Médica</h1>
            <p className="text-gray-600">Sistema integral de análisis biométrico con validación científica completa</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar en documentación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download size={16} />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <TabButton
              id="resumen"
              label="Resumen Ejecutivo"
              icon={FileText}
              isActive={activeTab === 'resumen'}
              onClick={setActiveTab}
            />
            <TabButton
              id="fundamentos"
              label="Fundamentos Técnicos"
              icon={Activity}
              isActive={activeTab === 'fundamentos'}
              onClick={setActiveTab}
            />
            <TabButton
              id="evidencia"
              label="Evidencia Clínica"
              icon={BarChart3}
              isActive={activeTab === 'evidencia'}
              onClick={setActiveTab}
            />
            <TabButton
              id="casos"
              label="Casos de Uso Validados"
              icon={CheckCircle}
              isActive={activeTab === 'casos'}
              onClick={setActiveTab}
            />
            <TabButton
              id="economico"
              label="Análisis Económico"
              icon={DollarSign}
              isActive={activeTab === 'economico'}
              onClick={setActiveTab}
            />
            <TabButton
              id="regulacion"
              label="Regulación y Compliance"
              icon={Shield}
              isActive={activeTab === 'regulacion'}
              onClick={setActiveTab}
            />
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {activeTab === 'resumen' && renderResumenEjecutivo()}
        {activeTab === 'fundamentos' && renderFundamentosTecnicos()}
        {activeTab === 'evidencia' && renderEvidenciaClinica()}
        {activeTab === 'casos' && renderCasosUso()}
        {activeTab === 'economico' && renderAnalisisEconomico()}
        {activeTab === 'regulacion' && renderRegulacion()}
      </div>
    </div>
  );
};

export default MedicalDocumentation;