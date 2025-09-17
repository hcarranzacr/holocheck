import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, BookOpen, Activity, Heart, Brain, Stethoscope, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MedicalDocumentation = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [clinicalData, setClinicalData] = useState([]);

  // Mock clinical studies data
  const clinicalStudies = [
    {
      id: 1,
      title: "Análisis de Biomarcadores Digitales en Detección Temprana de Enfermedades Cardiovasculares",
      category: "cardiovascular",
      date: "2024-01-15",
      authors: "Dr. García, M., Dr. López, J.",
      journal: "Digital Health Journal",
      impact: "Alto",
      relevance: 95,
      summary: "Estudio que demuestra la eficacia del análisis rPPG para la detección temprana de arritmias cardíacas con una precisión del 94.2%.",
      keyFindings: [
        "Precisión del 94.2% en detección de arritmias",
        "Reducción del 35% en falsos positivos",
        "Tiempo de análisis reducido a 30 segundos"
      ],
      methodology: "Estudio longitudinal con 2,847 participantes durante 18 meses",
      applications: ["Telemedicina", "Monitoreo continuo", "Screening poblacional"]
    },
    {
      id: 2,
      title: "Biomarcadores de Voz para Evaluación del Estado Mental y Cognitivo",
      category: "neurological",
      date: "2024-01-10",
      authors: "Dr. Martínez, A., Dr. Silva, R.",
      journal: "Neurological Assessment Review",
      impact: "Muy Alto",
      relevance: 98,
      summary: "Investigación sobre el uso de análisis de voz para detectar cambios cognitivos tempranos y estados de ánimo.",
      keyFindings: [
        "Detección de depresión con 91% de precisión",
        "Identificación temprana de deterioro cognitivo",
        "Correlación significativa con escalas clínicas estándar"
      ],
      methodology: "Análisis de patrones vocales en 1,523 sujetos",
      applications: ["Salud mental", "Neurología", "Geriatría"]
    },
    {
      id: 3,
      title: "Implementación de IA en Análisis Biométrico Facial para Detección de Estrés",
      category: "stress",
      date: "2024-01-05",
      authors: "Dr. Rodríguez, C., Dr. Fernández, L.",
      journal: "AI in Medicine",
      impact: "Alto",
      relevance: 87,
      summary: "Desarrollo de algoritmos de machine learning para la detección automática de niveles de estrés mediante análisis facial.",
      keyFindings: [
        "Precisión del 89% en detección de estrés",
        "Análisis en tiempo real (< 2 segundos)",
        "Integración exitosa con dispositivos móviles"
      ],
      methodology: "Deep learning con dataset de 5,000+ imágenes faciales",
      applications: ["Bienestar laboral", "Salud ocupacional", "Prevención"]
    },
    {
      id: 4,
      title: "Validación Clínica de Tecnologías rPPG en Entornos Hospitalarios",
      category: "validation",
      date: "2023-12-20",
      authors: "Dr. González, P., Dr. Morales, S.",
      journal: "Clinical Validation Studies",
      impact: "Muy Alto",
      relevance: 92,
      summary: "Estudio multicéntrico que valida la precisión de tecnologías rPPG en comparación con métodos tradicionales.",
      keyFindings: [
        "Correlación r=0.94 con ECG estándar",
        "Reducción del 60% en tiempo de evaluación",
        "Implementación exitosa en 12 hospitales"
      ],
      methodology: "Estudio multicéntrico con 3,200 pacientes",
      applications: ["Hospitales", "Clínicas", "Centros de salud"]
    }
  ];

  // Mock biomarker data
  const biomarkerData = [
    { name: 'Ene', heartRate: 72, bloodPressure: 120, stressLevel: 3, oxygenSat: 98 },
    { name: 'Feb', heartRate: 75, bloodPressure: 118, stressLevel: 4, oxygenSat: 97 },
    { name: 'Mar', heartRate: 70, bloodPressure: 122, stressLevel: 2, oxygenSat: 99 },
    { name: 'Abr', heartRate: 73, bloodPressure: 119, stressLevel: 3, oxygenSat: 98 },
    { name: 'May', heartRate: 71, bloodPressure: 121, stressLevel: 2, oxygenSat: 98 },
    { name: 'Jun', heartRate: 74, bloodPressure: 117, stressLevel: 4, oxygenSat: 97 }
  ];

  const radarData = [
    { subject: 'Cardiovascular', A: 120, B: 110, fullMark: 150 },
    { subject: 'Respiratorio', A: 98, B: 130, fullMark: 150 },
    { subject: 'Neurológico', A: 86, B: 100, fullMark: 150 },
    { subject: 'Estrés', A: 99, B: 85, fullMark: 150 },
    { subject: 'Metabólico', A: 85, B: 90, fullMark: 150 },
    { subject: 'Inmunológico', A: 65, B: 85, fullMark: 150 }
  ];

  useEffect(() => {
    setClinicalData(biomarkerData);
  }, []);

  const filteredStudies = clinicalStudies.filter(study => {
    const matchesCategory = selectedCategory === 'all' || study.category === selectedCategory;
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="h-5 w-5" />;
      case 'neurological': return <Brain className="h-5 w-5" />;
      case 'stress': return <Activity className="h-5 w-5" />;
      case 'validation': return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Muy Alto': return 'text-red-600 bg-red-100';
      case 'Alto': return 'text-orange-600 bg-orange-100';
      case 'Medio': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportDocument = (document) => {
    const content = `
DOCUMENTACIÓN MÉDICA - ${document.title}

Autores: ${document.authors}
Fecha: ${document.date}
Revista: ${document.journal}
Impacto: ${document.impact}
Relevancia: ${document.relevance}%

RESUMEN:
${document.summary}

HALLAZGOS CLAVE:
${document.keyFindings.map(finding => `• ${finding}`).join('\n')}

METODOLOGÍA:
${document.methodology}

APLICACIONES:
${document.applications.map(app => `• ${app}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-2" />
            Documentación Médica
          </h2>
          <p className="text-gray-600 mt-1">
            Base de conocimiento científico y estudios clínicos
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudios, autores, palabras clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="neurological">Neurológico</option>
            <option value="stress">Estrés</option>
            <option value="validation">Validación</option>
          </select>
        </div>
      </div>

      {/* Biomarker Analytics Dashboard */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2" />
          Análisis de Biomarcadores Digitales
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-3">Tendencias Temporales</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={clinicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="#8884d8" name="Freq. Cardíaca" />
                <Line type="monotone" dataKey="bloodPressure" stroke="#82ca9d" name="Presión Arterial" />
                <Line type="monotone" dataKey="stressLevel" stroke="#ffc658" name="Nivel de Estrés" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-3">Perfil Biométrico</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Actual" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Objetivo" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">94.2%</div>
            <div className="text-sm text-gray-600">Precisión Cardíaca</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">91%</div>
            <div className="text-sm text-gray-600">Detección Mental</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">89%</div>
            <div className="text-sm text-gray-600">Análisis de Estrés</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Stethoscope className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">2.8s</div>
            <div className="text-sm text-gray-600">Tiempo Análisis</div>
          </div>
        </div>
      </div>

      {/* Studies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudies.map((study) => (
          <div key={study.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getCategoryIcon(study.category)}
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(study.impact)}`}>
                  {study.impact}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <div className="mr-4">Relevancia: {study.relevance}%</div>
                <button
                  onClick={() => exportDocument(study)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {study.title}
            </h3>

            <div className="text-sm text-gray-600 mb-3">
              <div>Por: {study.authors}</div>
              <div>{study.journal} • {study.date}</div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
              {study.summary}
            </p>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Hallazgos Clave:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {study.keyFindings.slice(0, 2).map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {study.applications.map((app, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {app}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSelectedDocument(study)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Detalles Completos
            </button>
          </div>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedDocument.title}
              </h2>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">Resumen</h3>
                <p className="text-gray-700 mb-4">{selectedDocument.summary}</p>

                <h3 className="font-semibold text-gray-800 mb-2">Metodología</h3>
                <p className="text-gray-700 mb-4">{selectedDocument.methodology}</p>

                <h3 className="font-semibold text-gray-800 mb-2">Hallazgos Clave</h3>
                <ul className="space-y-2">
                  {selectedDocument.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Información del Estudio</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Autores:</strong> {selectedDocument.authors}</div>
                    <div><strong>Fecha:</strong> {selectedDocument.date}</div>
                    <div><strong>Revista:</strong> {selectedDocument.journal}</div>
                    <div><strong>Impacto:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(selectedDocument.impact)}`}>
                        {selectedDocument.impact}
                      </span>
                    </div>
                    <div><strong>Relevancia:</strong> {selectedDocument.relevance}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Aplicaciones</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.applications.map((app, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => exportDocument(selectedDocument)}
                  className="w-full mt-4 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Documento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{filteredStudies.length}</div>
          <div className="text-sm text-blue-800">Estudios Disponibles</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {filteredStudies.filter(s => s.impact === 'Muy Alto').length}
          </div>
          <div className="text-sm text-green-800">Alto Impacto</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(filteredStudies.reduce((acc, s) => acc + s.relevance, 0) / filteredStudies.length)}%
          </div>
          <div className="text-sm text-purple-800">Relevancia Promedio</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">12</div>
          <div className="text-sm text-orange-800">Hospitales Validados</div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDocumentation;