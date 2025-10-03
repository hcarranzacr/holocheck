import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  User, 
  Stethoscope,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';

const MedicalDocumentation = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents', 'evaluations', 'glossary'

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
      content: 'Evaluación completa del sistema cardiovascular con análisis rPPG...',
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
      content: 'Protocolo estándar para análisis de fotopletismografía remota...'
    },
    {
      id: 3,
      title: 'Estudio de Validación - Análisis de Voz',
      type: 'study',
      category: 'Investigación',
      date: '2024-01-08',
      author: 'Dr. Ana Martínez',
      status: 'in_review',
      priority: 'high',
      content: 'Estudio de validación para análisis de biomarcadores vocales...'
    },
    {
      id: 4,
      title: 'Reporte Mensual - Enero 2024',
      type: 'report',
      category: 'Reportes',
      date: '2024-01-31',
      author: 'Sistema HoloCheck',
      status: 'generated',
      priority: 'low',
      content: 'Reporte mensual de métricas de salud empresarial...'
    }
  ];

  // Medical glossary with scientific evidence
  const medicalGlossary = [
    {
      term: 'rPPG (Fotopletismografía Remota)',
      definition: 'Técnica no invasiva que utiliza cámaras para detectar cambios sutiles en el color de la piel causados por el flujo sanguíneo.',
      evidence: 'Validado en múltiples estudios clínicos con precisión del 95% comparado con ECG estándar.',
      references: ['Chen et al. (2018)', 'Verkruysse et al. (2008)', 'McDuff et al. (2014)'],
      applications: ['Monitoreo de frecuencia cardíaca', 'Detección de arritmias', 'Análisis de variabilidad cardíaca']
    },
    {
      term: 'VFC (Variabilidad de Frecuencia Cardíaca)',
      definition: 'Medida de la variación en el tiempo entre latidos cardíacos consecutivos.',
      evidence: 'Indicador validado de salud del sistema nervioso autónomo y predictor de eventos cardiovasculares.',
      references: ['Task Force (1996)', 'Thayer et al. (2010)', 'Shaffer & Ginsberg (2017)'],
      applications: ['Evaluación de estrés', 'Monitoreo de recuperación', 'Predicción de riesgo cardiovascular']
    },
    {
      term: 'Análisis de Biomarcadores Vocales',
      definition: 'Técnica que analiza características acústicas de la voz para detectar indicadores de salud.',
      evidence: 'Estudios demuestran correlación significativa entre patrones vocales y condiciones de salud.',
      references: ['Tsanas et al. (2012)', 'Arora et al. (2018)', 'Fagherazzi et al. (2021)'],
      applications: ['Detección de estrés', 'Monitoreo respiratorio', 'Evaluación neurológica']
    },
    {
      term: 'SpO2 (Saturación de Oxígeno)',
      definition: 'Porcentaje de hemoglobina saturada con oxígeno en la sangre arterial.',
      evidence: 'Parámetro vital estándar validado clínicamente para evaluación respiratoria.',
      references: ['Severinghaus & Naifeh (1987)', 'Chan et al. (2013)'],
      applications: ['Monitoreo respiratorio', 'Detección de hipoxemia', 'Evaluación de función pulmonar']
    }
  ];

  useEffect(() => {
    setDocuments(sampleDocuments);
    setFilteredDocuments(sampleDocuments);
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, filterType, documents]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'generated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'evaluation': return <Stethoscope size={16} />;
      case 'protocol': return <FileText size={16} />;
      case 'study': return <BookOpen size={16} />;
      case 'report': return <Archive size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const handleExportDocument = (doc) => {
    const dataStr = JSON.stringify(doc, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${doc.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const DocumentCard = ({ doc }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {getTypeIcon(doc.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doc.title}</h3>
            <p className="text-sm text-gray-500">{doc.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
            {doc.status.replace('_', ' ').toUpperCase()}
          </span>
          <div className={`${getPriorityColor(doc.priority)}`}>
            <AlertCircle size={16} />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-2">{doc.content}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-2">
          <User size={14} />
          <span>{doc.author}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>{new Date(doc.date).toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {doc.biometricData && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Datos Biométricos:</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>FC: {doc.biometricData.heartRate} BPM</div>
            <div>PA: {doc.biometricData.bloodPressure}</div>
            <div>VFC: {doc.biometricData.hrv} ms</div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setSelectedDocument(doc)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver documento"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleExportDocument(doc)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Exportar documento"
        >
          <Download size={16} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Editar">
          <Edit size={16} />
        </button>
        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const GlossaryCard = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 mb-2">{item.term}</h3>
      <p className="text-gray-600 mb-4">{item.definition}</p>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
          <Award className="mr-2" size={16} />
          Evidencia Científica:
        </h4>
        <p className="text-sm text-gray-600">{item.evidence}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Referencias:</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          {item.references.map((ref, index) => (
            <li key={index}>{ref}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-2">Aplicaciones:</h4>
        <div className="flex flex-wrap gap-2">
          {item.applications.map((app, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {app}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentación Médica</h1>
        <p className="text-gray-600">
          Gestión integral de documentos médicos, evaluaciones y evidencia científica
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Stethoscope className="inline mr-2" size={16} />
              Evaluaciones
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'glossary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="inline mr-2" size={16} />
              Glosario Científico
            </button>
          </nav>
        </div>
      </div>

      {/* Documents and Evaluations Tab */}
      {(activeTab === 'documents' || activeTab === 'evaluations') && (
        <>
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="evaluation">Evaluaciones</option>
                <option value="protocol">Protocolos</option>
                <option value="study">Estudios</option>
                <option value="report">Reportes</option>
              </select>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Nuevo</span>
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments
              .filter(doc => activeTab === 'documents' || doc.type === 'evaluation')
              .map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta ajustar los filtros de búsqueda o crear un nuevo documento.
              </p>
            </div>
          )}
        </>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medicalGlossary.map((item, index) => (
            <GlossaryCard key={index} item={item} />
          ))}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Autor</label>
                  <p className="text-gray-900">{selectedDocument.author}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <p className="text-gray-900">{new Date(selectedDocument.date).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <p className="text-gray-900">{selectedDocument.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                    {selectedDocument.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{selectedDocument.content}</p>
                </div>
              </div>

              {selectedDocument.biometricData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datos Biométricos</label>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="block text-sm text-gray-600">Frecuencia Cardíaca</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {selectedDocument.biometricData.heartRate} BPM
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-600">Presión Arterial</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {selectedDocument.biometricData.bloodPressure}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-600">VFC</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {selectedDocument.biometricData.hrv} ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentation;